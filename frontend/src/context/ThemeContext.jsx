import { createContext, useContext, useState, useEffect, useRef } from 'react';

const ThemeContext = createContext();

const KONAMI_SEQUENCE = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'b', 'a'
];

export function ThemeProvider({ children }) {
    // 1. Détecter si le code Konami a déjà été débloqué localement
    const [konamiUnlocked, setKonamiUnlocked] = useState(() => {
        return localStorage.getItem('azim_konami_unlocked') === 'true';
    });

    // 2. Détecter si l'utilisateur possède au moins un bot en mode Islam sur un de ses serveurs
    const [hasBotWithIslam, setHasBotWithIslam] = useState(false);

    // L'accès au mode Islam est autorisé UNIQUEMENT si l'utilisateur a un bot Islam OU a tapé le Konami code
    const isIslamUnlocked = Boolean(hasBotWithIslam || konamiUnlocked);

    // 3. Gestion du thème actif (visuel)
    // "le visuel islam sur le site se met de base que pour ceux qui ont un bot islam pas ceux qui n'en n'ont pas"
    const [theme, setThemeState] = useState(() => {
        // Au tout premier chargement sans info serveur, si débloqué par Konami on vérifie le choix utilisateur
        const isKonami = localStorage.getItem('azim_konami_unlocked') === 'true';
        if (isKonami) {
            const saved = localStorage.getItem('azim_theme');
            return saved === 'islam' ? 'islam' : 'cyber';
        }
        return 'cyber'; // Strictement cyber de base pour tout le monde
    });

    const [konamiToast, setKonamiToast] = useState(null);
    const keyHistoryRef = useRef([]);
    const wordBufferRef = useRef('');

    // Vérifier les serveurs de l'utilisateur au montage et après connexion
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setHasBotWithIslam(false);
            if (!konamiUnlocked) {
                setThemeState('cyber');
            }
            return;
        }

        fetch('/api/bot/overview', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                const hasIslamServer = (data?.guilds || []).some((g) => g.islamModeEnabled);
                setHasBotWithIslam(Boolean(hasIslamServer));

                if (hasIslamServer) {
                    // "le visuel islam sur le site se met de base que pour ceux qui ont un bot islam"
                    const saved = localStorage.getItem('azim_theme');
                    const chosen = saved === 'cyber' ? 'cyber' : 'islam'; // islam par défaut
                    setThemeState(chosen);
                } else if (!konamiUnlocked) {
                    // "enlève la possibilité de voir le theme islam et spiritualité dans le site si on a pas mis islam sur un de nos bot"
                    setThemeState('cyber');
                    localStorage.setItem('azim_theme', 'cyber');
                }
            })
            .catch(() => {
                if (!konamiUnlocked) {
                    setHasBotWithIslam(false);
                    setThemeState('cyber');
                }
            });
    }, [konamiUnlocked]);

    // Application du thème au document avec belle transition fluide
    useEffect(() => {
        const activeTheme = isIslamUnlocked ? theme : 'cyber';
        
        // Activer la transition fluide
        document.documentElement.classList.add('theme-transitioning');
        document.documentElement.setAttribute('data-theme', activeTheme);
        localStorage.setItem('azim_theme', activeTheme);

        const timer = setTimeout(() => {
            document.documentElement.classList.remove('theme-transitioning');
        }, 600);

        // Favicon dynamique
        const favicon = document.querySelector("link[rel*='icon']");
        if (favicon) {
            favicon.href = activeTheme === 'islam' ? '/favicon-islam.png' : '/favicon.png';
        }

        return () => clearTimeout(timer);
    }, [theme, isIslamUnlocked]);

    // ÉCOUTEUR GLOBAL CODE KONAMI & MOT-CLÉ "ISLAM"
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Ignorer la saisie si l'utilisateur tape dans un input, textarea ou contentEditable
            const tag = event.target?.tagName?.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || event.target?.isContentEditable) {
                return;
            }

            const key = event.key;

            // 1. Détection de la séquence Konami classique : ↑ ↑ ↓ ↓ ← → ← → B A
            const history = keyHistoryRef.current;
            history.push(key.toLowerCase());
            if (history.length > 20) {
                history.shift();
            }

            const konamiSlice = history.slice(-KONAMI_SEQUENCE.length);
            const matchesKonami = KONAMI_SEQUENCE.every(
                (targetKey, index) => targetKey.toLowerCase() === konamiSlice[index]
            );

            // 2. Détection du mot tapé "islam"
            wordBufferRef.current = (wordBufferRef.current + key.toLowerCase()).slice(-10);
            const matchesWordIslam = wordBufferRef.current.includes('islam');

            if (matchesKonami || matchesWordIslam) {
                wordBufferRef.current = '';
                keyHistoryRef.current = [];

                // Débloquer le mode Islam via Konami
                setKonamiUnlocked(true);
                localStorage.setItem('azim_konami_unlocked', 'true');

                // Si on était en cyber, basculer sur islam, sinon basculer ou confirmer
                setThemeState((prev) => {
                    const next = prev === 'islam' ? 'cyber' : 'islam';
                    triggerKonamiToast(
                        next === 'islam'
                            ? '🕌 Code Konami validé : Mode Islam & Spiritualité activé !'
                            : '⚡ Code Konami : Retour au thème Cyber standard.'
                    );
                    return next;
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const triggerKonamiToast = (message) => {
        setKonamiToast(message);
        setTimeout(() => {
            setKonamiToast(null);
        }, 4500);
    };

    const setTheme = (newTheme) => {
        if (!isIslamUnlocked) {
            setThemeState('cyber');
            localStorage.setItem('azim_theme', 'cyber');
            return;
        }
        const chosen = newTheme === 'islam' ? 'islam' : 'cyber';
        setThemeState(chosen);
        localStorage.setItem('azim_theme', chosen);
    };

    const toggleTheme = () => {
        if (!isIslamUnlocked) return;
        setTheme(theme === 'islam' ? 'cyber' : 'islam');
    };

    const unlockIslam = (code) => {
        const normalized = String(code || '').trim().toLowerCase();
        if (normalized === 'islam' || normalized === 'konami' || normalized === 'islammode') {
            setKonamiUnlocked(true);
            localStorage.setItem('azim_konami_unlocked', 'true');
            setThemeState('islam');
            triggerKonamiToast('🕌 Code secret validé : Thème Islam débloqué !');
            return { success: true };
        }
        return { success: false, error: 'Code secret invalide' };
    };

    const activeTheme = isIslamUnlocked && theme === 'islam' ? 'islam' : 'cyber';

    return (
        <ThemeContext.Provider
            value={{
                theme: activeTheme,
                isIslamUnlocked,
                hasBotWithIslam,
                konamiUnlocked,
                setTheme,
                toggleTheme,
                unlockIslam,
            }}
        >
            {children}

            {/* Notification Toast Konami flottante et élégante */}
            {konamiToast && (
                <div className="konami-toast" role="status" aria-live="polite">
                    <div className="konami-toast__content">
                        <span className="konami-toast__icon">✨</span>
                        <span className="konami-toast__message">{konamiToast}</span>
                    </div>
                </div>
            )}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
