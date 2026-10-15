import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import User from '../models/user.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_FEEDBACK_FILE = path.join(__dirname, '..', 'data', 'reports.json');

const BOT_TIMEOUT_MS = Number(process.env.BOT_API_TIMEOUT_MS || 5000);

function getBaseUrl() {
    const raw = process.env.BOT_API_URL || '';
    return raw.trim().replace(/\/+$/, '');
}

function getBotHeaders() {
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
    const token = process.env.BOT_API_TOKEN;
    if (token) {
        headers['x-dashboard-token'] = token;
    }
    return headers;
}

// Fallback local en mémoire/fichier JSON si le bot n'est pas joignable
function loadLocalReports() {
    try {
        if (!fs.existsSync(LOCAL_FEEDBACK_FILE)) return [];
        const raw = fs.readFileSync(LOCAL_FEEDBACK_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveLocalReports(reports) {
    try {
        const dir = path.dirname(LOCAL_FEEDBACK_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(LOCAL_FEEDBACK_FILE, JSON.stringify(reports, null, 2), 'utf-8');
    } catch (err) {
        console.error('Erreur saveLocalReports:', err.message);
    }
}

const isStaffUser = (user) => ['admin', 'superadmin'].includes(user?.role);

// Un retour appartient à la personne qui l'a envoyé depuis son compte (ou avec la même adresse email)
function isOwnReport(report, user) {
    if (!user) return false;
    if (report.authorUserId && String(report.authorUserId) === String(user.id)) return true;
    if (user.discord_id && report.authorId && String(report.authorId) === String(user.discord_id)) return true;
    return Boolean(user.email && report.authorEmail && report.authorEmail.toLowerCase() === String(user.email).toLowerCase());
}

function visibleReports(reports, user) {
    if (isStaffUser(user)) return reports;
    return reports
        .filter((report) => isOwnReport(report, user))
        .map(({ authorEmail, ...rest }) => rest);
}

export const getFeedbacks = async (req, res) => {
    if (!req.user) return res.json({ reports: [], scope: 'guest' });
    const scope = isStaffUser(req.user) ? 'all' : 'mine';
    const baseUrl = getBaseUrl();
    const { type, guildId } = req.query;

    if (baseUrl) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), BOT_TIMEOUT_MS);
            const queryParams = new URLSearchParams();
            if (type) queryParams.set('type', type);
            if (guildId) queryParams.set('guildId', guildId);

            const url = `${baseUrl}/reports?${queryParams.toString()}`;
            const response = await fetch(url, {
                headers: getBotHeaders(),
                signal: controller.signal,
            });
            clearTimeout(timeout);

            if (response.ok) {
                const data = await response.json();
                return res.json({ reports: visibleReports(Array.isArray(data.reports) ? data.reports : [], req.user), scope });
            }
        } catch (err) {
            console.warn('[Feedback] Impossible de joindre le bot, repli local:', err.message);
        }
    }

    // Repli sur le stockage local
    let reports = loadLocalReports();
    if (type && type !== 'all') {
        reports = reports.filter((r) => r.type === type);
    }
    if (guildId) {
        reports = reports.filter((r) => !r.guildId || r.guildId === String(guildId));
    }
    return res.json({ reports: visibleReports(reports, req.user), scope });
};

export const createFeedback = async (req, res) => {
    const { type, title, description, authorName, authorEmail, guildId, guildName, images } = req.body || {};

    if (!title?.trim() || !description?.trim()) {
        return res.status(400).json({ error: 'Le titre et la description sont obligatoires' });
    }

    const payload = {
        type: type === 'suggestion' ? 'suggestion' : 'bug',
        title: title.trim().slice(0, 150),
        description: description.trim().slice(0, 2000),
        authorName: authorName?.trim() || req.user?.username || 'Utilisateur Web',
        authorEmail: authorEmail?.trim() || req.user?.email || null,
        authorUserId: req.user?.id ? String(req.user.id) : null,
        authorId: req.user?.discord_id || null,
        guildId: guildId || null,
        guildName: guildName || null,
        images: Array.isArray(images) ? images.slice(0, 5) : [],
        source: 'web',
    };

    const baseUrl = getBaseUrl();
    if (baseUrl) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), BOT_TIMEOUT_MS);
            const response = await fetch(`${baseUrl}/reports`, {
                method: 'POST',
                headers: getBotHeaders(),
                body: JSON.stringify(payload),
                signal: controller.signal,
            });
            clearTimeout(timeout);

            if (response.ok) {
                const data = await response.json();
                return res.status(201).json(data);
            }
        } catch (err) {
            console.warn('[Feedback] Échec enregistrement via bot, repli local:', err.message);
        }
    }

    // Enregistrement local
    const reports = loadLocalReports();
    const id = `REP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newReport = {
        id,
        ...payload,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    reports.unshift(newReport);
    saveLocalReports(reports);

    return res.status(201).json({ success: true, report: newReport });
};

// Notifications : retours de la personne qui ont reçu une réponse ou changé de statut depuis sa dernière visite
function hasNewsFor(report, seenAt) {
    const updated = Date.parse(report.reply?.at || report.updatedAt || 0);
    const created = Date.parse(report.createdAt || 0);
    const touchedByStaff = Boolean(report.reply?.text) || (report.status && report.status !== 'open');
    if (!touchedByStaff || !updated || updated - created < 1000) return false;
    return !seenAt || updated > Date.parse(seenAt);
}

async function loadReports() {
    const baseUrl = getBaseUrl();
    if (baseUrl) {
        try {
            const response = await fetch(`${baseUrl}/reports`, { headers: getBotHeaders(), signal: AbortSignal.timeout(BOT_TIMEOUT_MS) });
            if (response.ok) {
                const data = await response.json();
                return Array.isArray(data.reports) ? data.reports : [];
            }
        } catch {
            // repli local ci-dessous
        }
    }
    return loadLocalReports();
}

// GET /api/feedback/notifications — nombre de retours avec du nouveau (réponse ou statut)
export const getFeedbackNotifications = async (req, res) => {
    const reports = (await loadReports()).filter((report) => isOwnReport(report, req.user));
    const fresh = reports.filter((report) => hasNewsFor(report, req.user.feedback_seen_at));
    res.json({ count: fresh.length, ids: fresh.map((report) => report.id) });
};

// POST /api/feedback/notifications/seen — la personne a ouvert la page Retours & idées
export const markFeedbackSeen = async (req, res) => {
    await User.setFeedbackSeen(req.user.id);
    res.json({ count: 0 });
};

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

export const updateFeedbackStatus = async (req, res) => {
    const { id } = req.params;
    const { status, reply } = req.body || {};

    if (status && !STATUSES.includes(status)) return res.status(400).json({ error: 'Statut inconnu' });
    if (!status && reply === undefined) return res.status(400).json({ error: 'Statut ou réponse requis' });

    const baseUrl = getBaseUrl();
    if (baseUrl) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), BOT_TIMEOUT_MS);
            const response = await fetch(`${baseUrl}/reports/${id}`, {
                method: 'PATCH',
                headers: getBotHeaders(),
                body: JSON.stringify({ status, reply }),
                signal: controller.signal,
            });
            clearTimeout(timeout);

            if (response.ok) {
                const data = await response.json();
                return res.json(data);
            }
        } catch (err) {
            console.warn('[Feedback] Échec màj via bot, repli local:', err.message);
        }
    }

    const reports = loadLocalReports();
    const target = reports.find((r) => r.id === id);
    if (!target) return res.status(404).json({ error: 'Signalement introuvable' });
    if (status) target.status = status;
    if (reply !== undefined) {
        const text = String(reply || '').trim().slice(0, 2000);
        target.reply = text ? { text, at: new Date().toISOString() } : null;
    }
    target.updatedAt = new Date().toISOString();
    saveLocalReports(reports);

    return res.json({ success: true, report: target });
};

export const deleteFeedback = async (req, res) => {
    const { id } = req.params;
    const baseUrl = getBaseUrl();
    if (baseUrl) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), BOT_TIMEOUT_MS);
            const response = await fetch(`${baseUrl}/reports/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: getBotHeaders(),
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (response.ok || response.status === 404) return res.status(response.status === 404 ? 404 : 200).json(await response.json().catch(() => ({})));
        } catch (err) {
            console.warn('[Feedback] Échec suppression via bot, repli local:', err.message);
        }
    }
    const reports = loadLocalReports();
    const next = reports.filter((r) => r.id !== id);
    if (next.length === reports.length) return res.status(404).json({ error: 'Signalement introuvable' });
    saveLocalReports(next);
    return res.json({ success: true });
};
