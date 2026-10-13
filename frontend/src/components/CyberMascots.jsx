import React from 'react';

/**
 * CuteCircuitMascots
 * Header decorative ribbon with 3 adorable kawaii hardware components:
 * 1. Pink DIP microchip with smiley face
 * 2. Green QFP square chip with cute happy face
 * 3. Orange/brown cylindrical resistor with smiling face
 * plus connected cyan circuit traces.
 */
export function CuteCircuitHeader() {
    return (
        <svg
            className="cute-circuit-header-svg"
            viewBox="0 0 280 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Traces de circuit d'interconnexion */}
            <path d="M 0 22 L 45 22 L 65 12 L 85 12" stroke="#22d3ee" strokeWidth="2" opacity="0.7" />
            <path d="M 10 32 L 40 32 L 55 24 L 75 24" stroke="#0ea5e9" strokeWidth="1.5" opacity="0.6" />
            <path d="M 125 18 L 145 18" stroke="#22d3ee" strokeWidth="2" opacity="0.7" />
            <path d="M 185 20 L 205 20" stroke="#22d3ee" strokeWidth="2" opacity="0.7" />
            <path d="M 235 22 L 280 22" stroke="#22d3ee" strokeWidth="2" opacity="0.7" />

            {/* Vias / points de soudure */}
            <circle cx="45" cy="22" r="3" fill="#22d3ee" />
            <circle cx="135" cy="18" r="2.5" fill="#22d3ee" />
            <circle cx="195" cy="20" r="2.5" fill="#22d3ee" />
            <circle cx="250" cy="22" r="3" fill="#22d3ee" />

            {/* 1. COMPOSANT 1 : PUCE ROSE SOURIANTE (DIP CHIP) */}
            <g transform="translate(85, 4)">
                {/* Pins du haut et du bas */}
                <rect x="6" y="-3" width="3.5" height="4" fill="#94a3b8" rx="0.5" />
                <rect x="15" y="-3" width="3.5" height="4" fill="#94a3b8" rx="0.5" />
                <rect x="24" y="-3" width="3.5" height="4" fill="#94a3b8" rx="0.5" />
                <rect x="33" y="-3" width="3.5" height="4" fill="#94a3b8" rx="0.5" />

                <rect x="6" y="27" width="3.5" height="4" fill="#94a3b8" rx="0.5" />
                <rect x="15" y="27" width="3.5" height="4" fill="#94a3b8" rx="0.5" />
                <rect x="24" y="27" width="3.5" height="4" fill="#94a3b8" rx="0.5" />
                <rect x="33" y="27" width="3.5" height="4" fill="#94a3b8" rx="0.5" />

                {/* Corps de la puce rose */}
                <rect x="0" y="1" width="42" height="26" rx="5" fill="#f472b6" stroke="#db2777" strokeWidth="1.5" />

                {/* Reflet doux */}
                <path d="M 3 5 Q 21 2 39 5" stroke="#fbcfe8" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

                {/* Visage Kawaii : Yeux et Joues roses */}
                <circle cx="13" cy="13" r="2.2" fill="#1e1b4b" />
                <circle cx="29" cy="13" r="2.2" fill="#1e1b4b" />
                <circle cx="13.7" cy="12.3" r="0.8" fill="#ffffff" />
                <circle cx="29.7" cy="12.3" r="0.8" fill="#ffffff" />
                {/* Joues roses foncées */}
                <ellipse cx="10" cy="16" rx="2.5" ry="1.2" fill="#db2777" opacity="0.5" />
                <ellipse cx="32" cy="16" rx="2.5" ry="1.2" fill="#db2777" opacity="0.5" />
                {/* Sourire mignon */}
                <path d="M 18 15 Q 21 19 24 15" stroke="#1e1b4b" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>

            {/* 2. COMPOSANT 2 : PUCE VERTE CARRÉE (QFP CHIP) */}
            <g transform="translate(145, 3)">
                {/* Pins latéraux */}
                <rect x="-3" y="8" width="4" height="3" fill="#94a3b8" rx="0.5" />
                <rect x="-3" y="17" width="4" height="3" fill="#94a3b8" rx="0.5" />
                <rect x="29" y="8" width="4" height="3" fill="#94a3b8" rx="0.5" />
                <rect x="29" y="17" width="4" height="3" fill="#94a3b8" rx="0.5" />
                <rect x="8" y="-3" width="3" height="4" fill="#94a3b8" rx="0.5" />
                <rect x="19" y="-3" width="3" height="4" fill="#94a3b8" rx="0.5" />
                <rect x="8" y="27" width="3" height="4" fill="#94a3b8" rx="0.5" />
                <rect x="19" y="27" width="3" height="4" fill="#94a3b8" rx="0.5" />

                {/* Corps de la puce verte */}
                <rect x="0" y="0" width="30" height="28" rx="6" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5" />

                {/* Reflet doux */}
                <path d="M 4 4 L 26 4" stroke="#bbf7d0" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

                {/* Visage Kawaii souriant */}
                <circle cx="9" cy="13" r="2.2" fill="#064e3b" />
                <circle cx="21" cy="13" r="2.2" fill="#064e3b" />
                <circle cx="9.6" cy="12.3" r="0.7" fill="#ffffff" />
                <circle cx="21.6" cy="12.3" r="0.7" fill="#ffffff" />
                {/* Joues vertes douces */}
                <circle cx="7" cy="16" r="1.5" fill="#15803d" opacity="0.35" />
                <circle cx="23" cy="16" r="1.5" fill="#15803d" opacity="0.35" />
                {/* Sourire */}
                <path d="M 13 15 Q 15 18 17 15" stroke="#064e3b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>

            {/* 3. COMPOSANT 3 : RÉSISTANCE / CONDENSATEUR MIGNON */}
            <g transform="translate(205, 5)">
                {/* Pattes métalliques */}
                <line x1="8" y1="28" x2="8" y2="36" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                <line x1="16" y1="28" x2="16" y2="36" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

                {/* Corps orange/pêche */}
                <rect x="2" y="2" width="20" height="26" rx="5" fill="#fb923c" stroke="#c2410c" strokeWidth="1.5" />

                {/* Reflet */}
                <line x1="5" y1="5" x2="19" y2="5" stroke="#fed7aa" strokeWidth="1.5" strokeLinecap="round" />

                {/* Visage Kawaii */}
                <circle cx="8" cy="13" r="1.8" fill="#431407" />
                <circle cx="16" cy="13" r="1.8" fill="#431407" />
                <path d="M 10 16 Q 12 18.5 14 16" stroke="#431407" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            </g>
        </svg>
    );
}

/**
 * OscilloscopeWave
 * Glowing cyan sine wave / frequency pulse line with plug connector on left
 */
export function OscilloscopeWave({ count = 1 }) {
    return (
        <div className="oscilloscope-container">
            {/* Connecteur Prise à gauche */}
            <div className="oscilloscope-plug">
                <svg width="34" height="24" viewBox="0 0 34 24" fill="none">
                    <rect x="0" y="4" width="18" height="16" rx="4" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
                    {/* Éclair sur la prise */}
                    <path d="M 10 7 L 6 12 L 9 12 L 8 17 L 13 11 L 10 11 Z" fill="#67e8f9" />
                    {/* Broche métallique */}
                    <rect x="18" y="8" width="8" height="8" rx="2" fill="#1e3a8a" stroke="#2563eb" />
                    <line x1="26" y1="12" x2="34" y2="12" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>

            {/* Onde sinusoïdale lumineuse pulsante */}
            <div className="oscilloscope-wave-box">
                <svg className="oscilloscope-wave-svg" viewBox="0 0 240 40" fill="none" preserveAspectRatio="none">
                    <defs>
                        <filter id="waveNeon" x="-20%" y="-40%" width="140%" height="180%">
                            <feGaussianBlur stdDeviation="3.5" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {/* Ligne de base droite */}
                    <line x1="0" y1="20" x2="40" y2="20" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
                    {/* Onde sinusoïdale active */}
                    <path
                        className="oscilloscope-animated-path"
                        d="M 40 20 Q 60 -2, 80 20 T 120 20 T 160 20 T 200 20"
                        stroke="#22d3ee"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                        filter="url(#waveNeon)"
                    />
                    {/* Ligne d'arrivée droite */}
                    <line x1="200" y1="20" x2="240" y2="20" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>

            {/* Valeur numérique à droite */}
            <span className="oscilloscope-count">{count}</span>
        </div>
    );
}

/**
 * CuteRetroCrtMonitor
 * Retro CRT television monitor displaying animated green/cyan oscilloscope line
 */
export function CuteRetroCrtMonitor() {
    return (
        <div className="crt-monitor-wrapper">
            <svg
                className="crt-monitor-svg"
                viewBox="0 0 110 90"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Antennes V orientées vers le haut */}
                <line x1="45" y1="24" x2="24" y2="4" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="23" cy="3" r="2.5" fill="#38bdf8" />
                <line x1="65" y1="24" x2="86" y2="4" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="87" cy="3" r="2.5" fill="#38bdf8" />

                {/* Boîtier TV CRT (châssis bleu arrondi) */}
                <rect x="8" y="20" width="94" height="64" rx="14" fill="#0f2b48" stroke="#1d4e7f" strokeWidth="2.5" />
                {/* Pieds de la télé */}
                <rect x="22" y="83" width="10" height="5" rx="2" fill="#0a1a2e" stroke="#1d4e7f" />
                <rect x="78" y="83" width="10" height="5" rx="2" fill="#0a1a2e" stroke="#1d4e7f" />

                {/* Écran cathodique incurvé */}
                <rect x="16" y="27" width="62" height="50" rx="9" fill="#061927" stroke="#143c64" strokeWidth="1.5" />

                {/* Ligne de balayage / oscilloscope cardiaque EKG */}
                <path
                    className="crt-ekg-path"
                    d="M 20 52 L 34 52 L 39 40 L 44 64 L 49 34 L 54 58 L 58 52 L 74 52"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />

                {/* Reflet courbe verre cathodique */}
                <path
                    d="M 20 31 Q 47 28 74 31"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    opacity="0.3"
                />

                {/* Boutons et mollettes de réglage TV sur le côté droit */}
                <g transform="translate(86, 32)">
                    <circle cx="4" cy="6" r="4" fill="#1b4570" stroke="#38bdf8" strokeWidth="1" />
                    <line x1="4" y1="4" x2="4" y2="8" stroke="#ffffff" strokeWidth="1" opacity="0.6" />

                    <circle cx="4" cy="18" r="4" fill="#1b4570" stroke="#38bdf8" strokeWidth="1" />
                    <line x1="2" y1="18" x2="6" y2="18" stroke="#ffffff" strokeWidth="1" opacity="0.6" />

                    {/* Grille de haut-parleur */}
                    <line x1="1" y1="29" x2="7" y2="29" stroke="#1b4570" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="1" y1="34" x2="7" y2="34" stroke="#1b4570" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="1" y1="39" x2="7" y2="39" stroke="#1b4570" strokeWidth="1.5" strokeLinecap="round" />
                </g>
            </svg>
        </div>
    );
}

/**
 * CuteRobotMascot
 * Friendly robot with headset saying "Aucune erreur récente signalée. 😊"
 */
export function CuteRobotMascot({ message = 'Aucune erreur récente signalée. 😊' }) {
    return (
        <div className="cute-robot-row">
            {/* Avatar Robot */}
            <div className="cute-robot-avatar">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    {/* Antenne robot */}
                    <line x1="24" y1="4" x2="24" y2="10" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="24" cy="3" r="2.5" fill="#38bdf8" />

                    {/* Oreillettes / Casque audio */}
                    <rect x="4" y="19" width="5" height="13" rx="2.5" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" />
                    <rect x="39" y="19" width="5" height="13" rx="2.5" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" />
                    {/* Micro du casque */}
                    <path d="M 39 27 C 39 37, 28 39, 23 39" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <circle cx="22" cy="39" r="2" fill="#60a5fa" />

                    {/* Tête du robot (châssis blanc/argenté et bleu) */}
                    <rect x="8" y="11" width="32" height="27" rx="8" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />

                    {/* Visière écran sombre */}
                    <rect x="12" y="15" width="24" height="16" rx="5" fill="#0c2340" />

                    {/* Yeux bleus numériques heureux (forme d'arceau joyeux ^ ^) */}
                    <path d="M 16 23 Q 18.5 19 21 23" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <path d="M 27 23 Q 29.5 19 32 23" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" />

                    {/* Joues roses lumineuses */}
                    <ellipse cx="15" cy="27" rx="1.8" ry="0.9" fill="#f472b6" opacity="0.8" />
                    <ellipse cx="33" cy="27" rx="1.8" ry="0.9" fill="#f472b6" opacity="0.8" />
                </svg>
            </div>

            {/* Bulle de dialogue */}
            <div className="cute-robot-speech-bubble">
                <span>{message}</span>
            </div>
        </div>
    );
}
