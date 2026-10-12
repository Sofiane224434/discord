import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { feedbackService } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';

export default function Feedback() {
    const { user, isAuthenticated } = useAuth();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all'); // 'all' | 'bug' | 'suggestion'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'open' | 'in_progress' | 'resolved'
    const [searchQuery, setSearchQuery] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState('bug');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [authorName, setAuthorName] = useState(user?.username || '');
    const [authorEmail, setAuthorEmail] = useState(user?.email || '');
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState('');
    const [submitError, setSubmitError] = useState('');

    const loadReports = async () => {
        setLoading(true);
        try {
            const data = await feedbackService.getFeedbacks();
            setReports(Array.isArray(data.reports) ? data.reports : []);
        } catch (err) {
            console.error('Erreur chargement feedback:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitSuccess('');

        if (!title.trim() || !description.trim()) {
            setSubmitError('Veuillez remplir le titre et la description.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await feedbackService.createFeedback({
                type: formType,
                title: title.trim(),
                description: description.trim(),
                authorName: authorName.trim() || 'Utilisateur anonyme',
                authorEmail: authorEmail.trim() || null,
            });

            if (res.success || res.report) {
                setSubmitSuccess(
                    formType === 'bug'
                        ? 'Votre bug a été enregistré avec succès ! Merci de votre aide.'
                        : 'Votre suggestion a été enregistrée avec succès ! Merci pour votre idée.'
                );
                setTitle('');
                setDescription('');
                setShowForm(false);
                loadReports();
            }
        } catch (err) {
            setSubmitError(err.message || 'Impossible d\'envoyer le rapport. Réessayez plus tard.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredReports = useMemo(() => {
        return reports.filter((item) => {
            if (filterType !== 'all' && item.type !== filterType) return false;
            if (statusFilter !== 'all' && item.status !== statusFilter) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchTitle = (item.title || '').toLowerCase().includes(q);
                const matchDesc = (item.description || '').toLowerCase().includes(q);
                const matchId = (item.id || '').toLowerCase().includes(q);
                if (!matchTitle && !matchDesc && !matchId) return false;
            }
            return true;
        });
    }, [reports, filterType, statusFilter, searchQuery]);

    const stats = useMemo(() => {
        const bugs = reports.filter((r) => r.type === 'bug').length;
        const suggestions = reports.filter((r) => r.type === 'suggestion').length;
        const resolved = reports.filter((r) => r.status === 'resolved').length;
        return { total: reports.length, bugs, suggestions, resolved };
    }, [reports]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'resolved':
                return <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">✓ Résolu</span>;
            case 'in_progress':
                return <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">⚙️ En cours d'examen</span>;
            case 'closed':
                return <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-400">Archivé</span>;
            default:
                return <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">● En attente</span>;
        }
    };

    return (
        <main className="site-page site-section-page max-w-5xl py-8 px-4 sm:px-6">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-[#0a1827] to-[#040e1a] p-6 sm:p-8 shadow-2xl backdrop-blur-md mb-8">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="site-eyebrow text-cyan-400">COMMUNAUTÉ & SUPPORT</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-xs text-slate-400">AzimBot v1.1</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                            <span>🛡️</span> Signalement de Bugs & Suggestions
                        </h1>
                        <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
                            Aidez-nous à améliorer AzimBot ! Signalez un problème rencontré sur votre serveur ou proposez de nouvelles fonctionnalités. Vous pouvez aussi utiliser directement la commande <code className="bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800 text-xs font-mono">/report</code> sur Discord.
                        </p>
                    </div>

                    <div className="shrink-0 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => { setShowForm(!showForm); setSubmitSuccess(''); setSubmitError(''); }}
                            className="btn btn-primary flex items-center gap-2 text-sm font-semibold shadow-lg shadow-cyan-950/80 px-5 py-2.5 hover:scale-105 transition-all"
                        >
                            <span>{showForm ? '✖ Fermer le formulaire' : '✍️ Créer un signalement'}</span>
                        </button>
                    </div>
                </div>

                {/* Stat pills */}
                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
                    <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-center">
                        <span className="text-xs text-slate-400 block">Total retours</span>
                        <strong className="text-lg font-bold text-white">{stats.total}</strong>
                    </div>
                    <div className="bg-rose-950/20 border border-rose-900/40 p-3 rounded-xl text-center">
                        <span className="text-xs text-rose-400 block">Bugs signalés</span>
                        <strong className="text-lg font-bold text-rose-200">{stats.bugs}</strong>
                    </div>
                    <div className="bg-cyan-950/20 border border-cyan-900/40 p-3 rounded-xl text-center">
                        <span className="text-xs text-cyan-400 block">Suggestions</span>
                        <strong className="text-lg font-bold text-cyan-200">{stats.suggestions}</strong>
                    </div>
                    <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl text-center">
                        <span className="text-xs text-emerald-400 block">Résolus</span>
                        <strong className="text-lg font-bold text-emerald-200">{stats.resolved}</strong>
                    </div>
                </div>
            </div>

            {/* Notification messages */}
            {submitSuccess ? (
                <div role="status" className="mb-6 rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-4 text-sm text-emerald-200 flex items-center gap-3">
                    <span className="text-xl">✅</span>
                    <p className="font-medium">{submitSuccess}</p>
                </div>
            ) : null}

            {submitError ? (
                <div role="alert" className="mb-6 rounded-xl border border-rose-500/50 bg-rose-950/40 p-4 text-sm text-rose-200 flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <p className="font-medium">{submitError}</p>
                </div>
            ) : null}

            {/* Submission Form Modal / Collapse */}
            {showForm ? (
                <section className="mb-8 rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span>📝</span> Nouveau retour
                        </h2>
                        <span className="text-xs text-slate-400">Remplissez les informations ci-dessous</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Type Toggle */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                                Catégorie du signalement
                            </label>
                            <div className="grid grid-cols-2 gap-3 max-w-md">
                                <button
                                    type="button"
                                    onClick={() => setFormType('bug')}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                                        formType === 'bug'
                                            ? 'border-rose-500 bg-rose-950/40 text-rose-200 shadow-md shadow-rose-950/50 ring-1 ring-rose-500'
                                            : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                                    }`}
                                >
                                    <span>🐛</span>
                                    <span>Signaler un Bug</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormType('suggestion')}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                                        formType === 'suggestion'
                                            ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500'
                                            : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                                    }`}
                                >
                                    <span>💡</span>
                                    <span>Proposer une Suggestion</span>
                                </button>
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                                Sujet / Titre <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={100}
                                placeholder={formType === 'bug' ? 'Ex: La radio s\'arrête après 20 minutes sur le salon vocal' : 'Ex: Ajouter une commande pour afficher la météo en temps réel'}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="form-input w-full"
                            />
                            <span className="text-[11px] text-slate-500 mt-1 block">Maximum 100 caractères.</span>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                                Description détaillée <span className="text-rose-400">*</span>
                            </label>
                            <textarea
                                required
                                rows={4}
                                maxLength={2000}
                                placeholder={formType === 'bug' ? 'Expliquez étape par étape comment reproduire l\'erreur, le message affiché et le salon...' : 'Décrivez votre idée, son utilité pour la communauté et comment elle devrait fonctionner...'}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="form-input w-full resize-y font-sans text-sm"
                            />
                        </div>

                        {/* Author Info */}
                        <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-800">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 block mb-1">Votre Nom ou Pseudo Discord</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Sofiane#0001"
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    className="form-input w-full text-xs"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400 block mb-1">Email de contact (optionnel)</label>
                                <input
                                    type="email"
                                    placeholder="Pour recevoir une notification de résolution"
                                    value={authorEmail}
                                    onChange={(e) => setAuthorEmail(e.target.value)}
                                    className="form-input w-full text-xs"
                                />
                            </div>
                        </div>

                        {/* Submit Action */}
                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="btn btn-soft text-xs"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !title.trim() || !description.trim()}
                                className="btn btn-primary text-xs flex items-center gap-2 font-semibold disabled:opacity-50"
                            >
                                {submitting ? 'Envoi en cours…' : 'Envoyer mon retour'}
                            </button>
                        </div>
                    </form>
                </section>
            ) : null}

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
                {/* Type Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                    <button
                        type="button"
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            filterType === 'all' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Tous ({reports.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterType('bug')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            filterType === 'bug' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        🐛 Bugs ({stats.bugs})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterType('suggestion')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            filterType === 'suggestion' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        💡 Suggestions ({stats.suggestions})
                    </button>
                </div>

                {/* Status dropdown & Search */}
                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="form-input text-xs py-1.5"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="open">En attente</option>
                        <option value="in_progress">En cours</option>
                        <option value="resolved">Résolu</option>
                    </select>

                    <input
                        type="search"
                        placeholder="Rechercher par mot-clé…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input text-xs py-1.5 max-w-xs"
                    />
                </div>
            </div>

            {/* Reports Feed */}
            {loading ? (
                <div className="py-16 text-center text-slate-400">
                    <div className="inline-block size-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent mb-3" />
                    <p className="text-sm">Chargement des retours de la communauté…</p>
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-12 text-center">
                    <span className="text-4xl mb-3 block">📭</span>
                    <h3 className="text-base font-semibold text-white">Aucun signalement ne correspond à vos filtres</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Soyez le premier à signaler un bug ou à proposer une amélioration pour faire progresser AzimBot !
                    </p>
                    <button
                        type="button"
                        onClick={() => { setShowForm(true); setFilterType('all'); setStatusFilter('all'); setSearchQuery(''); }}
                        className="btn btn-primary text-xs mt-4"
                    >
                        Créer le premier signalement
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredReports.map((item) => {
                        const isBug = item.type === 'bug';
                        return (
                            <article
                                key={item.id}
                                className={`rounded-xl border p-5 transition-all duration-200 bg-slate-900/50 hover:bg-slate-900/80 ${
                                    isBug
                                        ? 'border-rose-950/60 hover:border-rose-800/60'
                                        : 'border-cyan-950/60 hover:border-cyan-800/60'
                                }`}
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                                            isBug
                                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                        }`}>
                                            {isBug ? '🐛 Bug' : '💡 Suggestion'}
                                        </span>
                                        <span className="text-xs font-mono text-slate-500">{item.id}</span>
                                        <span className="text-slate-600">•</span>
                                        <span className="text-xs text-slate-400">
                                            {item.source === 'discord' ? 'Discord (/report)' : 'Site Web'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(item.status)}
                                        <time className="text-xs text-slate-500">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                                        </time>
                                    </div>
                                </div>

                                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed mb-3">
                                    {item.description}
                                </p>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <span>👤</span> {item.authorName || 'Anonyme'}
                                        {item.guildName ? <span className="text-slate-500">sur {item.guildName}</span> : null}
                                    </span>
                                    {item.status === 'resolved' ? (
                                        <span className="text-emerald-400 font-semibold text-[11px]">Traité par l'équipe</span>
                                    ) : null}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
