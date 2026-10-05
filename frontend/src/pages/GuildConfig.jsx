import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminService } from '../services/api.js';

const EMPTY_CONFIG = {
    ai: {
        systemPrompt: '',
        language: '',
        triggerName: 'azim',
        triggerNames: ['azim'],
        keysCount: 0,
        keysPreviews: [],
    },
    logs: { channelId: '', restartAnnouncementEnabled: false },
    welcome: {
        enabled: false,
        channelId: '',
        destination: 'both',
        trigger: 'arrivee',
        defaultMessage: 'Bienvenue {mention} sur **{serveur}** !',
        defaultDmMessage: '',
        rules: [],
    },
    profile: { bio: '', avatarUrl: '', avatarUpdatedAt: null },
    youtube: { channels: [], targetChannelId: '' },
    tiktok: { enabled: false, username: '', targetChannelId: '' },
    rank: { enabled: false, announceChannelId: '', silent: false, rewards: [] },
    features: { islamModeEnabled: false },
    channels: [],
    roles: [],
    commands: [],
};

function mergeConfig(data) {
    const aiData = data?.ai || {};
    const rawTriggers = Array.isArray(aiData.triggerNames) && aiData.triggerNames.length > 0
        ? aiData.triggerNames
        : [aiData.triggerName || 'azim'];
    const triggerNames = rawTriggers.map((t) => String(t || '').trim().toLowerCase()).filter(Boolean);
    if (triggerNames.length === 0) triggerNames.push('azim');

    const welcomeData = data?.welcome || {};
    const normalizedRules = (welcomeData.rules || []).map((rule) => {
        const rawRoleIds = Array.isArray(rule.roleIds) && rule.roleIds.length > 0
            ? rule.roleIds
            : (rule.roleId ? [rule.roleId] : []);
        return {
            condition: rule.condition || 'has_role',
            matchType: rule.matchType || 'all',
            roleIds: rawRoleIds.filter(Boolean),
            roleId: rawRoleIds[0] || '',
            channelId: rule.channelId || '',
            message: rule.message || '',
            dmMessage: rule.dmMessage || '',
        };
    });

    return {
        ...EMPTY_CONFIG,
        ...data,
        ai: {
            ...EMPTY_CONFIG.ai,
            ...aiData,
            triggerName: triggerNames[0] || 'azim',
            triggerNames,
            keysPreviews: Array.isArray(aiData.keysPreviews) ? aiData.keysPreviews : [],
        },
        logs: { ...EMPTY_CONFIG.logs, ...data?.logs },
        welcome: {
            ...EMPTY_CONFIG.welcome,
            ...welcomeData,
            rules: normalizedRules,
        },
        profile: { ...EMPTY_CONFIG.profile, ...data?.profile },
        youtube: { ...EMPTY_CONFIG.youtube, ...data?.youtube },
        tiktok: { ...EMPTY_CONFIG.tiktok, ...data?.tiktok },
        rank: { ...EMPTY_CONFIG.rank, ...data?.rank },
        features: { ...EMPTY_CONFIG.features, ...data?.features },
        channels: Array.isArray(data?.channels) ? data.channels : [],
        roles: Array.isArray(data?.roles) ? data.roles : [],
        commands: Array.isArray(data?.commands) ? data.commands : [],
    };
}

function getGuildName(guildId) {
    try {
        const guilds = JSON.parse(localStorage.getItem('discord_guilds') || '[]');
        return guilds.find((guild) => String(guild.id) === String(guildId))?.name || guildId;
    } catch {
        return guildId;
    }
}

function Field({ label, children, hint }) {
    return (
        <label className="grid gap-1.5 text-sm font-medium text-slate-200">
            <span>{label}</span>
            {children}
            {hint ? <span className="text-xs font-normal text-slate-400">{hint}</span> : null}
        </label>
    );
}

function TextInput(props) {
    return <input {...props} className="form-input" />;
}

function SelectInput({ value, onChange, options, emptyLabel, className = '' }) {
    return (
        <select value={value || ''} onChange={onChange} className={`form-input ${className}`}>
            {emptyLabel ? <option value="">{emptyLabel}</option> : null}
            {options.map((option) => (
                <option value={option.value} key={option.value}>{option.label}</option>
            ))}
        </select>
    );
}

function GuildConfig() {
    const { guildId } = useParams();
    const [form, setForm] = useState(EMPTY_CONFIG);
    const [activeTab, setActiveTab] = useState('ai');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [newKey, setNewKey] = useState('');
    const [newTrigger, setNewTrigger] = useState('');
    const [islamCode, setIslamCode] = useState('');
    const [activatingIslam, setActivatingIslam] = useState(false);
    const [commandSearch, setCommandSearch] = useState('');

    const refresh = useCallback(async () => {
        const data = await adminService.getGuildConfig(guildId);
        setForm(mergeConfig(data));
    }, [guildId]);

    useEffect(() => {
        let active = true;
        setLoading(true);
        adminService.getGuildConfig(guildId)
            .then((data) => {
                if (active) setForm(mergeConfig(data));
            })
            .catch((apiError) => {
                if (active) setError(apiError.hint || apiError.message || 'Impossible de charger cette configuration.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [guildId]);

    const update = (section, field, value) => {
        setForm((current) => ({
            ...current,
            [section]: { ...current[section], [field]: value },
        }));
    };

    const addTriggerName = () => {
        const clean = newTrigger.trim().toLowerCase();
        if (!clean || clean.length < 2 || clean.length > 32) return;
        if (form.ai.triggerNames.includes(clean)) {
            setNewTrigger('');
            return;
        }
        const updated = [...form.ai.triggerNames, clean];
        update('ai', 'triggerNames', updated);
        update('ai', 'triggerName', updated[0]);
        setNewTrigger('');
    };

    const removeTriggerName = (triggerToRemove) => {
        if (form.ai.triggerNames.length <= 1) return;
        const updated = form.ai.triggerNames.filter((t) => t !== triggerToRemove);
        update('ai', 'triggerNames', updated);
        update('ai', 'triggerName', updated[0] || 'azim');
    };

    const save = async (event) => {
        if (event) event.preventDefault();
        setSaving(true);
        setError('');
        setNotice('');
        try {
            const commandsPayload = form.commands.reduce((acc, cmd) => {
                acc[cmd.name.toLowerCase()] = {
                    enabled: cmd.enabled,
                    allowedRoleIds: cmd.allowedRoleIds || [],
                    deniedRoleIds: cmd.deniedRoleIds || [],
                };
                return acc;
            }, {});

            await adminService.updateGuildConfig(guildId, {
                ai: {
                    systemPrompt: form.ai.systemPrompt,
                    language: form.ai.language,
                    triggerNames: form.ai.triggerNames,
                    triggerName: form.ai.triggerNames[0] || 'azim',
                },
                logs: form.logs,
                welcome: {
                    ...form.welcome,
                    rules: form.welcome.rules.map((r) => ({
                        condition: r.condition,
                        matchType: r.matchType || 'all',
                        roleIds: r.roleIds,
                        roleId: r.roleIds[0] || '',
                        channelId: r.channelId || null,
                        message: r.message,
                        dmMessage: r.dmMessage,
                    })),
                },
                profile: { bio: form.profile.bio },
                youtube: form.youtube,
                tiktok: form.tiktok,
                rank: form.rank,
                commands: commandsPayload,
            });
            await refresh();
            setNotice('Toutes les modifications ont été enregistrées avec succès.');
        } catch (apiError) {
            setError(apiError.hint || apiError.message || 'Impossible d’enregistrer la configuration.');
        } finally {
            setSaving(false);
        }
    };

    const activateSecretCode = async () => {
        setActivatingIslam(true);
        setError('');
        setNotice('');
        try {
            const result = await adminService.activateIslamMode(guildId, islamCode);
            await refresh();
            setIslamCode('');
            if (result.islamModeEnabled || result.alreadyEnabled) {
                setNotice(result.commandSync === false
                    ? 'Mode Islam débloqué. Synchronisation des commandes Discord en cours.'
                    : 'Code secret validé : le mode Islam et ses commandes (/coran, /quiz) sont débloqués.');
            } else {
                setNotice('Code appliqué avec succès.');
            }
        } catch (apiError) {
            setError(apiError.message || 'Code secret invalide.');
        } finally {
            setActivatingIslam(false);
        }
    };

    const disableIslamMode = async () => {
        if (!window.confirm('Voulez-vous vraiment désactiver le mode Islam pour ce serveur ?')) return;
        setActivatingIslam(true);
        setError('');
        setNotice('');
        try {
            await adminService.activateIslamMode(guildId, { action: 'disable' });
            await refresh();
            setNotice('Le mode Islam a été désactivé pour ce serveur.');
        } catch (apiError) {
            setError(apiError.message || 'Impossible de désactiver le mode.');
        } finally {
            setActivatingIslam(false);
        }
    };

    const manageKey = async (payload) => {
        setError('');
        setNotice('');
        try {
            await adminService.updateGuildConfig(guildId, { ai: payload });
            setNewKey('');
            await refresh();
            setNotice('Clés IA mises à jour.');
        } catch (apiError) {
            setError(apiError.message || 'Impossible de modifier les clés IA.');
        }
    };

    const updateAvatar = async (avatarUrl) => {
        setError('');
        setNotice('');
        try {
            await adminService.updateGuildConfig(guildId, { profile: { avatarUrl } });
            update('profile', 'avatarUrl', '');
            setNotice(avatarUrl ? 'Avatar local modifié.' : 'Avatar local retiré.');
        } catch (apiError) {
            setError(apiError.message || 'Impossible de modifier l’avatar.');
        }
    };

    const updateCommand = (commandName, field, value) => {
        const updated = form.commands.map((cmd) => {
            if (cmd.name.toLowerCase() === commandName.toLowerCase()) {
                return { ...cmd, [field]: value };
            }
            return cmd;
        });
        setForm((prev) => ({ ...prev, commands: updated }));
    };

    const toggleCommandRole = (commandName, roleId) => {
        const cmd = form.commands.find((c) => c.name.toLowerCase() === commandName.toLowerCase());
        if (!cmd) return;
        const currentRoles = cmd.allowedRoleIds || [];
        const nextRoles = currentRoles.includes(roleId)
            ? currentRoles.filter((id) => id !== roleId)
            : [...currentRoles, roleId];
        updateCommand(commandName, 'allowedRoleIds', nextRoles);
    };

    const updateRuleField = (index, field, value) => {
        const rules = [...form.welcome.rules];
        rules[index] = { ...rules[index], [field]: value };
        update('welcome', 'rules', rules);
    };

    const addRoleToRule = (ruleIndex, roleId) => {
        if (!roleId) return;
        const rules = [...form.welcome.rules];
        const currentRoleIds = rules[ruleIndex].roleIds || [];
        if (!currentRoleIds.includes(roleId)) {
            rules[ruleIndex].roleIds = [...currentRoleIds, roleId];
            rules[ruleIndex].roleId = rules[ruleIndex].roleIds[0] || '';
            update('welcome', 'rules', rules);
        }
    };

    const removeRoleFromRule = (ruleIndex, roleId) => {
        const rules = [...form.welcome.rules];
        const nextRoleIds = (rules[ruleIndex].roleIds || []).filter((id) => id !== roleId);
        rules[ruleIndex].roleIds = nextRoleIds;
        rules[ruleIndex].roleId = nextRoleIds[0] || '';
        update('welcome', 'rules', rules);
    };

    const updateReward = (index, field, value) => {
        const rewards = [...form.rank.rewards];
        rewards[index] = { ...rewards[index], [field]: value };
        update('rank', 'rewards', rewards);
    };

    if (loading) {
        return (
            <main className="mx-auto max-w-5xl px-5 py-16 text-center text-slate-400">
                <div className="inline-block size-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent mb-4" />
                <p>Chargement du panneau d'administration…</p>
            </main>
        );
    }

    const channelOptions = form.channels.map((channel) => ({ value: channel.id, label: `#${channel.name}` }));
    const roleOptions = form.roles.map((role) => ({ value: role.id, label: role.name }));

    const filteredCommands = form.commands.filter((cmd) => {
        if (!commandSearch.trim()) return true;
        const q = commandSearch.toLowerCase().trim();
        return cmd.name.toLowerCase().includes(q) || (cmd.description || '').toLowerCase().includes(q);
    });

    const tabs = [
        { id: 'ai', label: 'IA & Déclencheurs', icon: '🤖' },
        { id: 'commands', label: 'Permissions Commandes', icon: '🛡️', count: form.commands.length },
        { id: 'welcome', label: 'Bienvenue & Rôles', icon: '👋', count: form.welcome.rules?.length || 0 },
        { id: 'logs', label: 'Logs & Profil', icon: '📋' },
        { id: 'social', label: 'Réseaux & Niveaux', icon: '📢' },
        { id: 'islam', label: form.features.islamModeEnabled ? 'Mode Islam' : 'Code Secret', icon: '🔒' },
    ];

    return (
        <main className="site-page site-section-page guild-config-page max-w-5xl pb-16">
            {/* Top Bar Header */}
            <div className="sticky top-0 z-20 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/60 bg-[#081625]/90 py-4 backdrop-blur-md">
                <div>
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard" className="text-xs font-semibold text-cyan-400 hover:underline">← Console</Link>
                        <span className="text-xs text-slate-600">/</span>
                        <span className="site-eyebrow text-[10px]">Administration</span>
                    </div>
                    <h1 className="mt-1 text-2xl font-bold text-white flex items-center gap-2">
                        {getGuildName(guildId)}
                        <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-xs font-normal text-slate-400">{guildId}</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={save}
                        disabled={saving}
                        className="btn btn-primary flex items-center gap-2 text-sm disabled:opacity-60"
                    >
                        {saving ? (
                            <>
                                <span className="size-3.5 animate-spin rounded-full border border-white border-t-transparent" />
                                Enregistrement…
                            </>
                        ) : 'Enregistrer les modifications'}
                    </button>
                </div>
            </div>

            {error ? <div role="alert" className="mb-6 rounded border-l-4 border-rose-500 bg-rose-950/40 p-4 text-sm text-rose-200">{error}</div> : null}
            {notice ? <div role="status" className="mb-6 rounded border-l-4 border-emerald-500 bg-emerald-950/40 p-4 text-sm text-emerald-200">{notice}</div> : null}

            {/* Navigation par Onglets */}
            <nav className="admin-tab-nav" aria-label="Sections de configuration">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                        {typeof tab.count === 'number' && tab.count > 0 ? (
                            <span className="admin-tab-badge">{tab.count}</span>
                        ) : null}
                    </button>
                ))}
            </nav>

            <form id="guild-config" onSubmit={save} className="space-y-6">
                {/* 1. ONGLET IA & DÉCLENCHEURS */}
                {activeTab === 'ai' ? (
                    <section className="admin-card space-y-6">
                        <div className="admin-card-header">
                            <div>
                                <h2 className="text-xl font-bold text-white">Intelligence Artificielle & Déclencheurs</h2>
                                <p className="text-sm text-slate-400">Configurez la personnalité, la langue et les mots-clés d'appel d'Azim.</p>
                            </div>
                        </div>

                        {/* Mots déclencheurs multiples */}
                        <div className="rounded-lg border border-cyan-800/40 bg-slate-900/40 p-4">
                            <Field
                                label="Mots déclencheurs de l'IA (Multi-déclencheurs)"
                                hint="Mots ou préfixes qui réveillent et font répondre l'IA en plus des mentions directes."
                            >
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    {form.ai.triggerNames.map((trig) => (
                                        <span key={trig} className="trigger-chip">
                                            {trig}
                                            {form.ai.triggerNames.length > 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTriggerName(trig)}
                                                    className="role-badge-remove text-xs"
                                                    title={`Retirer ${trig}`}
                                                >
                                                    ×
                                                </button>
                                            ) : null}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-3 flex max-w-md items-center gap-2">
                                    <TextInput
                                        placeholder="Ajouter un mot déclencheur (ex: azim, az, bot)…"
                                        value={newTrigger}
                                        onChange={(e) => setNewTrigger(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addTriggerName();
                                            }
                                        }}
                                        maxLength={32}
                                    />
                                    <button
                                        type="button"
                                        onClick={addTriggerName}
                                        disabled={!newTrigger.trim() || newTrigger.trim().length < 2}
                                        className="btn btn-soft text-xs disabled:opacity-40"
                                    >
                                        + Ajouter
                                    </button>
                                </div>
                            </Field>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Langue par défaut des réponses" hint="Ex: Français, English, العربية... (Laisser vide pour adaptation automatique)">
                                <TextInput
                                    maxLength={50}
                                    placeholder="Français, English, العربية…"
                                    value={form.ai.language || ''}
                                    onChange={(e) => update('ai', 'language', e.target.value)}
                                />
                            </Field>
                        </div>

                        <Field label="Prompt système personnalisé" hint="Instructions et contexte propres à ce serveur (max 6000 caractères).">
                            <textarea
                                className="form-input min-h-32 resize-y font-sans text-sm"
                                maxLength={6000}
                                placeholder="Tu es Azim, l'assistant officiel de ce serveur Discord..."
                                value={form.ai.systemPrompt || ''}
                                onChange={(e) => update('ai', 'systemPrompt', e.target.value)}
                            />
                        </Field>

                        {/* Clés Groq */}
                        <div className="rounded-lg border border-slate-700/60 bg-slate-900/30 p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="font-semibold text-white">Clés API Groq du serveur</h3>
                                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">{form.ai.keysCount} active(s)</span>
                            </div>
                            <div className="space-y-2">
                                {form.ai.keysPreviews.map((key) => (
                                    <div key={key.index} className="flex items-center justify-between rounded border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm">
                                        <span className="font-mono text-cyan-300">{key.preview}</span>
                                        <button
                                            type="button"
                                            disabled={form.ai.keysCount <= 1}
                                            onClick={() => manageKey({ removeKeyIndex: key.index })}
                                            className="text-xs text-rose-400 hover:underline disabled:opacity-40"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <TextInput
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="gsk_…"
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value)}
                                />
                                <button
                                    type="button"
                                    disabled={!newKey.trim()}
                                    onClick={() => manageKey({ addKey: newKey.trim() })}
                                    className="btn btn-soft text-xs disabled:opacity-50"
                                >
                                    Ajouter une clé
                                </button>
                            </div>
                        </div>
                    </section>
                ) : null}

                {/* 2. ONGLET PERMISSIONS DES COMMANDES */}
                {activeTab === 'commands' ? (
                    <section className="admin-card space-y-6">
                        <div className="admin-card-header">
                            <div>
                                <h2 className="text-xl font-bold text-white">Permissions et Accès aux Commandes</h2>
                                <p className="text-sm text-slate-400">
                                    Définissez précisément quelles commandes peuvent être utilisées et par quels rôles sur ce serveur.
                                </p>
                            </div>
                        </div>

                        {/* Search Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700/60 bg-slate-900/40 p-3">
                            <div className="w-full max-w-sm">
                                <TextInput
                                    type="search"
                                    placeholder="Rechercher une commande (/ask, /welcome, /rank…)…"
                                    value={commandSearch}
                                    onChange={(e) => setCommandSearch(e.target.value)}
                                />
                            </div>
                            <span className="text-xs text-slate-400">{filteredCommands.length} commande(s) affichée(s)</span>
                        </div>

                        {/* Commands List */}
                        <div className="space-y-3">
                            {filteredCommands.map((cmd) => {
                                const allowedRoles = cmd.allowedRoleIds || [];
                                const isEnabled = cmd.enabled !== false;

                                return (
                                    <div
                                        key={cmd.name}
                                        className={`rounded-lg border p-4 transition-all ${
                                            !isEnabled
                                                ? 'border-rose-900/40 bg-rose-950/10 opacity-70'
                                                : 'border-slate-700/60 bg-slate-900/50 hover:border-cyan-700/50'
                                        }`}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-base font-bold text-cyan-300">/{cmd.name}</code>
                                                    {cmd.isIslamic ? (
                                                        <span className="rounded bg-emerald-950/70 border border-emerald-600/50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">Mode Islam</span>
                                                    ) : null}
                                                    {cmd.defaultLevel === 'admin' ? (
                                                        <span className="rounded bg-amber-950/60 border border-amber-600/40 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">Admin par défaut</span>
                                                    ) : null}
                                                </div>
                                                <p className="mt-1 text-xs text-slate-400">{cmd.description || 'Aucune description'}</p>
                                            </div>

                                            {/* Enable / Disable Switch */}
                                            <div className="flex items-center gap-3">
                                                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-300">
                                                    <input
                                                        type="checkbox"
                                                        checked={isEnabled}
                                                        onChange={(e) => updateCommand(cmd.name, 'enabled', e.target.checked)}
                                                        className="size-4 accent-cyan-500"
                                                    />
                                                    {isEnabled ? 'Activée' : 'Désactivée'}
                                                </label>
                                            </div>
                                        </div>

                                        {isEnabled ? (
                                            <div className="mt-4 border-t border-slate-800/80 pt-3">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <span className="text-xs font-semibold text-slate-300">Rôles autorisés :</span>
                                                    <div className="max-w-xs">
                                                        <SelectInput
                                                            value=""
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    toggleCommandRole(cmd.name, e.target.value);
                                                                    e.target.value = '';
                                                                }
                                                            }}
                                                            options={roleOptions.filter((r) => !allowedRoles.includes(r.value))}
                                                            emptyLabel="+ Ajouter un rôle autorisé…"
                                                            className="text-xs py-1"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    {allowedRoles.length === 0 ? (
                                                        <span className="text-xs italic text-slate-500">
                                                            {cmd.defaultLevel === 'admin'
                                                                ? 'Réservée aux administrateurs du serveur (ou ajoutez des rôles pour autoriser des membres)'
                                                                : 'Accessible à tous les membres (@everyone)'}
                                                        </span>
                                                    ) : (
                                                        allowedRoles.map((roleId) => {
                                                            const roleName = form.roles.find((r) => r.id === roleId)?.name || roleId;
                                                            return (
                                                                <span key={roleId} className="role-badge">
                                                                    <span>@{roleName}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleCommandRole(cmd.name, roleId)}
                                                                        className="role-badge-remove"
                                                                        title="Retirer ce rôle"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </span>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ) : null}

                {/* 3. ONGLET BIENVENUE & MULTI-RÔLES */}
                {activeTab === 'welcome' ? (
                    <section className="admin-card space-y-6">
                        <div className="admin-card-header">
                            <div>
                                <h2 className="text-xl font-bold text-white">Messages de Bienvenue Conditionnels</h2>
                                <p className="text-sm text-slate-400">
                                    Personnalisez l'accueil et créez des messages sur-mesure selon des combinaisons de rôles (ex: Femme + Musulman = Selem ma soeur).
                                </p>
                            </div>
                        </div>

                        {/* Paramètres Généraux */}
                        <div className="grid gap-5 md:grid-cols-2">
                            <label className="flex items-center gap-3 text-sm font-semibold text-white">
                                <input
                                    type="checkbox"
                                    checked={form.welcome.enabled}
                                    onChange={(e) => update('welcome', 'enabled', e.target.checked)}
                                    className="size-4 accent-cyan-500"
                                />
                                Activer le système de bienvenue
                            </label>
                            <Field label="Salon de bienvenue principal">
                                <SelectInput
                                    value={form.welcome.channelId}
                                    onChange={(e) => update('welcome', 'channelId', e.target.value)}
                                    options={channelOptions}
                                    emptyLabel="Choisir un salon"
                                />
                            </Field>
                            <Field label="Destination du message">
                                <SelectInput
                                    value={form.welcome.destination}
                                    onChange={(e) => update('welcome', 'destination', e.target.value)}
                                    options={[
                                        { value: 'both', label: 'Salon public ET Message Privé (MP)' },
                                        { value: 'channel', label: 'Salon public uniquement' },
                                        { value: 'dm', label: 'Message Privé (MP) uniquement' },
                                    ]}
                                />
                            </Field>
                            <Field label="Déclencheur">
                                <SelectInput
                                    value={form.welcome.trigger}
                                    onChange={(e) => update('welcome', 'trigger', e.target.value)}
                                    options={[
                                        { value: 'arrivee', label: 'Dès l’arrivée sur le serveur' },
                                        { value: 'role', label: 'Lors de l’attribution d’un rôle' },
                                    ]}
                                />
                            </Field>
                        </div>

                        {/* Messages par défaut */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Message public standard (fallback)" hint="Variables : {mention}, {username}, {serveur}, {nbmembres}">
                                <textarea
                                    className="form-input min-h-24 resize-y text-sm"
                                    maxLength={2000}
                                    value={form.welcome.defaultMessage || ''}
                                    onChange={(e) => update('welcome', 'defaultMessage', e.target.value)}
                                />
                            </Field>
                            <Field label="Message privé standard (MP)">
                                <textarea
                                    className="form-input min-h-24 resize-y text-sm"
                                    maxLength={2000}
                                    value={form.welcome.defaultDmMessage || ''}
                                    onChange={(e) => update('welcome', 'defaultDmMessage', e.target.value)}
                                />
                            </Field>
                        </div>

                        {/* Règles Conditionnelles Multi-Rôles */}
                        <div className="mt-8 border-t border-slate-700/60 pt-6">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-base font-bold text-white">Règles Conditionnelles Multi-Rôles</h3>
                                    <p className="text-xs text-slate-400">
                                        Combinez plusieurs rôles pour déclencher un message spécifique (ex: Rôle Femme + Rôle Musulman).
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        update('welcome', 'rules', [
                                            ...form.welcome.rules,
                                            {
                                                condition: 'has_role',
                                                matchType: 'all',
                                                roleIds: [],
                                                channelId: '',
                                                message: '',
                                                dmMessage: '',
                                            },
                                        ])
                                    }
                                    className="btn btn-primary text-xs"
                                >
                                    + Ajouter une règle
                                </button>
                            </div>

                            {form.welcome.rules.length === 0 ? (
                                <p className="text-xs italic text-slate-500 py-3">Aucune règle conditionnelle. Le message standard sera envoyé à tous.</p>
                            ) : null}

                            <div className="space-y-4">
                                {form.welcome.rules.map((rule, index) => {
                                    const selectedRoleIds = rule.roleIds || (rule.roleId ? [rule.roleId] : []);
                                    return (
                                        <div key={index} className="rounded-lg border border-cyan-800/50 bg-slate-900/60 p-4 space-y-4">
                                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                                <span className="font-mono text-xs font-bold text-cyan-400">Règle #{index + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        update(
                                                            'welcome',
                                                            'rules',
                                                            form.welcome.rules.filter((_, i) => i !== index)
                                                        )
                                                    }
                                                    className="text-xs text-rose-400 hover:underline"
                                                >
                                                    Supprimer la règle
                                                </button>
                                            </div>

                                            {/* Sélecteur Multi-Rôles & Condition */}
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                                                        Rôles combinés ({selectedRoleIds.length}) :
                                                    </label>
                                                    <div className="mb-2 flex flex-wrap gap-1.5">
                                                        {selectedRoleIds.map((rid) => {
                                                            const rName = form.roles.find((r) => r.id === rid)?.name || rid;
                                                            return (
                                                                <span key={rid} className="role-badge">
                                                                    <span>@{rName}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeRoleFromRule(index, rid)}
                                                                        className="role-badge-remove"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                    <SelectInput
                                                        value=""
                                                        onChange={(e) => addRoleToRule(index, e.target.value)}
                                                        options={roleOptions.filter((r) => !selectedRoleIds.includes(r.value))}
                                                        emptyLabel="+ Ajouter un rôle à la condition…"
                                                        className="text-xs"
                                                    />
                                                </div>

                                                <Field label="Condition de correspondance">
                                                    <SelectInput
                                                        value={`${rule.condition || 'has_role'}_${rule.matchType || 'all'}`}
                                                        onChange={(e) => {
                                                            const [cond, match] = e.target.value.split('_');
                                                            updateRuleField(index, 'condition', cond);
                                                            updateRuleField(index, 'matchType', match);
                                                        }}
                                                        options={[
                                                            { value: 'has_role_all', label: 'Possède TOUS les rôles sélectionnés (ET / AND)' },
                                                            { value: 'has_role_any', label: 'Possède AU MOINS UN des rôles (OU / OR)' },
                                                            { value: 'lacks_role_all', label: 'Ne possède AUCUN des rôles sélectionnés' },
                                                        ]}
                                                    />
                                                </Field>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <Field label="Message public personnalisé (Ex: Selem ma soeur {mention})">
                                                    <TextInput
                                                        placeholder="Ex: Selem ma soeur {mention} sur {serveur} !"
                                                        value={rule.message || ''}
                                                        onChange={(e) => updateRuleField(index, 'message', e.target.value)}
                                                    />
                                                </Field>
                                                <Field label="Message privé personnalisé (facultatif)">
                                                    <TextInput
                                                        placeholder="Message privé personnalisé…"
                                                        value={rule.dmMessage || ''}
                                                        onChange={(e) => updateRuleField(index, 'dmMessage', e.target.value)}
                                                    />
                                                </Field>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                ) : null}

                {/* 4. ONGLET LOGS & PROFIL */}
                {activeTab === 'logs' ? (
                    <section className="admin-card space-y-6">
                        <div className="admin-card-header">
                            <div>
                                <h2 className="text-xl font-bold text-white">Logs & Profil du Bot</h2>
                                <p className="text-sm text-slate-400">Canal de diagnostic et identité locale du bot sur ce serveur.</p>
                            </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Salon dédié aux logs du bot">
                                <SelectInput
                                    value={form.logs.channelId}
                                    onChange={(e) => update('logs', 'channelId', e.target.value)}
                                    options={channelOptions}
                                    emptyLabel="Aucun salon de logs"
                                />
                            </Field>
                            <div className="flex items-center">
                                <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-white">
                                    <input
                                        type="checkbox"
                                        checked={form.logs.restartAnnouncementEnabled}
                                        onChange={(e) => update('logs', 'restartAnnouncementEnabled', e.target.checked)}
                                        className="size-4 accent-cyan-500"
                                    />
                                    Annoncer les redémarrages dans les logs
                                </label>
                            </div>
                        </div>

                        <div className="border-t border-slate-700/60 pt-5">
                            <h3 className="mb-4 font-semibold text-white">Profil local d'Azim sur ce serveur</h3>
                            <div className="grid gap-5 md:grid-cols-2">
                                <Field label="Bio personnalisée du bot" hint="Maximum 190 caractères.">
                                    <TextInput
                                        maxLength={190}
                                        placeholder="Description affichée sur le profil du bot…"
                                        value={form.profile.bio || ''}
                                        onChange={(e) => update('profile', 'bio', e.target.value)}
                                    />
                                </Field>
                                <div>
                                    <Field label="Avatar spécifique au serveur" hint="URL HTTPS hébergée sur cdn.discordapp.com ou media.discordapp.net">
                                        <TextInput
                                            type="url"
                                            placeholder="https://cdn.discordapp.com/…"
                                            value={form.profile.avatarUrl || ''}
                                            onChange={(e) => update('profile', 'avatarUrl', e.target.value)}
                                        />
                                    </Field>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            disabled={!form.profile.avatarUrl?.trim()}
                                            onClick={() => updateAvatar(form.profile.avatarUrl.trim())}
                                            className="btn btn-soft text-xs disabled:opacity-50"
                                        >
                                            Appliquer cet avatar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateAvatar('')}
                                            className="btn btn-soft text-xs text-rose-300"
                                        >
                                            Rétablir avatar par défaut
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : null}

                {/* 5. ONGLET RÉSEAUX & NIVEAUX */}
                {activeTab === 'social' ? (
                    <section className="admin-card space-y-6">
                        <div className="admin-card-header">
                            <div>
                                <h2 className="text-xl font-bold text-white">Réseaux Sociaux & Système de Niveaux XP</h2>
                                <p className="text-sm text-slate-400">Alertes automatiques YouTube / TikTok et récompenses d'activité.</p>
                            </div>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            {/* YouTube */}
                            <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4 space-y-4">
                                <h3 className="font-semibold text-cyan-300">Surveillance YouTube</h3>
                                <Field label="Chaînes YouTube surveillées" hint="Un identifiant de chaîne UC… par ligne.">
                                    <textarea
                                        className="form-input min-h-24 resize-y font-mono text-xs"
                                        value={(form.youtube.channels || []).join('\n')}
                                        onChange={(e) =>
                                            update(
                                                'youtube',
                                                'channels',
                                                e.target.value.split(/\r?\n/).map((id) => id.trim()).filter(Boolean)
                                            )
                                        }
                                    />
                                </Field>
                                <Field label="Salon de publication des vidéos">
                                    <SelectInput
                                        value={form.youtube.targetChannelId}
                                        onChange={(e) => update('youtube', 'targetChannelId', e.target.value)}
                                        options={channelOptions}
                                        emptyLabel="Aucun salon"
                                    />
                                </Field>
                            </div>

                            {/* TikTok */}
                            <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4 space-y-4">
                                <h3 className="font-semibold text-cyan-300">Alertes TikTok Live</h3>
                                <label className="flex items-center gap-3 text-sm font-semibold text-white">
                                    <input
                                        type="checkbox"
                                        checked={form.tiktok.enabled}
                                        onChange={(e) => update('tiktok', 'enabled', e.target.checked)}
                                        className="size-4 accent-cyan-500"
                                    />
                                    Activer les alertes de live TikTok
                                </label>
                                <Field label="Pseudo TikTok du créateur">
                                    <TextInput
                                        placeholder="@pseudo"
                                        value={form.tiktok.username || ''}
                                        onChange={(e) => update('tiktok', 'username', e.target.value)}
                                    />
                                </Field>
                                <Field label="Salon de notification de live">
                                    <SelectInput
                                        value={form.tiktok.targetChannelId}
                                        onChange={(e) => update('tiktok', 'targetChannelId', e.target.value)}
                                        options={channelOptions}
                                        emptyLabel="Choisir un salon"
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* Niveaux et Récompenses XP */}
                        <div className="border-t border-slate-700/60 pt-6 space-y-4">
                            <h3 className="font-semibold text-white">Système d'expérience et Niveaux</h3>
                            <div className="grid gap-5 md:grid-cols-2">
                                <label className="flex items-center gap-3 text-sm font-semibold text-white">
                                    <input
                                        type="checkbox"
                                        checked={form.rank.enabled}
                                        onChange={(e) => update('rank', 'enabled', e.target.checked)}
                                        className="size-4 accent-cyan-500"
                                    />
                                    Activer le gain d'XP et les niveaux
                                </label>
                                <label className="flex items-center gap-3 text-sm font-semibold text-white">
                                    <input
                                        type="checkbox"
                                        checked={form.rank.silent}
                                        onChange={(e) => update('rank', 'silent', e.target.checked)}
                                        className="size-4 accent-cyan-500"
                                    />
                                    Mode silencieux (ne pas annoncer les montées de niveau)
                                </label>
                                <Field label="Salon des annonces de niveau">
                                    <SelectInput
                                        value={form.rank.announceChannelId}
                                        onChange={(e) => update('rank', 'announceChannelId', e.target.value)}
                                        options={channelOptions}
                                        emptyLabel="Dans le salon où le membre écrit"
                                    />
                                </Field>
                            </div>

                            {/* Paliers */}
                            <div className="mt-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Rôles de récompense par palier</span>
                                    <button
                                        type="button"
                                        onClick={() => update('rank', 'rewards', [...form.rank.rewards, { level: 1, roleId: '' }])}
                                        className="btn btn-soft text-xs"
                                    >
                                        + Ajouter un palier
                                    </button>
                                </div>
                                {form.rank.rewards.map((reward, index) => (
                                    <div key={index} className="mb-2 flex flex-wrap items-center gap-3 rounded bg-slate-900/60 p-2.5">
                                        <div className="w-28">
                                            <TextInput
                                                type="number"
                                                min="1"
                                                max="200"
                                                value={reward.level}
                                                onChange={(e) => updateReward(index, 'level', Number(e.target.value))}
                                                placeholder="Niveau"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[200px]">
                                            <SelectInput
                                                value={reward.roleId}
                                                onChange={(e) => updateReward(index, 'roleId', e.target.value)}
                                                options={roleOptions}
                                                emptyLabel="Choisir le rôle attribué"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => update('rank', 'rewards', form.rank.rewards.filter((_, i) => i !== index))}
                                            className="text-xs text-rose-400 hover:underline"
                                        >
                                            Retirer
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                ) : null}

                {/* 6. ONGLET MODE ISLAM / CODE SECRET */}
                {activeTab === 'islam' ? (
                    <section className="admin-card space-y-6">
                        <div className="admin-card-header">
                            <div>
                                <h2 className="text-xl font-bold text-white">Mode Islam & Fonctionnalités Spéciales</h2>
                                <p className="text-sm text-slate-400">Déverrouillage et gestion des commandes spirituelles.</p>
                            </div>
                        </div>

                        {form.features.islamModeEnabled ? (
                            <div className="rounded-lg border border-emerald-700/60 bg-emerald-950/20 p-5 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="islam-enabled-status">
                                        <span>●</span> Mode Islam actuellement ACTIF sur ce serveur
                                    </div>
                                    <button
                                        type="button"
                                        onClick={disableIslamMode}
                                        disabled={activatingIslam}
                                        className="btn btn-soft text-xs text-rose-400 border-rose-800/60 hover:bg-rose-950/40 disabled:opacity-50"
                                    >
                                        {activatingIslam ? 'Désactivation…' : 'Désactiver le mode Islam'}
                                    </button>
                                </div>
                                <p className="text-sm text-slate-300">Les commandes suivantes sont actives et visibles par vos membres :</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded border border-emerald-800/60 bg-slate-900/60 p-3">
                                        <code className="text-sm font-bold text-emerald-400">/coran</code>
                                        <p className="mt-1 text-xs text-slate-400">Lecture et écoute complète du Saint Coran (sourate, verset, traduction française).</p>
                                    </div>
                                    <div className="rounded border border-emerald-800/60 bg-slate-900/60 p-3">
                                        <code className="text-sm font-bold text-emerald-400">/quiz</code>
                                        <p className="mt-1 text-xs text-slate-400">Quiz thématique islamique avec suivi des scores et classements en direct.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-5 space-y-4">
                                <div>
                                    <h3 className="font-semibold text-white">Déverrouillage par Code Secret</h3>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Entrez le code secret pour débloquer les fonctionnalités et commandes spirituelles sur ce serveur.
                                    </p>
                                </div>
                                <div className="flex max-w-md items-center gap-3">
                                    <TextInput
                                        value={islamCode}
                                        onChange={(e) => setIslamCode(e.target.value)}
                                        placeholder="Entrez un code secret…"
                                        autoComplete="off"
                                        maxLength={64}
                                    />
                                    <button
                                        type="button"
                                        onClick={activateSecretCode}
                                        disabled={activatingIslam || !islamCode.trim()}
                                        className="btn btn-primary whitespace-nowrap text-sm disabled:opacity-60"
                                    >
                                        {activatingIslam ? 'Vérification…' : 'Valider'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                ) : null}

                {/* Bottom Save Bar */}
                <div className="flex justify-end border-t border-slate-800 pt-5">
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
                    >
                        {saving ? 'Enregistrement en cours…' : 'Enregistrer toutes les modifications'}
                    </button>
                </div>
            </form>
        </main>
    );
}

export default GuildConfig;