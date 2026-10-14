// models/user.model.js
import { query } from '../config/db.js'; // Extension .js obligatoire ! ⬅️
import bcrypt from 'bcrypt';

const PUBLIC_COLUMNS = 'id, email, firstname, lastname, created_at, discord_id, discord_username, discord_avatar, has_password';

// Les comptes Discord sans email reçoivent une adresse technique : on ne l'affiche jamais
export function isPlaceholderEmail(email) {
    return /^discord_\d+@azim\.local$/i.test(String(email || ''));
}

function discordAvatarUrl(discordId, avatarHash) {
    if (!discordId) return null;
    if (avatarHash) {
        const ext = String(avatarHash).startsWith('a_') ? 'gif' : 'png';
        return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.${ext}?size=128`;
    }
    // Avatar par défaut de Discord (nouveau système de pseudos)
    try {
        return `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(discordId) >> 22n) % 6n)}.png`;
    } catch {
        return null;
    }
}

// Profil renvoyé au site (jamais le hash du mot de passe)
export function toPublicUser(row) {
    if (!row) return null;
    return {
        id: row.id,
        email: isPlaceholderEmail(row.email) ? null : row.email,
        firstname: row.firstname,
        lastname: row.lastname,
        createdAt: row.created_at || null,
        username: row.discord_username || row.firstname || null,
        avatarUrl: discordAvatarUrl(row.discord_id, row.discord_avatar),
        hasDiscord: Boolean(row.discord_id),
        hasPassword: row.has_password === undefined ? true : Boolean(row.has_password),
    };
}

const User = {
    // Trouver par email (avec le hash, pour la connexion)
    async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const results = await query(sql, [email.toLowerCase()]);
        return results[0] || null;
    },
    async findByDiscordId(discordId) {
        const results = await query('SELECT * FROM users WHERE discord_id = ?', [String(discordId)]);
        return results[0] || null;
    },
    // Trouver par ID (sans le password)
    async findById(id) {
        const results = await query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = ?`, [id]);
        return results[0] || null;
    },
    // Avec le hash : uniquement pour vérifier une identité
    async findByIdWithPassword(id) {
        const results = await query('SELECT * FROM users WHERE id = ?', [id]);
        return results[0] || null;
    },
    // Créer un utilisateur
    async create({ email, password, firstname = null, lastname = null, hasPassword = true, discord = null }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `
INSERT INTO users (email, password, firstname, lastname, has_password, discord_id, discord_username, discord_avatar)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;
        const result = await query(sql, [
            email.toLowerCase(),
            hashedPassword,
            firstname,
            lastname,
            hasPassword ? 1 : 0,
            discord?.id || null,
            discord?.username || null,
            discord?.avatar || null,
        ]);
        return this.findById(result.insertId);
    },
    // Associe / met à jour les infos Discord (pseudo et avatar changent côté Discord)
    async linkDiscord(id, discord) {
        await query(
            'UPDATE users SET discord_id = ?, discord_username = ?, discord_avatar = ? WHERE id = ?',
            [String(discord.id), discord.username || null, discord.avatar || null, id]
        );
    },
    async setPassword(id, plainPassword) {
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        await query('UPDATE users SET password = ?, has_password = 1 WHERE id = ?', [hashedPassword, id]);
    },
    async setEmail(id, email) {
        await query('UPDATE users SET email = ? WHERE id = ?', [email.toLowerCase(), id]);
    },
    async remove(id) {
        await query('DELETE FROM users WHERE id = ?', [id]);
    },
    // Vérifier le mot de passe
    async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
};
export default User;
