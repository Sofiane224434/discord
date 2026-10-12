import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const VALID_ISLAM_CODES = new Set(['islam', 'islam on', 'islam off', 'islammode', 'islam_mode']);

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        return localStorage.getItem('azim_theme') || 'cyber';
    });

    const [isIslamUnlocked, setIsIslamUnlockedState] = useState(() => {
        return localStorage.getItem('azim_islam_unlocked') === 'true';
    });

    const [showUnlockModal, setShowUnlockModal] = useState(false);

    const setIsIslamUnlocked = (value) => {
        const boolVal = Boolean(value);
        setIsIslamUnlockedState(boolVal);
        localStorage.setItem('azim_islam_unlocked', boolVal ? 'true' : 'false');
    };

    useEffect(() => {
        // Appliquer l'attribut data-theme au document
        const currentTheme = isIslamUnlocked && theme === 'islam' ? 'islam' : 'cyber';
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
        if (newTheme === 'islam') {
            if (!isIslamUnlocked) {
                setShowUnlockModal(true);
                return;
            }
            setThemeState('islam');
        } else {
            setThemeState('cyber');
        }
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
