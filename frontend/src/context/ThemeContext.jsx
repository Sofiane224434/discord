import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { managesIslamGuild } from './islamAccess.js';

const ThemeContext = createContext();

// Choix fait par l'utilisateur lui-même ('cyber' ou 'islam'). Absent = pas de choix :
// le thème islam devient alors le thème par défaut dès qu'il est débloqué.
const CHOICE_KEY = 'azim_theme_choice';
const ISLAM_KEY = 'azim_has_islam_bot';
const readChoice = () => localStorage.getItem(CHOICE_KEY);

// Anciennes façons de débloquer le thème (code secret, Konami) : supprimées
localStorage.removeItem('azim_konami_unlocked');

export function ThemeProvider({ children }) {
    const { user } = useAuth();
    const [hasBotWithIslam, setHasBotWithIslam] = useState(() => localStorage.getItem(ISLAM_KEY) === 'true');
    const [choice, setChoice] = useState(readChoice);

    const isIslamUnlocked = Boolean(user && hasBotWithIslam);
    // Islam par défaut quand il est débloqué, sauf si la personne a choisi le thème Cyber
    const activeTheme = isIslamUnlocked && choice !== 'cyber' ? 'islam' : 'cyber';

    const setIsIslamUnlocked = useCallback((unlocked) => {
        if (unlocked) localStorage.setItem(ISLAM_KEY, 'true');
        else localStorage.removeItem(ISLAM_KEY);
        setHasBotWithIslam(Boolean(unlocked));
    }, []);

    // Recalcule l'accès à chaque connexion / déconnexion
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!user || !token) {
            // Déconnecté : le thème islam est déjà coupé (isIslamUnlocked dépend de user)
            localStorage.removeItem(ISLAM_KEY);
            return undefined;
        }
        let cancelled = false;
        fetch('/api/bot/overview', { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!cancelled && data) setIsIslamUnlocked(managesIslamGuild(data.guilds));
            })
            .catch(() => {
                // Erreur réseau : on garde la dernière valeur connue
            });
        return () => { cancelled = true; };
    }, [user, setIsIslamUnlocked]);

    // Application du thème au document avec transition fluide
    useEffect(() => {
        document.documentElement.classList.add('theme-transitioning');
        document.documentElement.setAttribute('data-theme', activeTheme);
        const timer = setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 600);

        const favicon = document.querySelector("link[rel*='icon']");
        if (favicon) favicon.href = activeTheme === 'islam' ? '/favicon-islam.png' : '/favicon.png';

        return () => clearTimeout(timer);
    }, [activeTheme]);

    const setTheme = (newTheme) => {
        if (!isIslamUnlocked) return;
        const chosen = newTheme === 'islam' ? 'islam' : 'cyber';
        localStorage.setItem(CHOICE_KEY, chosen);
        setChoice(chosen);
    };

    const toggleTheme = () => setTheme(activeTheme === 'islam' ? 'cyber' : 'islam');

    return (
        <ThemeContext.Provider
            value={{
                theme: activeTheme,
                isIslamUnlocked,
                hasBotWithIslam,
                setTheme,
                setIsIslamUnlocked,
                toggleTheme,
            }}
        >
            {children}
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
