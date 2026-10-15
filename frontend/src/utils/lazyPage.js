// utils/lazyPage.js — chargement d'une page à la demande, résistant aux mises à jour du site.
// Après un déploiement, un onglet resté ouvert demande des fichiers de l'ancienne version, qui n'existent plus :
// on recharge alors la page une fois pour récupérer la nouvelle version (au lieu d'un écran vide).
import { lazy } from 'react';

const RELOAD_KEY = 'azim_chunk_reload';

export function lazyPage(factory) {
    return lazy(() => factory()
        .then((module) => {
            try { sessionStorage.removeItem(RELOAD_KEY); } catch { /* navigation privée */ }
            return module;
        })
        .catch((error) => {
            let alreadyReloaded = false;
            try {
                alreadyReloaded = sessionStorage.getItem(RELOAD_KEY) === '1';
                if (!alreadyReloaded) sessionStorage.setItem(RELOAD_KEY, '1');
            } catch { /* navigation privée */ }
            if (!alreadyReloaded) {
                window.location.reload();
                return new Promise(() => {}); // la page se recharge
            }
            throw error; // déjà rechargé : l'écran de secours (ErrorBoundary) prend le relais
        }));
}
