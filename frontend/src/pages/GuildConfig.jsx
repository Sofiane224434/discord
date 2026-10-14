import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
        <label className="ui-field">
            <span className="ui-field__label">{label}</span>
            {children}
            {hint ? <span className="cf-hint">{hint}</span> : null}
        </label>
    );
}

function TextInput(props) {
    return <input {...props} className="ui-input" />;
}

function SelectInput({ value, onChange, options, emptyLabel, className = '' }) {
    return (
        <select value={value || ''} onChange={onChange} className={`ui-input cf-select ${className}`}>
            {emptyLabel ? <option value="">{emptyLabel}</option> : null}
            {options.map((option) => (
                <option value={option.value} key={option.value}>{option.label}</option>
            ))}
        </select>
    );
}

// Interrupteur on/off avec libellé et description
function Switch({ checked, onChange, label, desc }) {
    return (
        <label className={`cf-switch${checked ? ' is-on' : ''}`}>
            <input type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
            <span className="cf-switch__track" aria-hidden="true"><i /></span>
            {label ? (
                <span className="cf-switch__text">
                    <strong>{label}</strong>
                    {desc ? <small>{desc}</small> : null}
                </span>
            ) : null}
        </label>
    );
}

// Bloc de réglages : titre, description, action optionnelle à droite
function Card({ title, desc, aside, children }) {
    return (
        <section className="cf-card">
            {title ? (
                <header className="cf-card__head">
                    <div>
                        <h3>{title}</h3>
                        {desc ? <p>{desc}</p> : null}
                    </div>
                    {aside}
                </header>
            ) : null}
            {children}
        </section>
    );
}

// Pastille de rôle supprimable
function RoleChip({ name, onRemove }) {
    return (
        <span className="cf-chip">
            @{name}
            <button type="button" onClick={onRemove} aria-label={`Retirer ${name}`}><Icon name="close" size={12} /></button>
        </span>
    );
}

// Prépare la partie « enregistrable » du formulaire pour détecter les modifications
function serializeForm(form) {
    return JSON.stringify({
        ai: { systemPrompt: form.ai.systemPrompt, language: form.ai.language, triggerNames: form.ai.triggerNames },
        logs: form.logs,
        welcome: form.welcome,
        bio: form.profile.bio,
        youtube: form.youtube,
        tiktok: form.tiktok,
        rank: form.rank,
        islam: form.islam,
        commands: form.commands,
    });
}

function GuildConfig() {
    const { guildId } = useParams();
    const { setIsIslamUnlocked } = useTheme();
    const [form, setForm] = useState(EMPTY_CONFIG);
    // Dernière version enregistrée côté serveur : sert à détecter les modifications en cours
    const [savedForm, setSavedForm] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const contentRef = useRef(null);
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
        const merged = mergeConfig(data);
        setForm(merged);
        setSavedForm(merged);
    }, [guildId]);

    const handleDownloadAvatar = async () => {
        setDownloadingAvatar(true);
        setError('');
        try {
            const fileName = `${form.profile.botDisplayName || 'azim'}-avatar.png`;
            await adminService.downloadAvatar(guildId, fileName);
            setNotice('Photo de profil téléchargée avec succès.');
        } catch {
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
                    setSavedForm(merged);
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
    const isDirty = savedForm ? serializeForm(form) !== serializeForm(savedForm) : false;

    // Prévient avant de quitter la page avec des modifications non enregistrées
    useEffect(() => {
        if (!isDirty) return undefined;
        const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [isDirty]);

    const discardChanges = () => {
        if (savedForm) setForm(savedForm);
    };

    // Change d'onglet et remonte en haut du contenu
    const goToTab = (tabId) => {
        setActiveTab(tabId);
        const el = contentRef.current;
        if (el && el.getBoundingClientRect().top < 0) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (loading) {
        return (
            <main className="gc">
                <LoadingScreen
                    label="Chargement de la configuration…"
                    subtext={getGuildName(guildId)}
                />
            </main>
        );
    }

    const channelOptions = form.channels.map((channel) => ({ value: channel.id, label: `#${channel.name}` }));
    const roleOptions = form.roles.map((role) => ({ value: role.id, label: role.name }));
    const roleName = (id) => form.roles.find((r) => r.id === id)?.name || id;
    const channelName = (id) => form.channels.find((c) => c.id === id)?.name;

    const visibleCommands = form.commands.filter((cmd) => isIslamActive || !cmd.isIslamic);
    const filteredCommands = visibleCommands.filter((cmd) => {
        if (!commandSearch.trim()) return true;
        const q = commandSearch.toLowerCase().trim();
        return cmd.name.toLowerCase().includes(q) || (cmd.description || '').toLowerCase().includes(q);
    });

    const commandUsage = Object.entries(form.observability?.commandByName || {})
        .map(([name, count]) => ({ name, count: Number(count) || 0 }))
        .sort((a, b) => b.count - a.count);
    const totalRuns = commandUsage.reduce((n, c) => n + c.count, 0);
    const maxRuns = Math.max(1, ...commandUsage.map((c) => c.count));
    const recentErrors = Array.isArray(form.observability?.recentErrors) ? form.observability.recentErrors : [];

    const tabs = [
        { id: 'overview', label: 'Vue d’ensemble', icon: 'activity' },
        { id: 'ai', label: 'Intelligence artificielle', icon: 'sparkles' },
        { id: 'commands', label: 'Commandes', icon: 'terminal', count: visibleCommands.length },
        { id: 'welcome', label: 'Bienvenue', icon: 'hand', on: form.welcome.enabled },
        { id: 'levels', label: 'Niveaux', icon: 'activity', on: form.rank.enabled },
        { id: 'social', label: 'Alertes réseaux', icon: 'megaphone', on: (form.youtube.channels || []).length > 0 || form.tiktok.enabled },
        { id: 'profile', label: 'Profil & logs', icon: 'fileText' },
        { id: 'islam', label: isIslamActive ? 'Mode Islam' : 'Code secret', icon: isIslamActive ? 'moon' : 'key', on: isIslamActive ? true : undefined },
    ];

    // Cartes de modules de la vue d'ensemble : état + accès direct à l'onglet
    const modules = [
        { tab: 'ai', title: 'Intelligence artificielle', icon: 'sparkles', color: 'var(--azim-lilac)', state: form.ai.keysCount > 0 ? 'on' : 'todo', detail: form.ai.keysCount > 0 ? `${form.ai.keysCount} clé(s) Groq` : 'Ajoutez une clé Groq' },
        { tab: 'welcome', title: 'Bienvenue', icon: 'hand', color: 'var(--azim-accent)', state: form.welcome.enabled ? (form.welcome.channelId ? 'on' : 'todo') : 'off', detail: form.welcome.enabled ? (channelName(form.welcome.channelId) ? `#${channelName(form.welcome.channelId)}` : 'Choisissez un salon') : 'Désactivé' },
        { tab: 'levels', title: 'Niveaux', icon: 'activity', color: 'var(--azim-warm)', state: form.rank.enabled ? 'on' : 'off', detail: form.rank.enabled ? `${form.rank.rewards.length} palier(s) de récompense` : 'Désactivé' },
        { tab: 'social', title: 'YouTube', icon: 'megaphone', color: 'var(--azim-coral)', state: (form.youtube.channels || []).length ? (form.youtube.targetChannelId ? 'on' : 'todo') : 'off', detail: (form.youtube.channels || []).length ? `${form.youtube.channels.length} chaîne(s) suivie(s)` : 'Aucune chaîne' },
        { tab: 'social', title: 'TikTok Live', icon: 'megaphone', color: '#f472b6', state: form.tiktok.enabled ? (form.tiktok.username ? 'on' : 'todo') : 'off', detail: form.tiktok.enabled ? (form.tiktok.username || 'Ajoutez un pseudo') : 'Désactivé' },
        { tab: 'profile', title: 'Logs du bot', icon: 'fileText', color: 'var(--azim-success)', state: form.logs.channelId ? 'on' : 'off', detail: form.logs.channelId ? `#${channelName(form.logs.channelId) || 'salon'}` : 'Aucun salon' },
    ];
    const STATE_LABEL = { on: 'Actif', off: 'Inactif', todo: 'À configurer' };

    const addWelcomeRule = () => update('welcome', 'rules', [
        ...form.welcome.rules,
        { condition: 'has_role', matchType: 'all', roleIds: [], channelId: '', message: '', dmMessage: '' },
    ]);

    return (
        <main className="gc">
            <header className="gc-head">
                <Link to="/dashboard" className="gc-back"><Icon name="arrowLeft" size={16} /> Mes serveurs</Link>
                <div className="gc-head__id">
                    {currentGuildIcon ? (
                        <img src={currentGuildIcon} alt="" className="gc-head__icon" />
                    ) : (
                        <span className="gc-head__icon gc-head__icon--fallback">{getGuildName(guildId).slice(0, 2).toUpperCase()}</span>
                    )}
                    <div>
                        <h1>{getGuildName(guildId)}</h1>
                        <p>Configuration d’Azim sur ce serveur</p>
                    </div>
                </div>
            </header>

            {error ? <div role="alert" className="ui-flash ui-flash--error"><Icon name="alert" size={18} /> {error}</div> : null}
            {notice ? <div role="status" className="ui-flash ui-flash--ok"><Icon name="check" size={18} /> {notice}</div> : null}

            <div className="gc-layout" ref={contentRef}>
                <nav className="gc-nav" aria-label="Sections de configuration">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => goToTab(tab.id)}
                            className={`gc-nav__item${activeTab === tab.id ? ' is-active' : ''}`}
                            aria-current={activeTab === tab.id ? 'page' : undefined}
                        >
                            <Icon name={tab.icon} size={18} />
                            <span className="gc-nav__label">{tab.label}</span>
                            {typeof tab.count === 'number' ? <span className="gc-nav__count">{tab.count}</span> : null}
                            {typeof tab.on === 'boolean' ? <span className={`gc-nav__dot${tab.on ? ' is-on' : ''}`} title={tab.on ? 'Actif' : 'Inactif'} /> : null}
                        </button>
                    ))}
                </nav>

                <form id="guild-config" onSubmit={save} className="gc-content">
                    {/* VUE D'ENSEMBLE */}
                    {activeTab === 'overview' ? (
                        <>
                            <div className="cf-modules">
                                {modules.map((m) => (
                                    <button key={m.title} type="button" className={`cf-module is-${m.state}`} style={{ '--c': m.color }} onClick={() => goToTab(m.tab)}>
                                        <span className="cf-module__icon"><Icon name={m.icon} size={20} /></span>
                                        <span className="cf-module__text">
                                            <strong>{m.title}</strong>
                                            <small>{m.detail}</small>
                                        </span>
                                        <span className="cf-module__state">{STATE_LABEL[m.state]}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="cf-grid-2">
                                <Card title="Commandes utilisées" desc={`${totalRuns} exécution(s) sur ce serveur`}>
                                    {commandUsage.length ? (
                                        <ol className="pnl-bars">
                                            {commandUsage.slice(0, 6).map((c) => (
                                                <li key={c.name}>
                                                    <div className="pnl-bars__label"><code>/{c.name}</code><strong>{c.count}</strong></div>
                                                    <span className="pnl-bars__track"><i style={{ width: `${Math.max(4, (c.count / maxRuns) * 100)}%` }} /></span>
                                                </li>
                                            ))}
                                        </ol>
                                    ) : <p className="cf-empty">Aucune commande utilisée pour l’instant.</p>}
                                </Card>
                                <Card title="Erreurs récentes" desc="Problèmes rencontrés par le bot ici">
                                    {recentErrors.length ? (
                                        <ul className="pnl-errors">
                                            {recentErrors.slice(0, 5).map((err, idx) => (
                                                <li key={idx}>
                                                    <span className="pnl-errors__icon"><Icon name="alert" size={15} /></span>
                                                    <div><strong>{err.type || 'Erreur'}</strong><small>{String(err.message || '').slice(0, 90)}</small></div>
                                                    <time>{err.ts ? new Date(err.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}</time>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className="cf-empty cf-empty--ok"><Icon name="check" size={16} /> Aucune erreur récente.</p>}
                                </Card>
                            </div>
                        </>
                    ) : null}

                    {/* INTELLIGENCE ARTIFICIELLE */}
                    {activeTab === 'ai' ? (
                        <>
                            <div className="cf-title">
                                <h2>Intelligence artificielle</h2>
                                <p>Comment Azim répond quand on lui parle sur ce serveur.</p>
                            </div>

                            <Card title="Mots qui réveillent l’IA" desc="Azim répond quand un message contient l’un de ces mots, en plus des mentions.">
                                <div className="cf-chips">
                                    {form.ai.triggerNames.map((trig) => (
                                        <span key={trig} className="cf-chip cf-chip--accent">
                                            {trig}
                                            {form.ai.triggerNames.length > 1 ? (
                                                <button type="button" onClick={() => removeTriggerName(trig)} aria-label={`Retirer ${trig}`}><Icon name="close" size={12} /></button>
                                            ) : null}
                                        </span>
                                    ))}
                                </div>
                                <div className="cf-inline">
                                    <TextInput
                                        placeholder="Ajouter un mot (ex : az, bot)"
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
                                    <button type="button" onClick={addTriggerName} disabled={!newTrigger.trim() || newTrigger.trim().length < 2} className="ui-btn">
                                        <Icon name="plus" size={16} /> Ajouter
                                    </button>
                                </div>
                            </Card>

                            <Card title="Personnalité">
                                <div className="cf-stack">
                                    <Field label="Langue des réponses" hint="Laissez vide pour répondre dans la langue du message.">
                                        <TextInput
                                            maxLength={50}
                                            placeholder="Français, English, العربية…"
                                            value={form.ai.language || ''}
                                            onChange={(e) => update('ai', 'language', e.target.value)}
                                        />
                                    </Field>
                                    <Field label="Instructions pour l’IA" hint={`${(form.ai.systemPrompt || '').length}/6000 caractères`}>
                                        <textarea
                                            className="ui-input"
                                            rows={6}
                                            maxLength={6000}
                                            placeholder="Tu es Azim, l’assistant de ce serveur Discord. Tu tutoies les membres…"
                                            value={form.ai.systemPrompt || ''}
                                            onChange={(e) => update('ai', 'systemPrompt', e.target.value)}
                                        />
                                    </Field>
                                </div>
                            </Card>

                            <Card
                                title="Clés API Groq"
                                desc="Utilisées uniquement pour ce serveur. Les modifications de clés sont enregistrées immédiatement."
                                aside={form.ai.keysPreviews.length ? (
                                    <button type="button" className="ui-btn" onClick={copyAllKeysToClipboard}>
                                        <Icon name={copiedAllKeys ? 'check' : 'fileText'} size={16} /> {copiedAllKeys ? 'Copiées' : 'Tout copier'}
                                    </button>
                                ) : null}
                            >
                                {form.ai.keysPreviews.length ? (
                                    <ul className="cf-keys">
                                        {form.ai.keysPreviews.map((key) => {
                                            const fullKey = key.key || key.preview || '';
                                            return (
                                                <li key={key.index}>
                                                    <span className="cf-keys__n">#{key.index}</span>
                                                    <code>{fullKey}</code>
                                                    <button type="button" className="ui-icon-btn" onClick={() => copyKeyToClipboard(fullKey, key.index)} title="Copier">
                                                        <Icon name={copiedKeyIndex === key.index ? 'check' : 'fileText'} size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="ui-icon-btn cf-danger"
                                                        disabled={form.ai.keysCount <= 1}
                                                        onClick={() => manageKey({ removeKeyIndex: key.index })}
                                                        title={form.ai.keysCount <= 1 ? 'Gardez au moins une clé' : 'Supprimer'}
                                                    >
                                                        <Icon name="close" size={15} />
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : <p className="cf-empty">Aucune clé : l’IA utilise le quota partagé, plus limité.</p>}

                                <div className="cf-stack cf-keys__add">
                                    <Field
                                        label="Ajouter des clés"
                                        hint={detectedGroqKeys.length ? `${detectedGroqKeys.length} clé(s) détectée(s)` : 'Collez une ou plusieurs clés gsk_…, séparées par des retours à la ligne.'}
                                    >
                                        <textarea
                                            className="ui-input cf-mono"
                                            rows={3}
                                            placeholder={'gsk_…\ngsk_…'}
                                            value={newKey}
                                            onChange={(e) => setNewKey(e.target.value)}
                                        />
                                    </Field>
                                    <div className="cf-actions">
                                        <button
                                            type="button"
                                            disabled={!detectedGroqKeys.length}
                                            onClick={() => manageKey({ addKeys: detectedGroqKeys })}
                                            className="ui-btn ui-btn--primary"
                                        >
                                            <Icon name="plus" size={16} /> Ajouter {detectedGroqKeys.length > 1 ? `les ${detectedGroqKeys.length} clés` : 'la clé'}
                                        </button>
                                        {detectedGroqKeys.length && form.ai.keysPreviews.length ? (
                                            <button
                                                type="button"
                                                className="ui-btn ui-btn--ghost"
                                                onClick={() => {
                                                    if (window.confirm(`Remplacer toutes les clés existantes par ces ${detectedGroqKeys.length} clé(s) ?`)) {
                                                        manageKey({ setKeys: detectedGroqKeys });
                                                    }
                                                }}
                                            >
                                                Remplacer les clés existantes
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </Card>
                        </>
                    ) : null}

                    {/* COMMANDES */}
                    {activeTab === 'commands' ? (
                        <>
                            <div className="cf-title cf-title--row">
                                <div>
                                    <h2>Commandes</h2>
                                    <p>Activez les commandes et choisissez qui peut les utiliser.</p>
                                </div>
                                <label className="ui-search">
                                    <Icon name="search" size={16} />
                                    <input
                                        type="search"
                                        placeholder="Rechercher…"
                                        value={commandSearch}
                                        onChange={(e) => setCommandSearch(e.target.value)}
                                    />
                                </label>
                            </div>

                            <div className="cf-commands">
                                {filteredCommands.map((cmd) => {
                                    const allowedRoles = cmd.allowedRoleIds || [];
                                    const isEnabled = cmd.enabled !== false;
                                    return (
                                        <article key={cmd.name} className={`cf-command${isEnabled ? '' : ' is-off'}`}>
                                            <div className="cf-command__main">
                                                <div className="cf-command__name">
                                                    <code>/{cmd.name}</code>
                                                    {cmd.isIslamic ? <span className="cf-tag cf-tag--green">Islam</span> : null}
                                                </div>
                                                <p>{cmd.description || 'Aucune description'}</p>
                                            </div>
                                            <Switch checked={isEnabled} onChange={(v) => updateCommand(cmd.name, 'enabled', v)} />

                                            {isEnabled ? (
                                                <div className="cf-command__access">
                                                    <div className="ui-seg cf-seg-sm" role="radiogroup" aria-label={`Accès à /${cmd.name}`}>
                                                        <button type="button" className={!cmd.adminOnly ? 'is-active' : ''} onClick={() => updateCommand(cmd.name, 'adminOnly', false)}>
                                                            {cmd.defaultLevel === 'admin' ? 'Par défaut' : 'Tout le monde'}
                                                        </button>
                                                        <button type="button" className={cmd.adminOnly ? 'is-active' : ''} onClick={() => updateCommand(cmd.name, 'adminOnly', true)}>
                                                            Admins seulement
                                                        </button>
                                                    </div>
                                                    <div className="cf-chips">
                                                        {allowedRoles.map((roleId) => (
                                                            <RoleChip key={roleId} name={roleName(roleId)} onRemove={() => toggleCommandRole(cmd.name, roleId)} />
                                                        ))}
                                                        <SelectInput
                                                            value=""
                                                            onChange={(e) => { if (e.target.value) toggleCommandRole(cmd.name, e.target.value); }}
                                                            options={roleOptions.filter((r) => !allowedRoles.includes(r.value))}
                                                            emptyLabel="+ Autoriser un rôle"
                                                            className="cf-select--chip"
                                                        />
                                                    </div>
                                                </div>
                                            ) : null}
                                        </article>
                                    );
                                })}
                                {filteredCommands.length === 0 ? <p className="cf-empty">Aucune commande ne correspond à « {commandSearch} ».</p> : null}
                            </div>
                        </>
                    ) : null}

                    {/* BIENVENUE */}
                    {activeTab === 'welcome' ? (
                        <>
                            <div className="cf-title cf-title--row">
                                <div>
                                    <h2>Bienvenue</h2>
                                    <p>Le message envoyé quand quelqu’un rejoint le serveur.</p>
                                </div>
                                <Switch checked={form.welcome.enabled} onChange={(v) => update('welcome', 'enabled', v)} label={form.welcome.enabled ? 'Activé' : 'Désactivé'} />
                            </div>

                            <div className={form.welcome.enabled ? '' : 'cf-disabled'}>
                                <Card title="Envoi">
                                    <div className="cf-grid-3">
                                        <Field label="Salon">
                                            <SelectInput value={form.welcome.channelId} onChange={(e) => update('welcome', 'channelId', e.target.value)} options={channelOptions} emptyLabel="Choisir un salon" />
                                        </Field>
                                        <Field label="Où envoyer">
                                            <SelectInput
                                                value={form.welcome.destination}
                                                onChange={(e) => update('welcome', 'destination', e.target.value)}
                                                options={[
                                                    { value: 'both', label: 'Salon + message privé' },
                                                    { value: 'channel', label: 'Salon uniquement' },
                                                    { value: 'dm', label: 'Message privé uniquement' },
                                                ]}
                                            />
                                        </Field>
                                        <Field label="Quand">
                                            <SelectInput
                                                value={form.welcome.trigger}
                                                onChange={(e) => update('welcome', 'trigger', e.target.value)}
                                                options={[
                                                    { value: 'arrivee', label: 'À l’arrivée' },
                                                    { value: 'role', label: 'Quand un rôle est donné' },
                                                ]}
                                            />
                                        </Field>
                                    </div>
                                </Card>

                                <Card title="Messages" desc="Variables : {mention}, {username}, {serveur}, {nbmembres}">
                                    <div className="cf-grid-2">
                                        <Field label="Dans le salon">
                                            <textarea className="ui-input" rows={4} maxLength={2000} value={form.welcome.defaultMessage || ''} onChange={(e) => update('welcome', 'defaultMessage', e.target.value)} />
                                        </Field>
                                        <Field label="En message privé">
                                            <textarea className="ui-input" rows={4} maxLength={2000} value={form.welcome.defaultDmMessage || ''} onChange={(e) => update('welcome', 'defaultDmMessage', e.target.value)} />
                                        </Field>
                                    </div>
                                </Card>

                                <Card
                                    title="Messages selon les rôles"
                                    desc="Un message différent pour les membres qui ont (ou n’ont pas) certains rôles."
                                    aside={<button type="button" className="ui-btn" onClick={addWelcomeRule}><Icon name="plus" size={16} /> Ajouter une règle</button>}
                                >
                                    {form.welcome.rules.length === 0 ? <p className="cf-empty">Aucune règle : tout le monde reçoit le message ci-dessus.</p> : null}
                                    <div className="cf-rules">
                                        {form.welcome.rules.map((rule, index) => {
                                            const selectedRoleIds = rule.roleIds || (rule.roleId ? [rule.roleId] : []);
                                            return (
                                                <div key={index} className="cf-rule">
                                                    <div className="cf-rule__head">
                                                        <span>Règle {index + 1}</span>
                                                        <button type="button" className="ui-icon-btn cf-danger" title="Supprimer la règle" onClick={() => update('welcome', 'rules', form.welcome.rules.filter((_, i) => i !== index))}>
                                                            <Icon name="close" size={15} />
                                                        </button>
                                                    </div>
                                                    <div className="cf-rule__when">
                                                        <SelectInput
                                                            value={`${rule.condition || 'has_role'}_${rule.matchType || 'all'}`}
                                                            onChange={(e) => {
                                                                const [cond, match] = e.target.value.split(/_(?=[^_]+$)/);
                                                                updateRuleField(index, 'condition', cond);
                                                                updateRuleField(index, 'matchType', match);
                                                            }}
                                                            options={[
                                                                { value: 'has_role_all', label: 'Si le membre a tous ces rôles' },
                                                                { value: 'has_role_any', label: 'Si le membre a l’un de ces rôles' },
                                                                { value: 'lacks_role_all', label: 'Si le membre n’a aucun de ces rôles' },
                                                            ]}
                                                        />
                                                        <div className="cf-chips">
                                                            {selectedRoleIds.map((rid) => (
                                                                <RoleChip key={rid} name={roleName(rid)} onRemove={() => removeRoleFromRule(index, rid)} />
                                                            ))}
                                                            <SelectInput
                                                                value=""
                                                                onChange={(e) => addRoleToRule(index, e.target.value)}
                                                                options={roleOptions.filter((r) => !selectedRoleIds.includes(r.value))}
                                                                emptyLabel="+ Rôle"
                                                                className="cf-select--chip"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="cf-grid-2">
                                                        <Field label="Message dans le salon">
                                                            <TextInput placeholder="Ex : Bienvenue {mention} !" value={rule.message || ''} onChange={(e) => updateRuleField(index, 'message', e.target.value)} />
                                                        </Field>
                                                        <Field label="Message privé (facultatif)">
                                                            <TextInput placeholder="Message privé…" value={rule.dmMessage || ''} onChange={(e) => updateRuleField(index, 'dmMessage', e.target.value)} />
                                                        </Field>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            </div>
                        </>
                    ) : null}

                    {/* NIVEAUX */}
                    {activeTab === 'levels' ? (
                        <>
                            <div className="cf-title cf-title--row">
                                <div>
                                    <h2>Niveaux</h2>
                                    <p>Les membres gagnent de l’XP en discutant et débloquent des rôles.</p>
                                </div>
                                <Switch checked={form.rank.enabled} onChange={(v) => update('rank', 'enabled', v)} label={form.rank.enabled ? 'Activé' : 'Désactivé'} />
                            </div>

                            <div className={form.rank.enabled ? '' : 'cf-disabled'}>
                                <Card title="Annonces de niveau">
                                    <div className="cf-grid-2 cf-align-end">
                                        <Field label="Salon des annonces">
                                            <SelectInput value={form.rank.announceChannelId} onChange={(e) => update('rank', 'announceChannelId', e.target.value)} options={channelOptions} emptyLabel="Là où le membre écrit" />
                                        </Field>
                                        <Switch checked={form.rank.silent} onChange={(v) => update('rank', 'silent', v)} label="Mode silencieux" desc="Ne pas annoncer les passages de niveau" />
                                    </div>
                                </Card>

                                <Card
                                    title="Rôles de récompense"
                                    desc="Donnés automatiquement quand un membre atteint le niveau."
                                    aside={<button type="button" className="ui-btn" onClick={() => update('rank', 'rewards', [...form.rank.rewards, { level: 1, roleId: '' }])}><Icon name="plus" size={16} /> Ajouter un palier</button>}
                                >
                                    {form.rank.rewards.length === 0 ? <p className="cf-empty">Aucun palier pour l’instant.</p> : null}
                                    <div className="cf-rewards">
                                        {form.rank.rewards.map((reward, index) => (
                                            <div key={index} className="cf-reward">
                                                <label className="cf-reward__lvl">
                                                    <span>Niveau</span>
                                                    <input type="number" min="1" max="200" value={reward.level} onChange={(e) => updateReward(index, 'level', Number(e.target.value))} />
                                                </label>
                                                <Icon name="arrowRight" size={16} />
                                                <SelectInput value={reward.roleId} onChange={(e) => updateReward(index, 'roleId', e.target.value)} options={roleOptions} emptyLabel="Choisir le rôle" />
                                                <button type="button" className="ui-icon-btn cf-danger" title="Retirer ce palier" onClick={() => update('rank', 'rewards', form.rank.rewards.filter((_, i) => i !== index))}>
                                                    <Icon name="close" size={15} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </>
                    ) : null}

                    {/* ALERTES RÉSEAUX */}
                    {activeTab === 'social' ? (
                        <>
                            <div className="cf-title">
                                <h2>Alertes réseaux</h2>
                                <p>Prévenez votre serveur des nouvelles vidéos et des lives.</p>
                            </div>

                            <div className="cf-grid-2">
                                <Card title="YouTube" desc="Une alerte à chaque nouvelle vidéo.">
                                    <div className="cf-stack">
                                        <Field label="Chaînes suivies" hint="Un identifiant UC… ou un @handle par ligne.">
                                            <textarea
                                                className="ui-input cf-mono"
                                                rows={4}
                                                value={(form.youtube.channels || []).join('\n')}
                                                onChange={(e) => update('youtube', 'channels', e.target.value.split(/\r?\n/).map((id) => id.trim()).filter(Boolean))}
                                            />
                                        </Field>
                                        <Field label="Salon des alertes">
                                            <SelectInput value={form.youtube.targetChannelId} onChange={(e) => update('youtube', 'targetChannelId', e.target.value)} options={channelOptions} emptyLabel="Choisir un salon" />
                                        </Field>
                                    </div>
                                </Card>

                                <Card title="TikTok Live" desc="Une alerte quand le créateur lance un live." aside={<Switch checked={form.tiktok.enabled} onChange={(v) => update('tiktok', 'enabled', v)} />}>
                                    <div className={`cf-stack${form.tiktok.enabled ? '' : ' cf-disabled'}`}>
                                        <Field label="Pseudo TikTok">
                                            <TextInput placeholder="@pseudo" value={form.tiktok.username || ''} onChange={(e) => update('tiktok', 'username', e.target.value)} />
                                        </Field>
                                        <Field label="Salon des alertes">
                                            <SelectInput value={form.tiktok.targetChannelId} onChange={(e) => update('tiktok', 'targetChannelId', e.target.value)} options={channelOptions} emptyLabel="Choisir un salon" />
                                        </Field>
                                    </div>
                                </Card>
                            </div>
                        </>
                    ) : null}

                    {/* PROFIL & LOGS */}
                    {activeTab === 'profile' ? (
                        <>
                            <div className="cf-title">
                                <h2>Profil & logs</h2>
                                <p>L’apparence d’Azim sur ce serveur et son salon de diagnostic.</p>
                            </div>

                            <Card title="Profil du bot" desc="Le nom et l’avatar sont appliqués immédiatement.">
                                <div className="cf-profile">
                                    <div className="cf-profile__avatar">
                                        <img
                                            src={form.profile.hasServerAvatar && form.profile.currentAvatarUrl
                                                ? form.profile.currentAvatarUrl
                                                : (isIslamActive ? '/icon-islam.png' : (form.profile.globalAvatarUrl || '/icon.png'))}
                                            alt=""
                                        />
                                        <span>{form.profile.hasServerAvatar ? 'Avatar du serveur' : 'Avatar par défaut'}</span>
                                    </div>
                                    <div className="cf-stack cf-profile__fields">
                                        <Field label="Nom sur ce serveur">
                                            <div className="cf-inline">
                                                <TextInput maxLength={32} placeholder="Azim" value={form.profile.botDisplayName || ''} onChange={(e) => update('profile', 'botDisplayName', e.target.value)} />
                                                <button type="button" className="ui-btn" disabled={saving || !form.profile.botDisplayName?.trim()} onClick={() => handleUpdateBotName(form.profile.botDisplayName.trim())}>
                                                    Renommer
                                                </button>
                                            </div>
                                        </Field>
                                        <Field label="Nouvel avatar" hint="Lien d’image hébergée sur cdn.discordapp.com ou media.discordapp.net.">
                                            <div className="cf-inline">
                                                <TextInput type="url" placeholder="https://cdn.discordapp.com/…" value={form.profile.avatarUrl || ''} onChange={(e) => update('profile', 'avatarUrl', e.target.value)} />
                                                <button type="button" className="ui-btn" disabled={!form.profile.avatarUrl?.trim()} onClick={() => updateAvatar(form.profile.avatarUrl.trim())}>
                                                    Appliquer
                                                </button>
                                            </div>
                                        </Field>
                                        <div className="cf-actions">
                                            <button type="button" className="ui-btn ui-btn--ghost" disabled={downloadingAvatar || !form.profile.currentAvatarUrl} onClick={handleDownloadAvatar}>
                                                {downloadingAvatar ? 'Téléchargement…' : 'Télécharger l’avatar actuel'}
                                            </button>
                                            {form.profile.hasServerAvatar ? (
                                                <button type="button" className="ui-btn ui-btn--danger" onClick={() => updateAvatar('')}>
                                                    Revenir à l’avatar par défaut
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                                <div className="cf-sep" />
                                <Field label="Bio du bot" hint={`${(form.profile.bio || '').length}/190 · enregistrée avec les autres modifications`}>
                                    <TextInput maxLength={190} placeholder="Description affichée sur le profil du bot…" value={form.profile.bio || ''} onChange={(e) => update('profile', 'bio', e.target.value)} />
                                </Field>
                            </Card>

                            <Card title="Logs" desc="Un salon où Azim signale ses problèmes sur ce serveur.">
                                <div className="cf-grid-2 cf-align-end">
                                    <Field label="Salon des logs">
                                        <SelectInput value={form.logs.channelId} onChange={(e) => update('logs', 'channelId', e.target.value)} options={channelOptions} emptyLabel="Aucun salon" />
                                    </Field>
                                    <Switch checked={form.logs.restartAnnouncementEnabled} onChange={(v) => update('logs', 'restartAnnouncementEnabled', v)} label="Annoncer les redémarrages" />
                                </div>
                            </Card>
                        </>
                    ) : null}

                    {/* MODE ISLAM / CODE SECRET */}
                    {activeTab === 'islam' ? (
                        isIslamActive ? (
                            <>
                                <div className="cf-title cf-title--row">
                                    <div>
                                        <h2>Mode Islam</h2>
                                        <p>Rappels de prière, jours blancs, radio Coran et commandes dédiées.</p>
                                    </div>
                                    <button type="button" className="ui-btn ui-btn--danger" onClick={disableIslamMode} disabled={activatingIslam}>
                                        {activatingIslam ? 'Désactivation…' : 'Désactiver le mode'}
                                    </button>
                                </div>

                                <Card title="Prières" desc="Horaires des 5 prières et rappel à l’heure de chaque prière." aside={<Switch checked={form.islam.prayerNotificationEnabled} onChange={(v) => update('islam', 'prayerNotificationEnabled', v)} />}>
                                    <div className="cf-grid-2">
                                        <Field label="Ville">
                                            <TextInput value={form.islam.prayerCity} onChange={(e) => update('islam', 'prayerCity', e.target.value)} placeholder="Paris" />
                                        </Field>
                                        <Field label="Méthode de calcul">
                                            <SelectInput value={form.islam.prayerMethod} onChange={(e) => update('islam', 'prayerMethod', Number(e.target.value))} options={PRAYER_METHODS} />
                                        </Field>
                                        {form.islam.prayerNotificationEnabled ? (
                                            <>
                                                <Field label="Salon des rappels">
                                                    <SelectInput value={form.islam.prayerChannelId} onChange={(e) => update('islam', 'prayerChannelId', e.target.value)} options={channelOptions} emptyLabel="Choisir un salon" />
                                                </Field>
                                                <Field label="Rôle à mentionner">
                                                    <SelectInput value={form.islam.prayerRoleId} onChange={(e) => update('islam', 'prayerRoleId', e.target.value)} options={roleOptions} emptyLabel="Aucune mention" />
                                                </Field>
                                            </>
                                        ) : null}
                                    </div>
                                </Card>

                                <Card title="Jours blancs" desc="Rappel la veille des 13, 14 et 15 du mois hégirien, à 18 h." aside={<Switch checked={form.islam.whiteDaysNotificationEnabled} onChange={(v) => update('islam', 'whiteDaysNotificationEnabled', v)} />}>
                                    {form.islam.whiteDaysNotificationEnabled ? (
                                        <Field label="Salon du rappel">
                                            <SelectInput value={form.islam.whiteDaysChannelId} onChange={(e) => update('islam', 'whiteDaysChannelId', e.target.value)} options={channelOptions} emptyLabel="Choisir un salon" />
                                        </Field>
                                    ) : <p className="cf-empty">Rappel désactivé.</p>}
                                </Card>

                                <Card title="Radio Coran 24/7" desc="Diffusion continue dans un salon vocal avec /radio.">
                                    <div className="cf-grid-2 cf-align-end">
                                        <Field label="Récitateur par défaut">
                                            <SelectInput value={form.islam.radioDefaultReciter} onChange={(e) => update('islam', 'radioDefaultReciter', e.target.value)} options={ISLAMIC_RECITERS} />
                                        </Field>
                                        <Switch checked={form.islam.radioAutoReconnect} onChange={(v) => update('islam', 'radioAutoReconnect', v)} label="Reconnexion automatique" desc="Relance le flux après une coupure" />
                                    </div>
                                </Card>

                                <Card title="Commandes débloquées">
                                    <div className="cf-chips">
                                        {['priere', 'doua', 'hadith', 'hijri', 'qibla', 'asma', 'ramadan', 'radio', 'coran', 'quiz'].map((c) => (
                                            <span key={c} className="cf-chip cf-chip--green">/{c}</span>
                                        ))}
                                    </div>
                                </Card>
                            </>
                        ) : (
                            <>
                                <div className="cf-title">
                                    <h2>Code secret</h2>
                                    <p>Entrez un code d’activation pour débloquer des modules supplémentaires sur ce serveur.</p>
                                </div>
                                <Card>
                                    <div className="cf-inline">
                                        <TextInput value={islamCode} onChange={(e) => setIslamCode(e.target.value)} placeholder="Code secret" autoComplete="off" maxLength={64} />
                                        <button type="button" onClick={activateSecretCode} disabled={activatingIslam || !islamCode.trim()} className="ui-btn ui-btn--primary">
                                            {activatingIslam ? 'Vérification…' : 'Valider'}
                                        </button>
                                    </div>
                                </Card>
                            </>
                        )
                    ) : null}

                    {/* Barre d'enregistrement : visible seulement s'il y a des changements */}
                    <div className={`gc-savebar${isDirty ? ' is-visible' : ''}`} aria-hidden={!isDirty}>
                        <span><i /> Modifications non enregistrées</span>
                        <div className="cf-actions">
                            <button type="button" className="ui-btn ui-btn--ghost" onClick={discardChanges} disabled={saving} tabIndex={isDirty ? 0 : -1}>Annuler</button>
                            <button type="submit" disabled={saving} className="ui-btn ui-btn--primary" tabIndex={isDirty ? 0 : -1}>
                                {saving ? 'Enregistrement…' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default GuildConfig;
