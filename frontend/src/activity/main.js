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
        video: 'Vidéo', loop: 'Boucle', preparing: 'Préparation de la vidéo…', videoFailed: 'Cette vidéo ne peut pas être lue pour le moment.',
    },
    en: {
        live: 'Live', connecting: 'Connecting to the live stream…', unmute: 'Turn sound on', mute: 'Mute',
        retry: 'Try again', failed: 'The live stream is not responding right now.', fullscreen: 'Full screen', camera: 'Camera',
        video: 'Video', loop: 'Loop', preparing: 'Preparing the video…', videoFailed: 'This video cannot be played right now.',
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
const liveBadge = document.querySelector('.act-live');
const loopBtn = document.getElementById('loop');
let loop = false;

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
    // Une seule source : pas de choix à afficher
    sourcesNav.hidden = SOURCES.length < 2;
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
    title.textContent = current.type === 'youtube' ? current.detail[lang] : `${current.label[lang]} · ${current.detail[lang]}`;
    liveBadge.hidden = current.type === 'youtube' && !current.isLive;
    loopBtn.hidden = current.type !== 'youtube' || current.isLive;
}

function renderLoop() {
    loopBtn.querySelector('span').textContent = t.loop;
    loopBtn.classList.toggle('act-btn--primary', loop);
    loopBtn.setAttribute('aria-pressed', String(loop));
}
loopBtn.addEventListener('click', () => { loop = !loop; renderLoop(); });

// Le flux est envoyé au fur et à mesure (pas de retour en arrière) : en boucle, on le redemande depuis le début
video.addEventListener('ended', () => {
    if (current.type === 'youtube' && loop) playFile(`${current.urls[0]}?r=${Date.now()}`);
});

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

// Vidéo YouTube : un fichier MP4 envoyé au fur et à mesure par le serveur d'Azim
function playFile(url) {
    if (hls) {
        hls.destroy();
        hls = null;
    }
    showState(t.preparing);
    video.src = url;
    video.play().catch(() => null);
}

function select(source) {
    current = source;
    urlIndex = 0;
    renderSources();
    if (source.type === 'youtube') playFile(source.urls[0]);
    else play(current.urls[0]);
}

video.addEventListener('playing', hideState);
video.addEventListener('waiting', () => showState(current.type === 'youtube' ? t.preparing : t.connecting));
video.addEventListener('error', () => {
    if (current.type === 'youtube') showState(t.videoFailed, { loading: false, retry: true });
});

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
    renderSound();

    // Vidéo demandée avec /lecture video dans ce salon vocal ? Sinon, La Mecque en direct.
    const channelId = params.get('channel_id');
    if (channelId) {
        renderSources();
        showState(t.preparing);
        try {
            const res = await fetch(`/api/system/activity/${encodeURIComponent(channelId)}`);
            const data = await res.json();
            if (data.type === 'youtube' && data.video?.id) {
                SOURCES.unshift({
                    id: 'youtube',
                    type: 'youtube',
                    isLive: Boolean(data.video.isLive),
                    label: { fr: t.video, en: t.video },
                    detail: { fr: data.video.title, en: data.video.title },
                    urls: [`/api/system/youtube/${data.video.id}/video`],
                });
                loop = Boolean(data.video.loop);
                renderLoop();
                return select(SOURCES[0]);
            }
            if (data.type === 'youtube' && data.error) {
                renderSources();
                return showState(`${t.videoFailed} (${data.error})`, { loading: false });
            }
        } catch (error) {
            console.warn('[Activité] Vidéo demandée :', error);
        }
    }
    select(SOURCES[0]);
}

start();
