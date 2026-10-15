// Activité Discord « La Mecque en direct » : le direct de Masjid al-Haram (ou de Médine) dans un salon vocal.
// Discord n'autorise pas les bots à partager leur écran ; une Activité est la façon prévue pour regarder ensemble.
// Dans Discord, toutes les requêtes passent par le proxy discordsays.com : les flux vidéo y sont déclarés
// (portail développeur > Activities > URL Mappings) et patchUrlMappings redirige les requêtes du lecteur.
import Hls from 'hls.js/light';
import { DiscordSDK, patchUrlMappings } from '@discord/embedded-app-sdk';
import { DISCORD_CLIENT_ID } from '../config/links.js';
import './activity.css';

// Chaque source a un flux principal (720p) et un flux de secours
const SOURCES = [
    {
        id: 'mecque',
        label: { fr: 'La Mecque', en: 'Mecca' },
        detail: { fr: 'Masjid al-Haram', en: 'Masjid al-Haram' },
        urls: [
            'https://win.holol.com/live/quran/playlist.m3u8',
            'https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8',
        ],
    },
    {
        id: 'medine',
        label: { fr: 'Médine', en: 'Medina' },
        detail: { fr: 'Masjid an-Nabawi', en: 'Masjid an-Nabawi' },
        urls: [
            'https://win.holol.com/live/sunnah/playlist.m3u8',
            'https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/index.m3u8',
        ],
    },
];

// Préfixes à déclarer à l'identique dans les URL Mappings du portail Discord
const URL_MAPPINGS = [
    { prefix: '/flux-holol', target: 'win.holol.com' },
    { prefix: '/flux-globecast', target: 'cdn-globecast.akamaized.net' },
];

const TEXT = {
    fr: {
        live: 'En direct', connecting: 'Connexion au direct…', unmute: 'Activer le son', mute: 'Couper le son',
        retry: 'Réessayer', failed: 'Le direct ne répond pas pour le moment.', fullscreen: 'Plein écran', camera: 'Caméra',
    },
    en: {
        live: 'Live', connecting: 'Connecting to the live stream…', unmute: 'Turn sound on', mute: 'Mute',
        retry: 'Try again', failed: 'The live stream is not responding right now.', fullscreen: 'Full screen', camera: 'Camera',
    },
};

const params = new URLSearchParams(window.location.search);
const inDiscord = params.has('frame_id');
const lang = (params.get('locale') || navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en';
const t = TEXT[lang];

const video = document.getElementById('video');
const stateBox = document.getElementById('state');
const stateText = document.getElementById('state-text');
const retryBtn = document.getElementById('retry');
const soundBtn = document.getElementById('sound');
const sourcesNav = document.getElementById('sources');
const title = document.getElementById('title');

let hls = null;
let current = SOURCES[0];
let urlIndex = 0;

document.documentElement.lang = lang;
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t[el.dataset.t] || el.textContent; });
document.getElementById('fullscreen').setAttribute('aria-label', t.fullscreen);
sourcesNav.setAttribute('aria-label', t.camera);

function showState(text, { loading = true, retry = false } = {}) {
    stateBox.hidden = false;
    stateBox.classList.toggle('is-loading', loading);
    stateText.textContent = text;
    retryBtn.hidden = !retry;
}

function hideState() {
    stateBox.hidden = true;
}

function renderSources() {
    sourcesNav.replaceChildren(...SOURCES.map((source) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `act-source${source.id === current.id ? ' is-active' : ''}`;
        button.setAttribute('aria-pressed', String(source.id === current.id));
        const name = document.createElement('strong');
        name.textContent = source.label[lang];
        const detail = document.createElement('small');
        detail.textContent = source.detail[lang];
        button.append(name, detail);
        button.addEventListener('click', () => select(source));
        return button;
    }));
    title.textContent = `${current.label[lang]} · ${current.detail[lang]}`;
}

function play(url) {
    if (hls) {
        hls.destroy();
        hls = null;
    }
    showState(t.connecting);

    if (Hls.isSupported()) {
        hls = new Hls({ liveSyncDurationCount: 3, enableWorker: true });
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => null));
        hls.on(Hls.Events.ERROR, (_event, data) => {
            if (!data.fatal) return;
            // Flux principal en panne : flux de secours, sinon message et bouton « Réessayer »
            if (urlIndex < current.urls.length - 1) {
                urlIndex += 1;
                play(current.urls[urlIndex]);
            } else {
                showState(t.failed, { loading: false, retry: true });
            }
        });
        hls.loadSource(url);
        hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari / iOS lisent le HLS directement
        video.src = url;
        video.play().catch(() => null);
    } else {
        showState(t.failed, { loading: false });
    }
}

function select(source) {
    current = source;
    urlIndex = 0;
    renderSources();
    play(current.urls[0]);
}

video.addEventListener('playing', hideState);
video.addEventListener('waiting', () => showState(t.connecting));

retryBtn.addEventListener('click', () => select(current));

// Lecture automatique sans son (règle des navigateurs) : le son s'active d'un clic
function renderSound() {
    soundBtn.querySelector('span').textContent = video.muted ? t.unmute : t.mute;
    soundBtn.classList.toggle('act-btn--primary', video.muted);
}
soundBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    if (!video.muted) video.play().catch(() => null);
    renderSound();
});

document.getElementById('fullscreen').addEventListener('click', () => {
    const root = document.getElementById('activity');
    if (document.fullscreenElement) document.exitFullscreen().catch(() => null);
    else root.requestFullscreen?.().catch(() => null);
});

async function start() {
    if (inDiscord) {
        patchUrlMappings(URL_MAPPINGS);
        try {
            const sdk = new DiscordSDK(DISCORD_CLIENT_ID);
            await sdk.ready();
        } catch (error) {
            console.warn('[Activité] SDK Discord :', error);
        }
    }
    renderSources();
    renderSound();
    play(current.urls[0]);
}

start();
