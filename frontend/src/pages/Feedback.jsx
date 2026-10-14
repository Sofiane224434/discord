import { useState, useEffect, useMemo, useRef } from 'react';
import Icon from '../components/Icon.jsx';
import { feedbackService } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import LoadingScreen from '../components/LoadingScreen.jsx';

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_IMAGES = 3;

export default function Feedback() {
    const { user } = useAuth();

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


    const STATUS_LABELS = {
        open: 'En attente',
        in_progress: 'En cours',
        resolved: 'Résolu',
        closed: 'Archivé',
    };

    const openForm = (type = formType) => {
        setFormType(type);
        setSubmitSuccess('');
        setSubmitError('');
        setShowForm(true);
    };

    const counterClass = (current, max) => {
        const ratio = current / max;
        if (ratio >= 0.9) return 'is-danger';
        if (ratio >= 0.75) return 'is-warn';
        return '';
    };

    const statCards = [
        { label: 'Retours', value: stats.total, icon: 'fileText', color: 'var(--azim-accent)' },
        { label: 'Bugs', value: stats.bugs, icon: 'bug', color: 'var(--azim-coral)' },
        { label: 'Idées', value: stats.suggestions, icon: 'sparkles', color: 'var(--azim-lilac)' },
        { label: 'Résolus', value: stats.resolved, icon: 'check', color: 'var(--azim-success)' },
    ];

    const typeTabs = [
        { id: 'all', label: 'Tous', count: stats.total },
        { id: 'bug', label: 'Bugs', count: stats.bugs },
        { id: 'suggestion', label: 'Idées', count: stats.suggestions },
    ];

    return (
        <main className="pg" id="main" tabIndex="-1">
            <header className="pg-head pg-head--row">
                <div>
                    <h1>Retours & idées</h1>
                    <p>Un bug ou une idée pour Azim ? Dites-le nous ici, ou avec <code>/report</code> sur Discord.</p>
                </div>
                <div className="pg-head__actions">
                    <button type="button" className="ui-btn" onClick={() => openForm('suggestion')}>
                        <Icon name="sparkles" size={16} /> Proposer une idée
                    </button>
                    <button type="button" className="ui-btn ui-btn--primary" onClick={() => openForm('bug')}>
                        <Icon name="bug" size={16} /> Signaler un bug
                    </button>
                </div>
            </header>

            {submitSuccess ? <div role="status" className="ui-flash ui-flash--ok"><Icon name="check" size={18} /> {submitSuccess}</div> : null}
            {submitError && !showForm ? <div role="alert" className="ui-flash ui-flash--error"><Icon name="alert" size={18} /> {submitError}</div> : null}

            <section className="ui-stats" aria-label="Chiffres des retours">
                {statCards.map((card) => (
                    <article key={card.label} className="ui-stat" style={{ '--c': card.color }}>
                        <span className="ui-stat__icon"><Icon name={card.icon} size={20} /></span>
                        <div>
                            <small>{card.label}</small>
                            <strong>{loading ? '—' : card.value}</strong>
                        </div>
                    </article>
                ))}
            </section>

            <div className="fb-toolbar">
                <div className="ui-seg" role="tablist" aria-label="Type de retour">
                    {typeTabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={filterType === tab.id}
                            className={filterType === tab.id ? 'is-active' : ''}
                            onClick={() => setFilterType(tab.id)}
                        >
                            {tab.label} <span>{tab.count}</span>
                        </button>
                    ))}
                </div>
                <div className="fb-toolbar__right">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="ui-input" aria-label="Filtrer par statut">
                        <option value="all">Tous les statuts</option>
                        <option value="open">En attente</option>
                        <option value="in_progress">En cours</option>
                        <option value="resolved">Résolu</option>
                    </select>
                    <label className="ui-search">
                        <Icon name="search" size={16} />
                        <input
                            type="search"
                            placeholder="Rechercher…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </label>
                </div>
            </div>

            {loading ? (
                <div className="py-12">
                    <LoadingScreen label="Chargement des retours…" subtext="Récupération des signalements et des idées" />
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="ui-empty">
                    <span className="ui-empty__icon"><Icon name="fileText" size={26} /></span>
                    <h3>Aucun retour pour ces filtres</h3>
                    <p>Soyez le premier à signaler un bug ou à proposer une idée.</p>
                    <button type="button" className="ui-btn ui-btn--primary" onClick={() => { setFilterType('all'); setStatusFilter('all'); setSearchQuery(''); openForm(); }}>
                        Écrire un retour
                    </button>
                </div>
            ) : (
                <div className="fb-list">
                    {filteredReports.map((item) => {
                        const isBug = item.type === 'bug';
                        return (
                            <article key={item.id} className={`fb-item ${isBug ? 'is-bug' : 'is-idea'}`}>
                                <span className="fb-item__icon"><Icon name={isBug ? 'bug' : 'sparkles'} size={20} /></span>
                                <div className="fb-item__body">
                                    <div className="fb-item__top">
                                        <h3>{item.title}</h3>
                                        <span className={`fb-status is-${item.status || 'open'}`}>{STATUS_LABELS[item.status] || STATUS_LABELS.open}</span>
                                    </div>
                                    <p>{item.description}</p>

                                    {Array.isArray(item.images) && item.images.length > 0 && (
                                        <div className="fb-thumbs">
                                            {item.images.map((imgSrc, imgIdx) => (
                                                <button type="button" key={imgIdx} onClick={() => setPreviewImage(imgSrc)} title="Agrandir la capture">
                                                    <img src={imgSrc} alt={`Capture ${imgIdx + 1}`} />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="fb-item__meta">
                                        <span className="fb-author">
                                            <i>{(item.authorName || 'A').charAt(0).toUpperCase()}</i>
                                            {item.authorName || 'Anonyme'}
                                        </span>
                                        {item.guildName ? <span>sur {item.guildName}</span> : null}
                                        <span>{item.source === 'discord' ? 'via /report' : 'via le site'}</span>
                                        <time>
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                        </time>
                                        <code>{item.id}</code>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* Formulaire dans une fenêtre */}
            {showForm ? (
                <div className="ui-modal" role="dialog" aria-modal="true" aria-labelledby="fb-form-title" onClick={() => setShowForm(false)}>
                    <section className="ui-modal__panel fb-form" onClick={(e) => e.stopPropagation()}>
                        <header className="ui-modal__head">
                            <h2 id="fb-form-title">Nouveau retour</h2>
                            <button type="button" className="ui-icon-btn" onClick={() => setShowForm(false)} aria-label="Fermer">
                                <Icon name="close" size={18} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="fb-form__body">
                            <div className="fb-types">
                                <button type="button" className={`fb-type is-bug${formType === 'bug' ? ' is-active' : ''}`} onClick={() => setFormType('bug')}>
                                    <Icon name="bug" size={20} />
                                    <span><strong>Un bug</strong><small>Quelque chose ne marche pas</small></span>
                                </button>
                                <button type="button" className={`fb-type is-idea${formType === 'suggestion' ? ' is-active' : ''}`} onClick={() => setFormType('suggestion')}>
                                    <Icon name="sparkles" size={20} />
                                    <span><strong>Une idée</strong><small>Une amélioration à proposer</small></span>
                                </button>
                            </div>

                            <label className="ui-field">
                                <span className="ui-field__label">
                                    Titre <em className={counterClass(title.length, MAX_TITLE_LENGTH)}>{title.length}/{MAX_TITLE_LENGTH}</em>
                                </span>
                                <input
                                    type="text"
                                    required
                                    maxLength={MAX_TITLE_LENGTH}
                                    placeholder={formType === 'bug' ? 'Ex : la radio s’arrête après 20 minutes' : 'Ex : une commande pour la météo'}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="ui-input"
                                />
                            </label>

                            <label className="ui-field">
                                <span className="ui-field__label">
                                    Description <em className={counterClass(description.length, MAX_DESCRIPTION_LENGTH)}>{description.length}/{MAX_DESCRIPTION_LENGTH}</em>
                                </span>
                                <textarea
                                    required
                                    rows={5}
                                    maxLength={MAX_DESCRIPTION_LENGTH}
                                    placeholder={formType === 'bug' ? 'Que s’est-il passé ? Dans quel salon ? Comment le reproduire ?' : 'Décrivez votre idée et à quoi elle servirait.'}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="ui-input"
                                />
                            </label>

                            <div className="ui-field">
                                <span className="ui-field__label">Captures d’écran <em>{images.length}/{MAX_IMAGES} · facultatif</em></span>
                                <div className="fb-uploads">
                                    {images.map((imgSrc, idx) => (
                                        <div key={idx} className="fb-upload">
                                            <img src={imgSrc} alt={`Capture ${idx + 1}`} />
                                            <button type="button" onClick={() => handleRemoveImage(idx)} aria-label="Retirer cette capture">
                                                <Icon name="close" size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {images.length < MAX_IMAGES && (
                                        <label className="fb-upload fb-upload--add">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/png, image/jpeg, image/webp"
                                                multiple
                                                onChange={handleImageUpload}
                                            />
                                            <Icon name="plus" size={20} />
                                            <span>Ajouter</span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="fb-form__grid">
                                <label className="ui-field">
                                    <span className="ui-field__label">Pseudo Discord</span>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex : sofiane"
                                        value={authorName}
                                        onChange={(e) => setAuthorName(e.target.value)}
                                        className="ui-input"
                                    />
                                </label>
                                <label className="ui-field">
                                    <span className="ui-field__label">Email <em>facultatif</em></span>
                                    <input
                                        type="email"
                                        placeholder="Pour être prévenu de la résolution"
                                        value={authorEmail}
                                        onChange={(e) => setAuthorEmail(e.target.value)}
                                        className="ui-input"
                                    />
                                </label>
                            </div>

                            {submitError ? <div role="alert" className="ui-flash ui-flash--error"><Icon name="alert" size={18} /> {submitError}</div> : null}

                            <footer className="ui-modal__foot">
                                <button type="button" className="ui-btn ui-btn--ghost" onClick={() => setShowForm(false)}>Annuler</button>
                                <button
                                    type="submit"
                                    className="ui-btn ui-btn--primary"
                                    disabled={submitting || !title.trim() || !description.trim() || !authorName.trim()}
                                >
                                    {submitting ? 'Envoi…' : 'Envoyer'}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            ) : null}

            {/* Agrandissement d'une capture */}
            {previewImage && (
                <div className="ui-modal" onClick={() => setPreviewImage(null)}>
                    <div className="fb-preview" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="ui-icon-btn" onClick={() => setPreviewImage(null)} aria-label="Fermer">
                            <Icon name="close" size={18} />
                        </button>
                        <img src={previewImage} alt="Capture agrandie" />
                    </div>
                </div>
            )}
        </main>
    );
}
