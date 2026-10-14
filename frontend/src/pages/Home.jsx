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
        'IA /ask', 'Niveaux & XP', 'Modération', 'Accueil', 'YouTube', 'TikTok Live',
        'Rappels', 'Stats serveur', 'Quiz', 'Rappel bump',
        ...(isIslamUnlocked ? ['Horaires de prière', 'Coran', 'Radio 24/7', 'Qibla'] : []),
    ];

    const features = [
        {
            key: 'ai',
            size: 'wide',
            icon: 'sparkles',
            title: 'Une IA dans vos salons',
            desc: "Posez une question avec /ask : la réponse arrive en quelques secondes, propulsée par Groq. Idéal pour aider vos membres sans quitter Discord.",
            visual: (
                <div className="azh-mini-chat">
                    <div className="azh-mini-bubble is-user">/ask Explique-moi les promesses en JS</div>
                    <div className="azh-mini-bubble is-bot">
                        <span className="azh-typing"><i /><i /><i /></span>
                    </div>
                </div>
            ),
        },
        {
            key: 'levels',
            icon: 'activity',
            title: 'Niveaux & XP',
            desc: 'Classements, paliers et rôles attribués automatiquement aux membres les plus actifs.',
            visual: (
                <div className="azh-xp">
                    <div className="azh-xp-row"><span>Niv. 12</span><span>2 340 / 3 000 XP</span></div>
                    <div className="azh-xp-bar"><span /></div>
                </div>
            ),
        },
        {
            key: 'moderation',
            icon: 'shield',
            title: 'Modération',
            desc: 'Nettoyez un salon avec /purge, gérez les permissions et gardez une trace de tout.',
            visual: (
                <ul className="azh-log">
                    <li><b>/purge 50</b> · 50 messages supprimés</li>
                    <li><b>Permissions</b> · rôle Modo mis à jour</li>
                </ul>
            ),
        },
        {
            key: 'alerts',
            icon: 'megaphone',
            title: 'Alertes YouTube & TikTok',
            desc: "Une vidéo publiée, un live lancé ? Votre salon d'annonces est prévenu en temps réel.",
            visual: (
                <div className="azh-notif">
                    <span className="azh-notif-dot" />
                    <div>
                        <strong>Nouvelle vidéo</strong>
                        <small>@createur vient de publier</small>
                    </div>
                </div>
            ),
        },
        {
            key: 'welcome',
            icon: 'hand',
            title: 'Accueil & outils',
            desc: 'Messages de bienvenue, rappels, infos serveur et membres : le quotidien de votre communauté, simplifié.',
        },
        ...(isIslamUnlocked ? [{
            key: 'spiritual',
            size: 'wide',
            icon: 'moon',
            title: 'Prières, Coran & radio',
            desc: 'Horaires des 5 prières avec rappels automatiques, lecture du Coran et radio vocale 24h/24 parmi 22 récitateurs.',
            visual: (
                <div className="azh-prayers">
                    {[['Fajr', '06:42'], ['Dhuhr', '13:51'], ['Asr', '16:48'], ['Maghrib', '19:12'], ['Isha', '20:38']].map(([name, time], i) => (
                        <div key={name} className={i === 2 ? 'is-next' : ''}><small>{name}</small><b>{time}</b></div>
                    ))}
                </div>
            ),
        }] : []),
    ];

    const steps = [
        { n: '01', title: 'Invitez Azim', desc: 'Un clic sur « Ajouter à Discord » et choisissez votre serveur.' },
        { n: '02', title: 'Configurez', desc: 'Activez les modules qui vous intéressent depuis le dashboard ou avec /config.' },
        { n: '03', title: 'Profitez', desc: 'Vos membres découvrent les commandes slash, Azim s’occupe du reste.' },
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
                            Azim réunit l'IA, les niveaux, la modération et les alertes réseaux dans un seul bot
                            français et gratuit, simple à configurer et agréable à utiliser.
                        </p>
                        <div className="azh-cta">
                            <a className="azh-btn azh-btn--primary" href={ADD_TO_SERVER_URL} target="_blank" rel="noreferrer">
                                <DiscordIcon /> Ajouter à Discord
                            </a>
                            <Link className="azh-btn azh-btn--ghost" to="/docs/commandes">
                                Voir les commandes <Icon name="arrowRight" size={17} />
                            </Link>
                        </div>
                        <ul className="azh-facts">
                            <li><b>30+</b> commandes slash</li>
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

            {/* MODULES QUI DÉFILENT */}
            <div className="azh-marquee" aria-label="Modules disponibles">
                <div className="azh-marquee-track">
                    {[...modules, ...modules].map((m, i) => (
                        <span key={i} className="azh-chip" aria-hidden={i >= modules.length}>{m}</span>
                    ))}
                </div>
            </div>

            {/* FONCTIONNALITÉS EN GRILLE */}
            <section className="azh-section" id="features">
                <header className="azh-section-head" ref={reveal}>
                    <h2>Tout ce qu'il faut, rien de superflu</h2>
                    <p>Chaque module s'active en quelques secondes et se règle au détail près.</p>
                </header>

                <div className="azh-bento">
                    {features.map((f) => (
                        <article key={f.key} ref={reveal} className={`azh-card${f.size === 'wide' ? ' azh-card--wide' : ''}`}>
                            <div className="azh-card-icon"><Icon name={f.icon} size={22} /></div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                            {f.visual && <div className="azh-card-visual">{f.visual}</div>}
                        </article>
                    ))}
                </div>
            </section>

            {/* ÉTAPES */}
            <section className="azh-section azh-section--steps">
                <header className="azh-section-head" ref={reveal}>
                    <h2>Prêt en moins d'une minute</h2>
                </header>
                <ol className="azh-steps">
                    {steps.map((s) => (
                        <li key={s.n} ref={reveal} className="azh-step">
                            <span className="azh-step-n">{s.n}</span>
                            <h3>{s.title}</h3>
                            <p>{s.desc}</p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* APPEL À L'ACTION FINAL */}
            <section className="azh-final" ref={reveal}>
                <img src={logoSrc} alt="" className="azh-final-logo" />
                <div>
                    <h2>Donnez un coup de boost à votre communauté</h2>
                    <p>Ajoutez Azim gratuitement et configurez-le depuis le dashboard.</p>
                </div>
                <div className="azh-cta">
                    <a className="azh-btn azh-btn--primary" href={ADD_TO_SERVER_URL} target="_blank" rel="noreferrer">
                        <DiscordIcon /> Ajouter à Discord
                    </a>
                    <Link className="azh-btn azh-btn--ghost" to="/dashboard">Ouvrir le dashboard</Link>
                </div>
            </section>
        </div>
    );
}

export default Home;
