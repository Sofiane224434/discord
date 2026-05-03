import { query } from '../config/db.js';

const DashboardModel = {
    async saveOverview(overview, source = 'api') {
        const bot = overview?.bot || {};
        const stats = overview?.stats || {};
        const guilds = Array.isArray(overview?.guilds) ? overview.guilds : [];

        const snapshotResult = await query(
            `INSERT INTO bot_snapshots (
        bot_name,
        bot_status,
        uptime_seconds,
        latency_ms,
        guild_count,
        member_count,
        command_count_24h,
        active_users_24h,
        source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                bot.name || 'Azim',
                bot.status || 'offline',
                Number(bot.uptime || 0),
                Number(bot.latency || 0),
                Number(stats.guildCount || 0),
                Number(stats.memberCount || 0),
                Number(stats.commandCount24h || 0),
                Number(stats.activeUsers24h || 0),
                source,
            ]
        );

        const snapshotId = snapshotResult.insertId;

        if (!snapshotId || guilds.length === 0) {
            return snapshotId;
        }

        const insertGuildSql = `
      INSERT INTO bot_guilds (
        snapshot_id,
        guild_id,
        guild_name,
        member_count,
        icon_url
      ) VALUES (?, ?, ?, ?, ?)
    `;

        for (const guild of guilds) {
            await query(insertGuildSql, [
                snapshotId,
                String(guild.id || ''),
                guild.name || 'Serveur inconnu',
                Number(guild.memberCount || 0),
                guild.iconUrl || null,
            ]);
        }

        return snapshotId;
    },

    async getLatestOverview() {
        const snapshots = await query(
            `SELECT
        id,
        bot_name,
        bot_status,
        uptime_seconds,
        latency_ms,
        guild_count,
        member_count,
        command_count_24h,
        active_users_24h,
        source,
        created_at
      FROM bot_snapshots
      ORDER BY id DESC
      LIMIT 1`
        );

        const snapshot = snapshots[0];
        if (!snapshot) {
            return null;
        }

        const guilds = await query(
            `SELECT
        guild_id AS id,
        guild_name AS name,
        member_count AS memberCount,
        icon_url AS iconUrl
      FROM bot_guilds
      WHERE snapshot_id = ?
      ORDER BY member_count DESC, guild_name ASC`,
            [snapshot.id]
        );

        return {
            bot: {
                name: snapshot.bot_name,
                status: snapshot.bot_status,
                uptime: Number(snapshot.uptime_seconds || 0),
                latency: Number(snapshot.latency_ms || 0),
                connectedAt: null,
            },
            stats: {
                guildCount: Number(snapshot.guild_count || 0),
                memberCount: Number(snapshot.member_count || 0),
                commandCount24h: Number(snapshot.command_count_24h || 0),
                activeUsers24h: Number(snapshot.active_users_24h || 0),
                errorTotal: 0,
            },
            observability: {
                errorTotal: 0,
                errorByType: {},
                topCommands: [],
            },
            guilds,
            source: snapshot.source || 'cache',
            generatedAt: snapshot.created_at,
        };
    },
};

export default DashboardModel;
