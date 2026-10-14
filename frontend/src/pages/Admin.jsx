import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';
import { staffService } from '../services/api.js';
import Icon from '../components/Icon.jsx';
import { useConfirm } from '../hooks/useConfirm.jsx';

// Administration du site : comptes (bannir, nommer admin) et serveurs (suspendre le bot)
export default function Admin() {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const locale = i18n.resolvedLanguage || i18n.language || 'fr';
    const isSuperAdmin = user?.role === 'superadmin';
    const [confirm, confirmDialog] = useConfirm();

    const [tab, setTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [guilds, setGuilds] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(null);
    const [error, setError] = useState('');

    const loadUsers = useCallback(async (query = '') => {
        try {
            const data = await staffService.getUsers(query);
            setUsers(data.users || []);
        } catch (err) {
            setError(err.message);
        }
    }, []);

    const loadGuilds = useCallback(async () => {
        try {
            const data = await staffService.getGuilds();
            setGuilds(data.guilds || []);
        } catch (err) {
            setError(err.message);
        }
    }, []);

    useEffect(() => {
        Promise.all([loadUsers(), loadGuilds()]).finally(() => setLoading(false));
    }, [loadUsers, loadGuilds]);

    // Recherche de comptes côté serveur, après une courte pause de frappe
    useEffect(() => {
        const timer = setTimeout(() => loadUsers(search), 300);
        return () => clearTimeout(timer);
    }, [search, loadUsers]);

    const filteredGuilds = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return guilds;
        return guilds.filter((g) => g.name.toLowerCase().includes(q) || g.id.includes(q));
    }, [guilds, search]);

    const run = async (key, action) => {
        setBusy(key);
        setError('');
        try {
            await action();
        } catch (err) {
            setError(err.message || t('admin.error'));
        } finally {
            setBusy(null);
        }
    };

    // Raison facultative demandée dans une fenêtre du site ; null = annulé
    const askReason = (title, message, confirmLabel) => confirm({
        title,
        message,
        confirmLabel,
        danger: true,
        input: { label: t('admin.reason_label'), placeholder: t('admin.reason_ph') },
    });

    const toggleBan = async (target) => {
        const name = target.username || target.email;
        let reason = '';
        if (!target.banned) {
            reason = await askReason(t('admin.ban_title', { name }), t('admin.ban_message'), t('admin.ban'));
            if (reason === null) return;
        } else if (!(await confirm({ title: t('admin.unban_title', { name }), confirmLabel: t('admin.unban') }))) {
            return;
        }
        run(`ban-${target.id}`, async () => {
            const res = await staffService.setBan(target.id, !target.banned, reason);
            setUsers((prev) => prev.map((u) => (u.id === target.id ? res.user : u)));
        });
    };

    const toggleAdmin = async (target) => {
        const name = target.username || target.email;
        const role = target.role === 'admin' ? 'user' : 'admin';
        const ok = await confirm({
            title: t(role === 'admin' ? 'admin.promote_confirm' : 'admin.demote_confirm', { name }),
            message: t(role === 'admin' ? 'admin.promote_message' : 'admin.demote_message'),
            confirmLabel: role === 'admin' ? t('admin.promote') : t('admin.demote'),
            danger: role !== 'admin',
        });
        if (!ok) return;
        run(`role-${target.id}`, async () => {
            const res = await staffService.setRole(target.id, role);
            setUsers((prev) => prev.map((u) => (u.id === target.id ? res.user : u)));
        });
    };

    const toggleSuspend = async (guild) => {
        let reason = '';
        if (!guild.suspended) {
            reason = await askReason(t('admin.suspend_title', { name: guild.name }), t('admin.suspend_message'), t('admin.suspend'));
            if (reason === null) return;
        } else if (!(await confirm({ title: t('admin.resume_title', { name: guild.name }), confirmLabel: t('admin.resume') }))) {
            return;
        }
        run(`guild-${guild.id}`, async () => {
            await staffService.setSuspended(guild.id, !guild.suspended, reason);
            setGuilds((prev) => prev.map((g) => (g.id === guild.id ? { ...g, suspended: !guild.suspended } : g)));
        });
    };

    if (!['admin', 'superadmin'].includes(user?.role)) return <Navigate to="/dashboard" replace />;

    const tabs = [
        { id: 'users', label: t('admin.tab_users'), count: users.length },
        { id: 'guilds', label: t('admin.tab_guilds'), count: guilds.length },
    ];

    return (
        <main className="pg" id="main" tabIndex="-1">
            <header className="pg-head pg-head--row">
                <div>
                    <h1>{t('admin.title')}</h1>
                    <p>{isSuperAdmin ? t('admin.lead_super') : t('admin.lead')}</p>
                </div>
                <Link to="/feedback" className="ui-btn">
                    <Icon name="message" size={16} /> {t('admin.feedbacks')}
                </Link>
            </header>

            {error ? <div role="alert" className="ui-flash ui-flash--error"><Icon name="alert" size={18} /> {error}</div> : null}

            <div className="fb-toolbar">
                <div className="ui-seg" role="tablist">
                    {tabs.map((item) => (
                        <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? 'is-active' : ''} onClick={() => setTab(item.id)}>
                            {item.label} <span>{item.count}</span>
                        </button>
                    ))}
                </div>
                <label className="ui-search">
                    <Icon name="search" size={16} />
                    <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tab === 'users' ? t('admin.search_users') : t('admin.search_guilds')} />
                </label>
            </div>

            {loading ? <p className="pnl-muted">{t('admin.loading')}</p> : null}

            {!loading && tab === 'users' ? (
                <ul className="adm-list">
                    {users.map((item) => (
                        <li key={item.id} className={`adm-row${item.banned ? ' is-banned' : ''}`}>
                            {item.avatarUrl
                                ? <img src={item.avatarUrl} alt="" className="adm-row__avatar" />
                                : <span className="adm-row__avatar">{(item.username || item.email || '?').charAt(0).toUpperCase()}</span>}
                            <div className="adm-row__main">
                                <strong>
                                    {item.username || item.firstname || '—'}
                                    {item.role !== 'user' ? <em className={`adm-role is-${item.role}`}>{t(`admin.role_${item.role}`)}</em> : null}
                                    {item.banned ? <em className="adm-role is-banned">{t('admin.banned')}</em> : null}
                                </strong>
                                <small>
                                    {item.email}
                                    {item.discordId ? ` · Discord ${item.discordId}` : ''}
                                    {item.createdAt ? ` · ${new Date(item.createdAt).toLocaleDateString(locale)}` : ''}
                                </small>
                                {item.banned && item.banReason ? <small className="adm-row__reason">{item.banReason}</small> : null}
                            </div>
                            {item.role !== 'superadmin' && item.id !== user.id ? (
                                <div className="adm-row__actions">
                                    {isSuperAdmin ? (
                                        <button type="button" className="ui-btn ui-btn--ghost" disabled={busy === `role-${item.id}`} onClick={() => toggleAdmin(item)}>
                                            <Icon name="crown" size={15} /> {item.role === 'admin' ? t('admin.demote') : t('admin.promote')}
                                        </button>
                                    ) : null}
                                    {isSuperAdmin || item.role === 'user' ? (
                                        <button type="button" className={`ui-btn ui-btn--ghost${item.banned ? '' : ' fb-admin__danger'}`} disabled={busy === `ban-${item.id}`} onClick={() => toggleBan(item)}>
                                            <Icon name="ban" size={15} /> {item.banned ? t('admin.unban') : t('admin.ban')}
                                        </button>
                                    ) : null}
                                </div>
                            ) : null}
                        </li>
                    ))}
                    {users.length === 0 ? <li className="pnl-muted">{t('admin.no_users')}</li> : null}
                </ul>
            ) : null}

            {!loading && tab === 'guilds' ? (
                <ul className="adm-list">
                    {filteredGuilds.map((guild) => (
                        <li key={guild.id} className={`adm-row${guild.suspended ? ' is-banned' : ''}`}>
                            {guild.iconUrl
                                ? <img src={guild.iconUrl} alt="" className="adm-row__avatar" />
                                : <span className="adm-row__avatar">{guild.name.charAt(0).toUpperCase()}</span>}
                            <div className="adm-row__main">
                                <strong>
                                    {guild.name}
                                    {guild.suspended ? <em className="adm-role is-banned">{t('admin.suspended')}</em> : null}
                                </strong>
                                <small>{guild.id} · {t('panel.members', { count: guild.memberCount.toLocaleString(locale) })}</small>
                            </div>
                            <div className="adm-row__actions">
                                <button type="button" className={`ui-btn ui-btn--ghost${guild.suspended ? '' : ' fb-admin__danger'}`} disabled={busy === `guild-${guild.id}`} onClick={() => toggleSuspend(guild)}>
                                    <Icon name={guild.suspended ? 'refresh' : 'pause'} size={15} /> {guild.suspended ? t('admin.resume') : t('admin.suspend')}
                                </button>
                            </div>
                        </li>
                    ))}
                    {filteredGuilds.length === 0 ? <li className="pnl-muted">{t('admin.no_guilds')}</li> : null}
                </ul>
            ) : null}
            {confirmDialog}
        </main>
    );
}
