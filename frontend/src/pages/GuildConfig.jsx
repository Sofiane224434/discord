import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminService } from '../services/api.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Icon from '../components/Icon.jsx';

const PRAYER_METHODS = [
    { value: 12, label: 'UOIF - Union des Organisations Islamiques de France (12°)' },
    { value: 3, label: 'MWL - Ligue Islamique Mondiale (18°)' },
    { value: 2, label: 'ISNA - Islamic Society of North America (15°)' },
    { value: 4, label: 'Umm al-Qura University, Makkah' },
    { value: 5, label: 'Egyptian General Authority of Survey' },
    { value: 1, label: 'University of Islamic Sciences, Karachi' },
    { value: 13, label: 'Diyanet İşleri Başkanlığı, Turquie' },
];

const ISLAMIC_RECITERS = [
    { value: 'mishary', label: 'Mishary Rashid Alafasy (العفاسي)' },
    { value: 'sudais', label: 'Abdul Rahman Al-Sudais (السديس)' },
    { value: 'shuraim', label: 'Saud Al-Shuraim (الشريم)' },
    { value: 'maher', label: 'Maher Al-Muaiqly (المعيقلي)' },
    { value: 'yasser', label: 'Yasser Al-Dosari (الدوسري)' },
    { value: 'ghamdi', label: 'Saad Al-Ghamdi (الغامدي)' },
    { value: 'ajmy', label: 'Ahmed Al-Ajmy (العجمي)' },
    { value: 'basit_murattal', label: 'Abdulbasit Abdulsamad - Murattal (عبد الباسط)' },
    { value: 'basit_mujawwad', label: 'Abdulbasit Abdulsamad - Mujawwad (عبد الباسط)' },
    { value: 'minshawi_murattal', label: 'Mohamed Siddiq Al-Minshawi - Murattal (المنشاوي)' },
    { value: 'minshawi_mujawwad', label: 'Mohamed Siddiq Al-Minshawi - Mujawwad (المنشاوي)' },
    { value: 'hussary_murattal', label: 'Mahmoud Khalil Al-Hussary - Murattal (الحصري)' },
];

const EMPTY_CONFIG = {
    ai: {
        systemPrompt: '',
        language: '',
        triggerName: 'azim',
        triggerNames: ['azim', 'azimbot'],
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
    profile: {
        bio: '',
        avatarUrl: '',
        avatarUpdatedAt: null,
        currentAvatarUrl: '',
        globalAvatarUrl: '',
        hasServerAvatar: false,
        botDisplayName: 'AzimBot',
        botUsername: 'AzimBot',
        botTag: 'AzimBot',
    },
    youtube: { channels: [], targetChannelId: '' },
    tiktok: { enabled: false, username: '', targetChannelId: '' },
    rank: { enabled: false, announceChannelId: '', silent: false, rewards: [] },
    features: { islamModeEnabled: false },
    islam: {
        prayerCity: 'Paris',
        prayerMethod: 12,
        prayerNotificationEnabled: false,
        prayerChannelId: '',
        prayerRoleId: '',
        whiteDaysNotificationEnabled: false,
        whiteDaysChannelId: '',
        radioDefaultReciter: 'mishary',
        radioAutoReconnect: true,
    },
    channels: [],
    roles: [],
    commands: [],
    observability: { commandByName: {}, recentErrors: [], errorTotal: 0 },
};

function mergeConfig(data) {
    const aiData = data?.ai || {};
    const rawTriggers = Array.isArray(aiData.triggerNames) && aiData.triggerNames.length > 0
        ? aiData.triggerNames
        : [aiData.triggerName || 'azim', 'azimbot'];
    const triggerNames = [...new Set(rawTriggers.map((t) => String(t || '').trim().toLowerCase()).filter(Boolean))];
    if (!triggerNames.includes('azim')) triggerNames.unshift('azim');
    if (!triggerNames.includes('azimbot')) triggerNames.push('azimbot');

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
        islam: {
            ...EMPTY_CONFIG.islam,
            ...(data?.islam || {}),
            prayerCity: data?.islam?.prayerCity || 'Paris',
            prayerMethod: Number(data?.islam?.prayerMethod) || 12,
            prayerNotificationEnabled: Boolean(data?.islam?.prayerNotificationEnabled),
            prayerChannelId: data?.islam?.prayerChannelId || '',
            prayerRoleId: data?.islam?.prayerRoleId || '',
            whiteDaysNotificationEnabled: Boolean(data?.islam?.whiteDaysNotificationEnabled),
            whiteDaysChannelId: data?.islam?.whiteDaysChannelId || '',
            radioDefaultReciter: data?.islam?.radioDefaultReciter || 'mishary',
            radioAutoReconnect: data?.islam?.radioAutoReconnect !== false,
        },
        channels: Array.isArray(data?.channels) ? data.channels : [],
        roles: Array.isArray(data?.roles) ? data.roles : [],
        commands: Array.isArray(data?.commands) ? data.commands : [],
        observability: data?.observability || { commandByName: {}, recentErrors: [], errorTotal: 0 },
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
    const { setIsIslamUnlocked, theme, setTheme } = useTheme();
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
    const [downloadingAvatar, setDownloadingAvatar] = useState(false);
    const [copiedKeyIndex, setCopiedKeyIndex] = useState(null);
    const [copiedAllKeys, setCopiedAllKeys] = useState(false);

    const copyKeyToClipboard = (keyString, index) => {
        navigator.clipboard.writeText(keyString);
        setCopiedKeyIndex(index);
        setTimeout(() => setCopiedKeyIndex(null), 2000);
    };

    const copyAllKeysToClipboard = () => {
        const allKeys = form.ai.keysPreviews.map((k) => k.key || k.preview).filter(Boolean);
        if (!allKeys.length) return;
        navigator.clipboard.writeText(allKeys.join('\n'));
        setCopiedAllKeys(true);
        setTimeout(() => setCopiedAllKeys(null), 2500);
    };

    const detectedGroqKeys = useMemo(() => {
        return [...new Set(newKey.match(/gsk_[A-Za-z0-9_-]{16,}/g) || [])];
    }, [newKey]);

    const refresh = useCallback(async () => {
        const data = await adminService.getGuildConfig(guildId);
        setForm(mergeConfig(data));
    }, [guildId]);

    const handleDownloadAvatar = async () => {
        setDownloadingAvatar(true);
        setError('');
        try {
            const fileName = `${form.profile.botDisplayName || 'azim'}-avatar.png`;
            await adminService.downloadAvatar(guildId, fileName);
            setNotice('Photo de profil téléchargée avec succès.');
        } catch (downloadErr) {
            if (form.profile.currentAvatarUrl) {
                window.open(form.profile.currentAvatarUrl, '_blank');
                setNotice('Ouverture de la photo de profil dans un nouvel onglet.');
            } else {
                setError('Impossible de télécharger la photo de profil.');
            }
        } finally {
            setDownloadingAvatar(false);
        }
    };

    useEffect(() => {
        let active = true;
        setLoading(true);
        adminService.getGuildConfig(guildId)
            .then((data) => {
                if (active) {
                    const merged = mergeConfig(data);
                    setForm(merged);
                    if (merged.features?.islamModeEnabled) {
                        setIsIslamUnlocked(true);
                    }
                }
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
                    adminOnly: Boolean(cmd.adminOnly),
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
                islam: form.islam,
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
            update('features', 'islamModeEnabled', true);
            setIsIslamUnlocked(true);
            setIslamCode('');
            if (result.islamModeEnabled || result.alreadyEnabled) {
                setNotice('Code secret validé : le mode Islam et ses commandes (/coran, /priere, /quiz, etc.) sont débloqués.');
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
        // Mise à jour optimiste immédiate : l'interface bascule instantanément
        update('features', 'islamModeEnabled', false);
        setIsIslamUnlocked(false);
        try {
            await adminService.activateIslamMode(guildId, { action: 'disable' });
            setNotice('Le mode Islam a été désactivé pour ce serveur.');
        } catch (apiError) {
            // Rétablissement en cas d'échec
            update('features', 'islamModeEnabled', true);
            setIsIslamUnlocked(true);
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
            await refresh();
            setNotice(avatarUrl ? 'Avatar local modifié avec succès.' : 'Photo de profil de base du bot rétablie avec succès sur ce serveur.');
        } catch (apiError) {
            setError(apiError.message || 'Impossible de modifier l’avatar.');
        }
    };

    const handleUpdateBotName = async (newName) => {
        setError('');
        setNotice('');
        try {
            await adminService.updateGuildConfig(guildId, { profile: { botDisplayName: newName } });
            await refresh();
            setNotice(`Nom du bot mis à jour avec succès : "${newName}"`);
        } catch (apiError) {
            setError(apiError.message || 'Impossible de modifier le nom du bot.');
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

    const currentGuildIcon = useMemo(() => {
        try {
            const guilds = JSON.parse(localStorage.getItem('discord_guilds') || '[]');
            const g = guilds.find((guild) => String(guild.id) === String(guildId));
            if (!g) return null;
            if (g.icon) {
                return `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=256`;
            }
            return g.iconUrl || null;
        } catch {
            return null;
        }
    }, [guildId]);

    const isIslamActive = Boolean(form.features?.islamModeEnabled);

    if (loading) {
        return (
            <main className="site-page site-section-page max-w-5xl py-12">
                <LoadingScreen
                    label="Chargement du panneau d'administration…"
                    subtext={`Configuration en cours pour ${getGuildName(guildId)}`}
                />
            </main>
        );
    }

    const channelOptions = form.channels.map((channel) => ({ value: channel.id, label: `#${channel.name}` }));
    const roleOptions = form.roles.map((role) => ({ value: role.id, label: role.name }));

    const filteredCommands = form.commands.filter((cmd) => {
        if (!isIslamActive && cmd.isIslamic) return false;
        if (!commandSearch.trim()) return true;
        const q = commandSearch.toLowerCase().trim();
        return cmd.name.toLowerCase().includes(q) || (cmd.description || '').toLowerCase().includes(q);
    });

    const tabs = [
        { id: 'ai', label: 'IA & déclencheurs', icon: 'sparkles' },
        { id: 'commands', label: 'Commandes', icon: 'shield', count: form.commands.filter((cmd) => isIslamActive || !cmd.isIslamic).length },
        { id: 'welcome', label: 'Bienvenue & rôles', icon: 'hand', count: form.welcome.rules?.length || 0 },
        { id: 'logs', label: 'Logs & profil du bot', icon: 'fileText' },
        { id: 'social', label: 'Réseaux & niveaux', icon: 'megaphone' },
        { id: 'islam', label: isIslamActive ? 'Mode Islam' : 'Code secret', icon: isIslamActive ? 'moon' : 'key', status: isIslamActive ? 'Actif' : null },
    ];

    return (
        <main className="gc">
            <header className="gc-head">
                <Link to="/dashboard" className="gc-back"><Icon name="arrowLeft" size={16} /> Mes serveurs</Link>
                <div className="gc-head__row">
                    <div className="gc-head__id">
                        {currentGuildIcon ? (
                            <img src={currentGuildIcon} alt="" className="gc-head__icon" />
                        ) : (
                            <span className="gc-head__icon gc-head__icon--fallback">{getGuildName(guildId).slice(0, 2).toUpperCase()}</span>
                        )}
                        <div>
                            <h1>{getGuildName(guildId)}</h1>
                            <p>ID <code>{guildId}</code></p>
                        </div>
                    </div>
                    <button type="button" onClick={save} disabled={saving} className="gc-save">
                        {saving ? <span className="gc-save__spinner" /> : <Icon name="check" size={17} />}
                        {saving ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                </div>
            </header>

            {error ? <div role="alert" className="gc-flash gc-flash--error"><Icon name="alert" size={18} /> {error}</div> : null}
            {notice ? <div role="status" className="gc-flash gc-flash--ok"><Icon name="check" size={18} /> {notice}</div> : null}

            <div className="gc-layout">
            <nav className="gc-nav" aria-label="Sections de configuration">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`gc-nav__item${activeTab === tab.id ? ' is-active' : ''}`}
                        aria-current={activeTab === tab.id ? 'page' : undefined}
                    >
                        <Icon name={tab.icon} size={18} />
                        <span className="gc-nav__label">{tab.label}</span>
                        {typeof tab.count === 'number' && tab.count > 0 ? <span className="gc-nav__count">{tab.count}</span> : null}
                        {tab.status ? <span className="gc-nav__count gc-nav__count--ok">{tab.status}</span> : null}
                    </button>
                ))}
            </nav>

            <form id="guild-config" onSubmit={save} className="gc-content space-y-6">
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
                        <div className="rounded-lg border border-slate-700/60 bg-slate-900/30 p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-white">Clés API Groq du serveur</h3>
                                    <p className="text-xs text-slate-400">Toutes vos clés sont affichées en entier pour vous permettre de les vérifier ou de les copier.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300 font-semibold">{form.ai.keysCount} active(s)</span>
                                    {form.ai.keysPreviews.length > 0 ? (
                                        <button
                                            type="button"
                                            onClick={copyAllKeysToClipboard}
                                            className="btn btn-primary text-xs py-1 px-3 flex items-center gap-1.5 shadow-md shadow-cyan-900/40"
                                            title="Copie toutes les clés de ce serveur séparées par des retours à la ligne"
                                        >
                                            <span>{copiedAllKeys ? '✓' : '📋'}</span>
                                            <span>{copiedAllKeys ? 'Toutes les clés copiées !' : `Tout copier d'un coup (${form.ai.keysPreviews.length})`}</span>
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 rounded-md border border-emerald-800/40 bg-emerald-950/20 p-2.5 text-xs text-emerald-300">
                                <span className="text-sm shrink-0">🛡️</span>
                                <div>
                                    <strong>Isolation stricte :</strong> Les clés API configurées ici sont hermétiques et utilisées exclusivement pour ce serveur ({getGuildName(guildId)}). Aucun autre serveur ne peut utiliser ou partager vos clés ou quotas.
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                {form.ai.keysPreviews.map((key) => {
                                    const fullKey = key.key || key.preview || '';

                                    return (
                                        <div
                                            key={key.index}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg border border-slate-800 bg-[#071727] p-3 text-sm shadow-sm"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-400 shrink-0">
                                                    #{key.index}
                                                </span>
                                                <code className="font-mono text-cyan-300 break-all select-all text-xs sm:text-sm bg-[#050e18] px-2.5 py-1.5 rounded border border-cyan-950/60 flex-1">
                                                    {fullKey}
                                                </code>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                                <button
                                                    type="button"
                                                    onClick={() => copyKeyToClipboard(fullKey, key.index)}
                                                    className="btn btn-soft text-xs py-1 px-2.5 flex items-center gap-1 text-cyan-300 hover:text-cyan-200"
                                                    title="Copier cette clé complète"
                                                >
                                                    <span>{copiedKeyIndex === key.index ? '✓' : '📋'}</span>
                                                    <span>{copiedKeyIndex === key.index ? 'Copié !' : 'Copier'}</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={form.ai.keysCount <= 1}
                                                    onClick={() => manageKey({ removeKeyIndex: key.index })}
                                                    className="btn btn-soft text-xs py-1 px-2.5 text-rose-400 hover:text-rose-300 disabled:opacity-40"
                                                    title="Supprimer cette clé de la configuration"
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Zone d'ajout de clés en bloc ou à l'unité */}
                            <div className="mt-4 rounded-lg border border-slate-700/80 bg-slate-900/60 p-3.5 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <label className="text-xs font-semibold text-slate-200">
                                        Ajouter ou coller plusieurs clés d'un coup
                                    </label>
                                    {detectedGroqKeys.length > 0 ? (
                                        <span className="rounded bg-cyan-950/80 border border-cyan-600/40 px-2 py-0.5 text-[11px] font-semibold text-cyan-300">
                                            ✨ {detectedGroqKeys.length} clé(s) Groq détectée(s)
                                        </span>
                                    ) : null}
                                </div>

                                <textarea
                                    className="form-input min-h-[90px] w-full resize-y font-mono text-xs sm:text-sm"
                                    placeholder="Collez une ou plusieurs clés Groq ici (séparées par saut de ligne, espace ou virgule) :&#10;gsk_123...&#10;gsk_456...&#10;gsk_789..."
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value)}
                                />

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={detectedGroqKeys.length === 0}
                                        onClick={() => manageKey({ addKeys: detectedGroqKeys })}
                                        className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-40 shadow-sm"
                                    >
                                        <span>+</span>
                                        <span>
                                            {detectedGroqKeys.length > 1
                                                ? `Ajouter ces ${detectedGroqKeys.length} clés d'un coup`
                                                : detectedGroqKeys.length === 1
                                                ? 'Ajouter cette clé'
                                                : 'Ajouter les clés'}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        disabled={detectedGroqKeys.length === 0}
                                        onClick={() => {
                                            if (window.confirm(`Voulez-vous vraiment remplacer TOUTES les clés existantes par ces ${detectedGroqKeys.length} nouvelle(s) clé(s) ?`)) {
                                                manageKey({ setKeys: detectedGroqKeys });
                                            }
                                        }}
                                        className="btn btn-soft text-xs py-1.5 px-3 text-amber-300 hover:text-amber-200 disabled:opacity-40"
                                        title="Remplace toutes les clés existantes par la liste collée"
                                    >
                                        <span>🔄</span>
                                        <span>Remplacer tout par ce lot</span>
                                    </button>

                                    {newKey ? (
                                        <button
                                            type="button"
                                            onClick={() => setNewKey('')}
                                            className="btn btn-soft text-xs py-1.5 px-2.5 text-slate-400"
                                        >
                                            Effacer
                                        </button>
                                    ) : null}
                                </div>
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

                                            {/* Switches: Admin Only & Enable/Disable */}
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <label className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-all ${
                                                    cmd.adminOnly
                                                        ? 'border-amber-500/60 bg-amber-950/40 text-amber-200 shadow-sm'
                                                        : 'border-slate-700/60 bg-slate-800/40 text-slate-400 hover:border-slate-600'
                                                }`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(cmd.adminOnly)}
                                                        onChange={(e) => updateCommand(cmd.name, 'adminOnly', e.target.checked)}
                                                        className="size-3.5 accent-amber-500"
                                                    />
                                                    <span>🔒 Admin seulement</span>
                                                </label>

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
                                                {cmd.adminOnly ? (
                                                    <div className="mb-3 flex items-center gap-2.5 rounded-md bg-amber-950/20 border border-amber-600/30 px-3 py-2 text-xs text-amber-300">
                                                        <span className="text-sm shrink-0">🛡️</span>
                                                        <span>
                                                            <strong>Mode Administrateur actif :</strong> les administrateurs et le propriétaire ont accès d'office. Vous pouvez également autoriser des rôles spécifiques supplémentaires ci-dessous.
                                                        </span>
                                                    </div>
                                                ) : null}

                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <span className="text-xs font-semibold text-slate-300">
                                                        {cmd.adminOnly ? 'Rôles autorisés additionnels :' : 'Rôles autorisés :'}
                                                    </span>
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
                                                            {cmd.adminOnly
                                                                ? 'Réservée aux administrateurs du serveur (ajoutez des rôles pour étendre l’accès).'
                                                                : (cmd.defaultLevel === 'admin'
                                                                    ? 'Réservée aux administrateurs du serveur (ou ajoutez des rôles pour autoriser des membres)'
                                                                    : 'Accessible à tous les membres (@everyone)')}
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

                        <div className="border-t border-slate-700/60 pt-5 space-y-6">
                            <div>
                                <h3 className="font-semibold text-white text-base">Photo de profil & Identité locale du bot</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Visualisez l'avatar actuellement actif sur ce serveur, téléchargez-le ou personnalisez son apparence.
                                </p>
                            </div>

                            {/* Carte Photo de profil actuelle du bot actif */}
                            <div className="rounded-xl border border-slate-700/60 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950 p-5 shadow-lg">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                                    <div className="relative group shrink-0">
                                        {form.profile.hasServerAvatar && form.profile.currentAvatarUrl ? (
                                            <img
                                                src={form.profile.currentAvatarUrl}
                                                alt={form.profile.botDisplayName || 'Avatar du bot'}
                                                className="size-24 sm:size-28 rounded-2xl object-cover ring-2 ring-cyan-500/40 shadow-cyan-950/40 shadow-xl transition-transform duration-200 group-hover:scale-105"
                                            />
                                        ) : (
                                            <img
                                                src={isIslamActive ? '/icon-islam.png' : (form.profile.globalAvatarUrl || '/icon.png')}
                                                alt={form.profile.botDisplayName || 'Avatar du bot'}
                                                className={`size-24 sm:size-28 rounded-2xl object-contain p-2 bg-slate-900/90 ring-2 shadow-xl transition-transform duration-200 group-hover:scale-105 ${
                                                    isIslamActive
                                                        ? 'ring-emerald-500/50 shadow-emerald-950/50'
                                                        : 'ring-cyan-500/40 shadow-cyan-950/40'
                                                }`}
                                            />
                                        )}
                                        {form.profile.hasServerAvatar ? (
                                            <span className="absolute -bottom-2 -right-2 rounded-full bg-cyan-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
                                                Serveur
                                            </span>
                                        ) : (
                                            <span className={`absolute -bottom-2 -right-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-md ${
                                                isIslamActive ? 'bg-emerald-600' : 'bg-slate-700'
                                            }`}>
                                                {isIslamActive ? 'Islam' : 'Global'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 text-center sm:text-left space-y-2">
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                            <h4 className="text-lg font-bold text-white">
                                                {form.profile.botDisplayName || 'Azim'}
                                            </h4>
                                            <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400 font-mono">
                                                {form.profile.botTag || 'Bot Discord'}
                                            </span>
                                            {form.profile.hasServerAvatar ? (
                                                <span className="rounded-full bg-emerald-950/70 border border-emerald-600/50 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                                                    ✨ Avatar personnalisé à ce serveur
                                                </span>
                                            ) : (
                                                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                                                    isIslamActive
                                                        ? 'bg-emerald-950/70 border-emerald-600/50 text-emerald-300'
                                                        : 'bg-slate-800 border-slate-700 text-slate-400'
                                                }`}>
                                                    {isIslamActive
                                                        ? '🕌 Photo officielle Islamique (active par défaut)'
                                                        : '🌐 Photo officielle de base (processeur bleu)'}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-slate-400 max-w-xl">
                                            Voici la photo de profil du bot telle qu'elle est affichée aux membres de ce serveur Discord. Vous pouvez la retélécharger en un clic ou définir un avatar spécifique ci-dessous.
                                        </p>

                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                                            <button
                                                type="button"
                                                disabled={downloadingAvatar || !form.profile.currentAvatarUrl}
                                                onClick={handleDownloadAvatar}
                                                className="btn btn-primary text-xs flex items-center gap-2 shadow-cyan-900/30 shadow-md disabled:opacity-50"
                                            >
                                                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                {downloadingAvatar ? 'Téléchargement…' : 'Télécharger la photo de profil'}
                                            </button>

                                            {form.profile.hasServerAvatar ? (
                                                <button
                                                    type="button"
                                                    onClick={() => updateAvatar('')}
                                                    className="btn bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs flex items-center gap-2 font-semibold shadow-md shadow-rose-950/30 transition-all hover:scale-[1.02]"
                                                    title="Supprimer la photo spécifique à ce serveur et réutiliser la photo de profil de base du bot"
                                                >
                                                    <span className="text-sm">🔄</span>
                                                    Rétablir la photo de profil de base
                                                </button>
                                            ) : null}

                                            {form.profile.currentAvatarUrl ? (
                                                <a
                                                    href={form.profile.currentAvatarUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-soft text-xs flex items-center gap-1.5"
                                                >
                                                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    Voir en grand
                                                </a>
                                            ) : null}
                                        </div>

                                        {form.profile.hasServerAvatar ? (
                                            <div className="mt-2.5 flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-200">
                                                <span className="text-base leading-none">💡</span>
                                                <div>
                                                    <strong>Une photo personnalisée est actuellement active sur ce serveur.</strong>
                                                    <p className="mt-0.5 text-slate-300 text-[11px]">Pour réutiliser la photo officielle du bot (le petit processeur bleu), cliquez simplement sur <em>« Rétablir la photo de profil de base »</em> ci-dessus.</p>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <Field label="Nom / Surnom du bot sur ce serveur" hint="Personnalisez le nom affiché du bot sur ce serveur Discord (1 à 32 caractères)">
                                        <div className="flex gap-2">
                                            <TextInput
                                                maxLength={32}
                                                placeholder="Ex: AzimBot, Assistant, MonBot…"
                                                value={form.profile.botDisplayName || ''}
                                                onChange={(e) => update('profile', 'botDisplayName', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                disabled={saving || !form.profile.botDisplayName?.trim()}
                                                onClick={() => handleUpdateBotName(form.profile.botDisplayName.trim())}
                                                className="btn btn-primary text-xs whitespace-nowrap"
                                            >
                                                Renommer
                                            </button>
                                        </div>
                                    </Field>
                                </div>
                                <Field label="Bio personnalisée du bot" hint="Maximum 190 caractères.">
                                    <TextInput
                                        maxLength={190}
                                        placeholder="Description affichée sur le profil du bot…"
                                        value={form.profile.bio || ''}
                                        onChange={(e) => update('profile', 'bio', e.target.value)}
                                    />
                                </Field>
                            </div>

                            <div className="border-t border-slate-700/60 pt-4">
                                <Field label="Changer l'avatar du serveur" hint="URL HTTPS hébergée sur cdn.discordapp.com ou media.discordapp.net">
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
                                        className="btn btn-soft text-xs text-rose-300 hover:text-rose-200 flex items-center gap-1.5"
                                        title="Effacer la photo custom pour revenir à la photo de base"
                                    >
                                        <span>🔄</span>
                                        Rétablir photo de profil de base
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Activité & Santé interne de ce serveur */}
                        <div className="border-t border-slate-700/60 pt-6 space-y-5">
                            <div>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                                        <span>📊</span> Activité & Santé interne de ce serveur
                                    </h3>
                                    <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
                                        Données 100% isolées à ce serveur
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    Ces statistiques et journaux d'erreurs concernent exclusivement l'activité enregistrée sur ce serveur Discord.
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Commandes les plus utilisées sur ce serveur */}
                                <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-4 space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Commandes utilisées ici</h4>
                                        <span className="text-xs text-cyan-400 font-semibold">
                                            {Object.values(form.observability?.commandByName || {}).reduce((a, b) => a + Number(b || 0), 0)} exécutions
                                        </span>
                                    </div>
                                    {Object.keys(form.observability?.commandByName || {}).length ? (
                                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                            {Object.entries(form.observability.commandByName)
                                                .sort((a, b) => Number(b[1]) - Number(a[1]))
                                                .slice(0, 10)
                                                .map(([cmdName, count], idx) => (
                                                    <div key={cmdName} className="flex items-center justify-between text-xs bg-slate-800/40 px-3 py-1.5 rounded border border-slate-700/40">
                                                        <span className="font-mono text-cyan-300 font-semibold">
                                                            <span className="text-slate-500 mr-2">{idx + 1}.</span>/{cmdName}
                                                        </span>
                                                        <span className="font-bold text-white bg-slate-700/50 px-2 py-0.5 rounded text-[11px]">
                                                            {count}
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500 py-4 text-center">Aucune commande encore exécutée sur ce serveur.</p>
                                    )}
                                </div>

                                {/* Erreurs récentes sur ce serveur */}
                                <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-4 space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Erreurs internes du serveur</h4>
                                        <span className="text-xs text-rose-400 font-semibold">
                                            {form.observability?.recentErrors?.length || 0} récentes
                                        </span>
                                    </div>
                                    {Array.isArray(form.observability?.recentErrors) && form.observability.recentErrors.length ? (
                                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                            {form.observability.recentErrors.slice(0, 10).map((err, idx) => (
                                                <div key={idx} className="rounded border border-rose-900/50 bg-rose-950/20 p-2 text-xs">
                                                    <div className="flex items-center justify-between text-[11px] text-rose-400 font-semibold">
                                                        <span>{err.type || 'Erreur'}</span>
                                                        <time className="text-slate-500">{err.ts ? new Date(err.ts).toLocaleTimeString() : ''}</time>
                                                    </div>
                                                    <p className="mt-0.5 text-slate-300 text-[11px] break-words line-clamp-2">{err.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-emerald-400/80 py-4 text-center flex items-center justify-center gap-1.5">
                                            <span>✓</span> Aucune erreur signalée sur ce serveur.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Choix du Thème si débloqué */}
                            {isIslamActive ? (
                                <div className="border-t border-slate-700/60 pt-6">
                                    <div className="rounded-xl border border-emerald-600/40 bg-gradient-to-r from-emerald-950/40 to-slate-900/80 p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">🎨</span>
                                                <h3 className="font-semibold text-white text-base">Thème d'affichage du site</h3>
                                            </div>
                                            <p className="text-xs text-slate-300 mt-1">
                                                Choisissez l'ambiance visuelle du panel pour votre navigation (Mode Islam débloqué).
                                            </p>
                                        </div>
                                        <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900/90 p-1 shrink-0 self-start sm:self-auto">
                                            <button
                                                type="button"
                                                onClick={() => setTheme('cyber')}
                                                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-all ${
                                                    theme === 'cyber'
                                                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50'
                                                        : 'text-slate-400 hover:text-slate-200'
                                                }`}
                                            >
                                                <span>🤖</span> Cyber
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTheme('islam')}
                                                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-all ${
                                                    theme === 'islam'
                                                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-950/50'
                                                        : 'text-slate-400 hover:text-slate-200'
                                                }`}
                                            >
                                                <span>🌙</span> Islam
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
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
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span>{isIslamActive ? '🌙' : '🔑'}</span> {isIslamActive ? 'Mode Islam & Spiritualité' : 'Extensions & Code secret'}
                                </h2>
                                <p className="text-sm text-slate-400">
                                    {isIslamActive
                                        ? 'Configuration des rappels de prière (Adhan), jeûne des Jours Blancs, radio 24/7 et commandes islamiques.'
                                        : 'Entrez un code d’activation pour débloquer des fonctionnalités supplémentaires sur ce serveur.'}
                                </p>
                            </div>
                        </div>

                        {form.features.islamModeEnabled ? (
                            <div className="space-y-6">
                                {/* Statut du mode */}
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-700/60 bg-emerald-950/25 p-4">
                                    <div className="islam-enabled-status">
                                        <span>●</span> Mode Islam actuellement ACTIF sur ce serveur (100% gratuit & sans limitation)
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

                                {/* Choix du Thème du Site (paramètres) */}
                                <div className="rounded-xl border border-emerald-600/50 bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-slate-900/90 p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">🎨</span>
                                            <h3 className="font-semibold text-white text-base">Thème & Apparence du site</h3>
                                        </div>
                                        <p className="text-xs text-slate-300 mt-1">
                                            Le mode Islam étant débloqué sur votre serveur, vous pouvez choisir d’afficher le site avec le thème Islamique (émeraude & or) ou le thème Cyber classique.
                                        </p>
                                    </div>
                                    <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900/90 p-1 shrink-0 self-start sm:self-auto">
                                        <button
                                            type="button"
                                            onClick={() => setTheme('cyber')}
                                            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-all ${
                                                theme === 'cyber'
                                                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50'
                                                    : 'text-slate-400 hover:text-slate-200'
                                            }`}
                                        >
                                            <span>🤖</span> Thème Cyber
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTheme('islam')}
                                            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-all ${
                                                theme === 'islam'
                                                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-950/50'
                                                    : 'text-slate-400 hover:text-slate-200'
                                            }`}
                                        >
                                            <span>🌙</span> Thème Islam
                                        </button>
                                    </div>
                                </div>

                                {/* 1. Horaires de Prière & Rappels Adhan Automatiques */}
                                <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🕌</span>
                                        <div>
                                            <h3 className="font-semibold text-white">Horaires des Prières & Rappels Adhan</h3>
                                            <p className="text-xs text-slate-400">Calcul automatique des 5 prières quotidiennes (Fajr, Dhuhr, Asr, Maghrib, Isha) et alertes en direct.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field label="Ville de référence" hint="Ex: Paris, Lyon, Marseille, Alger, Casablanca, Bruxelles, Montréal">
                                            <TextInput
                                                value={form.islam.prayerCity}
                                                onChange={(e) => update('islam', 'prayerCity', e.target.value)}
                                                placeholder="Paris"
                                            />
                                        </Field>
                                        <Field label="Méthode de calcul" hint="Angle astronomique pour Fajr et Isha">
                                            <SelectInput
                                                value={form.islam.prayerMethod}
                                                onChange={(e) => update('islam', 'prayerMethod', Number(e.target.value))}
                                                options={PRAYER_METHODS}
                                            />
                                        </Field>
                                    </div>

                                    <div className="border-t border-slate-800/80 pt-4 space-y-3">
                                        <label className="flex items-center gap-3 text-sm font-semibold text-white cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.islam.prayerNotificationEnabled}
                                                onChange={(e) => update('islam', 'prayerNotificationEnabled', e.target.checked)}
                                                className="size-4 accent-emerald-500 rounded"
                                            />
                                            <span>Activer les notifications automatiques à l'heure de chaque prière (Appel Adhan)</span>
                                        </label>

                                        {form.islam.prayerNotificationEnabled ? (
                                            <div className="grid gap-4 md:grid-cols-2 pt-2">
                                                <Field label="Salon Discord pour l'Adhan" hint="Le bot y publiera un embed à l'heure exacte de chaque prière">
                                                    <SelectInput
                                                        value={form.islam.prayerChannelId}
                                                        onChange={(e) => update('islam', 'prayerChannelId', e.target.value)}
                                                        options={channelOptions}
                                                        emptyLabel="Choisir un salon textuel"
                                                    />
                                                </Field>
                                                <Field label="Rôle à mentionner (optionnel)" hint="Ex: @Prière ou @Musulmans (laisser vide pour aucune mention)">
                                                    <SelectInput
                                                        value={form.islam.prayerRoleId}
                                                        onChange={(e) => update('islam', 'prayerRoleId', e.target.value)}
                                                        options={roleOptions}
                                                        emptyLabel="Aucune mention de rôle"
                                                    />
                                                </Field>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* 2. Rappel des Jours Blancs (Jeûne Sunnah) */}
                                <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🤍</span>
                                        <div>
                                            <h3 className="font-semibold text-white">Jeûne des Jours Blancs (Ayyam al-Bid)</h3>
                                            <p className="text-xs text-slate-400">Rappel automatique de la Sunnah la veille des 13, 14 et 15 de chaque mois hégirien (à 18h00).</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 text-sm font-semibold text-white cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.islam.whiteDaysNotificationEnabled}
                                                onChange={(e) => update('islam', 'whiteDaysNotificationEnabled', e.target.checked)}
                                                className="size-4 accent-emerald-500 rounded"
                                            />
                                            <span>Activer le rappel automatique la veille du jeûne des Jours Blancs</span>
                                        </label>

                                        {form.islam.whiteDaysNotificationEnabled ? (
                                            <div className="max-w-md pt-2">
                                                <Field label="Salon Discord pour le rappel" hint="Salon où sera publiée l'annonce la veille du 13ème jour">
                                                    <SelectInput
                                                        value={form.islam.whiteDaysChannelId}
                                                        onChange={(e) => update('islam', 'whiteDaysChannelId', e.target.value)}
                                                        options={channelOptions}
                                                        emptyLabel="Choisir un salon textuel"
                                                    />
                                                </Field>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* 3. Radio Coran 24/7 & Récitateurs */}
                                <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🎙️</span>
                                        <div>
                                            <h3 className="font-semibold text-white">Radio Coranique 24/7 & Audio Vocal</h3>
                                            <p className="text-xs text-slate-400">Diffusion continue en salon vocal sans interruption ni déconnexion.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field label="Récitateur favori par défaut" hint="Utilisé au lancement de la commande /radio">
                                            <SelectInput
                                                value={form.islam.radioDefaultReciter}
                                                onChange={(e) => update('islam', 'radioDefaultReciter', e.target.value)}
                                                options={ISLAMIC_RECITERS}
                                            />
                                        </Field>
                                        <div className="flex flex-col justify-center">
                                            <label className="flex items-center gap-3 text-sm font-semibold text-white cursor-pointer pt-4">
                                                <input
                                                    type="checkbox"
                                                    checked={form.islam.radioAutoReconnect}
                                                    onChange={(e) => update('islam', 'radioAutoReconnect', e.target.checked)}
                                                    className="size-4 accent-emerald-500 rounded"
                                                />
                                                <span>Reconnexion automatique du flux en cas de micro-coupure réseau</span>
                                            </label>
                                            <span className="text-xs text-slate-400 mt-1">Garantit une diffusion 24/7 ininterrompue.</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Catalogue des 10 Commandes Spirituelles Actives */}
                                <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-white">Catalogue des 10 Commandes Spirituelles Actives</h3>
                                            <p className="text-xs text-slate-400">Toutes ces fonctionnalités sont disponibles gratuitement sur votre serveur Discord :</p>
                                        </div>
                                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                                            10 Commandes Débloquées
                                        </span>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        <div className="rounded border border-emerald-900/60 bg-slate-900/80 p-3 hover:border-emerald-700/60 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm font-bold text-emerald-400">/priere</code>
                                                <span className="text-[10px] text-slate-500 uppercase font-semibold">Horaires</span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-300">Horaires des 5 prières du jour pour toute ville avec décompte temps réel.</p>
                                        </div>

                                        <div className="rounded border border-emerald-900/60 bg-slate-900/80 p-3 hover:border-emerald-700/60 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm font-bold text-emerald-400">/doua</code>
                                                <span className="text-[10px] text-slate-500 uppercase font-semibold">Invocations</span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-300">Citadelle du Musulman (matin, soir, sommeil, repas, épreuves) avec arabe et phonétique.</p>
                                        </div>

                                        <div className="rounded border border-emerald-900/60 bg-slate-900/80 p-3 hover:border-emerald-700/60 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm font-bold text-emerald-400">/hadith</code>
                                                <span className="text-[10px] text-slate-500 uppercase font-semibold">Sunnah</span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-300">40 Hadiths Nawawi, Sahih Bukhari & Muslim avec références et leçons éthiques.</p>
                                        </div>

                                        <div className="rounded border border-emerald-900/60 bg-slate-900/80 p-3 hover:border-emerald-700/60 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm font-bold text-emerald-400">/hijri</code>
                                                <span className="text-[10px] text-slate-500 uppercase font-semibold">Calendrier</span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-300">Date lunaire du jour, mois islamique et rappel des 3 Jours Blancs (13, 14, 15).</p>
                                        </div>

                                        <div className="rounded border border-emerald-900/60 bg-slate-900/80 p-3 hover:border-emerald-700/60 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm font-bold text-emerald-400">/qibla</code>
                                                <span className="text-[10px] text-slate-500 uppercase font-semibold">Direction</span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-300">Cap précis en degrés et distance en km vers la Kaaba sacrée à La Mecque.</p>
                                        </div>

                                        <div className="rounded border border-emerald-900/60 bg-slate-900/80 p-3 hover:border-emerald-700/60 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm font-bold text-emerald-400">/asma</code>
                                                <span className="text-[10px] text-slate-500 uppercase font-semibold">99 Noms</span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-300">Les 99 Plus Beaux Noms d'Allah avec calligraphie arabe, sens et méditation.</p>
                                        </div>

                                        <div className="rounded border border-emerald-900/60 bg-slate-900/80 p-3 hover:border-emerald-700/60 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm font-bold text-emerald-400">/ramadan</code>
                                                <span className="text-[10px] text-slate-500 uppercase font-semibold">Jeûne</span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-300">Compagnon de jeûne : heures d'Imsak et d'Iftar (Maghrib) et doua de rupture.</p>
                                        </div>

                                        <div className="rounded border border-emerald-900/60 bg-slate-900/80 p-3 hover:border-emerald-700/60 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm font-bold text-emerald-400">/radio</code>
                                                <span className="text-[10px] text-slate-500 uppercase font-semibold">Audio 24/7</span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-300">Diffusion 24/7 en salon vocal avec 22 récitateurs et stations sélectionnables.</p>
                                        </div>

                                        <div className="rounded border border-emerald-900/60 bg-slate-900/80 p-3 hover:border-emerald-700/60 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm font-bold text-emerald-400">/coran</code>
                                                <span className="text-[10px] text-slate-500 uppercase font-semibold">Lecture</span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-300">Lecture et écoute verset par verset du Saint Coran avec traduction en français.</p>
                                        </div>

                                        <div className="rounded border border-emerald-900/60 bg-slate-900/80 p-3 hover:border-emerald-700/60 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm font-bold text-emerald-400">/quiz</code>
                                                <span className="text-[10px] text-slate-500 uppercase font-semibold">Quiz</span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-300">Quiz islamique interactif avec classement des meilleurs joueurs en direct.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-5 space-y-4">
                                <div>
                                    <h3 className="font-semibold text-white">Déverrouillage par Code Secret</h3>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Entrez votre code d'accès pour débloquer les modules et fonctionnalités supplémentaires sur ce serveur.
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

                <div className="gc-savebar">
                    <span>Pensez à enregistrer après vos modifications.</span>
                    <button type="submit" disabled={saving} className="gc-save">
                        {saving ? <span className="gc-save__spinner" /> : <Icon name="check" size={17} />}
                        {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
            </div>
        </main>
    );
}

export default GuildConfig;