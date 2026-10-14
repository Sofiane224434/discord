// pages/Docs.jsx — documentation (contenu dans src/content/docs/<langue>.js)
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext.jsx';
import Icon from '../components/Icon.jsx';
import { SUPPORT_URL } from '../config/links.js';
import DOCS_FR from '../content/docs/fr.js';
import DOCS_EN from '../content/docs/en.js';

const CONTENT = { fr: DOCS_FR, en: DOCS_EN };

const HINT_ICONS = { info: 'help', warning: 'alert', tip: 'sparkles' };

// Transforme les `morceaux de code` d'un texte en balises <code>
function renderInline(text) {
    return String(text || '').split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : <Fragment key={i}>{part}</Fragment>
    );
}

function CommandCard({ cmd, desc }) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard?.writeText(cmd);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };
    return (
        <div className="dc-cmd">
            <div className="dc-cmd__top">
                <code>{cmd}</code>
                <button type="button" onClick={copy} className={`dc-cmd__copy${copied ? ' is-done' : ''}`} title={t('docs.copy_cmd')}>
                    <Icon name={copied ? 'check' : 'fileText'} size={14} />
                    <span>{copied ? t('common.copied') : t('common.copy')}</span>
                </button>
            </div>
            <p>{desc}</p>
        </div>
    );
}

function Block({ block }) {
    if (block.type === 'hint') {
        return (
            <aside className={`dc-hint dc-hint--${block.variant}`}>
                <span className="dc-hint__icon"><Icon name={HINT_ICONS[block.variant] || 'help'} size={18} /></span>
                <div>
                    <strong>{block.title}</strong>
                    <p>{renderInline(block.text)}</p>
                </div>
            </aside>
        );
    }

    if (block.type !== 'section') return null;

    return (
        <section id={block.id} className="dc-section">
            <h2>
                <a href={`#${block.id}`} className="dc-anchor" aria-hidden="true">#</a>
                {block.title}
            </h2>

            {block.paragraphs?.map((p, i) => <p key={i}>{renderInline(p)}</p>)}

            {block.actionButton ? (
                <a href={block.actionButton.url} target="_blank" rel="noreferrer" className="ui-btn ui-btn--primary dc-action">
                    {block.actionButton.label}
                </a>
            ) : null}

            {block.items ? (
                <ul className="dc-list">
                    {block.items.map((it, i) => (
                        <li key={i}>
                            <span className="dc-list__check"><Icon name="check" size={14} strokeWidth={3} /></span>
                            <span><strong>{it.strong}</strong> {renderInline(it.text)}</span>
                        </li>
                    ))}
                </ul>
            ) : null}

            {block.table ? (
                <div className="dc-table">
                    <table>
                        <thead>
                            <tr>{block.table.headers.map((h) => <th key={h}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {block.table.rows.map((row, r) => (
                                <tr key={r}>
                                    {row.map((cell, c) => <td key={c}>{c === 0 ? <code>{cell}</code> : cell}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}

            {block.codeList ? (
                <div className="dc-cmds">
                    {block.codeList.map((c) => <CommandCard key={c.cmd} cmd={c.cmd} desc={c.desc} />)}
                </div>
            ) : null}
        </section>
    );
}

function Docs() {
    const { slug } = useParams();
    const { t, i18n } = useTranslation();
    const { isIslamUnlocked } = useTheme();
    const lang = (i18n.resolvedLanguage || i18n.language || 'fr').slice(0, 2);
    const [query, setQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState(null);

    const categories = useMemo(
        () => (CONTENT[lang] || DOCS_FR).filter((cat) => !cat.isIslamicCategory || isIslamUnlocked),
        [lang, isIslamUnlocked]
    );
    const articles = useMemo(
        () => categories.flatMap((cat) => cat.items.map((item) => ({ ...item, category: cat.category }))),
        [categories]
    );

    const article = articles.find((a) => a.slug === (slug || 'accueil')) || articles[0];
    const index = articles.findIndex((a) => a.slug === article.slug);
    const prev = index > 0 ? articles[index - 1] : null;
    const next = index < articles.length - 1 ? articles[index + 1] : null;
    const isHome = article.slug === 'accueil';

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return categories;
        return categories
            .map((cat) => ({
                ...cat,
                items: cat.items.filter((item) =>
                    [item.title, item.summary, item.content.heading].some((txt) => String(txt).toLowerCase().includes(q))
                ),
            }))
            .filter((cat) => cat.items.length);
    }, [categories, query]);

    // Sommaire « Sur cette page » : suit la section en cours de lecture
    useEffect(() => {
        const ids = (article.sections || []).map((s) => s.id);
        const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
        if (!els.length) return undefined;
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) setActiveSection(visible[0].target.id);
            },
            { rootMargin: '-100px 0px -60% 0px' }
        );
        els.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [article]);

    const blocks = (article.content.blocks || []).filter((b) => !b.isIslamic || isIslamUnlocked);

    return (
        <div className="dc">
            <aside className={`dc-nav${menuOpen ? ' is-open' : ''}`} aria-label={t('docs.nav_label')}>
                <button type="button" className="dc-nav__toggle" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
                    <Icon name="menu" size={18} /> {t('docs.menu')}
                    <span className="dc-nav__current">{article.title}</span>
                    <Icon name="chevronDown" size={16} className="dc-nav__chevron" />
                </button>

                <div className="dc-nav__panel" onClick={(e) => { if (e.target.closest('a')) setMenuOpen(false); }}>
                    <label className="ui-search dc-nav__search">
                        <Icon name="search" size={16} />
                        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('docs.search')} />
                    </label>

                    {filtered.length === 0 ? <p className="dc-nav__empty">{t('docs.no_results', { q: query })}</p> : null}

                    {filtered.map((cat) => (
                        <div key={cat.category} className="dc-nav__group">
                            <h3>{cat.category}</h3>
                            <ul>
                                {cat.items.map((item) => (
                                    <li key={item.slug}>
                                        <Link to={`/docs/${item.slug}`} className={`dc-nav__link${item.slug === article.slug ? ' is-active' : ''}`}>
                                            <Icon name={item.icon} size={16} />
                                            <span>{item.title}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </aside>

            <article className="dc-article">
                {!isHome ? (
                    <nav className="dc-crumbs" aria-label={t('docs.breadcrumb')}>
                        <Link to="/docs/accueil">{t('docs.docs')}</Link>
                        <Icon name="chevronDown" size={14} className="dc-crumbs__sep" />
                        <span>{article.category}</span>
                    </nav>
                ) : null}

                <header className={`dc-head${isHome ? ' dc-head--home' : ''}`}>
                    <span className="dc-head__icon"><Icon name={article.icon} size={24} /></span>
                    <div>
                        {article.content.badge ? <span className="dc-head__badge">{article.content.badge}</span> : null}
                        <h1>{isHome ? t('docs.docs') : article.content.heading}</h1>
                        <p>{renderInline(article.content.lead)}</p>
                    </div>
                </header>

                {isHome ? (
                    <section className="dc-explore">
                        <h2>{t('docs.explore')}</h2>
                        <div className="dc-explore__grid">
                            {categories.map((cat) => (
                                <div key={cat.category} className="dc-explore__cat">
                                    <h3>{cat.category}</h3>
                                    {cat.items.filter((item) => item.slug !== 'accueil').map((item) => (
                                        <Link key={item.slug} to={`/docs/${item.slug}`} className="dc-explore__item">
                                            <span className="dc-explore__icon"><Icon name={item.icon} size={18} /></span>
                                            <span>
                                                <strong>{item.title}</strong>
                                                <small>{item.summary}</small>
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null}

                <div className="dc-body">
                    {blocks.map((block, i) => <Block key={`${article.slug}-${i}`} block={block} />)}
                </div>

                <nav className="dc-pager">
                    {prev ? (
                        <Link to={`/docs/${prev.slug}`} className="dc-pager__card">
                            <small><Icon name="arrowLeft" size={14} /> {t('docs.previous')}</small>
                            <strong>{prev.title}</strong>
                        </Link>
                    ) : <span />}
                    {next ? (
                        <Link to={`/docs/${next.slug}`} className="dc-pager__card dc-pager__card--next">
                            <small>{t('docs.next')} <Icon name="arrowRight" size={14} /></small>
                            <strong>{next.title}</strong>
                        </Link>
                    ) : <span />}
                </nav>

                <aside className="dc-help">
                    <span className="dc-help__icon"><Icon name="lifebuoy" size={22} /></span>
                    <div>
                        <strong>{t('docs.need_help')}</strong>
                        <p>{t('docs.need_help_lead')}</p>
                    </div>
                    <div className="dc-help__actions">
                        <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="ui-btn ui-btn--primary">{t('docs.join_support')}</a>
                        <Link to="/feedback" className="ui-btn ui-btn--ghost">{t('docs.suggest_edit')}</Link>
                    </div>
                </aside>
            </article>

            {article.sections?.length ? (
                <aside className="dc-toc" aria-label={t('docs.on_this_page')}>
                    <h4>{t('docs.on_this_page')}</h4>
                    <ul>
                        {article.sections.map((sec) => (
                            <li key={sec.id}>
                                <a href={`#${sec.id}`} className={activeSection === sec.id ? 'is-active' : ''}>{sec.label}</a>
                            </li>
                        ))}
                    </ul>
                </aside>
            ) : null}
        </div>
    );
}

export default Docs;
