// pages/Home.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import Icon from '../components/Icon.jsx';

const ADD_TO_SERVER_URL = 'https://discord.com/oauth2/authorize?client_id=1462543984584032430&permissions=268823632&scope=bot%20applications.commands';

function DiscordIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
    );
}

// Couleurs des modules (cyclées dans le bandeau)
const HUES = ['#20b9f2', '#b5a0ff', '#ffc46c', '#ff917e', '#51d6a5', '#f472b6'];

function Home() {
    const { theme, isIslamUnlocked } = useTheme();
    const logoSrc = theme === 'islam' ? '/icon-islam.png' : '/icon.png';

    // Mot qui change dans le titre du hero
    const words = ['intelligent', 'protégé', 'animé', 'connecté', ...(isIslamUnlocked ? ['serein'] : [])];
    const [wordIdx, setWordIdx] = useState(0);

    useEffect(() => {
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
        { label: 'Intelligence artificielle', icon: 'sparkles' },
        { label: 'Niveaux & XP', icon: 'activity' },
        { label: 'Modération', icon: 'shield' },
        { label: 'Bienvenue', icon: 'hand' },
        { label: 'Alertes YouTube', icon: 'megaphone' },
        { label: 'Lives TikTok', icon: 'megaphone' },
        { label: 'Rappels', icon: 'refresh' },
        { label: 'Quiz', icon: 'help' },
        { label: 'Infos serveur', icon: 'server' },
        ...(isIslamUnlocked ? [
            { label: 'Horaires de prière', icon: 'moon' },
            { label: 'Radio Coran 24/7', icon: 'moon' },
        ] : []),
    ];
    const half = Math.ceil(modules.length / 2);
    const rows = [modules.slice(0, half), modules.slice(half)];

    const steps = [
        { title: 'Invitez Azim', desc: 'Un clic, choisissez votre serveur.', icon: 'plus' },
        { title: 'Activez vos modules', desc: 'Depuis le panel ou avec /config.', icon: 'settings' },
        { title: 'C’est parti', desc: 'Vos membres profitent des commandes.', icon: 'check' },
    ];

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
                            Un serveur Discord
                            <span className="azh-word-slot">
                                {words.map((w, i) => (
                                    <span key={w} className={`azh-word${i === wordIdx ? ' is-on' : ''}`} aria-hidden={i !== wordIdx}>
                                        {w}.
                                    </span>
                                ))}
                            </span>
                        </h1>
                        <p className="azh-lead">
                            IA, niveaux, modération et alertes réseaux dans un seul bot.
                            Français, gratuit, prêt en une minute.
                        </p>
                        <div className="azh-cta">
                            <a className="azh-btn azh-btn--primary" href={ADD_TO_SERVER_URL} target="_blank" rel="noreferrer">
                                <DiscordIcon /> Ajouter à Discord
                            </a>
                            <Link className="azh-btn azh-btn--ghost" to="/#features">
                                Voir les fonctionnalités <Icon name="arrowRight" size={17} />
                            </Link>
                        </div>
                        <ul className="azh-facts">
                            <li><b>30+</b> commandes</li>
                            <li><b>24/7</b> en ligne</li>
                            <li><b>0 €</b> pour toujours</li>
                        </ul>
                    </div>

                    {/* Aperçu façon fenêtre Discord */}
                    <div className="azh-preview" aria-hidden="true">
                        <div className="azh-window">
                            <div className="azh-window-bar">
                                <span className="azh-hash">#</span> général
                            </div>
                            <div className="azh-window-body">
                                <div className="azh-msg">
                                    <span className="azh-avatar azh-avatar--user">S</span>
                                    <div>
                                        <div className="azh-msg-head">Sami <small>aujourd'hui à 14:02</small></div>
                                        <div className="azh-cmd">/ask quelle est la capitale du Japon ?</div>
                                    </div>
                                </div>
                                <div className="azh-msg">
                                    <img className="azh-avatar" src={logoSrc} alt="" />
                                    <div>
                                        <div className="azh-msg-head">Azim <span className="azh-bot-tag">BOT</span> <small>aujourd'hui à 14:02</small></div>
                                        <div className="azh-embed">
                                            <p>La capitale du Japon est <b>Tokyo</b>, la ville la plus peuplée du monde avec son agglomération.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="azh-msg azh-msg--system">
                                    <span className="azh-levelup">🎉</span>
                                    <div><b>Sami</b> passe au <b className="azh-accent">niveau 12</b> !</div>
                                </div>
                            </div>
                        </div>
                        <img className="azh-float-logo" src={logoSrc} alt="" />
                    </div>
                </div>
            </section>

            {/* BANDEAU DES MODULES : deux rubans croisés */}
            <div className="azh-ribbons" aria-label="Modules disponibles">
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
                    <h2>Tout votre serveur, un seul bot</h2>
                    <p>Activez ce dont vous avez besoin, ignorez le reste.</p>
                </header>

                <div className={`azh-bento${isIslamUnlocked ? ' has-islam' : ''}`}>
                    <article ref={reveal} className="azh-card azh-card--ai" style={{ '--c': '#b5a0ff' }}>
                        <div className="azh-card-text">
                            <span className="azh-card-icon"><Icon name="sparkles" size={22} /></span>
                            <h3>Une IA dans vos salons</h3>
                            <p>Mentionnez Azim ou tapez /ask : il répond en quelques secondes.</p>
                        </div>
                        <div className="azh-card-visual azh-v-chat">
                            <div className="azh-v-bubble is-user">@Azim c'est quoi une promesse en JS ?</div>
                            <div className="azh-v-bubble is-bot">
                                <img src={logoSrc} alt="" />
                                <span>Une <b>Promise</b> représente une valeur disponible plus tard : on la lit avec <code>.then()</code> ou <code>await</code>.</span>
                            </div>
                        </div>
                    </article>

                    <article ref={reveal} className="azh-card azh-card--lvl" style={{ '--c': '#ffc46c' }}>
                        <div className="azh-card-text">
                            <span className="azh-card-icon"><Icon name="activity" size={22} /></span>
                            <h3>Niveaux & XP</h3>
                            <p>Vos membres gagnent de l'XP en discutant et débloquent des rôles.</p>
                        </div>
                        <div className="azh-card-visual azh-v-rank">
                            <div className="azh-rank-card">
                                <div className="azh-rank-ring">
                                    <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" /><circle className="is-fill" cx="32" cy="32" r="28" /></svg>
                                    <span>S</span>
                                </div>
                                <div className="azh-rank-info">
                                    <strong>Sami</strong>
                                    <small>Niveau 12 · #3</small>
                                    <div className="azh-rank-bar"><i /></div>
                                </div>
                            </div>
                            <ol className="azh-board">
                                <li><span className="azh-medal is-gold">1</span> Inès <b>Niv. 27</b></li>
                                <li><span className="azh-medal is-silver">2</span> Yanis <b>Niv. 19</b></li>
                                <li><span className="azh-medal is-bronze">3</span> Sami <b>Niv. 12</b></li>
                            </ol>
                        </div>
                    </article>

                    <article ref={reveal} className="azh-card azh-card--mod" style={{ '--c': '#51d6a5' }}>
                        <div className="azh-card-text">
                            <span className="azh-card-icon"><Icon name="shield" size={22} /></span>
                            <h3>Modération</h3>
                            <p>Nettoyez un salon en une commande.</p>
                        </div>
                        <div className="azh-card-visual azh-v-purge">
                            <code>/purge 50</code>
                            <span className="azh-v-ok"><Icon name="check" size={14} /> 50 messages supprimés</span>
                        </div>
                    </article>

                    <article ref={reveal} className="azh-card azh-card--yt" style={{ '--c': '#ff917e' }}>
                        <div className="azh-card-text">
                            <span className="azh-card-icon"><Icon name="megaphone" size={22} /></span>
                            <h3>Alertes YouTube & TikTok</h3>
                            <p>Nouvelle vidéo ou live : votre salon est prévenu.</p>
                        </div>
                        <div className="azh-card-visual azh-v-video">
                            <div className="azh-video-thumb"><span>▶</span></div>
                            <div>
                                <strong>Nouvelle vidéo !</strong>
                                <small>@createur · il y a 1 min</small>
                            </div>
                        </div>
                    </article>

                    <article ref={reveal} className="azh-card azh-card--wel" style={{ '--c': '#20b9f2' }}>
                        <div className="azh-card-text">
                            <span className="azh-card-icon"><Icon name="hand" size={22} /></span>
                            <h3>Accueil des membres</h3>
                            <p>Message de bienvenue, rôles automatiques et message privé à l'arrivée.</p>
                        </div>
                        <div className="azh-card-visual azh-v-welcome">
                            <div className="azh-welcome-banner">
                                <span className="azh-welcome-avatar">L</span>
                                <strong>Bienvenue Léa !</strong>
                                <small>Tu es le 843e membre</small>
                            </div>
                        </div>
                    </article>

                    {isIslamUnlocked ? (
                        <article ref={reveal} className="azh-card azh-card--isl" style={{ '--c': '#10b981' }}>
                            <div className="azh-card-text">
                                <span className="azh-card-icon"><Icon name="moon" size={22} /></span>
                                <h3>Prières & Coran</h3>
                                <p>Rappels des 5 prières et radio Coran 24/7.</p>
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
                    <h2>Prêt en moins d’une minute</h2>
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
                    <h2>Prêt à ajouter Azim ?</h2>
                    <p>Gratuit, sans inscription, configurable depuis Discord ou le panel.</p>
                    <div className="azh-cta">
                        <a className="azh-btn azh-btn--light" href={ADD_TO_SERVER_URL} target="_blank" rel="noreferrer">
                            <DiscordIcon /> Ajouter à Discord
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
