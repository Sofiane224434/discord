import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminService } from '../services/api.js';

const EMPTY_CONFIG = {
    ai: { systemPrompt: '', language: '', triggerName: 'azim', keysCount: 0, keysPreviews: [] },
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
};

function mergeConfig(data) {
    return {
        ...EMPTY_CONFIG,
        ...data,
        ai: { ...EMPTY_CONFIG.ai, ...data.ai },
        logs: { ...EMPTY_CONFIG.logs, ...data.logs },
        welcome: { ...EMPTY_CONFIG.welcome, ...data.welcome },
        profile: { ...EMPTY_CONFIG.profile, ...data.profile },
        youtube: { ...EMPTY_CONFIG.youtube, ...data.youtube },
        tiktok: { ...EMPTY_CONFIG.tiktok, ...data.tiktok },
        rank: { ...EMPTY_CONFIG.rank, ...data.rank },
        features: { ...EMPTY_CONFIG.features, ...data.features },
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
        <label className="grid gap-1.5 text-sm font-medium text-slate-800">
            <span>{label}</span>
            {children}
            {hint ? <span className="text-xs font-normal text-slate-500">{hint}</span> : null}
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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [newKey, setNewKey] = useState('');
    const [islamCode, setIslamCode] = useState('');
    const [activatingIslam, setActivatingIslam] = useState(false);

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

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setNotice('');
        try {
            await adminService.updateGuildConfig(guildId, {
                ai: { systemPrompt: form.ai.systemPrompt, language: form.ai.language, triggerName: form.ai.triggerName },
                logs: form.logs,
                welcome: form.welcome,
                profile: { bio: form.profile.bio },
                youtube: form.youtube,
                tiktok: form.tiktok,
                rank: form.rank,
            });
            await refresh();
            setNotice('Configuration enregistrée.');
        } catch (apiError) {
            setError(apiError.hint || apiError.message || 'Impossible d’enregistrer la configuration.');
        } finally {
            setSaving(false);
        }
    };

    const activateIslam = async () => {
        setActivatingIslam(true);
        setError('');
        setNotice('');
        try {
            const result = await adminService.activateIslamMode(guildId, islamCode);
            await refresh();
            setIslamCode('');
            setNotice(result.commandSync === false
                ? 'Mode activé. Les commandes sont enregistrées, mais Discord n’a pas encore confirmé leur synchronisation.'
                : result.alreadyEnabled
                    ? 'Le mode Islam est déjà activé sur ce serveur.'
                    : 'Mode Islam activé. /coran et /quiz sont disponibles sur ce serveur.');
        } catch (apiError) {
            setError(apiError.message || 'Impossible de vérifier ce code. Réessayez.');
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

    const updateRule = (index, field, value) => {
        const rules = [...form.welcome.rules];
        rules[index] = { ...rules[index], [field]: value };
        update('welcome', 'rules', rules);
    };

    const updateReward = (index, field, value) => {
        const rewards = [...form.rank.rewards];
        rewards[index] = { ...rewards[index], [field]: value };
        update('rank', 'rewards', rewards);
    };

    if (loading) {
        return <main className="mx-auto max-w-5xl px-5 py-12 text-slate-600">Chargement de la configuration…</main>;
    }

    const channelOptions = form.channels.map((channel) => ({ value: channel.id, label: `#${channel.name}` }));
    const roleOptions = form.roles.map((role) => ({ value: role.id, label: role.name }));

    return (
        <main className="site-page site-section-page guild-config-page max-w-5xl">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <Link to="/dashboard" className="text-sm font-medium text-teal-800 hover:underline">← Console</Link>
                    <p className="mt-5 text-xs font-bold uppercase tracking-widest text-teal-800">Administration du serveur</p>
                    <h1 className="mt-1 text-3xl font-bold text-slate-900">{getGuildName(guildId)}</h1>
                    <p className="mt-1 font-mono text-xs text-slate-500">{guildId}</p>
                </div>
                <button type="submit" form="guild-config" disabled={saving} className="btn btn-primary disabled:opacity-60">
                    {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
                </button>
            </div>

            {error ? <div role="alert" className="mb-5 border-l-4 border-rose-600 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div> : null}
            {notice ? <div role="status" className="mb-5 border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div> : null}

            <form id="guild-config" onSubmit={save} className="space-y-8">
                <section className="border-b border-slate-200 pb-8">
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-slate-900">Intelligence artificielle</h2>
                        <p className="mt-1 text-sm text-slate-600">Réglages utilisés par /ask et les réponses automatiques.</p>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Langue des réponses" hint="Laisser vide pour laisser l’IA choisir selon la conversation.">
                            <TextInput maxLength={50} placeholder="Français, English, العربية…" value={form.ai.language || ''} onChange={(event) => update('ai', 'language', event.target.value)} />
                        </Field>
                        <Field label="Mot déclencheur" hint="Nom utilisé pour appeler l’IA dans la conversation.">
                            <TextInput minLength={2} maxLength={32} value={form.ai.triggerName || ''} onChange={(event) => update('ai', 'triggerName', event.target.value)} />
                        </Field>
                        <Field label="Prompt système" hint="Instructions propres à ce serveur, maximum 6000 caractères.">
                            <textarea className="form-input min-h-32 resize-y" maxLength={6000} value={form.ai.systemPrompt || ''} onChange={(event) => update('ai', 'systemPrompt', event.target.value)} />
                        </Field>
                    </div>
                    <div className="mt-6 max-w-2xl border-t border-slate-200 pt-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <h3 className="font-semibold text-slate-900">Clés Groq</h3>
                            <span className="text-sm text-slate-500">{form.ai.keysCount} configurée(s)</span>
                        </div>
                        <div className="space-y-2">
                            {form.ai.keysPreviews.map((key) => (
                                <div key={key.index} className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 text-sm">
                                    <span className="font-mono text-slate-700">{key.preview}</span>
                                    <button type="button" disabled={form.ai.keysCount <= 1} onClick={() => manageKey({ removeKeyIndex: key.index })} className="text-rose-700 hover:underline disabled:opacity-40">Supprimer</button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <TextInput type="password" autoComplete="new-password" placeholder="gsk_…" value={newKey} onChange={(event) => setNewKey(event.target.value)} />
                            <button type="button" disabled={!newKey.trim()} onClick={() => manageKey({ addKey: newKey.trim() })} className="btn btn-soft disabled:opacity-50">Ajouter une clé</button>
                        </div>
                    </div>
                </section>

                <section className="border-b border-slate-200 pb-8">
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-slate-900">Bienvenue</h2>
                        <p className="mt-1 text-sm text-slate-600">Messages par défaut et règles conditionnelles par rôle.</p>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                        <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
                            <input type="checkbox" checked={form.welcome.enabled} onChange={(event) => update('welcome', 'enabled', event.target.checked)} className="size-4 accent-teal-700" />
                            Activer les messages de bienvenue
                        </label>
                        <Field label="Salon de bienvenue">
                            <SelectInput value={form.welcome.channelId} onChange={(event) => update('welcome', 'channelId', event.target.value)} options={channelOptions} emptyLabel="Choisir un salon" />
                        </Field>
                        <Field label="Destination">
                            <SelectInput value={form.welcome.destination} onChange={(event) => update('welcome', 'destination', event.target.value)} options={[
                                { value: 'both', label: 'Salon et message privé' },
                                { value: 'channel', label: 'Salon uniquement' },
                                { value: 'dm', label: 'Message privé uniquement' },
                            ]} />
                        </Field>
                        <Field label="Déclencheur">
                            <SelectInput value={form.welcome.trigger} onChange={(event) => update('welcome', 'trigger', event.target.value)} options={[
                                { value: 'arrivee', label: 'À l’arrivée' },
                                { value: 'role', label: 'Selon les rôles' },
                            ]} />
                        </Field>
                        <Field label="Message public par défaut">
                            <textarea className="form-input min-h-24 resize-y" maxLength={2000} value={form.welcome.defaultMessage || ''} onChange={(event) => update('welcome', 'defaultMessage', event.target.value)} />
                        </Field>
                        <Field label="Message privé par défaut">
                            <textarea className="form-input min-h-24 resize-y" maxLength={2000} value={form.welcome.defaultDmMessage || ''} onChange={(event) => update('welcome', 'defaultDmMessage', event.target.value)} />
                        </Field>
                    </div>
                    <div className="mt-6">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <h3 className="font-semibold text-slate-900">Règles par rôle</h3>
                            <button type="button" onClick={() => update('welcome', 'rules', [...form.welcome.rules, { condition: 'has_role', roleId: '', channelId: '', message: '', dmMessage: '' }])} className="btn btn-soft text-sm">Ajouter une règle</button>
                        </div>
                        {form.welcome.rules.map((rule, index) => (
                            <div key={`${rule.roleId}-${index}`} className="mb-3 grid gap-3 border-l-2 border-teal-700 bg-white/60 p-3 md:grid-cols-2">
                                <Field label="Condition">
                                    <SelectInput value={rule.condition || 'has_role'} onChange={(event) => updateRule(index, 'condition', event.target.value)} options={[
                                        { value: 'has_role', label: 'Possède le rôle' },
                                        { value: 'lacks_role', label: 'Ne possède pas le rôle' },
                                    ]} />
                                </Field>
                                <Field label="Rôle concerné">
                                    <SelectInput value={rule.roleId} onChange={(event) => updateRule(index, 'roleId', event.target.value)} options={roleOptions} emptyLabel="Choisir un rôle" />
                                </Field>
                                <Field label="Salon spécifique (facultatif)">
                                    <SelectInput value={rule.channelId} onChange={(event) => updateRule(index, 'channelId', event.target.value)} options={channelOptions} emptyLabel="Salon par défaut" />
                                </Field>
                                <Field label="Message public">
                                    <TextInput maxLength={2000} value={rule.message || ''} onChange={(event) => updateRule(index, 'message', event.target.value)} />
                                </Field>
                                <Field label="Message privé">
                                    <TextInput maxLength={2000} value={rule.dmMessage || ''} onChange={(event) => updateRule(index, 'dmMessage', event.target.value)} />
                                </Field>
                                <div className="flex items-end justify-end">
                                    <button type="button" onClick={() => update('welcome', 'rules', form.welcome.rules.filter((_, ruleIndex) => ruleIndex !== index))} className="text-sm font-medium text-rose-700 hover:underline">Supprimer cette règle</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="border-b border-slate-200 pb-8">
                    <h2 className="mb-5 text-xl font-bold text-slate-900">Logs et profil du bot</h2>
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Salon des logs">
                            <SelectInput value={form.logs.channelId} onChange={(event) => update('logs', 'channelId', event.target.value)} options={channelOptions} emptyLabel="Aucun salon" />
                        </Field>
                        <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
                            <input type="checkbox" checked={form.logs.restartAnnouncementEnabled} onChange={(event) => update('logs', 'restartAnnouncementEnabled', event.target.checked)} className="size-4 accent-teal-700" />
                            Annoncer les redémarrages dans les logs
                        </label>
                        <Field label="Bio du bot sur ce serveur" hint="Maximum 190 caractères.">
                            <TextInput maxLength={190} value={form.profile.bio || ''} onChange={(event) => update('profile', 'bio', event.target.value)} />
                        </Field>
                        <div className="grid gap-2">
                            <Field label="Avatar local du bot" hint="URL HTTPS d’une image sur cdn.discordapp.com ou media.discordapp.net.">
                                <TextInput type="url" placeholder="https://cdn.discordapp.com/…" value={form.profile.avatarUrl || ''} onChange={(event) => update('profile', 'avatarUrl', event.target.value)} />
                            </Field>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" disabled={!form.profile.avatarUrl?.trim()} onClick={() => updateAvatar(form.profile.avatarUrl.trim())} className="btn btn-soft text-sm disabled:opacity-50">Appliquer l’avatar</button>
                                <button type="button" onClick={() => updateAvatar('')} className="btn btn-soft text-sm">Retirer l’avatar local</button>
                                {form.profile.avatarUpdatedAt ? <span className="self-center text-xs text-slate-500">Avatar local actif</span> : null}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-b border-slate-200 pb-8">
                    <h2 className="mb-5 text-xl font-bold text-slate-900">Surveillance des réseaux</h2>
                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900">YouTube</h3>
                            <Field label="Chaînes surveillées" hint="Un identifiant de chaîne UC… par ligne.">
                                <textarea className="form-input min-h-28 resize-y font-mono text-sm" value={(form.youtube.channels || []).join('\n')} onChange={(event) => update('youtube', 'channels', event.target.value.split(/\r?\n/).map((id) => id.trim()).filter(Boolean))} />
                            </Field>
                            <Field label="Salon de publication">
                                <SelectInput value={form.youtube.targetChannelId} onChange={(event) => update('youtube', 'targetChannelId', event.target.value)} options={channelOptions} emptyLabel="Aucun salon" />
                            </Field>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900">TikTok Live</h3>
                            <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
                                <input type="checkbox" checked={form.tiktok.enabled} onChange={(event) => update('tiktok', 'enabled', event.target.checked)} className="size-4 accent-teal-700" />
                                Activer les alertes de live
                            </label>
                            <Field label="Pseudo TikTok">
                                <TextInput placeholder="@pseudo" value={form.tiktok.username || ''} onChange={(event) => update('tiktok', 'username', event.target.value)} />
                            </Field>
                            <Field label="Salon des alertes">
                                <SelectInput value={form.tiktok.targetChannelId} onChange={(event) => update('tiktok', 'targetChannelId', event.target.value)} options={channelOptions} emptyLabel="Choisir un salon" />
                            </Field>
                        </div>
                    </div>
                </section>

                <section className="border-b border-slate-200 pb-8">
                    <h2 className="mb-2 text-xl font-bold text-slate-900">Niveaux et récompenses</h2>
                    <p className="mb-5 text-sm text-slate-600">Les membres gagnent de l’XP selon l’activité du serveur.</p>
                    <div className="grid gap-5 md:grid-cols-2">
                        <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
                            <input type="checkbox" checked={form.rank.enabled} onChange={(event) => update('rank', 'enabled', event.target.checked)} className="size-4 accent-teal-700" />
                            Activer le système de niveaux
                        </label>
                        <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
                            <input type="checkbox" checked={form.rank.silent} onChange={(event) => update('rank', 'silent', event.target.checked)} className="size-4 accent-teal-700" />
                            Ne pas annoncer les montées de niveau
                        </label>
                        <Field label="Salon d’annonces">
                            <SelectInput value={form.rank.announceChannelId} onChange={(event) => update('rank', 'announceChannelId', event.target.value)} options={channelOptions} emptyLabel="Salon où le membre écrit" />
                        </Field>
                    </div>
                    <div className="mt-6">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <h3 className="font-semibold text-slate-900">Rôles de récompense</h3>
                            <button type="button" onClick={() => update('rank', 'rewards', [...form.rank.rewards, { level: 1, roleId: '' }])} className="btn btn-soft text-sm">Ajouter un palier</button>
                        </div>
                        {form.rank.rewards.map((reward, index) => (
                            <div key={`${reward.level}-${index}`} className="mb-2 grid gap-3 border-b border-slate-100 py-2 sm:grid-cols-[140px_1fr_auto]">
                                <Field label="Niveau">
                                    <TextInput type="number" min="1" max="200" value={reward.level} onChange={(event) => updateReward(index, 'level', Number(event.target.value))} />
                                </Field>
                                <Field label="Rôle attribué">
                                    <SelectInput value={reward.roleId} onChange={(event) => updateReward(index, 'roleId', event.target.value)} options={roleOptions} emptyLabel="Choisir un rôle" />
                                </Field>
                                <button type="button" onClick={() => update('rank', 'rewards', form.rank.rewards.filter((_, rewardIndex) => rewardIndex !== index))} className="self-end pb-2 text-sm text-rose-700 hover:underline">Retirer</button>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="border-t border-slate-200 pt-6 pb-4">
                    <h2 className="mb-2 text-xl font-bold text-slate-900">Commandes supplémentaires</h2>
                    {form.features.islamModeEnabled ? (
                        <div className="islam-enabled-panel">
                            <p className="islam-enabled-status"><span aria-hidden="true">●</span> Mode Islam activé sur ce serveur</p>
                            <p className="mt-2 text-sm text-slate-600">Les commandes suivantes sont disponibles ici :</p>
                            <div className="module-command-list mt-3">
                                <code>/coran</code>
                                <code>/quiz</code>
                            </div>
                        </div>
                    ) : (
                        <div className="islam-code-form">
                            <p className="mb-4 text-sm text-slate-600">Entrez le code d’accès pour activer /coran et /quiz sur ce serveur.</p>
                            <div className="flex flex-wrap gap-3">
                                <TextInput
                                    value={islamCode}
                                    onChange={(event) => setIslamCode(event.target.value)}
                                    placeholder="Code d’accès"
                                    autoComplete="off"
                                    maxLength={64}
                                    aria-label="Code d’accès du mode Islam"
                                />
                                <button type="button" onClick={activateIslam} disabled={activatingIslam || !islamCode.trim()} className="btn btn-primary disabled:opacity-60">
                                    {activatingIslam ? 'Vérification…' : 'Vérifier le code'}
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                <div className="flex justify-end border-t border-slate-200 pt-5">
                    <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-60">
                        {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </main>
    );
}

export default GuildConfig;