// pages/Home.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useTheme } from '../context/ThemeContext.jsx';
import Icon from '../components/Icon.jsx';
import { ADD_BOT_URL } from '../config/links.js';


function DiscordIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
    );
}

// Couleurs des modules (cyclées dans le bandeau)
// t(..., { returnObjects: true }) renvoie la clé (texte) tant que les traductions ne sont pas chargées
const asList = (value) => (Array.isArray(value) ? value : []);

const HUES = ['#20b9f2', '#b5a0ff', '#ffc46c', '#ff917e', '#51d6a5', '#f472b6'];

function Home() {
    const { theme, isIslamUnlocked } = useTheme();
    const { t } = useTranslation();
    const logoSrc = theme === 'islam' ? '/icon-islam.png' : '/icon.png';

    // Mot qui change dans le titre du hero
    const words = [...asList(t('home.words', { returnObjects: true })), ...(isIslamUnlocked ? [t('home.word_islam')] : [])];
    const [wordIdx, setWordIdx] = useState(0);

    useEffect(() => {
        if (words.length < 2) return undefined;
        const timer = setInterval(() => setWordIdx((prev) => (prev + 1) % words.length), 2600);
        return () => clearInterval(timer);
    }, [words.length]);

    // Apparition au scroll
    const revealRefs = useRef([]);
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-in');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );
        revealRefs.current.forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, [isIslamUnlocked]);

    const reveal = (el) => {
        if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
    };

    const modules = [
        { label: t('home.modules.ai'), icon: 'sparkles' },
        { label: t('home.modules.levels'), icon: 'activity' },
        { label: t('home.modules.moderation'), icon: 'shield' },
        { label: t('home.modules.welcome'), icon: 'hand' },
        { label: t('home.modules.youtube'), icon: 'megaphone' },
        { label: t('home.modules.tiktok'), icon: 'megaphone' },
        { label: t('home.modules.reminders'), icon: 'refresh' },
        { label: t('home.modules.quiz'), icon: 'help' },
        { label: t('home.modules.serverinfo'), icon: 'server' },
        ...(isIslamUnlocked ? [
            { label: t('home.modules.prayers'), icon: 'moon' },
            { label: t('home.modules.radio'), icon: 'moon' },
        ] : []),
    ];
    const half = Math.ceil(modules.length / 2);
    const rows = [modules.slice(0, half), modules.slice(half)];

    const stepIcons = ['plus', 'settings', 'check'];
    const steps = asList(t('home.steps', { returnObjects: true })).map((step, i) => ({ ...step, icon: stepIcons[i] }));

    return (
        <div className="azh" id="main" role="main" tabIndex="-1">
            {/* HERO */}
            <section className="azh-hero">
                <div className="azh-hero-bg" aria-hidden="true">
                    <span className="azh-blob azh-blob--a" />
                    <span className="azh-blob azh-blob--b" />
                    <span className="azh-grid" />
                </div>

                <div className="azh-hero-inner">
                    <div className="azh-hero-copy">
                        <h1>
                            {t('home.title')}
                            <span className="azh-word-slot">
                                {words.map((w, i) => (
                                    <span key={w} className={`azh-word${i === wordIdx % words.length ? ' is-on' : ''}`} aria-hidden={i !== wordIdx % words.length}>
                                        {w}
                                    </span>
                                ))}
                            </span>
                        </h1>
                        <p className="azh-lead">
                            {t('home.lead')}
                        </p>
                        <div className="azh-cta">
                            <a className="azh-btn azh-btn--primary" href={ADD_BOT_URL} target="_blank" rel="noreferrer">
                                <DiscordIcon /> {t('home.cta_add')}
                            </a>
                            <Link className="azh-btn azh-btn--ghost" to="/#features">
                                {t('home.cta_features')} <Icon name="arrowRight" size={17} />
                            </Link>
                        </div>
                        <ul className="azh-facts">
                            <li><b>30+</b> {t('home.fact_commands')}</li>
                            <li><b>24/7</b> {t('home.fact_online')}</li>
                            <li><b>0 €</b> {t('home.fact_free')}</li>
                        </ul>
                    </div>

                    {/* Aperçu façon fenêtre Discord */}
                    <div className="azh-preview" aria-hidden="true">
                        <div className="azh-window">
                            <div className="azh-window-bar">
                                <span className="azh-hash">#</span> {t('home.chat_channel')}
                            </div>
                            <div className="azh-window-body">
                                <div className="azh-msg">
                                    <span className="azh-avatar azh-avatar--user">S</span>
                                    <div>
                                        <div className="azh-msg-head">Sami <small>{t('home.chat_today')}</small></div>
                                        <div className="azh-cmd">{t('home.chat_question')}</div>
                                    </div>
                                </div>
                                <div className="azh-msg">
                                    <img className="azh-avatar" src={logoSrc} alt="" />
                                    <div>
                                        <div className="azh-msg-head">Azim <span className="azh-bot-tag">BOT</span> <small>{t('home.chat_today')}</small></div>
                                        <div className="azh-embed">
                                            <p><Trans i18nKey="home.chat_answer" components={{ b: <b /> }} /></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="azh-msg azh-msg--system">
                                    <span className="azh-levelup">🎉</span>
                                    <div><Trans i18nKey="home.chat_levelup" components={{ b: <b />, lvl: <b className="azh-accent" /> }} /></div>
                                </div>
                            </div>
                        </div>
                        <img className="azh-float-logo" src={logoSrc} alt="" />
                    </div>
                </div>
            </section>

            {/* BANDEAU DES MODULES : deux rubans croisés */}
            <div className="azh-ribbons" aria-label={t('home.modules_label')}>
                {rows.map((row, r) => (
                    <div key={r} className={`azh-ribbon azh-ribbon--${r ? 'b' : 'a'}`}>
                        <div className="azh-ribbon-track">
                            {[...row, ...row, ...row, ...row, ...row, ...row].map((m, i) => (
                                <span key={i} className="azh-tile" style={{ '--c': HUES[(i + r * 3) % HUES.length] }} aria-hidden={i >= row.length}>
                                    <span className="azh-tile-icon"><Icon name={m.icon} size={16} /></span>
                                    {m.label}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* FONCTIONNALITÉS */}
            <section className="azh-section" id="features">
                <header className="azh-section-head" ref={reveal}>
                    <h2>{t('home.features_title')}</h2>
                    <p>{t('home.features_lead')}</p>
                </header>

                <div className={`azh-bento${isIslamUnlocked ? ' has-islam' : ''}`}>
                    <article ref={reveal} className="azh-card azh-card--ai" style={{ '--c': '#b5a0ff' }}>
                        <div className="azh-card-text">
                            <span className="azh-card-icon"><Icon name="sparkles" size={22} /></span>
                            <h3>{t('home.ai_title')}</h3>
                            <p>{t('home.ai_desc')}</p>
                        </div>
                        <div className="azh-card-visual azh-v-chat">
                            <div className="azh-v-bubble is-user">{t('home.ai_question')}</div>
                            <div className="azh-v-bubble is-bot">
                                <img src={logoSrc} alt="" />
                                <span><Trans i18nKey="home.ai_answer" components={{ b: <b />, code: <code /> }} /></span>
                            </div>
                        </div>
                    </article>

                    <article ref={reveal} className="azh-card azh-card--lvl" style={{ '--c': '#ffc46c' }}>
                        <div className="azh-card-text">
                            <span className="azh-card-icon"><Icon name="activity" size={22} /></span>
                            <h3>{t('home.levels_title')}</h3>
                            <p>{t('home.levels_desc')}</p>
                        </div>
                        <div className="azh-card-visual azh-v-rank">
                            <div className="azh-rank-card">
                                <div className="azh-rank-ring">
                                    <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" /><circle className="is-fill" cx="32" cy="32" r="28" /></svg>
                                    <span>S</span>
                                </div>
                                <div className="azh-rank-info">
                                    <strong>Sami</strong>
                                    <small>{t('home.level_rank')}</small>
                                    <div className="azh-rank-bar"><i /></div>
                                </div>
                            </div>
                            <ol className="azh-board">
                                <li><span className="azh-medal is-gold">1</span> Inès <b>{t('home.level_short')} 27</b></li>
                                <li><span className="azh-medal is-silver">2</span> Yanis <b>{t('home.level_short')} 19</b></li>
                                <li><span className="azh-medal is-bronze">3</span> Sami <b>{t('home.level_short')} 12</b></li>
                            </ol>
                        </div>
                    </article>

                    <article ref={reveal} className="azh-card azh-card--mod" style={{ '--c': '#51d6a5' }}>
                        <div className="azh-card-text">
                            <span className="azh-card-icon"><Icon name="shield" size={22} /></span>
                            <h3>{t('home.mod_title')}</h3>
                            <p>{t('home.mod_desc')}</p>
                        </div>
                        <div className="azh-card-visual azh-v-purge">
                            <code>/purge 50</code>
                            <span className="azh-v-ok"><Icon name="check" size={14} /> {t('home.mod_done')}</span>
                        </div>
                    </article>

                    <article ref={reveal} className="azh-card azh-card--yt" style={{ '--c': '#ff917e' }}>
                        <div className="azh-card-text">
                            <span className="azh-card-icon"><Icon name="megaphone" size={22} /></span>
                            <h3>{t('home.yt_title')}</h3>
                            <p>{t('home.yt_desc')}</p>
                        </div>
                        <div className="azh-card-visual azh-v-video">
                            <div className="azh-video-thumb"><span>▶</span></div>
                            <div>
                                <strong>{t('home.yt_new')}</strong>
                                <small>{t('home.yt_meta')}</small>
                            </div>
                        </div>
                    </article>

                    <article ref={reveal} className="azh-card azh-card--wel" style={{ '--c': '#20b9f2' }}>
                        <div className="azh-card-text">
                            <span className="azh-card-icon"><Icon name="hand" size={22} /></span>
                            <h3>{t('home.welcome_title')}</h3>
                            <p>{t('home.welcome_desc')}</p>
                        </div>
                        <div className="azh-card-visual azh-v-welcome">
                            <div className="azh-welcome-banner">
                                <span className="azh-welcome-avatar">L</span>
                                <strong>{t('home.welcome_banner')}</strong>
                                <small>{t('home.welcome_count')}</small>
                            </div>
                        </div>
                    </article>

                    {isIslamUnlocked ? (
                        <article ref={reveal} className="azh-card azh-card--isl" style={{ '--c': '#10b981' }}>
                            <div className="azh-card-text">
                                <span className="azh-card-icon"><Icon name="moon" size={22} /></span>
                                <h3>{t('home.islam_title')}</h3>
                                <p>{t('home.islam_desc')}</p>
                            </div>
                            <div className="azh-card-visual azh-prayers">
                                {[['Fajr', '06:42'], ['Dhuhr', '13:51'], ['Asr', '16:48'], ['Maghrib', '19:12'], ['Isha', '20:38']].map(([name, time], i) => (
                                    <div key={name} className={i === 2 ? 'is-next' : ''}><small>{name}</small><b>{time}</b></div>
                                ))}
                            </div>
                        </article>
                    ) : null}
                </div>
            </section>

            {/* ÉTAPES */}
            <section className="azh-section">
                <header className="azh-section-head" ref={reveal}>
                    <h2>{t('home.steps_title')}</h2>
                </header>
                <ol className="azh-steps" ref={reveal}>
                    {steps.map((s, i) => (
                        <li key={s.title} className="azh-step">
                            <span className="azh-step-dot"><Icon name={s.icon} size={22} /><i>{i + 1}</i></span>
                            <h3>{s.title}</h3>
                            <p>{s.desc}</p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* APPEL À L'ACTION FINAL */}
            <section className="azh-final" ref={reveal}>
                <div className="azh-final-art" aria-hidden="true">
                    <span className="azh-orbit azh-orbit--1" />
                    <span className="azh-orbit azh-orbit--2" />
                    <img src={logoSrc} alt="" />
                </div>
                <div className="azh-final-copy">
                    <h2>{t('home.final_title')}</h2>
                    <p>{t('home.final_lead')}</p>
                    <div className="azh-cta">
                        <a className="azh-btn azh-btn--light" href={ADD_BOT_URL} target="_blank" rel="noreferrer">
                            <DiscordIcon /> {t('home.cta_add')}
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
