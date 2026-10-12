import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { feedbackService } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import LoadingScreen from '../components/LoadingScreen.jsx';

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_IMAGES = 3;

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
    const [images, setImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState('');
    const [submitError, setSubmitError] = useState('');

    // Modal pour agrandir une image
    const [previewImage, setPreviewImage] = useState(null);

    const fileInputRef = useRef(null);

    // Initialiser le pseudo si l'utilisateur se connecte
    useEffect(() => {
        if (user?.username && !authorName) {
            setAuthorName(user.username);
        }
        if (user?.email && !authorEmail) {
            setAuthorEmail(user.email);
        }
    }, [user]);

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

    // Compression automatique des captures d'écran pour éviter les surcharges (erreur 413)
    const compressImage = (file, maxDimension = 1600, quality = 0.82) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let { width, height } = img;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = Math.round((height * maxDimension) / width);
                            width = maxDimension;
                        } else {
                            width = Math.round((width * maxDimension) / height);
                            height = maxDimension;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = () => resolve(e.target.result);
                img.src = e.target.result;
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    };

    // Gestion de l'ajout d'images / captures d'écran avec compression automatique
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const remainingSlots = MAX_IMAGES - images.length;
        if (remainingSlots <= 0) {
            setSubmitError(`Vous pouvez ajouter au maximum ${MAX_IMAGES} captures d'écran.`);
            return;
        }

        const selectedFiles = files.slice(0, remainingSlots);

        selectedFiles.forEach(async (file) => {
            if (!file.type.startsWith('image/')) {
                setSubmitError('Format de fichier non supporté. Veuillez choisir une image PNG, JPEG ou WebP.');
                return;
            }
            if (file.size > 20 * 1024 * 1024) {
                setSubmitError('Image trop volumineuse (maximum 20 Mo par image).');
                return;
            }

            const compressedBase64 = await compressImage(file);
            if (compressedBase64) {
                setImages((prev) => (prev.length < MAX_IMAGES ? [...prev, compressedBase64] : prev));
                setSubmitError('');
            }
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitSuccess('');

        const cleanTitle = title.trim();
        const cleanDesc = description.trim();
        const cleanAuthor = authorName.trim();
        const cleanEmail = authorEmail.trim();

        if (!cleanTitle) {
            setSubmitError('Veuillez renseigner un titre pour votre signalement.');
            return;
        }
        if (!cleanDesc) {
            setSubmitError('Veuillez fournir une description détaillée.');
            return;
        }
        if (!cleanAuthor) {
            setSubmitError('Le champ "Votre Nom ou Pseudo Discord" est obligatoire pour vous identifier.');
            return;
        }
        if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            setSubmitError('L\'adresse email saisie est invalide.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await feedbackService.createFeedback({
                type: formType,
                title: cleanTitle,
                description: cleanDesc,
                authorName: cleanAuthor,
                authorEmail: cleanEmail || null,
                images: images,
            });

            if (res.success || res.report) {
                setSubmitSuccess(
                    formType === 'bug'
                        ? 'Votre bug a été enregistré avec succès ! Merci de votre aide.'
                        : 'Votre suggestion a été enregistrée avec succès ! Merci pour votre idée.'
                );
                setTitle('');
                setDescription('');
                setImages([]);
                setShowForm(false);
                loadReports();
            }
        } catch (err) {
            const msg = err.message || '';
            if (msg.includes('413') || err.status === 413) {
                setSubmitError('Le contenu du signalement ou les captures d\'écran sont trop volumineux. Veuillez réduire la taille ou le nombre d\'images.');
            } else {
                setSubmitError(msg || 'Impossible d\'envoyer le rapport. Réessayez plus tard.');
            }
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

    // Calcul dynamique de la couleur du compteur de caractères
    const getCounterColor = (current, max) => {
        const ratio = current / max;
        if (ratio >= 0.9) return 'text-rose-400 font-bold';
        if (ratio >= 0.75) return 'text-amber-400 font-semibold';
        return 'text-slate-400';
    };

    return (
        <main className="site-page site-section-page max-w-5xl py-8 px-4 sm:px-6 overflow-x-hidden">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-[#0a1827] to-[#040e1a] p-6 sm:p-8 shadow-2xl backdrop-blur-md mb-8">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="site-eyebrow text-cyan-400">COMMUNAUTÉ & SUPPORT</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-xs text-slate-400">AzimBot v2.4</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                            <span>🛡️</span> Signalement de Bugs & Suggestions
                        </h1>
                        <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
                            Aidez-nous à perfectionner AzimBot ! Signalez un problème rencontré sur votre serveur ou proposez vos idées d'améliorations. Vous pouvez aussi utiliser directement la commande <code className="bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800 text-xs font-mono">/report</code> sur Discord.
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
                <section className="mb-8 rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-6 sm:p-7 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span>📝</span> Formulaire de signalement V2
                        </h2>
                        <span className="text-xs text-slate-400">Remplissez les informations ci-dessous</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Type Toggle */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                                Catégorie du signalement <span className="text-rose-400">*</span>
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

                        {/* Title avec compteur dynamique */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                                    Sujet / Titre <span className="text-rose-400">*</span>
                                </label>
                                <span className={`text-[11px] font-mono transition-colors ${getCounterColor(title.length, MAX_TITLE_LENGTH)}`}>
                                    {title.length} / {MAX_TITLE_LENGTH} caractères
                                </span>
                            </div>
                            <input
                                type="text"
                                required
                                maxLength={MAX_TITLE_LENGTH}
                                placeholder={formType === 'bug' ? 'Ex: La radio s\'arrête après 20 minutes sur le salon vocal' : 'Ex: Ajouter une commande pour afficher la météo en temps réel'}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="form-input w-full"
                            />
                        </div>

                        {/* Description avec compteur dynamique */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                                    Description détaillée <span className="text-rose-400">*</span>
                                </label>
                                <span className={`text-[11px] font-mono transition-colors ${getCounterColor(description.length, MAX_DESCRIPTION_LENGTH)}`}>
                                    {description.length} / {MAX_DESCRIPTION_LENGTH} caractères
                                </span>
                            </div>
                            <textarea
                                required
                                rows={4}
                                maxLength={MAX_DESCRIPTION_LENGTH}
                                placeholder={formType === 'bug' ? 'Expliquez étape par étape comment reproduire l\'erreur, le message affiché et le salon...' : 'Décrivez votre idée, son utilité pour la communauté et comment elle devrait fonctionner...'}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="form-input w-full resize-y font-sans text-sm"
                            />
                        </div>

                        {/* Ajout de capture d'écran (Point 5) */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                                    Captures d'écran / Illustrations <span className="text-slate-500 text-[11px] font-normal normal-case">(optionnel, max {MAX_IMAGES})</span>
                                </label>
                                <span className="text-[11px] font-mono text-slate-400">
                                    {images.length} / {MAX_IMAGES} image(s)
                                </span>
                            </div>

                            {/* Aperçu des images sélectionnées */}
                            {images.length > 0 && (
                                <div className="flex flex-wrap gap-3 mb-3">
                                    {images.map((imgSrc, idx) => (
                                        <div key={idx} className="relative group size-20 sm:size-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                                            <img src={imgSrc} alt={`Capture ${idx + 1}`} className="size-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(idx)}
                                                className="absolute top-1 right-1 size-5 rounded-full bg-rose-600/90 text-white flex items-center justify-center text-xs opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow-md"
                                                title="Supprimer cette capture"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Bouton pour ajouter une capture */}
                            {images.length < MAX_IMAGES && (
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png, image/jpeg, image/webp"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="feedback-file-upload"
                                    />
                                    <label
                                        htmlFor="feedback-file-upload"
                                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-cyan-500/50 bg-cyan-950/20 text-xs font-semibold text-cyan-300 hover:bg-cyan-950/40 hover:border-cyan-400 cursor-pointer transition-all"
                                    >
                                        <span>📷</span>
                                        <span>Joindre une capture d'écran (PNG, JPG, WebP)</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Author Info avec distinction explicite Obligatoire vs Optionnel */}
                        <div className="grid gap-4 sm:grid-cols-2 pt-3 border-t border-slate-800">
                            <div>
                                <label className="text-xs font-semibold text-slate-300 block mb-1">
                                    Votre Nom ou Pseudo Discord <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Sofiane#0001"
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    className="form-input w-full text-xs"
                                />
                                <span className="text-[11px] text-slate-500 mt-1 block">Obligatoire pour vous identifier dans le suivi.</span>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-300 block mb-1">
                                    Email de contact <span className="text-slate-500 font-normal text-[11px]">(Optionnel)</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="Pour recevoir une notification de résolution"
                                    value={authorEmail}
                                    onChange={(e) => setAuthorEmail(e.target.value)}
                                    className="form-input w-full text-xs"
                                />
                                <span className="text-[11px] text-slate-500 mt-1 block">Facultatif — utile pour être averti quand le bug est résolu.</span>
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
                                disabled={submitting || !title.trim() || !description.trim() || !authorName.trim()}
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
                <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                            filterType === 'all' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Tous ({reports.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterType('bug')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                            filterType === 'bug' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        🐛 Bugs ({stats.bugs})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterType('suggestion')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
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
                <div className="py-12">
                    <LoadingScreen label="Chargement des retours de la communauté…" subtext="Récupération des suggestions et signalements" />
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
                                className={`rounded-xl border p-5 transition-all duration-200 bg-slate-900/50 hover:bg-slate-900/80 max-w-full overflow-hidden ${
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

                                {/* Titre avec word-break strict pour empêcher tout débordement horizontal */}
                                <h3 className="text-base font-bold text-white mb-2 break-words [overflow-wrap:anywhere]">
                                    {item.title}
                                </h3>

                                {/* Description avec word-break strict et support des longs textes */}
                                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed mb-3 break-words [overflow-wrap:anywhere]">
                                    {item.description}
                                </p>

                                {/* Galerie de captures d'écran attachées */}
                                {Array.isArray(item.images) && item.images.length > 0 && (
                                    <div className="flex flex-wrap gap-2.5 my-3 pt-2 border-t border-slate-800/60">
                                        {item.images.map((imgSrc, imgIdx) => (
                                            <button
                                                type="button"
                                                key={imgIdx}
                                                onClick={() => setPreviewImage(imgSrc)}
                                                className="relative group size-16 sm:size-20 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 hover:scale-105 transition-transform"
                                                title="Cliquer pour agrandir la capture"
                                            >
                                                <img src={imgSrc} alt={`Capture ${imgIdx + 1}`} className="size-full object-cover" />
                                                <div className="absolute inset-0 bg-cyan-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs">
                                                    🔍
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                                    <span className="flex items-center gap-1.5 break-words [overflow-wrap:anywhere]">
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

            {/* Modal d'agrandissement d'image */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-4 right-4 size-8 rounded-full bg-slate-800/80 text-white flex items-center justify-center font-bold hover:bg-slate-700 transition-colors z-10"
                        >
                            ✕
                        </button>
                        <img src={previewImage} alt="Capture agrandie" className="max-h-[82vh] w-auto object-contain rounded-xl" />
                    </div>
                </div>
            )}
        </main>
    );
}
