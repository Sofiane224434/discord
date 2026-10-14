// config/db.js
import mysql from 'mysql2/promise';
// Création du pool de connexions
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'azim_dashboard',
    waitForConnections: true,
    connectionLimit: 10
});
// Fonction utilitaire pour les requêtes
export async function query(sql, params = []) {
    const [results] = await pool.execute(sql, params);
    return results;
}
// Test de connexion
export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('MySQL connecté');
        connection.release();
        return true;
    } catch (error) {
        console.error('Erreur MySQL:', error.message);
        return false;
    }
}
export default pool;
// Colonnes ajoutées après la création initiale de la table users.
// schema.sql ne s'exécute qu'à la première initialisation de MySQL : on complète ici au démarrage.
const USER_COLUMNS = {
    discord_id: 'VARCHAR(32) NULL UNIQUE',
    discord_username: 'VARCHAR(100) NULL',
    discord_avatar: 'VARCHAR(255) NULL',
    has_password: 'TINYINT(1) NOT NULL DEFAULT 1',
};

export async function ensureSchema() {
    const rows = await query(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'"
    );
    const existing = new Set(rows.map((row) => row.COLUMN_NAME));
    for (const [name, definition] of Object.entries(USER_COLUMNS)) {
        if (existing.has(name)) continue;
        await query(`ALTER TABLE users ADD COLUMN ${name} ${definition}`);
        console.log(`Migration : colonne users.${name} ajoutée`);
        if (name === 'has_password') {
            // Comptes créés via Discord sans email : leur mot de passe aléatoire n'a jamais été connu
            await query('UPDATE users SET has_password = 0 WHERE email LIKE ?', ['discord\_%@azim.local']);
        }
    }
}
