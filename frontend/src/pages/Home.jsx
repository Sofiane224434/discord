// pages/Home.jsx
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

function Home() {
    const { theme, isIslamUnlocked } = useTheme();

    const addToServerUrl = 'https://discord.com/oauth2/authorize?client_id=1462543984584032430&permissions=268823632&scope=bot%20applications.commands';

    // 1. Textes animés façon DraftBot (visibles / masqués en boucle)
    const activities = [
        "L'Intelligence Artificielle",
        "La Modération",
        "Les Niveaux",
        "L'Accueil & Rôles",
        "Les Statistiques",
        "Les Alertes Vidéo",
        ...(isIslamUnlocked ? ["Les Prières & Coran"] : [])
    ];

    const [activeIdx, setActiveIdx] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIdx((prev) => (prev + 1) % activities.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [activities.length]);

    // 2. Scroll reveal pour les blocs features
    const featureRefs = useRef([]);
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    }
                });
            },
            { threshold: 0.15 }
        );

        featureRefs.current.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const registerFeatureRef = (el) => {
        if (el && !featureRefs.current.includes(el)) {
            featureRefs.current.push(el);
        }
    };

    // Définition des showcases
    const showcases = [
        {
            key: 'ai',
            title: "Intelligence Artificielle",
            desc: "Posez n'importe quelle question avec /ask. Vos réponses sont générées en temps réel par le moteur Groq Llama 3, directement dans votre salon Discord.\nTout est instantané, fluide et intuitif. Alors échangez !",
            icon: "🧠",
            badgeText: "Groq Llama 3",
            subIcon: "🤖"
        },
        {
            key: 'levels',
            title: "Level & XP",
            desc: "Laissez vos membres se démarquer sur votre serveur grâce au système de niveaux et d'expérience personnalisable.\nVous pourrez afficher le classement, proposer des récompenses et attribuer automatiquement des rôles exclusifs aux paliers atteints !",
            icon: "🏆",
            badgeText: "Niveaux & Rangs",
            subIcon: "⭐"
        },
        {
            key: 'moderation',
            title: "Modération",
            desc: "Qui osera vous tenir tête avec Azim à vos côtés ?\nNettoyage de salon en un éclair avec /purge, journal de bord, gestion des permissions et filtres automatiques seront votre meilleure arme pour protéger votre communauté.",
            icon: "🛡️",
            badgeText: "Sécurité & Purge",
            subIcon: "⚡"
        },
        {
            key: 'alerts',
            title: "Alertes Réseaux",
            desc: "Ne manquez plus aucune sortie de vos créateurs préférés.\nSoyez notifié en temps réel sur Discord lors de la publication d'une nouvelle vidéo YouTube ou du lancement d'un live TikTok en reliant vos salons d'annonces.",
            icon: "📢",
            badgeText: "YouTube & TikTok",
            subIcon: "📺"
        },
        ...(isIslamUnlocked ? [
            {
                key: 'spiritual',
                title: "Prières & Coran",
                desc: "Offrez un espace spirituel et serein à votre serveur.\nHoraires des 5 prières quotidiennes avec notifications automatiques, lecture complète du Coran et diffusion vocale continue 24h/24 parmi 22 récitateurs renommés.",
                icon: "🕌",
                badgeText: "Audio 24/7",
                subIcon: "📖"
            }
        ] : [])
    ];

    // Couleur d'accent selon le thème
    const accentColor = theme === 'islam' ? '#10b981' : '#20b9f2';
    const accentDark = theme === 'islam' ? '#059669' : '#0284c7';
    const sectionBg = theme === 'islam' ? '#062319' : '#272b30';

    return (
        <div className="home-page" id="main" role="main" tabIndex="-1">
            {/* 1. HERO FAÇON DRAFTBOT AVEC LOGO CENTRAL & VAGUE ANIMÉE */}
            <div id="head" className="home-hero">
                <div className="bot-part">
                    <img
                        className="bot-logo"
                        src={theme === 'islam' ? '/icon-islam.png' : '/icon.png'}
                        alt="Logo AzimBot"
                    />

                    <div className="bot-title">
                        <p className="bot-description">Un bot pour</p>
                        <div id="annimated-texts" className="bot-activities">
                            {activities.map((act, index) => (
                                <span
                                    key={act}
                                    className={index === activeIdx ? 'visible' : ''}
                                >
                                    {act}
                                </span>
                            ))}
                        </div>
                    </div>

                    <a
                        className="bot-invite"
                        href={addToServerUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Ajouter à Discord"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                        <span>Ajouter à Discord</span>
                    </a>
                </div>

                {/* VAGUE INFINIE SVG EXACTEMENT COMME DRAFTBOT */}
                <div className="wave-container" aria-hidden="true">
                    <div className="wave">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="2064"
                            height="219"
                            fill="none"
                            id="azim-wave-source"
                            className="wave-part"
                        >
                            {/* Fond qui remplit le bas avec la couleur de la section suivante */}
                            <path
                                fill={sectionBg}
                                d="M.002 68.707C493.593-82.922 334.453 185.814 993.229 39.824 1652.02-106.152 1544.84 211.336 2064 68.707V219H.004z"
                            />
                            {/* Ruban principal en relief dégradé */}
                            <g filter="url(#azim-wave-shadow)">
                                <path
                                    fill="url(#azim-wave-grad)"
                                    d="M0 68.258C493.591-83.371 334.451 185.365 993.227 39.375 1652.02-106.601 1544.84 210.887 2063.99 68.258v42.405C1527.17 238.432 1651.83-64.69 993.046 81.292S513.158-28.399 0 110.663z"
                                />
                            </g>
                            {/* Ligne d'accent supérieure */}
                            <path
                                fill="url(#azim-wave-grad2)"
                                d="M.004 68.259C493.59-83.369 334.45 185.364 993.228 39.376 1652.02-106.602 1544.84 210.886 2064 68.259v17.238C1546.74 226.172 1632.45-85.507 973.668 60.475 324.297 204.372 475.6-53.906.004 85.497z"
                            />
                            <defs>
                                <linearGradient id="azim-wave-grad" x1="2066" x2="-8" y1="26" y2="18" gradientUnits="userSpaceOnUse">
                                    <stop stopColor={accentColor} />
                                    <stop offset="0.25" stopColor={accentDark} />
                                    <stop offset="0.5" stopColor={accentColor} />
                                    <stop offset="0.8" stopColor={accentDark} />
                                    <stop offset="1" stopColor={accentColor} />
                                </linearGradient>
                                <linearGradient id="azim-wave-grad2" x1="2064" x2="0" y1="68" y2="67" gradientUnits="userSpaceOnUse">
                                    <stop stopColor={accentDark} />
                                    <stop offset="0.25" stopColor={accentColor} />
                                    <stop offset="0.5" stopColor={accentDark} />
                                    <stop offset="0.8" stopColor={accentColor} />
                                    <stop offset="1" stopColor={accentDark} />
                                </linearGradient>
                                <filter id="azim-wave-shadow" width="2072" height="151" x="-4" y="0" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
                                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.4" />
                                </filter>
                            </defs>
                        </svg>
                        <svg className="wave-part"><use href="#azim-wave-source" /></svg>
                        <svg className="wave-part"><use href="#azim-wave-source" /></svg>
                    </div>
                </div>
            </div>

            {/* 2. SHOWCASES ALTERNÉS GAUCHE/DROITE FAÇON DRAFTBOT */}
            <div className="features">
                <div className="features__content">
                    {showcases.map((feat) => (
                        <div
                            key={feat.key}
                            ref={registerFeatureRef}
                            className="feature"
                        >
                            {/* Image / Illustration graphique circulaire avec l'icône du bot */}
                            <div className="image">
                                <div className="feature-circle-badge">
                                    <div className="feature-circle-inner">
                                        <span style={{ fontSize: '48px', lineHeight: 1 }}>{feat.icon}</span>
                                        <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', fontFamily: 'monospace' }}>
                                            {feat.badgeText}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contenu textuel avec GRAND TITRE en majuscules */}
                            <div className="content">
                                <div className="title">
                                    <h2>{feat.title}</h2>
                                </div>
                                <p className="description" style={{ whiteSpace: 'pre-line' }}>
                                    {feat.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Home;