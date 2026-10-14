import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Règle de la ligne de flottaison : aucun bloc ne doit être coupé par le bas du premier écran.
// Un bloc qui chevauche cette ligne est poussé juste en dessous (il reste donc entièrement visible
// ou entièrement sous la ligne). Recalculé à chaque page, redimensionnement ou chargement de contenu.
const BLOCKS = [
    '.ui-stat', '.ui-card', '.pnl-card', '.pnl-guild', '.fb-item', '.ui-empty',
    '.cf-card', '.cf-module', '.adm-row',
    '.st-cluster', '.st-clusters', '.st-metrics', '.pg-card', '.st-services', '.st-help',
    '.set-section', '.set-account', '.dc-live__item', '.dc-section', '.dc-pager', '.dc-help', '.dc-explore__cat',
    '.azh-window', '.azh-card', '.azh-ribbons', '.azh-steps',
].join(',');

const ATTR = 'data-fold-shift';
const GAP = 16;
const MAX_HEIGHT_RATIO = 0.85;

function applyFoldRule() {
    // Repart de la mise en page d'origine
    document.querySelectorAll(`[${ATTR}]`).forEach((el) => {
        el.style.marginTop = el.getAttribute(ATTR);
        el.removeAttribute(ATTR);
    });

    const fold = window.innerHeight;
    const main = document.querySelector('.draft-main') || document.body;
    const shifted = [];

    for (let pass = 0; pass < 12; pass += 1) {
        const crossing = [...main.querySelectorAll(BLOCKS)].find((el) => {
            if (shifted.some((done) => done.contains(el) || el.contains(done))) return false;
            const rect = el.getBoundingClientRect();
            const top = rect.top + window.scrollY;
            const bottom = top + rect.height;
            // Un bloc plus haut que l'écran ne peut pas tenir au-dessus : on regarde ses enfants
            return rect.height > 0 && rect.height <= fold * MAX_HEIGHT_RATIO && top < fold && bottom > fold;
        });
        if (!crossing) break;
        // Un titre posé juste au-dessus du bloc descend avec lui (jamais de titre seul au-dessus de la ligne)
        let target = crossing;
        // (le bloc peut être le premier élément d'une grille placée sous le titre)
        let anchor = crossing;
        while (!anchor.previousElementSibling && anchor.parentElement && anchor.parentElement !== main) anchor = anchor.parentElement;
        const heading = anchor.previousElementSibling;
        if (heading && /^H[1-4]$/.test(heading.tagName)
            && anchor.getBoundingClientRect().top - heading.getBoundingClientRect().bottom < 48) {
            target = heading;
        }
        target.setAttribute(ATTR, target.style.marginTop || '');
        // Les marges verticales voisines se fusionnent : on mesure à nouveau jusqu'à passer sous la ligne
        for (let attempt = 0; attempt < 4; attempt += 1) {
            const top = target.getBoundingClientRect().top + window.scrollY;
            if (top >= fold + GAP - 1) break;
            const current = parseFloat(getComputedStyle(target).marginTop) || 0;
            target.style.marginTop = `${current + (fold + GAP - top)}px`;
        }
        shifted.push(crossing);
    }
}

function FoldGuard() {
    const location = useLocation();

    useEffect(() => {
        let frame = 0;
        const schedule = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(applyFoldRule);
        };
        schedule();
        const timer = setTimeout(schedule, 600); // après les données et les animations d'apparition
        const observer = new ResizeObserver(schedule);
        const main = document.querySelector('.draft-main');
        if (main) observer.observe(main);
        // Sur mobile, la barre d'adresse change la hauteur pendant le défilement : on ne recalcule qu'au changement de largeur
        let width = window.innerWidth;
        const onResize = () => {
            if (window.innerWidth === width) return;
            width = window.innerWidth;
            schedule();
        };
        window.addEventListener('resize', onResize);
        return () => {
            cancelAnimationFrame(frame);
            clearTimeout(timer);
            observer.disconnect();
            window.removeEventListener('resize', onResize);
        };
    }, [location.pathname]);

    return null;
}

export default FoldGuard;
