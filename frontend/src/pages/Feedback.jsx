import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import Icon from '../components/Icon.jsx';
import { feedbackService } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import LoadingScreen from '../components/LoadingScreen.jsx';

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_IMAGES = 3;

export default function Feedback() {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const locale = i18n.resolvedLanguage || i18n.language || 'fr';

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
            setSubmitError(t('feedback.err_max_images', { max: MAX_IMAGES }));
            return;
        }

        const selectedFiles = files.slice(0, remainingSlots);

        selectedFiles.forEach(async (file) => {
            if (!file.type.startsWith('image/')) {
                setSubmitError(t('feedback.err_format'));
                return;
            }
            if (file.size > 20 * 1024 * 1024) {
                setSubmitError(t('feedback.err_size'));
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
            setSubmitError(t('feedback.err_title'));
            return;
        }
        if (!cleanDesc) {
            setSubmitError(t('feedback.err_desc'));
            return;
        }
        if (!cleanAuthor) {
            setSubmitError(t('feedback.err_name'));
            return;
        }
        if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            setSubmitError(t('feedback.err_email'));
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
                    formType === 'bug' ? t('feedback.ok_bug') : t('feedback.ok_idea')
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
                setSubmitError(t('feedback.err_too_big'));
            } else {
                setSubmitError(msg || t('feedback.err_send'));
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
        open: t('feedback.status_open'),
        in_progress: t('feedback.status_in_progress'),
        resolved: t('feedback.status_resolved'),
        closed: t('feedback.status_closed'),
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
        { label: t('feedback.stat_total'), value: stats.total, icon: 'fileText', color: 'var(--azim-accent)' },
        { label: t('feedback.stat_bugs'), value: stats.bugs, icon: 'bug', color: 'var(--azim-coral)' },
        { label: t('feedback.stat_ideas'), value: stats.suggestions, icon: 'sparkles', color: 'var(--azim-lilac)' },
        { label: t('feedback.stat_resolved'), value: stats.resolved, icon: 'check', color: 'var(--azim-success)' },
    ];

    const typeTabs = [
        { id: 'all', label: t('feedback.tab_all'), count: stats.total },
        { id: 'bug', label: t('feedback.tab_bugs'), count: stats.bugs },
        { id: 'suggestion', label: t('feedback.tab_ideas'), count: stats.suggestions },
    ];

    return (
        <main className="pg" id="main" tabIndex="-1">
            <header className="pg-head pg-head--row">
                <div>
                    <h1>{t('feedback.title')}</h1>
                    <p><Trans i18nKey="feedback.lead" components={{ code: <code /> }} /></p>
                </div>
                <button type="button" className="ui-btn ui-btn--primary" onClick={() => openForm()}>
                    <Icon name="plus" size={16} /> {t('feedback.new')}
                </button>
            </header>

            {submitSuccess ? <div role="status" className="ui-flash ui-flash--ok"><Icon name="check" size={18} /> {submitSuccess}</div> : null}
            {submitError && !showForm ? <div role="alert" className="ui-flash ui-flash--error"><Icon name="alert" size={18} /> {submitError}</div> : null}

            <section className="ui-stats" aria-label={t('feedback.stats_label')}>
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
                <div className="ui-seg" role="tablist" aria-label={t('feedback.type_label')}>
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
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="ui-input" aria-label={t('feedback.status_filter')}>
                        <option value="all">{t('feedback.status_all')}</option>
                        <option value="open">{t('feedback.status_open')}</option>
                        <option value="in_progress">{t('feedback.status_in_progress')}</option>
                        <option value="resolved">{t('feedback.status_resolved')}</option>
                    </select>
                    <label className="ui-search">
                        <Icon name="search" size={16} />
                        <input
                            type="search"
                            placeholder={t('common.search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </label>
                </div>
            </div>

            {loading ? (
                <div className="py-12">
                    <LoadingScreen label={t('feedback.loading')} subtext={t('feedback.loading_sub')} />
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="ui-empty">
                    <span className="ui-empty__icon"><Icon name="fileText" size={26} /></span>
                    <h3>{t('feedback.empty_title')}</h3>
                    <p>{t('feedback.empty_lead')}</p>
                    <button type="button" className="ui-btn ui-btn--primary" onClick={() => { setFilterType('all'); setStatusFilter('all'); setSearchQuery(''); openForm(); }}>
                        {t('feedback.write')}
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
                                                <button type="button" key={imgIdx} onClick={() => setPreviewImage(imgSrc)} title={t('feedback.enlarge')}>
                                                    <img src={imgSrc} alt={t('feedback.capture', { n: imgIdx + 1 })} />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="fb-item__meta">
                                        <span className="fb-author">
                                            <i>{(item.authorName || 'A').charAt(0).toUpperCase()}</i>
                                            {item.authorName || t('feedback.anonymous')}
                                        </span>
                                        {item.guildName ? <span>{t('feedback.on_guild', { name: item.guildName })}</span> : null}
                                        <span>{item.source === 'discord' ? t('feedback.via_report') : t('feedback.via_site')}</span>
                                        <time>
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
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
                            <h2 id="fb-form-title">{t('feedback.form_title')}</h2>
                            <button type="button" className="ui-icon-btn" onClick={() => setShowForm(false)} aria-label={t('common.close')}>
                                <Icon name="close" size={18} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="fb-form__body">
                            <div className="fb-types">
                                <button type="button" className={`fb-type is-bug${formType === 'bug' ? ' is-active' : ''}`} onClick={() => setFormType('bug')}>
                                    <Icon name="bug" size={20} />
                                    <span><strong>{t('feedback.type_bug')}</strong><small>{t('feedback.type_bug_desc')}</small></span>
                                </button>
                                <button type="button" className={`fb-type is-idea${formType === 'suggestion' ? ' is-active' : ''}`} onClick={() => setFormType('suggestion')}>
                                    <Icon name="sparkles" size={20} />
                                    <span><strong>{t('feedback.type_idea')}</strong><small>{t('feedback.type_idea_desc')}</small></span>
                                </button>
                            </div>

                            <label className="ui-field">
                                <span className="ui-field__label">
                                    {t('feedback.field_title')} <em className={counterClass(title.length, MAX_TITLE_LENGTH)}>{title.length}/{MAX_TITLE_LENGTH}</em>
                                </span>
                                <input
                                    type="text"
                                    required
                                    maxLength={MAX_TITLE_LENGTH}
                                    placeholder={formType === 'bug' ? t('feedback.ph_title_bug') : t('feedback.ph_title_idea')}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="ui-input"
                                />
                            </label>

                            <label className="ui-field">
                                <span className="ui-field__label">
                                    {t('feedback.field_desc')} <em className={counterClass(description.length, MAX_DESCRIPTION_LENGTH)}>{description.length}/{MAX_DESCRIPTION_LENGTH}</em>
                                </span>
                                <textarea
                                    required
                                    rows={5}
                                    maxLength={MAX_DESCRIPTION_LENGTH}
                                    placeholder={formType === 'bug' ? t('feedback.ph_desc_bug') : t('feedback.ph_desc_idea')}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="ui-input"
                                />
                            </label>

                            <div className="ui-field">
                                <span className="ui-field__label">{t('feedback.field_images')} <em>{images.length}/{MAX_IMAGES} · {t('feedback.optional')}</em></span>
                                <div className="fb-uploads">
                                    {images.map((imgSrc, idx) => (
                                        <div key={idx} className="fb-upload">
                                            <img src={imgSrc} alt={t('feedback.capture', { n: idx + 1 })} />
                                            <button type="button" onClick={() => handleRemoveImage(idx)} aria-label={t('feedback.remove_image')}>
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
                                            <span>{t('feedback.add_image')}</span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="fb-form__grid">
                                <label className="ui-field">
                                    <span className="ui-field__label">{t('feedback.field_name')}</span>
                                    <input
                                        type="text"
                                        required
                                        placeholder={t('feedback.ph_name')}
                                        value={authorName}
                                        onChange={(e) => setAuthorName(e.target.value)}
                                        className="ui-input"
                                    />
                                </label>
                                <label className="ui-field">
                                    <span className="ui-field__label">{t('feedback.field_email')} <em>{t('feedback.optional')}</em></span>
                                    <input
                                        type="email"
                                        placeholder={t('feedback.ph_email')}
                                        value={authorEmail}
                                        onChange={(e) => setAuthorEmail(e.target.value)}
                                        className="ui-input"
                                    />
                                </label>
                            </div>

                            {submitError ? <div role="alert" className="ui-flash ui-flash--error"><Icon name="alert" size={18} /> {submitError}</div> : null}

                            <footer className="ui-modal__foot">
                                <button type="button" className="ui-btn ui-btn--ghost" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
                                <button
                                    type="submit"
                                    className="ui-btn ui-btn--primary"
                                    disabled={submitting || !title.trim() || !description.trim() || !authorName.trim()}
                                >
                                    {submitting ? t('feedback.sending') : t('feedback.send')}
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
                        <button type="button" className="ui-icon-btn" onClick={() => setPreviewImage(null)} aria-label={t('common.close')}>
                            <Icon name="close" size={18} />
                        </button>
                        <img src={previewImage} alt="Capture agrandie" />
                    </div>
                </div>
            )}
        </main>
    );
}
