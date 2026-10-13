import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { botService, discordService } from '../services/api.js';
import MotherboardBackground from '../components/MotherboardBackground.jsx';
import { CuteCircuitHeader, OscilloscopeWave, CuteRetroCrtMonitor, CuteRobotMascot } from '../components/CyberMascots.jsx';

function hasManageGuildPermission(guild) {
    if (guild?.owner) return true;
    try {
        return (BigInt(guild?.permissions || '0') & (0x20n | 0x8n)) !== 0n;
    } catch {
        return false;
    }
}

function getDiscordGuildIcon(guild) {
    if (guild.iconUrl) return guild.iconUrl;
    if (guild.icon) return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=96`;
    return null;
}

const PLUG_COLORS = ['purple', 'green', 'cyan'];

function Dashboard() {
    const { user } = useAuth();
    const { setIsIslamUnlocked } = useTheme();
    const location = useLocation();
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [inviteLoading, setInviteLoading] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        setRefreshing(true);
        try {
            const data = await botService.getOverview();
            setOverview(data);
            setError('');

            const hasIslamActive = (data?.guilds || []).some((bg) => bg.islamModeEnabled);
            if (hasIslamActive) {
                setIsIslamUnlocked(true);
            }
        } catch (apiError) {
            setError(apiError.message || 'Impossible de charger les données du bot.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [setIsIslamUnlocked]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const discordGuilds = useMemo(() => {
        try {
            const parsed = JSON.parse(localStorage.getItem('discord_guilds') || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }, []);

    const connectedGuildIds = useMemo(
        () => new Set((overview?.guilds || []).map((guild) => String(guild.id))),
        [overview]
    );

    const userGuildMap = useMemo(() => {
        const map = new Map();
        for (const g of discordGuilds) {
            map.set(String(g.id), {
                ...g,
                id: String(g.id),
                canManage: hasManageGuildPermission(g),
            });
        }
        return map;
    }, [discordGuilds]);

    // 1. Serveurs à gérer : Perm de gérer ET Bot présent
    const manageableGuilds = useMemo(() => {
        const result = [];
        for (const g of userGuildMap.values()) {
            if (g.canManage && connectedGuildIds.has(g.id)) {
                const botGuild = (overview?.guilds || []).find((bg) => String(bg.id) === g.id);
                result.push({
                    ...g,
                    iconUrl: g.iconUrl || botGuild?.iconUrl || getDiscordGuildIcon(g),
                    memberCount: g.memberCount || botGuild?.memberCount || null,
                    connected: true,
                    canManage: true,
                });
            }
        }
        return result;
    }, [userGuildMap, connectedGuildIds, overview]);

    // Commandes les plus utilisées
    const topCommands = useMemo(() => {
        const counts = {};
        for (const g of manageableGuilds) {
            const bg = (overview?.guilds || []).find((b) => String(b.id) === String(g.id));
            const cMap = bg?.observability?.commandByName || {};
            for (const [cmd, count] of Object.entries(cMap)) {
                counts[cmd] = (counts[cmd] || 0) + Number(count || 0);
            }
        }
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .filter((c) => c.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
    }, [manageableGuilds, overview]);

    // Erreurs récentes
    const recentErrors = useMemo(() => {
        const errors = [];
        for (const g of manageableGuilds) {
            const bg = (overview?.guilds || []).find((b) => String(b.id) === String(g.id));
            const list = Array.isArray(bg?.observability?.recentErrors) ? bg.observability.recentErrors : [];
            errors.push(...list);
        }
        return errors
            .sort((a, b) => new Date(b.ts || 0) - new Date(a.ts || 0))
            .slice(0, 5);
    }, [manageableGuilds, overview]);

    const errorTotal = useMemo(() => {
        let total = 0;
        for (const g of manageableGuilds) {
            const bg = (overview?.guilds || []).find((b) => String(b.id) === String(g.id));
            total += Number(bg?.observability?.errorTotal || 0);
        }
        return total;
    }, [manageableGuilds, overview]);

    // 2. Autres serveurs où le bot est présent sans permission
    const otherBotGuilds = useMemo(() => {
        const result = [];
        const addedIds = new Set(manageableGuilds.map((g) => g.id));
        for (const g of userGuildMap.values()) {
            if (!addedIds.has(g.id) && connectedGuildIds.has(g.id)) {
                const botGuild = (overview?.guilds || []).find((bg) => String(bg.id) === g.id);
                if (botGuild?.islamModeEnabled || g.id === '1283533269047971894') continue;
                result.push({
                    ...g,
                    iconUrl: g.iconUrl || botGuild?.iconUrl || getDiscordGuildIcon(g),
                    memberCount: g.memberCount || botGuild?.memberCount || null,
                    connected: true,
                    canManage: false,
                });
                addedIds.add(g.id);
            }
        }
        return result;
    }, [userGuildMap, connectedGuildIds, manageableGuilds, overview]);

    // 3. Serveurs administrables à inviter
    const inviteableGuilds = useMemo(() => {
        const result = [];
        for (const g of userGuildMap.values()) {
            if (g.canManage && !connectedGuildIds.has(g.id)) {
                result.push({
                    ...g,
                    iconUrl: g.iconUrl || getDiscordGuildIcon(g),
                    connected: false,
                    canManage: true,
                });
            }
        }
        return result;
    }, [userGuildMap, connectedGuildIds]);

    const inviteBot = async (guildId) => {
        setInviteLoading(guildId);
        try {
            const invite = await discordService.getBotInviteUrl(guildId);
            window.open(invite.url, '_blank', 'noopener,noreferrer');
        } catch {
            setError('Impossible de préparer le lien d’invitation.');
        } finally {
            setInviteLoading(null);
        }
    };

    const firstCommand = topCommands[0];
    const firstCommandCount = firstCommand ? Number(firstCommand.count || 1) : 1;
    const username = user?.firstname || user?.username || 'Sofiane';

    return (
        <main className="cyber-dashboard-root">
            {/* 1. Carte Mère Fond Vectoriel (Motherboard SVG) */}
            <MotherboardBackground />

            {/* 2. Layout principal de la console */}
            <div className="cyber-console-layout">
                {/* === COLONNE GAUCHE : BARRE DE NAVIGATION PILULES === */}
                <aside className="cyber-sidebar" aria-label="Console Navigation">
                    {/* Dôme supérieur de la console */}
                    <div className="cyber-saucer-dome" aria-hidden="true">
                        <svg className="cyber-saucer-svg" viewBox="0 0 160 48" fill="none">
                            <ellipse cx="80" cy="22" rx="72" ry="16" fill="#0b2440" stroke="#1d558b" strokeWidth="2.5" />
                            <ellipse cx="80" cy="20" rx="46" ry="10" fill="#071b30" stroke="#22d3ee" strokeWidth="1.5" />
                            <ellipse cx="80" cy="20" rx="28" ry="4" fill="#22d3ee" opacity="0.85" />
                            <path d="M 30 18 Q 80 8 130 18" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                        </svg>
                    </div>

                    {/* Bouton 1 : Panel (Actif) */}
                    <Link
                        to="/dashboard"
                        className={`cyber-nav-pill ${location.pathname === '/dashboard' ? 'is-active' : ''}`}
                    >
                        <span className="cyber-nav-pill__socket-left" style={{ borderColor: '#22d3ee' }} />
                        <span className="cyber-nav-pill__label">Panel</span>
                        <span className="cyber-nav-pill__icon" style={{ color: '#22d3ee' }}>⚙️</span>
                    </Link>

                    {/* Bouton 2 : Documentation */}
                    <Link
                        to="/docs/accueil"
                        className={`cyber-nav-pill ${location.pathname.startsWith('/docs') ? 'is-active' : ''}`}
                    >
                        <span className="cyber-nav-pill__label">Documentation</span>
                        <span className="cyber-nav-pill__icon" style={{ color: '#ec4899' }}>👾</span>
                        <span className="cyber-nav-pill__socket-right" style={{ color: '#ec4899' }} />
                    </Link>

                    {/* Bouton 3 : Statuts */}
                    <Link
                        to="/status"
                        className={`cyber-nav-pill ${location.pathname === '/status' ? 'is-active' : ''}`}
                    >
                        <span className="cyber-nav-pill__label">Statuts</span>
                        <span className="cyber-nav-pill__icon" style={{ color: '#22c55e' }}>🖲️</span>
                        <span className="cyber-nav-pill__socket-right" style={{ color: '#22c55e' }} />
                    </Link>

                    {/* Bouton 4 : Retours & idées */}
                    <Link
                        to="/feedback"
                        className={`cyber-nav-pill ${location.pathname === '/feedback' ? 'is-active' : ''}`}
                    >
                        <span className="cyber-nav-pill__label">Retours & idées</span>
                        <span className="cyber-nav-pill__icon" style={{ color: '#f43f5e' }}>💖</span>
                        <span className="cyber-nav-pill__socket-right" style={{ color: '#a855f7' }} />
                    </Link>

                    {/* Bouton 5 : Support */}
                    <a
                        href="https://discord.gg/azim"
                        target="_blank"
                        rel="noreferrer"
                        className="cyber-nav-pill"
                    >
                        <span className="cyber-nav-pill__label">Support</span>
                        <span className="cyber-nav-pill__icon" style={{ color: '#38bdf8' }}>⚙️</span>
                        <span className="cyber-nav-pill__socket-left" style={{ borderColor: '#38bdf8' }} />
                    </a>

                    {/* Capsule Utilisateur */}
                    <div className="cyber-user-capsule">
                        <div className="cyber-user-avatar-wrap">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={username} className="cyber-user-avatar" />
                            ) : (
                                <div className="flex size-full items-center justify-center font-bold text-cyan-300 text-xs">
                                    {username.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="cyber-user-status-dot" />
                        </div>
                        <span className="cyber-user-name">{username}</span>
                        <Link to="/settings" className="cyber-user-settings-btn" title="Paramètres">
                            ⚙
                        </Link>
                    </div>
                </aside>

                {/* === COLONNE CENTRALE : VOS ACCÈS (SERVEURS À GÉRER) === */}
                <main className="cyber-center-column">
                    <section className="cyber-chassis" aria-label="Serveurs à gérer">
                        {/* En-tête de la carte avec composants mignons */}
                        <div className="cyber-chassis__header">
                            <div>
                                <p className="cyber-chassis__eyebrow">VOS ACCÈS</p>
                                <h1 className="cyber-chassis__title">Serveurs à gérer</h1>
                            </div>

                            {/* Ruban décoratif circuit avec les 3 puces kawaii souriantes */}
                            <div className="cyber-cute-ribbon" aria-hidden="true">
                                <CuteCircuitHeader />
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="cyber-chassis__count">
                                    {manageableGuilds.length} serveur(s)
                                </span>
                                <button
                                    type="button"
                                    onClick={loadData}
                                    disabled={refreshing}
                                    title="Actualiser les serveurs"
                                    className="text-xs text-cyan-400 hover:text-cyan-200 transition-colors p-1"
                                >
                                    {refreshing ? '⟳' : '↻'}
                                </button>
                            </div>
                        </div>

                        {error ? (
                            <div role="alert" className="mb-4 rounded-lg bg-rose-950/50 border border-rose-600/40 p-3 text-xs text-rose-300">
                                {error}
                            </div>
                        ) : null}

                        {/* En-tête du tableau */}
                        <div className="cyber-table-head" aria-hidden="true">
                            <span>Serveur</span>
                            <span>Bot</span>
                            <span>Membres</span>
                            <span>Configuration</span>
                        </div>

                        {/* Liste des serveurs avec connecteurs 3D */}
                        <div className="cyber-server-list">
                            {manageableGuilds.length > 0 ? (
                                manageableGuilds.map((guild, idx) => {
                                    const icon = getDiscordGuildIcon(guild);
                                    const plugColor = PLUG_COLORS[idx % PLUG_COLORS.length];

                                    return (
                                        <article className="cyber-server-row" key={guild.id}>
                                            {/* Prise connecteur 3D à gauche de la ligne */}
                                            <div className={`cyber-socket-plug cyber-socket-plug--${plugColor}`} aria-hidden="true">
                                                <span className="cyber-socket-plug__pin" />
                                            </div>

                                            {/* Identité : icône + nom */}
                                            <div className="cyber-server-identity">
                                                {icon ? (
                                                    <img src={icon} alt="" className="cyber-server-icon" />
                                                ) : (
                                                    <span className="cyber-server-fallback">
                                                        {(guild.name || '?').slice(0, 1).toUpperCase()}
                                                    </span>
                                                )}
                                                <span className="cyber-server-name" title={guild.name}>
                                                    {guild.name}
                                                </span>
                                            </div>

                                            {/* Statut Bot Installé */}
                                            <div>
                                                <span className="cyber-bot-badge">
                                                    <span className="cyber-bot-badge__dot" />
                                                    Installé
                                                </span>
                                            </div>

                                            {/* Nombre de membres */}
                                            <div className="cyber-server-members">
                                                {guild.memberCount ? Number(guild.memberCount).toLocaleString() : '—'}
                                            </div>

                                            {/* Bouton Configurer */}
                                            <div>
                                                <Link
                                                    to={`/dashboard/servers/${guild.id}/config`}
                                                    className="cyber-btn-config"
                                                >
                                                    <span>Configurer</span>
                                                    <span aria-hidden="true">↗</span>
                                                </Link>
                                            </div>
                                        </article>
                                    );
                                })
                            ) : (
                                <div className="rounded-xl border border-dashed border-cyan-800/50 bg-[#071628]/60 p-8 text-center">
                                    <p className="text-sm text-slate-300 font-medium">
                                        Aucun serveur où vous êtes administrateur n'a Azim installé actuellement.
                                    </p>
                                    {inviteableGuilds.length > 0 ? (
                                        <p className="mt-2 text-xs text-cyan-400">
                                            Vous pouvez l'ajouter en un clic sur l'un de vos serveurs ci-dessous.
                                        </p>
                                    ) : (
                                        <Link to="/login" className="mt-4 inline-block text-xs font-semibold text-cyan-400 hover:underline">
                                            Actualiser vos autorisations Discord →
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Section additionnelle si d'autres serveurs peuvent être invités */}
                    {inviteableGuilds.length > 0 && (
                        <section className="cyber-chassis mt-6 opacity-95">
                            <div className="cyber-chassis__header">
                                <div>
                                    <p className="cyber-chassis__eyebrow">INVITATION</p>
                                    <h2 className="cyber-chassis__title">Ajouter Azim à vos autres serveurs</h2>
                                </div>
                                <span className="cyber-chassis__count">
                                    {inviteableGuilds.length} disponible(s)
                                </span>
                            </div>

                            <div className="cyber-server-list">
                                {inviteableGuilds.map((guild) => {
                                    const icon = getDiscordGuildIcon(guild);

                                    return (
                                        <article className="cyber-server-row" key={guild.id}>
                                            <div className="cyber-socket-plug cyber-socket-plug--cyan" aria-hidden="true">
                                                <span className="cyber-socket-plug__pin" />
                                            </div>
                                            <div className="cyber-server-identity">
                                                {icon ? (
                                                    <img src={icon} alt="" className="cyber-server-icon" />
                                                ) : (
                                                    <span className="cyber-server-fallback">
                                                        {(guild.name || '?').slice(0, 1).toUpperCase()}
                                                    </span>
                                                )}
                                                <span className="cyber-server-name">{guild.name}</span>
                                            </div>
                                            <div>
                                                <span className="cyber-bot-badge text-slate-400 bg-slate-800/80 border-slate-700">
                                                    Non installé
                                                </span>
                                            </div>
                                            <div className="cyber-server-members">—</div>
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => inviteBot(guild.id)}
                                                    disabled={inviteLoading === guild.id}
                                                    className="cyber-btn-config"
                                                >
                                                    {inviteLoading === guild.id ? 'Ouverture…' : 'Ajouter le bot ↗'}
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Section communautés publiques / autres serveurs */}
                    {otherBotGuilds.length > 0 && (
                        <section className="cyber-chassis mt-6 opacity-90">
                            <div className="cyber-chassis__header">
                                <div>
                                    <p className="cyber-chassis__eyebrow">COMMUNAUTÉS AZIM</p>
                                    <h2 className="cyber-chassis__title">Autres serveurs avec Azim</h2>
                                </div>
                                <span className="cyber-chassis__count">{otherBotGuilds.length} serveur(s)</span>
                            </div>
                            <div className="cyber-server-list">
                                {otherBotGuilds.map((guild) => {
                                    const icon = getDiscordGuildIcon(guild);
                                    return (
                                        <article className="cyber-server-row" key={guild.id}>
                                            <div className="cyber-socket-plug cyber-socket-plug--purple" aria-hidden="true">
                                                <span className="cyber-socket-plug__pin" />
                                            </div>
                                            <div className="cyber-server-identity">
                                                {icon ? <img src={icon} alt="" className="cyber-server-icon" /> : <span className="cyber-server-fallback">{(guild.name || '?').slice(0, 1).toUpperCase()}</span>}
                                                <span className="cyber-server-name">{guild.name}</span>
                                            </div>
                                            <div>
                                                <span className="cyber-bot-badge"><span className="cyber-bot-badge__dot" />En ligne</span>
                                            </div>
                                            <div className="cyber-server-members">{guild.memberCount ? Number(guild.memberCount).toLocaleString() : '—'}</div>
                                            <div>
                                                <span className="text-xs text-slate-500 italic">Accès membre</span>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </main>

                {/* === COLONNE DROITE : COMMANDES OSCILLOSCOPE + JOURNAL ERREURS CRT === */}
                <aside className="cyber-right-column">
                    {/* Carte 1 : UTILISATION - Commandes les plus utilisées */}
                    <section className="cyber-chassis" aria-label="Commandes les plus utilisées">
                        <div className="cyber-chassis__header">
                            <div>
                                <p className="cyber-chassis__eyebrow">UTILISATION</p>
                                <h2 className="cyber-chassis__title">Commandes les plus utilisées</h2>
                            </div>
                            <Link to="/command-history" className="text-xs font-semibold text-cyan-400 hover:text-cyan-200 transition-colors">
                                Tout voir →
                            </Link>
                        </div>

                        {/* Rang 01 + Prise + Onde sinusoïdale néon oscilloscope + compteur */}
                        <div className="mt-2">
                            <OscilloscopeWave count={firstCommandCount} />
                            {firstCommand && (
                                <p className="mt-2 text-xs font-mono text-cyan-300 flex items-center justify-between px-1">
                                    <span>/{firstCommand.name}</span>
                                    <span className="text-slate-400">{firstCommandCount} appel(s)</span>
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Carte 2 : JOURNAL - Erreurs récentes avec TV CRT et Robot */}
                    <section className="cyber-chassis" aria-label="Journal d'erreurs">
                        <div className="cyber-chassis__header">
                            <div>
                                <p className="cyber-chassis__eyebrow">JOURNAL</p>
                                <h2 className="cyber-chassis__title">Erreurs récentes</h2>
                            </div>
                            <span className="cyber-chassis__count">{errorTotal} au total</span>
                        </div>

                        {/* Corps : Téléviseur CRT oscilloscope + Robot avec bulle de dialogue */}
                        <div className="cyber-errors-body">
                            <CuteRetroCrtMonitor />
                            <CuteRobotMascot
                                message={
                                    recentErrors.length === 0
                                        ? 'Aucune erreur récente signalée. 😊'
                                        : `${recentErrors.length} événement(s) récent(s). Le système fonctionne bien.`
                                }
                            />
                        </div>
                    </section>
                </aside>
            </div>
        </main>
    );
}

export default Dashboard;