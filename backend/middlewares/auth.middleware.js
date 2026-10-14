// middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import User, { resolveRole } from '../models/user.model.js'; // .js ! ⬅️
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token manquant' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let user = null;
        let dbUnavailable = false;
        try {
            user = await User.findById(decoded.id);
        } catch (dbError) {
            // Si la base MySQL est momentanément indisponible, on utilise les claims du token JWT valide
            dbUnavailable = true;
            console.warn('MySQL non accessible, utilisation du profil JWT:', dbError.message);
        }

        // Seulement si la base est injoignable : un compte supprimé ne doit plus être accepté
        if (!user && dbUnavailable && decoded?.id) {
            user = {
                id: decoded.id,
                email: decoded.email || null,
                firstname: decoded.firstname || 'Admin',
                lastname: decoded.lastname || null,
            };
        }

        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé' });
        }

        if (user.banned_at) {
            return res.status(403).json({ error: 'Ce compte a été suspendu.', hint: user.ban_reason || undefined, banned: true });
        }

        user.role = resolveRole(user);
        user.discord_guild_ids = Array.isArray(decoded.discordGuildIds) ? decoded.discordGuildIds : [];
        req.user = user;
        // Méthode et date de connexion : servent à confirmer les actions sensibles
        req.auth = { method: decoded.auth || 'password', issuedAt: decoded.iat };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expiré' });
        }
        return res.status(401).json({ error: 'Token invalide' });
    }
};
// Connexion facultative : renseigne req.user si un jeton valide est fourni
export const optionalAuth = (req, res, next) => {
    if (!req.headers.authorization?.startsWith('Bearer ')) return next();
    return authMiddleware(req, res, next);
};

export const requireStaff = (req, res, next) => {
    if (!['admin', 'superadmin'].includes(req.user?.role)) return res.status(403).json({ error: 'Accès réservé à l’administration.' });
    next();
};

export const requireSuperAdmin = (req, res, next) => {
    if (req.user?.role !== 'superadmin') return res.status(403).json({ error: 'Accès réservé au super administrateur.' });
    next();
};

export default authMiddleware;