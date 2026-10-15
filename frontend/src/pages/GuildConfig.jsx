import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminService } from '../services/api.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon.jsx';
import { useConfirm } from '../hooks/useConfirm.jsx';

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
    youtube: { channels: [], profiles: [], targetChannelId: '' },
    tiktok: { enabled: false, username: '', accounts: [], profiles: [], targetChannelId: '' },
    rank: { enabled: false, announceChannelId: '', silent: false, rewards: [] },
    features: { islamModeEnabled: false },
    // Langue du bot (commandes et réponses), modération et vitrine : mêmes réglages que /langue, /mod et /vitrine
    language: 'fr',
    moderation: { logChannelId: '', dmOnSanction: true },
    showcase: { enabled: false, url: null, channelId: '', hidden: false },
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
        language: data?.language === 'en' ? 'en' : 'fr',
        moderation: { ...EMPTY_CONFIG.moderation, ...data?.moderation, logChannelId: data?.moderation?.logChannelId || '' },
        showcase: { ...EMPTY_CONFIG.showcase, ...data?.showcase, channelId: data?.showcase?.channelId || '' },
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

// Chaînes YouTube / comptes TikTok suivis : photo, nom, @pseudo, lien, suppression et ajout
const SOCIAL_PAGE_SIZE = 10;

function SocialAccounts({ items, profiles, onChange, platform, placeholder, t }) {
    const [draft, setDraft] = useState('');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(0);
    const byId = Object.fromEntries((profiles || []).map((profile) => [profile.id, profile]));
    // Recherche sur le nom, le @pseudo ou l'identifiant ; 10 chaînes par page
    const needle = query.trim().toLowerCase();
    const matches = needle
        ? items.filter((id) => [id, byId[id]?.name, byId[id]?.handle].some((text) => String(text || '').toLowerCase().includes(needle)))
        : items;
    const pageCount = Math.max(1, Math.ceil(matches.length / SOCIAL_PAGE_SIZE));
    const currentPage = Math.min(page, pageCount - 1);
    const visible = matches.slice(currentPage * SOCIAL_PAGE_SIZE, (currentPage + 1) * SOCIAL_PAGE_SIZE);
    const showTools = items.length > SOCIAL_PAGE_SIZE;
    const add = () => {
        const value = draft.trim();
        if (!value || items.includes(value)) return;
        onChange([...items, value]);
        setDraft('');
    };
    return (
        <div className="cf-social">
            {showTools ? (
                <label className="ui-search cf-social__search">
                    <Icon name="search" size={16} />
                    <input
                        type="search"
                        value={query}
                        placeholder={t('config.social_search', { count: items.length })}
                        onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                    />
                </label>
            ) : null}
            {items.length && !matches.length ? <p className="cf-empty">{t('config.social_no_match')}</p> : null}
            {matches.length ? (
                <ul className="cf-social__list">
                    {visible.map((id) => {
                        const profile = byId[id];
                        return (
                            <li key={id} className="cf-social__item">
                                {profile?.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt="" referrerPolicy="no-referrer" loading="lazy" />
                                ) : (
                                    <span className="cf-social__avatar"><Icon name={platform === 'youtube' ? 'play' : 'music'} size={18} /></span>
                                )}
                                <div className="cf-social__text">
                                    <strong>{profile?.name || profile?.handle || id}</strong>
                                    <small>{profile ? (profile.handle || id) : t('config.social_pending')}</small>
                                </div>
                                {profile?.url ? (
                                    <a href={profile.url} target="_blank" rel="noreferrer" className="ui-icon-btn" aria-label={t('config.social_open', { name: profile.name || profile.handle || id })}>
                                        <Icon name="external" size={15} />
                                    </a>
                                ) : null}
                                <button type="button" className="ui-icon-btn cf-danger" aria-label={t('config.social_remove')} onClick={() => onChange(items.filter((item) => item !== id))}>
                                    <Icon name="close" size={15} />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            ) : null}
            {!items.length ? <p className="cf-empty">{t('config.social_empty')}</p> : null}
            {pageCount > 1 ? (
                <div className="cf-pager">
                    <button type="button" className="ui-icon-btn" aria-label={t('config.page_prev')} disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
                        <Icon name="chevronLeft" size={16} />
                    </button>
                    <span>{t('config.page_range', { from: currentPage * SOCIAL_PAGE_SIZE + 1, to: Math.min((currentPage + 1) * SOCIAL_PAGE_SIZE, matches.length), total: matches.length })}</span>
                    <button type="button" className="ui-icon-btn" aria-label={t('config.page_next')} disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)}>
                        <Icon name="chevronRight" size={16} />
                    </button>
                </div>
            ) : null}
            <div className="cf-social__add">
                <input
                    className="ui-input"
                    value={draft}
                    placeholder={placeholder}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                />
                <button type="button" className="ui-btn" onClick={add} disabled={!draft.trim()}>
                    <Icon name="plus" size={16} /> {t('config.social_add')}
                </button>
            </div>
        </div>
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
            <button type="button" onClick={onRemove} aria-label={name}><Icon name="close" size={12} /></button>
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
        // Onglet Serveur & modération : sans eux, la barre « Enregistrer » n'apparaissait pas
        language: form.language,
        moderation: form.moderation,
        showcase: { enabled: form.showcase.enabled, channelId: form.showcase.channelId || '', hidden: Boolean(form.showcase.hidden) },
    });
}

function GuildConfig() {
    const { guildId } = useParams();
    const { setIsIslamUnlocked } = useTheme();
    const { t, i18n } = useTranslation();
    const locale = i18n.resolvedLanguage || i18n.language || 'fr';
    const [confirm, confirmDialog] = useConfirm();
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
            setNotice(t('config.n_avatar_downloaded'));
        } catch {
            if (form.profile.currentAvatarUrl) {
                window.open(form.profile.currentAvatarUrl, '_blank');
                setNotice(t('config.n_avatar_opened'));
            } else {
                setError(t('config.e_avatar_download'));
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
                if (active) setError(apiError.hint || apiError.message || t('config.e_load'));
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
                    systemPrompt: form.ai.systemPrompt || '',
                    language: form.ai.language || '',
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
                profile: { bio: form.profile.bio || '' },
                youtube: form.youtube,
                tiktok: form.tiktok,
                rank: form.rank,
                islam: form.islam,
                commands: commandsPayload,
                language: form.language,
                moderation: { logChannelId: form.moderation.logChannelId || null, dmOnSanction: form.moderation.dmOnSanction },
                showcase: { enabled: form.showcase.enabled, channelId: form.showcase.channelId || null, hidden: Boolean(form.showcase.hidden) },
            });
            await refresh();
            setNotice(t('config.n_saved'));
        } catch (apiError) {
            setError(apiError.hint || apiError.message || t('config.e_save'));
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
                setNotice(t('config.n_code_islam'));
            } else {
                setNotice(t('config.n_code_ok'));
            }
        } catch (apiError) {
            setError(apiError.message || t('config.e_code'));
        } finally {
            setActivatingIslam(false);
        }
    };

    const disableIslamMode = async () => {
        const ok = await confirm({
            title: t('config.disable_confirm'),
            message: t('config.disable_message'),
            confirmLabel: t('config.disable_islam'),
            danger: true,
        });
        if (!ok) return;
        setActivatingIslam(true);
        setError('');
        setNotice('');
        // Mise à jour optimiste immédiate : l'interface bascule instantanément
        update('features', 'islamModeEnabled', false);
        setIsIslamUnlocked(false);
        try {
            await adminService.activateIslamMode(guildId, { action: 'disable' });
            setNotice(t('config.n_disabled'));
        } catch (apiError) {
            // Rétablissement en cas d'échec
            update('features', 'islamModeEnabled', true);
            setIsIslamUnlocked(true);
            setError(apiError.message || t('config.e_disable'));
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
            setNotice(t('config.n_keys'));
        } catch (apiError) {
            setError(apiError.message || t('config.e_keys'));
        }
    };

    const updateAvatar = async (avatarUrl) => {
        setError('');
        setNotice('');
        try {
            await adminService.updateGuildConfig(guildId, { profile: { avatarUrl } });
            update('profile', 'avatarUrl', '');
            await refresh();
            setNotice(avatarUrl ? t('config.n_avatar_set') : t('config.n_avatar_reset'));
        } catch (apiError) {
            setError(apiError.message || t('config.e_avatar'));
        }
    };

    const handleUpdateBotName = async (newName) => {
        setError('');
        setNotice('');
        try {
            await adminService.updateGuildConfig(guildId, { profile: { botDisplayName: newName } });
            await refresh();
            setNotice(t('config.n_renamed', { name: newName }));
        } catch (apiError) {
            setError(apiError.message || t('config.e_rename'));
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
            <div className="gc">
                <LoadingScreen
                    label={t('config.loading')}
                    subtext={getGuildName(guildId)}
                />
            </div>
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
        { id: 'overview', label: t('config.tab_overview'), icon: 'activity' },
        { id: 'ai', label: t('config.tab_ai'), icon: 'sparkles' },
        { id: 'commands', label: t('config.tab_commands'), icon: 'terminal', count: visibleCommands.length },
        { id: 'welcome', label: t('config.tab_welcome'), icon: 'hand', on: form.welcome.enabled },
        { id: 'levels', label: t('config.tab_levels'), icon: 'activity', on: form.rank.enabled },
        { id: 'social', label: t('config.tab_social'), icon: 'megaphone', on: (form.youtube.channels || []).length > 0 || form.tiktok.enabled },
        { id: 'server', label: t('config.tab_server'), icon: 'shield' },
        { id: 'profile', label: t('config.tab_profile'), icon: 'fileText' },
        { id: 'islam', label: isIslamActive ? t('config.tab_islam') : t('config.tab_code'), icon: isIslamActive ? 'moon' : 'key', on: isIslamActive ? true : undefined },
    ];

    // Cartes de modules de la vue d'ensemble : état + accès direct à l'onglet
    const modules = [
        { tab: 'ai', title: t('config.mod_ai'), icon: 'sparkles', color: 'var(--azim-accent)', state: form.ai.keysCount > 0 ? 'on' : 'todo', detail: form.ai.keysCount > 0 ? t('config.mod_ai_keys', { count: form.ai.keysCount }) : t('config.mod_ai_none') },
        { tab: 'welcome', title: t('config.mod_welcome'), icon: 'hand', color: 'var(--azim-accent)', state: form.welcome.enabled ? (form.welcome.channelId ? 'on' : 'todo') : 'off', detail: form.welcome.enabled ? (channelName(form.welcome.channelId) ? `#${channelName(form.welcome.channelId)}` : t('config.mod_choose_channel')) : t('config.disabled') },
        { tab: 'levels', title: t('config.mod_levels'), icon: 'activity', color: 'var(--azim-warm)', state: form.rank.enabled ? 'on' : 'off', detail: form.rank.enabled ? t('config.mod_rewards', { count: form.rank.rewards.length }) : t('config.disabled') },
        { tab: 'social', title: t('config.mod_youtube'), icon: 'megaphone', color: 'var(--azim-coral)', state: (form.youtube.channels || []).length ? (form.youtube.targetChannelId ? 'on' : 'todo') : 'off', detail: (form.youtube.channels || []).length ? t('config.mod_channels', { count: form.youtube.channels.length }) : t('config.mod_no_channel') },
        { tab: 'social', title: t('config.mod_tiktok'), icon: 'megaphone', color: 'var(--azim-coral)', state: form.tiktok.enabled ? (form.tiktok.username ? 'on' : 'todo') : 'off', detail: form.tiktok.enabled ? (form.tiktok.username || t('config.mod_add_handle')) : t('config.disabled') },
        { tab: 'profile', title: t('config.mod_logs'), icon: 'fileText', color: 'var(--azim-success)', state: form.logs.channelId ? 'on' : 'off', detail: form.logs.channelId ? `#${channelName(form.logs.channelId) || t('config.mod_channel_fallback')}` : t('config.mod_no_logs') },
    ];
    const STATE_LABEL = { on: t('config.active'), off: t('config.inactive'), todo: t('config.todo') };

    const addWelcomeRule = () => update('welcome', 'rules', [
        ...form.welcome.rules,
        { condition: 'has_role', matchType: 'all', roleIds: [], channelId: '', message: '', dmMessage: '' },
    ]);

    return (
        <div className="gc">
            <header className="gc-head">
                <Link to="/dashboard" className="gc-back"><Icon name="arrowLeft" size={16} /> {t('config.back')}</Link>
                <div className="gc-head__id">
                    {currentGuildIcon ? (
                        <img src={currentGuildIcon} alt="" className="gc-head__icon" />
                    ) : (
                        <span className="gc-head__icon gc-head__icon--fallback">{getGuildName(guildId).slice(0, 2).toUpperCase()}</span>
                    )}
                    <div>
                        <h1>{getGuildName(guildId)}</h1>
                        <p>{t('config.subtitle')}</p>
                    </div>
                </div>
            </header>

            {error ? <div role="alert" className="ui-flash ui-flash--error"><Icon name="alert" size={18} /> {error}</div> : null}
            {notice ? <div role="status" className="ui-flash ui-flash--ok"><Icon name="check" size={18} /> {notice}</div> : null}

            <div className="gc-layout" ref={contentRef}>
                <nav className="gc-nav" aria-label={t('config.sections')}>
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
                            {typeof tab.on === 'boolean' ? <span className={`gc-nav__dot${tab.on ? ' is-on' : ''}`} title={tab.on ? t('config.active') : t('config.inactive')} /> : null}
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
                                <Card title={t('config.usage')} desc={t('config.usage_desc', { count: totalRuns })}>
                                    {commandUsage.length ? (
                                        <ol className="pnl-bars">
                                            {commandUsage.slice(0, 6).map((c) => (
                                                <li key={c.name}>
                                                    <code>/{c.name}</code>
                                                    <span className="pnl-bars__track"><i style={{ width: `${Math.max(4, (c.count / maxRuns) * 100)}%` }} /></span>
                                                    <strong>{c.count}</strong>
                                                </li>
                                            ))}
                                        </ol>
                                    ) : <p className="cf-empty">{t('config.usage_empty')}</p>}
                                </Card>
                                <Card title={t('config.errors')} desc={t('config.errors_desc')}>
                                    {recentErrors.length ? (
                                        <ul className="pnl-errors">
                                            {recentErrors.slice(0, 5).map((err, idx) => (
                                                <li key={idx}>
                                                    <span className="pnl-errors__icon"><Icon name="alert" size={15} /></span>
                                                    <div><strong>{err.type || t('config.error_default')}</strong><small>{String(err.message || '').slice(0, 90)}</small></div>
                                                    <time>{err.ts ? new Date(err.ts).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : ''}</time>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className="cf-empty cf-empty--ok"><Icon name="check" size={16} /> {t('config.errors_empty')}</p>}
                                </Card>
                            </div>
                        </>
                    ) : null}

                    {/* INTELLIGENCE ARTIFICIELLE */}
                    {activeTab === 'ai' ? (
                        <>
                            <div className="cf-title">
                                <h2>{t('config.ai_title')}</h2>
                                <p>{t('config.ai_lead')}</p>
                            </div>

                            <Card title={t('config.triggers')} desc={t('config.triggers_desc')}>
                                <div className="cf-chips">
                                    {form.ai.triggerNames.map((trig) => (
                                        <span key={trig} className="cf-chip cf-chip--accent">
                                            {trig}
                                            {form.ai.triggerNames.length > 1 ? (
                                                <button type="button" onClick={() => removeTriggerName(trig)} aria-label={t('config.remove_x', { name: trig })}><Icon name="close" size={12} /></button>
                                            ) : null}
                                        </span>
                                    ))}
                                </div>
                                <div className="cf-inline">
                                    <TextInput
                                        placeholder={t('config.trigger_ph')}
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

                            <Card title={t('config.personality')}>
                                <div className="cf-stack">
                                    <Field label={t('config.ai_language')} hint={t('config.ai_language_hint')}>
                                        <TextInput
                                            maxLength={50}
                                            placeholder="Français, English, العربية…"
                                            value={form.ai.language || ''}
                                            onChange={(e) => update('ai', 'language', e.target.value)}
                                        />
                                    </Field>
                                    <Field label={t('config.ai_prompt')} hint={t('config.ai_prompt_count', { count: (form.ai.systemPrompt || '').length })}>
                                        <textarea
                                            className="ui-input"
                                            rows={6}
                                            maxLength={6000}
                                            placeholder={t('config.ai_prompt_ph')}
                                            value={form.ai.systemPrompt || ''}
                                            onChange={(e) => update('ai', 'systemPrompt', e.target.value)}
                                        />
                                    </Field>
                                </div>
                            </Card>

                            <Card
                                title={t('config.keys')}
                                desc={t('config.keys_desc')}
                            >
                                {form.ai.keysPreviews.length ? (
                                    <ul className="cf-keys">
                                        {/* Clés enregistrées chiffrées : le panel ne reçoit qu'un aperçu masqué */}
                                        {form.ai.keysPreviews.map((key) => (
                                            <li key={key.index}>
                                                <span className="cf-keys__n">#{key.index}</span>
                                                <code>{key.masked}</code>
                                                <button
                                                    type="button"
                                                    className="ui-icon-btn cf-danger"
                                                    onClick={() => manageKey({ removeKeyIndex: key.index })}
                                                    title={t('config.delete')}
                                                    aria-label={t('config.delete')}
                                                >
                                                    <Icon name="close" size={15} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="cf-empty">{t('config.keys_empty')}</p>}

                                <div className="cf-stack cf-keys__add">
                                    <Field
                                        label={t('config.add_keys')}
                                        hint={detectedGroqKeys.length ? t('config.keys_detected', { count: detectedGroqKeys.length }) : t('config.keys_hint')}
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
                                            <Icon name="plus" size={16} /> {detectedGroqKeys.length > 1 ? t('config.add_n_keys', { count: detectedGroqKeys.length }) : t('config.add_key')}
                                        </button>
                                        {detectedGroqKeys.length && form.ai.keysPreviews.length ? (
                                            <button
                                                type="button"
                                                className="ui-btn ui-btn--ghost"
                                                onClick={async () => {
                                                    const ok = await confirm({
                                                        title: t('config.replace_confirm', { count: detectedGroqKeys.length }),
                                                        message: t('config.replace_message'),
                                                        confirmLabel: t('config.replace_keys'),
                                                        danger: true,
                                                    });
                                                    if (ok) manageKey({ setKeys: detectedGroqKeys });
                                                }}
                                            >
                                                {t('config.replace_keys')}
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
                                    <h2>{t('config.commands_title')}</h2>
                                    <p>{t('config.commands_lead')}</p>
                                </div>
                                <label className="ui-search">
                                    <Icon name="search" size={16} />
                                    <input
                                        type="search"
                                        placeholder={t('common.search')}
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
                                                    {cmd.isIslamic ? <span className="cf-tag cf-tag--green">{t('config.islam_tag')}</span> : null}
                                                </div>
                                                <p>{cmd.description || t('config.no_description')}</p>
                                            </div>
                                            <Switch checked={isEnabled} onChange={(v) => updateCommand(cmd.name, 'enabled', v)} />

                                            {isEnabled ? (
                                                <div className="cf-command__access">
                                                    <div className="ui-seg cf-seg-sm" role="radiogroup" aria-label={t('config.access_label', { name: cmd.name })}>
                                                        <button type="button" className={!cmd.adminOnly ? 'is-active' : ''} onClick={() => updateCommand(cmd.name, 'adminOnly', false)}>
                                                            {cmd.defaultLevel === 'admin' ? t('config.by_default') : t('config.everyone')}
                                                        </button>
                                                        <button type="button" className={cmd.adminOnly ? 'is-active' : ''} onClick={() => updateCommand(cmd.name, 'adminOnly', true)}>
                                                            {t('config.admins_only')}
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
                                                            emptyLabel={t('config.allow_role')}
                                                            className="cf-select--chip"
                                                        />
                                                    </div>
                                                </div>
                                            ) : null}
                                        </article>
                                    );
                                })}
                                {filteredCommands.length === 0 ? <p className="cf-empty">{t('config.no_match', { q: commandSearch })}</p> : null}
                            </div>
                        </>
                    ) : null}

                    {/* BIENVENUE */}
                    {activeTab === 'welcome' ? (
                        <>
                            <div className="cf-title cf-title--row">
                                <div>
                                    <h2>{t('config.welcome_title')}</h2>
                                    <p>{t('config.welcome_lead')}</p>
                                </div>
                                <Switch checked={form.welcome.enabled} onChange={(v) => update('welcome', 'enabled', v)} label={form.welcome.enabled ? t('config.enabled') : t('config.disabled')} />
                            </div>

                            <div className={form.welcome.enabled ? '' : 'cf-disabled'}>
                                <Card title={t('config.sending')}>
                                    <div className="cf-grid-3">
                                        <Field label={t('config.channel')}>
                                            <SelectInput value={form.welcome.channelId} onChange={(e) => update('welcome', 'channelId', e.target.value)} options={channelOptions} emptyLabel={t('config.choose_channel')} />
                                        </Field>
                                        <Field label={t('config.where')}>
                                            <SelectInput
                                                value={form.welcome.destination}
                                                onChange={(e) => update('welcome', 'destination', e.target.value)}
                                                options={[
                                                    { value: 'both', label: t('config.dest_both') },
                                                    { value: 'channel', label: t('config.dest_channel') },
                                                    { value: 'dm', label: t('config.dest_dm') },
                                                ]}
                                            />
                                        </Field>
                                        <Field label={t('config.when')}>
                                            <SelectInput
                                                value={form.welcome.trigger}
                                                onChange={(e) => update('welcome', 'trigger', e.target.value)}
                                                options={[
                                                    { value: 'arrivee', label: t('config.on_join') },
                                                    { value: 'role', label: t('config.on_role') },
                                                ]}
                                            />
                                        </Field>
                                    </div>
                                </Card>

                                <Card title={t('config.messages')} desc={t('config.variables')}>
                                    <div className="cf-grid-2">
                                        <Field label={t('config.in_channel')}>
                                            <textarea className="ui-input" rows={4} maxLength={2000} value={form.welcome.defaultMessage || ''} onChange={(e) => update('welcome', 'defaultMessage', e.target.value)} />
                                        </Field>
                                        <Field label={t('config.in_dm')}>
                                            <textarea className="ui-input" rows={4} maxLength={2000} value={form.welcome.defaultDmMessage || ''} onChange={(e) => update('welcome', 'defaultDmMessage', e.target.value)} />
                                        </Field>
                                    </div>
                                </Card>

                                <Card
                                    title={t('config.rules')}
                                    desc={t('config.rules_desc')}
                                    aside={<button type="button" className="ui-btn" onClick={addWelcomeRule}><Icon name="plus" size={16} /> {t('config.add_rule')}</button>}
                                >
                                    {form.welcome.rules.length === 0 ? <p className="cf-empty">{t('config.rules_empty')}</p> : null}
                                    <div className="cf-rules">
                                        {form.welcome.rules.map((rule, index) => {
                                            const selectedRoleIds = rule.roleIds || (rule.roleId ? [rule.roleId] : []);
                                            return (
                                                <div key={index} className="cf-rule">
                                                    <div className="cf-rule__head">
                                                        <span>{t('config.rule_n', { n: index + 1 })}</span>
                                                        <button type="button" className="ui-icon-btn cf-danger" title={t('config.delete_rule')} onClick={() => update('welcome', 'rules', form.welcome.rules.filter((_, i) => i !== index))}>
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
                                                                { value: 'has_role_all', label: t('config.cond_all') },
                                                                { value: 'has_role_any', label: t('config.cond_any') },
                                                                { value: 'lacks_role_all', label: t('config.cond_none') },
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
                                                                emptyLabel={t('config.add_role')}
                                                                className="cf-select--chip"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="cf-grid-2">
                                                        <Field label={t('config.rule_message')}>
                                                            <TextInput placeholder={t('config.rule_message_ph')} value={rule.message || ''} onChange={(e) => updateRuleField(index, 'message', e.target.value)} />
                                                        </Field>
                                                        <Field label={t('config.rule_dm')}>
                                                            <TextInput placeholder={t('config.rule_dm_ph')} value={rule.dmMessage || ''} onChange={(e) => updateRuleField(index, 'dmMessage', e.target.value)} />
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
                                    <h2>{t('config.levels_title')}</h2>
                                    <p>{t('config.levels_lead')}</p>
                                </div>
                                <Switch checked={form.rank.enabled} onChange={(v) => update('rank', 'enabled', v)} label={form.rank.enabled ? t('config.enabled') : t('config.disabled')} />
                            </div>

                            <div className={form.rank.enabled ? '' : 'cf-disabled'}>
                                <Card title={t('config.announces')}>
                                    <div className="cf-grid-2 cf-align-end">
                                        <Field label={t('config.announce_channel')}>
                                            <SelectInput value={form.rank.announceChannelId} onChange={(e) => update('rank', 'announceChannelId', e.target.value)} options={channelOptions} emptyLabel={t('config.where_member_writes')} />
                                        </Field>
                                        <Switch checked={form.rank.silent} onChange={(v) => update('rank', 'silent', v)} label={t('config.silent')} desc={t('config.silent_desc')} />
                                    </div>
                                </Card>

                                <Card
                                    title={t('config.rewards')}
                                    desc={t('config.rewards_desc')}
                                    aside={<button type="button" className="ui-btn" onClick={() => update('rank', 'rewards', [...form.rank.rewards, { level: 1, roleId: '' }])}><Icon name="plus" size={16} /> {t('config.add_reward')}</button>}
                                >
                                    {form.rank.rewards.length === 0 ? <p className="cf-empty">{t('config.rewards_empty')}</p> : null}
                                    <div className="cf-rewards">
                                        {form.rank.rewards.map((reward, index) => (
                                            <div key={index} className="cf-reward">
                                                <label className="cf-reward__lvl">
                                                    <span>{t('config.level')}</span>
                                                    <input type="number" min="1" max="200" value={reward.level} onChange={(e) => updateReward(index, 'level', Number(e.target.value))} />
                                                </label>
                                                <Icon name="arrowRight" size={16} />
                                                <SelectInput value={reward.roleId} onChange={(e) => updateReward(index, 'roleId', e.target.value)} options={roleOptions} emptyLabel={t('config.choose_role')} />
                                                <button type="button" className="ui-icon-btn cf-danger" title={t('config.remove_reward')} onClick={() => update('rank', 'rewards', form.rank.rewards.filter((_, i) => i !== index))}>
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
                                <h2>{t('config.social_title')}</h2>
                                <p>{t('config.social_lead')}</p>
                            </div>

                            <div className="cf-grid-2">
                                <Card title="YouTube" desc={t('config.yt_desc')}>
                                    <div className="cf-stack">
                                        <div className="ui-field">
                                            <span className="ui-field__label">{t('config.yt_channels')}</span>
                                            <SocialAccounts
                                                t={t}
                                                platform="youtube"
                                                items={form.youtube.channels || []}
                                                profiles={form.youtube.profiles}
                                                placeholder={t('config.yt_add_ph')}
                                                onChange={(channels) => update('youtube', 'channels', channels)}
                                            />
                                            <span className="cf-hint">{t('config.yt_channels_hint')}</span>
                                        </div>
                                        <Field label={t('config.alerts_channel')}>
                                            <SelectInput value={form.youtube.targetChannelId} onChange={(e) => update('youtube', 'targetChannelId', e.target.value)} options={channelOptions} emptyLabel={t('config.choose_channel')} />
                                        </Field>
                                    </div>
                                </Card>

                                <Card title="TikTok Live" desc={t('config.tiktok_desc')} aside={<Switch checked={form.tiktok.enabled} onChange={(v) => update('tiktok', 'enabled', v)} />}>
                                    <div className={`cf-stack${form.tiktok.enabled ? '' : ' cf-disabled'}`}>
                                        <div className="ui-field">
                                            <span className="ui-field__label">{t('config.tiktok_accounts')}</span>
                                            <SocialAccounts
                                                t={t}
                                                platform="tiktok"
                                                items={form.tiktok.accounts?.length ? form.tiktok.accounts : (form.tiktok.username ? [form.tiktok.username] : [])}
                                                profiles={form.tiktok.profiles}
                                                placeholder="@pseudo"
                                                onChange={(accounts) => setForm((prev) => ({ ...prev, tiktok: { ...prev.tiktok, accounts, username: accounts[0] || '' } }))}
                                            />
                                        </div>
                                        <Field label={t('config.alerts_channel')}>
                                            <SelectInput value={form.tiktok.targetChannelId} onChange={(e) => update('tiktok', 'targetChannelId', e.target.value)} options={channelOptions} emptyLabel={t('config.choose_channel')} />
                                        </Field>
                                    </div>
                                </Card>
                            </div>
                        </>
                    ) : null}

                    {/* PROFIL & LOGS */}
                    {activeTab === 'server' ? (
                        <>
                            <div className="cf-title">
                                <h2>{t('config.server_title')}</h2>
                                <p>{t('config.server_lead')}</p>
                            </div>

                            <Card title={t('config.language_title')} desc={t('config.language_desc')}>
                                <div className="cf-grid-2">
                                    <Field label={t('config.language_label')} hint={t('config.language_hint')}>
                                        <SelectInput
                                            value={form.language}
                                            onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
                                            options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]}
                                        />
                                    </Field>
                                </div>
                            </Card>

                            <Card title={t('config.moderation_title')} desc={t('config.moderation_desc')}>
                                <div className="cf-grid-2 cf-align-end">
                                    <Field label={t('config.moderation_channel')} hint={t('config.moderation_channel_hint')}>
                                        <SelectInput value={form.moderation.logChannelId} onChange={(e) => update('moderation', 'logChannelId', e.target.value)} options={channelOptions} emptyLabel={t('config.moderation_channel_default')} />
                                    </Field>
                                    <Switch checked={form.moderation.dmOnSanction} onChange={(v) => update('moderation', 'dmOnSanction', v)} label={t('config.moderation_dm')} desc={t('config.moderation_dm_desc')} />
                                </div>
                            </Card>

                            <Card
                                title={t('config.showcase_title')}
                                desc={t('config.showcase_desc')}
                                aside={<Switch checked={form.showcase.enabled} onChange={(v) => { update('showcase', 'enabled', v); if (v) update('showcase', 'hidden', false); }} label={form.showcase.enabled ? t('config.enabled') : t('config.disabled')} />}
                            >
                                <div className={`cf-grid-2 cf-align-end${form.showcase.enabled ? '' : ' cf-disabled'}`}>
                                    <Field label={t('config.showcase_channel')} hint={t('config.showcase_channel_hint')}>
                                        <SelectInput value={form.showcase.channelId} onChange={(e) => update('showcase', 'channelId', e.target.value)} options={channelOptions} emptyLabel={t('config.choose_channel')} />
                                    </Field>
                                    {form.showcase.url ? (
                                        <p className="cf-hint">{t('config.showcase_current')} <a href={form.showcase.url} target="_blank" rel="noreferrer">{form.showcase.url}</a></p>
                                    ) : null}
                                </div>
                            </Card>

                            <Card
                                title={t('config.anonymous_title')}
                                desc={t('config.anonymous_desc')}
                                aside={<Switch checked={Boolean(form.showcase.hidden)} onChange={(v) => { update('showcase', 'hidden', v); if (v) update('showcase', 'enabled', false); }} label={form.showcase.hidden ? t('config.enabled') : t('config.disabled')} />}
                            />
                        </>
                    ) : null}

                    {activeTab === 'profile' ? (
                        <>
                            <div className="cf-title">
                                <h2>{t('config.profile_title')}</h2>
                                <p>{t('config.profile_lead')}</p>
                            </div>

                            <Card title={t('config.bot_profile')} desc={t('config.bot_profile_desc')}>
                                <div className="cf-profile">
                                    <div className="cf-profile__avatar">
                                        <img
                                            src={form.profile.hasServerAvatar && form.profile.currentAvatarUrl
                                                ? form.profile.currentAvatarUrl
                                                : (isIslamActive ? '/icon-islam.webp' : (form.profile.globalAvatarUrl || '/icon.webp'))}
                                            alt=""
                                        />
                                        <span>{form.profile.hasServerAvatar ? t('config.server_avatar') : t('config.default_avatar')}</span>
                                    </div>
                                    <div className="cf-stack cf-profile__fields">
                                        <Field label={t('config.bot_name')}>
                                            <div className="cf-inline">
                                                <TextInput maxLength={32} placeholder="Azim" value={form.profile.botDisplayName || ''} onChange={(e) => update('profile', 'botDisplayName', e.target.value)} />
                                                <button type="button" className="ui-btn" disabled={saving || !form.profile.botDisplayName?.trim()} onClick={() => handleUpdateBotName(form.profile.botDisplayName.trim())}>
                                                    {t('config.rename')}
                                                </button>
                                            </div>
                                        </Field>
                                        <Field label={t('config.new_avatar')} hint={t('config.new_avatar_hint')}>
                                            <div className="cf-inline">
                                                <TextInput type="url" placeholder="https://cdn.discordapp.com/…" value={form.profile.avatarUrl || ''} onChange={(e) => update('profile', 'avatarUrl', e.target.value)} />
                                                <button type="button" className="ui-btn" disabled={!form.profile.avatarUrl?.trim()} onClick={() => updateAvatar(form.profile.avatarUrl.trim())}>
                                                    {t('config.apply')}
                                                </button>
                                            </div>
                                        </Field>
                                        <div className="cf-actions">
                                            <button type="button" className="ui-btn ui-btn--ghost" disabled={downloadingAvatar || !form.profile.currentAvatarUrl} onClick={handleDownloadAvatar}>
                                                {downloadingAvatar ? t('config.downloading') : t('config.download_avatar')}
                                            </button>
                                            {form.profile.hasServerAvatar ? (
                                                <button type="button" className="ui-btn ui-btn--danger" onClick={() => updateAvatar('')}>
                                                    {t('config.reset_avatar')}
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                                <div className="cf-sep" />
                                <Field label={t('config.bio')} hint={t('config.bio_hint', { count: (form.profile.bio || '').length })}>
                                    <TextInput maxLength={190} placeholder={t('config.bio_ph')} value={form.profile.bio || ''} onChange={(e) => update('profile', 'bio', e.target.value)} />
                                </Field>
                            </Card>

                            <Card title={t('config.logs')} desc={t('config.logs_desc')}>
                                <div className="cf-grid-2 cf-align-end">
                                    <Field label={t('config.logs_channel')}>
                                        <SelectInput value={form.logs.channelId} onChange={(e) => update('logs', 'channelId', e.target.value)} options={channelOptions} emptyLabel={t('config.no_channel')} />
                                    </Field>
                                    <Switch checked={form.logs.restartAnnouncementEnabled} onChange={(v) => update('logs', 'restartAnnouncementEnabled', v)} label={t('config.restart_announce')} />
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
                                        <h2>{t('config.islam_title')}</h2>
                                        <p>{t('config.islam_lead')}</p>
                                    </div>
                                    <button type="button" className="ui-btn ui-btn--danger" onClick={disableIslamMode} disabled={activatingIslam}>
                                        {activatingIslam ? t('config.disabling') : t('config.disable_mode')}
                                    </button>
                                </div>

                                <Card title={t('config.prayers')} desc={t('config.prayers_desc')} aside={<Switch checked={form.islam.prayerNotificationEnabled} onChange={(v) => update('islam', 'prayerNotificationEnabled', v)} />}>
                                    <div className="cf-grid-2">
                                        <Field label={t('config.city')}>
                                            <TextInput value={form.islam.prayerCity} onChange={(e) => update('islam', 'prayerCity', e.target.value)} placeholder="Paris" />
                                        </Field>
                                        <Field label={t('config.method')}>
                                            <SelectInput value={form.islam.prayerMethod} onChange={(e) => update('islam', 'prayerMethod', Number(e.target.value))} options={PRAYER_METHODS.map((m) => ({ ...m, label: t(`config.method_${m.value}`, { defaultValue: m.label }) }))} />
                                        </Field>
                                        {form.islam.prayerNotificationEnabled ? (
                                            <>
                                                <Field label={t('config.reminder_channel')}>
                                                    <SelectInput value={form.islam.prayerChannelId} onChange={(e) => update('islam', 'prayerChannelId', e.target.value)} options={channelOptions} emptyLabel={t('config.choose_channel')} />
                                                </Field>
                                                <Field label={t('config.mention_role')}>
                                                    <SelectInput value={form.islam.prayerRoleId} onChange={(e) => update('islam', 'prayerRoleId', e.target.value)} options={roleOptions} emptyLabel={t('config.no_mention')} />
                                                </Field>
                                            </>
                                        ) : null}
                                    </div>
                                </Card>

                                <Card title={t('config.white_days')} desc={t('config.white_days_desc')} aside={<Switch checked={form.islam.whiteDaysNotificationEnabled} onChange={(v) => update('islam', 'whiteDaysNotificationEnabled', v)} />}>
                                    {form.islam.whiteDaysNotificationEnabled ? (
                                        <Field label={t('config.white_days_channel')}>
                                            <SelectInput value={form.islam.whiteDaysChannelId} onChange={(e) => update('islam', 'whiteDaysChannelId', e.target.value)} options={channelOptions} emptyLabel={t('config.choose_channel')} />
                                        </Field>
                                    ) : <p className="cf-empty">{t('config.reminder_off')}</p>}
                                </Card>

                                <Card title={t('config.radio')} desc={t('config.radio_desc')}>
                                    <div className="cf-grid-2 cf-align-end">
                                        <Field label={t('config.reciter')}>
                                            <SelectInput value={form.islam.radioDefaultReciter} onChange={(e) => update('islam', 'radioDefaultReciter', e.target.value)} options={ISLAMIC_RECITERS} />
                                        </Field>
                                        <Switch checked={form.islam.radioAutoReconnect} onChange={(v) => update('islam', 'radioAutoReconnect', v)} label={t('config.reconnect')} desc={t('config.reconnect_desc')} />
                                    </div>
                                </Card>

                                <Card title={t('config.unlocked')}>
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
                                    <h2>{t('config.code_title')}</h2>
                                    <p>{t('config.code_lead')}</p>
                                </div>
                                <Card>
                                    <div className="cf-inline">
                                        <TextInput value={islamCode} onChange={(e) => setIslamCode(e.target.value)} placeholder={t('config.code_ph')} autoComplete="off" maxLength={64} />
                                        <button type="button" onClick={activateSecretCode} disabled={activatingIslam || !islamCode.trim()} className="ui-btn ui-btn--primary">
                                            {activatingIslam ? t('config.checking') : t('config.validate')}
                                        </button>
                                    </div>
                                </Card>
                            </>
                        )
                    ) : null}

                    {/* Barre d'enregistrement : visible seulement s'il y a des changements */}
                    <div className={`gc-savebar${isDirty ? ' is-visible' : ''}`} aria-hidden={!isDirty}>
                        {/* Erreur d'enregistrement affichée ici, là où on vient de cliquer */}
                        {error ? <span className="gc-savebar__error" role="alert"><Icon name="alert" size={16} /> {error}</span> : <span><i /> {t('config.unsaved')}</span>}
                        <div className="cf-actions">
                            <button type="button" className="ui-btn ui-btn--ghost" onClick={discardChanges} disabled={saving} tabIndex={isDirty ? 0 : -1}>{t('common.cancel')}</button>
                            <button type="submit" disabled={saving} className="ui-btn ui-btn--primary" tabIndex={isDirty ? 0 : -1}>
                                {saving ? t('common.saving') : t('common.save')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            {confirmDialog}
        </div>
    );
}

export default GuildConfig;
