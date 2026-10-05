// middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; // .js ! ⬅️
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token manquant' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let user = null;
        try {
            user = await User.findById(decoded.id);
        } catch (dbError) {
            // Si la base MySQL est momentanément indisponible, on utilise les claims du token JWT valide
            console.warn('MySQL non accessible, utilisation du profil JWT:', dbError.message);
        }

        if (!user && decoded?.id) {
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

        user.discord_guild_ids = Array.isArray(decoded.discordGuildIds) ? decoded.discordGuildIds : [];
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expiré' });
        }
        return res.status(401).json({ error: 'Token invalide' });
    }
};
export default authMiddleware;