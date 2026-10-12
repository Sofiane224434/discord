import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const VALID_ISLAM_CODES = new Set(['islam', 'islam on', 'islam off', 'islammode', 'islam_mode']);

export function ThemeProvider({ children }) {
    const [isIslamUnlocked, setIsIslamUnlockedState] = useState(() => {
        return localStorage.getItem('azim_islam_unlocked') === 'true';
    });

    const [theme, setThemeState] = useState(() => {
        const unlocked = localStorage.getItem('azim_islam_unlocked') === 'true';
        if (!unlocked) return 'cyber';
        const saved = localStorage.getItem('azim_theme');
        return saved === 'cyber' ? 'cyber' : 'islam'; // islam par défaut quand débloqué
    });

    const [showUnlockModal, setShowUnlockModal] = useState(false);

    const setIsIslamUnlocked = (value) => {
        const boolVal = Boolean(value);
        setIsIslamUnlockedState(boolVal);
        localStorage.setItem('azim_islam_unlocked', boolVal ? 'true' : 'false');
        if (boolVal) {
            // "quand il est en mode islam il doit être mis par défaut"
            setThemeState('islam');
            localStorage.setItem('azim_theme', 'islam');
        } else {
            setThemeState('cyber');
            localStorage.setItem('azim_theme', 'cyber');
        }
    };

    useEffect(() => {
        // Appliquer l'attribut data-theme au document
        const currentTheme = isIslamUnlocked ? theme : 'cyber';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('azim_theme', currentTheme);

        // Mettre à jour le favicon dynamiquement
        const favicon = document.querySelector("link[rel*='icon']");
        if (favicon) {
            favicon.href = currentTheme === 'islam' ? '/favicon-islam.png' : '/favicon.png';
        }
    }, [theme, isIslamUnlocked]);

    const unlockIslam = (code) => {
        const normalized = String(code || '').trim().toLowerCase();
        if (VALID_ISLAM_CODES.has(normalized)) {
            setIsIslamUnlocked(true);
            setThemeState('islam');
            setShowUnlockModal(false);
            return { success: true };
        }
        return { success: false, error: 'Code secret invalide' };
    };

    const setTheme = (newTheme) => {
        if (!isIslamUnlocked) {
            setThemeState('cyber');
            return;
        }
        setThemeState(newTheme === 'islam' ? 'islam' : 'cyber');
    };

    const toggleTheme = () => {
        if (theme === 'islam') {
            setTheme('cyber');
        } else {
            setTheme('islam');
        }
    };

    const activeTheme = isIslamUnlocked && theme === 'islam' ? 'islam' : 'cyber';

    return (
        <ThemeContext.Provider
            value={{
                theme: activeTheme,
                isIslamUnlocked,
                setIsIslamUnlocked,
                setTheme,
                toggleTheme,
                unlockIslam,
                showUnlockModal,
                setShowUnlockModal,
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
