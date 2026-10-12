import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

export const getFeedbacks = async (req, res) => {
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
                return res.json(data);
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
    return res.json({ reports });
};

export const createFeedback = async (req, res) => {
    const { type, title, description, authorName, authorEmail, guildId, guildName } = req.body || {};

    if (!title?.trim() || !description?.trim()) {
        return res.status(400).json({ error: 'Le titre et la description sont obligatoires' });
    }

    const payload = {
        type: type === 'suggestion' ? 'suggestion' : 'bug',
        title: title.trim().slice(0, 150),
        description: description.trim().slice(0, 2000),
        authorName: authorName?.trim() || req.user?.username || 'Utilisateur Web',
        authorEmail: authorEmail?.trim() || req.user?.email || null,
        guildId: guildId || null,
        guildName: guildName || null,
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

export const updateFeedbackStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!status) return res.status(400).json({ error: 'Nouveau statut requis' });

    const baseUrl = getBaseUrl();
    if (baseUrl) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), BOT_TIMEOUT_MS);
            const response = await fetch(`${baseUrl}/reports/${id}`, {
                method: 'PATCH',
                headers: getBotHeaders(),
                body: JSON.stringify({ status }),
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
    target.status = status;
    target.updatedAt = new Date().toISOString();
    saveLocalReports(reports);

    return res.json({ success: true, report: target });
};
