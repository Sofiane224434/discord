// components/ScrollManager.jsx — remonte en haut à chaque changement de page,
// ou descend jusqu'à l'ancre (#section) quand l'URL en contient une.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollManager() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            // Laisse la page se rendre avant de chercher la section visée
            const timer = setTimeout(() => {
                const target = document.getElementById(decodeURIComponent(hash.slice(1)));
                if (target) {
                    const headerHeight = document.querySelector('.az-header')?.offsetHeight || 0;
                    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }, 60);
            return () => clearTimeout(timer);
        }
        window.scrollTo(0, 0);
        return undefined;
    }, [pathname, hash]);

    return null;
}

export default ScrollManager;
