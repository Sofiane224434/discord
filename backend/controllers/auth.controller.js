// controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User, { toPublicUser } from '../models/user.model.js';

// Une connexion Discord récente vaut confirmation d'identité pour les comptes sans mot de passe
const DISCORD_REAUTH_WINDOW_SECONDS = 10 * 60;
const MIN_PASSWORD_LENGTH = 8;

// Génère un token JWT (auth = méthode de connexion : 'password' ou 'discord')
export const generateToken = (user, discordGuildIds = [], auth = 'password') => {
    return jwt.sign(
        { id: user.id, email: user.email, discordGuildIds, auth },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

function hasRecentDiscordAuth(req) {
    const { method, issuedAt } = req.auth || {};
    return method === 'discord' && Date.now() / 1000 - Number(issuedAt || 0) < DISCORD_REAUTH_WINDOW_SECONDS;
}

// Vérifie l'identité avant une action sensible : mot de passe actuel, ou connexion Discord récente
async function confirmIdentity(req, currentPassword) {
    const user = await User.findByIdWithPassword(req.user.id);
    if (!user) return { status: 404, body: { error: 'Compte introuvable' } };
    if (hasRecentDiscordAuth(req)) return { user };
    if (user.has_password) {
        if (!currentPassword || !(await User.verifyPassword(currentPassword, user.password))) {
            return { status: 403, body: { error: 'Mot de passe actuel incorrect', code: 'BAD_PASSWORD' } };
        }
        return { user };
    }
    return {
        status: 403,
        body: { error: 'Reconnectez-vous avec Discord pour confirmer cette action.', code: 'REAUTH_DISCORD' },
    };
}

function firstZodError(error) {
    return error.issues?.[0]?.message || 'Données invalides';
}

// POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { email, password, firstname, lastname } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email déjà utilisé' });
        }
        const user = await User.create({ email, password, firstname, lastname });
        const token = generateToken(user);
        res.status(201).json({ message: 'Inscription réussie', user: toPublicUser(user), token });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);
        if (!user || !user.has_password || !(await User.verifyPassword(password, user.password))) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }
        if (user.banned_at) {
            return res.status(403).json({ error: 'Ce compte a été suspendu.', hint: user.ban_reason || undefined });
        }
        const token = generateToken(user);
        res.json({ user: toPublicUser(user), token });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
// GET /api/auth/me
export const getProfile = async (req, res) => {
    res.json({
        user: {
            ...toPublicUser(req.user),
            // Indique au site si une action sensible peut se faire sans mot de passe
            recentDiscordAuth: hasRecentDiscordAuth(req),
        },
    });
};

// PUT /api/auth/password — définir ou changer son mot de passe
const passwordSchema = z.object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(MIN_PASSWORD_LENGTH, `Le mot de passe doit faire au moins ${MIN_PASSWORD_LENGTH} caractères`).max(128, 'Mot de passe trop long'),
});

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = passwordSchema.parse(req.body || {});
        const check = await confirmIdentity(req, currentPassword);
        if (!check.user) return res.status(check.status).json(check.body);
        await User.setPassword(check.user.id, newPassword);
        res.json({ message: check.user.has_password ? 'Mot de passe modifié.' : 'Mot de passe défini : vous pouvez aussi vous connecter avec votre email.' });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: firstZodError(error) });
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// PUT /api/auth/email — changer son adresse email
const emailSchema = z.object({
    email: z.email('Adresse email invalide').max(255),
    currentPassword: z.string().optional(),
});

export const changeEmail = async (req, res) => {
    try {
        const { email, currentPassword } = emailSchema.parse(req.body || {});
        const check = await confirmIdentity(req, currentPassword);
        if (!check.user) return res.status(check.status).json(check.body);
        const taken = await User.findByEmail(email);
        if (taken && taken.id !== check.user.id) {
            return res.status(409).json({ error: 'Cette adresse est déjà utilisée par un autre compte.' });
        }
        await User.setEmail(check.user.id, email);
        res.json({ message: 'Adresse email mise à jour.', user: toPublicUser(await User.findById(check.user.id)) });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: firstZodError(error) });
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// DELETE /api/auth/me — supprimer définitivement son compte
export const deleteAccount = async (req, res) => {
    try {
        const { currentPassword, confirm } = req.body || {};
        // Mot de confirmation tapé par l'utilisateur, selon la langue du site
        if (!['SUPPRIMER', 'DELETE'].includes(confirm)) {
            return res.status(400).json({ error: 'Tapez SUPPRIMER pour confirmer.' });
        }
        const check = await confirmIdentity(req, currentPassword);
        if (!check.user) return res.status(check.status).json(check.body);
        await User.remove(check.user.id);
        res.json({ message: 'Compte supprimé.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
