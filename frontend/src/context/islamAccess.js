// Le thème islam n'existe que pour les personnes qui gèrent un serveur où le mode islam est actif
function canManage(guild) {
    if (guild?.owner) return true;
    try {
        return (BigInt(guild?.permissions || '0') & (0x20n | 0x8n)) !== 0n;
    } catch {
        return false;
    }
}

export function managesIslamGuild(botGuilds) {
    let userGuilds = [];
    try {
        userGuilds = JSON.parse(localStorage.getItem('discord_guilds') || '[]');
    } catch {
        userGuilds = [];
    }
    const managed = new Set((Array.isArray(userGuilds) ? userGuilds : []).filter(canManage).map((g) => String(g.id)));
    return (botGuilds || []).some((g) => g.islamModeEnabled && managed.has(String(g.id)));
}
