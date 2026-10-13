import React from 'react';

/**
 * MotherboardBackground
 * Recreates the intricate cyberpunk circuit board / motherboard artwork in pure vector SVG & CSS.
 * Includes perspective grid floor, CPU chips with bus traces, server blade racks,
 * cooling fan grills, bundled cables with metallic clips, and pulsing LED status lights.
 */
export function MotherboardBackground() {
    return (
        <div className="cyber-motherboard-bg" aria-hidden="true">
            <svg
                className="cyber-motherboard-svg"
                viewBox="0 0 1920 1080"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    {/* Gradients pour les câbles */}
                    <linearGradient id="cableTeal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                    <linearGradient id="cablePurple" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                    <linearGradient id="cablePink" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f472b6" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#db2777" />
                    </linearGradient>
                    <linearGradient id="cableLime" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a3e635" />
                        <stop offset="50%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                    <linearGradient id="cableOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="50%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>

                    {/* Gradient pour les puces et composants */}
                    <linearGradient id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#143152" />
                        <stop offset="100%" stopColor="#0a1a2e" />
                    </linearGradient>
                    <linearGradient id="chipHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#0e2844" stopOpacity="0.1" />
                    </linearGradient>

                    {/* Glow Filter pour les traces et LEDs */}
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* 1. FOND CARTE MÈRE ET GRILLE PERSPECTIVE */}
                <rect width="1920" height="1080" fill="#061325" />
                <rect width="1920" height="1080" fill="url(#chipGrad)" opacity="0.65" />

                {/* Grille de perspective sol (Partie basse) */}
                <g stroke="#0f3d68" strokeWidth="1" opacity="0.55">
                    {/* Lignes horizontales perspective */}
                    <line x1="0" y1="840" x2="1920" y2="840" strokeOpacity="0.3" />
                    <line x1="0" y1="890" x2="1920" y2="890" strokeOpacity="0.4" />
                    <line x1="0" y1="945" x2="1920" y2="945" strokeOpacity="0.55" />
                    <line x1="0" y1="1005" x2="1920" y2="1005" strokeOpacity="0.75" />
                    <line x1="0" y1="1070" x2="1920" y2="1070" strokeOpacity="0.9" />

                    {/* Lignes verticales de perspective convergeant vers l'horizon */}
                    <line x1="0" y1="1080" x2="400" y2="800" />
                    <line x1="160" y1="1080" x2="480" y2="800" />
                    <line x1="340" y1="1080" x2="580" y2="800" />
                    <line x1="530" y1="1080" x2="680" y2="800" />
                    <line x1="720" y1="1080" x2="780" y2="800" />
                    <line x1="910" y1="1080" x2="900" y2="800" />
                    <line x1="1080" y1="1080" x2="1020" y2="800" />
                    <line x1="1260" y1="1080" x2="1140" y2="800" />
                    <line x1="1450" y1="1080" x2="1260" y2="800" />
                    <line x1="1650" y1="1080" x2="1370" y2="800" />
                    <line x1="1840" y1="1080" x2="1480" y2="800" />
                    <line x1="1920" y1="1020" x2="1570" y2="800" />
                </g>

                {/* 2. CIRCUITS IMPRIMÉS & TRACES (Motherboard Traces) */}
                <g stroke="#1a5280" strokeWidth="2" fill="none" opacity="0.6">
                    {/* Traces en haut à gauche */}
                    <path d="M 60 120 L 160 120 L 220 180 L 220 280 L 320 380 L 450 380" />
                    <path d="M 80 140 L 170 140 L 240 210 L 240 300 L 340 400 L 480 400" />
                    <path d="M 120 80 L 200 80 L 270 150 L 270 240 L 370 340 L 510 340" />

                    {/* Pistes bus vers le grand CPU */}
                    <path d="M 380 180 L 480 180 L 530 230 L 530 300" />
                    <path d="M 400 200 L 490 200 L 545 255 L 545 300" />
                    <path d="M 360 220 L 470 220 L 515 265 L 515 300" />

                    {/* Traces sous le CPU central */}
                    <path d="M 490 440 L 490 520 L 420 590 L 300 590 L 250 640 L 250 780" />
                    <path d="M 520 440 L 520 540 L 450 610 L 320 610 L 270 660 L 270 800" />
                    <path d="M 550 440 L 550 560 L 480 630 L 350 630 L 300 680 L 300 820" />

                    {/* Traces bas-centre et droite */}
                    <path d="M 980 640 L 1150 640 L 1220 710 L 1380 710" />
                    <path d="M 1020 670 L 1170 670 L 1240 740 L 1420 740" />
                    <path d="M 1000 700 L 1190 700 L 1260 770 L 1450 770" />
                </g>

                {/* Traces lumineuses avec pulse cyan */}
                <g stroke="#22d3ee" strokeWidth="1.5" fill="none" opacity="0.45" filter="url(#subtleGlow)">
                    <path d="M 240 210 L 240 300 L 340 400 L 480 400" />
                    <path d="M 520 440 L 520 540 L 450 610 L 320 610 L 270 660 L 270 800" />
                    <path d="M 980 640 L 1150 640 L 1220 710 L 1380 710" />
                    <path d="M 1520 320 L 1600 320 L 1650 370 L 1650 500" />
                </g>

                {/* 3. POINTS DE SOUDURE / VIAS (Small circular pads) */}
                <g fill="#1a5280" opacity="0.8">
                    <circle cx="60" cy="120" r="3.5" />
                    <circle cx="80" cy="140" r="3.5" />
                    <circle cx="120" cy="80" r="3.5" />
                    <circle cx="380" cy="180" r="3.5" />
                    <circle cx="400" cy="200" r="3.5" />
                    <circle cx="360" cy="220" r="3.5" />
                    <circle cx="250" cy="780" r="3.5" />
                    <circle cx="270" cy="800" r="3.5" />
                    <circle cx="300" cy="820" r="3.5" />
                    <circle cx="1380" cy="710" r="3.5" />
                    <circle cx="1420" cy="740" r="3.5" />
                    <circle cx="1450" cy="770" r="3.5" />
                </g>
                <g fill="#22d3ee" opacity="0.75" filter="url(#subtleGlow)">
                    <circle cx="480" cy="400" r="3" />
                    <circle cx="530" cy="300" r="3" />
                    <circle cx="450" cy="610" r="3" />
                    <circle cx="1150" cy="640" r="3" />
                    <circle cx="1650" cy="500" r="3" />
                </g>

                {/* 4. GRAND MICROPROCESSEUR CPU (Gauche) */}
                <g transform="translate(470, 260)">
                    {/* Pins du CPU */}
                    {[-10, 5, 20, 35, 50, 65, 80, 95, 110, 125].map((pos, idx) => (
                        <React.Fragment key={idx}>
                            <rect x={pos} y="-12" width="5" height="14" fill="#1b4670" />
                            <rect x={pos} y="138" width="5" height="14" fill="#1b4670" />
                            <rect x="-12" y={pos} width="14" height="5" fill="#1b4670" />
                            <rect x="138" y={pos} width="14" height="5" fill="#1b4670" />
                        </React.Fragment>
                    ))}
                    {/* Corps principal CPU */}
                    <rect x="0" y="0" width="140" height="140" rx="10" fill="#0b223c" stroke="#1c558c" strokeWidth="3" />
                    <rect x="15" y="15" width="110" height="110" rx="6" fill="#081b30" stroke="#16436f" strokeWidth="1.5" />
                    {/* Reflet diagonal CPU */}
                    <path d="M 20 20 L 120 120" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.25" />
                    {/* Écriture gravée CPU */}
                    <text x="70" y="72" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold" opacity="0.75">
                        AZIM-X9
                    </text>
                    <text x="70" y="86" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace" opacity="0.6">
                        OCTA-CORE AI
                    </text>
                    {/* Indicateur d'encoche */}
                    <circle cx="28" cy="28" r="3.5" fill="#1c558c" />
                </g>

                {/* Deuxième CPU plus bas */}
                <g transform="translate(580, 720)">
                    {[-8, 6, 20, 34, 48, 62, 76, 90].map((pos, idx) => (
                        <React.Fragment key={idx}>
                            <rect x={pos} y="-8" width="4" height="10" fill="#1b4670" />
                            <rect x={pos} y="98" width="4" height="10" fill="#1b4670" />
                            <rect x="-8" y={pos} width="10" height="4" fill="#1b4670" />
                            <rect x="98" y={pos} width="10" height="4" fill="#1b4670" />
                        </React.Fragment>
                    ))}
                    <rect x="0" y="0" width="100" height="100" rx="8" fill="#0b223c" stroke="#1c558c" strokeWidth="2" />
                    <rect x="12" y="12" width="76" height="76" rx="4" fill="#081b30" stroke="#16436f" strokeWidth="1" />
                    <text x="50" y="54" textAnchor="middle" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold" opacity="0.6">
                        NEURAL BUS
                    </text>
                </g>

                {/* 5. CAPACITEURS ET CONDENSATEURS ÉLECTRONIQUES */}
                <g>
                    {/* Paire de condensateurs cylindriques haut */}
                    <rect x="420" y="90" width="22" height="34" rx="4" fill="#0e2947" stroke="#1e588d" strokeWidth="2" />
                    <line x1="420" y1="102" x2="442" y2="102" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
                    <rect x="450" y="90" width="22" height="34" rx="4" fill="#0e2947" stroke="#1e588d" strokeWidth="2" />
                    <line x1="450" y1="102" x2="472" y2="102" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />

                    {/* Condensateurs bas */}
                    <rect x="1220" y="735" width="24" height="38" rx="4" fill="#0e2947" stroke="#1e588d" strokeWidth="2" />
                    <line x1="1220" y1="748" x2="1244" y2="748" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
                    <rect x="1255" y="735" width="24" height="38" rx="4" fill="#0e2947" stroke="#1e588d" strokeWidth="2" />
                    <line x1="1255" y1="748" x2="1279" y2="748" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
                </g>

                {/* 6. SERVEURS & RACKS BLADES (Droite) */}
                <g transform="translate(1300, 110)">
                    {/* Baie de rack serveur 1 */}
                    <rect x="0" y="0" width="280" height="42" rx="4" fill="#0c243f" stroke="#1c4d7d" strokeWidth="2" />
                    <circle cx="20" cy="21" r="5" fill="#081a2e" stroke="#1c4d7d" />
                    <rect x="40" y="10" width="180" height="22" rx="2" fill="#071727" stroke="#163e66" />
                    {/* Trous de ventilation */}
                    {[50, 65, 80, 95, 110, 125, 140, 155, 170, 185, 200].map((x, i) => (
                        <circle key={i} cx={x} cy="21" r="2" fill="#143e69" />
                    ))}
                    {/* Voyants LED serveur */}
                    <circle cx="240" cy="21" r="3" fill="#22c55e" filter="url(#subtleGlow)" />
                    <circle cx="255" cy="21" r="3" fill="#38bdf8" filter="url(#subtleGlow)" />

                    {/* Baie de rack serveur 2 */}
                    <rect x="0" y="52" width="280" height="42" rx="4" fill="#0c243f" stroke="#1c4d7d" strokeWidth="2" />
                    <circle cx="20" cy="73" r="5" fill="#081a2e" stroke="#1c4d7d" />
                    <rect x="40" y="62" width="180" height="22" rx="2" fill="#071727" stroke="#163e66" />
                    {[50, 65, 80, 95, 110, 125, 140, 155, 170, 185, 200].map((x, i) => (
                        <circle key={i} cx={x} cy="73" r="2" fill="#143e69" />
                    ))}
                    <circle cx="240" cy="73" r="3" fill="#22c55e" filter="url(#subtleGlow)" />
                    <circle cx="255" cy="73" r="3" fill="#f59e0b" filter="url(#subtleGlow)" />

                    {/* Baie de rack serveur 3 (Bas) */}
                    <rect x="0" y="104" width="280" height="38" rx="4" fill="#0a1f37" stroke="#18436e" strokeWidth="1.5" />
                    <rect x="40" y="112" width="180" height="20" rx="2" fill="#071727" />
                    <circle cx="240" cy="123" r="3" fill="#22c55e" filter="url(#subtleGlow)" />
                </g>

                {/* 7. VENTILATEUR DE REFROIDISSEMENT (Cooling Fan) */}
                <g transform="translate(1080, 50)">
                    <rect x="0" y="0" width="140" height="140" rx="8" fill="#0c2541" stroke="#1d4e7f" strokeWidth="2" />
                    <circle cx="70" cy="70" r="54" fill="#08182b" stroke="#184570" strokeWidth="2" />
                    {/* Moyeu central */}
                    <circle cx="70" cy="70" r="18" fill="#102f50" stroke="#2564a2" strokeWidth="1.5" />
                    {/* Pales du ventilateur */}
                    <path d="M 70 52 C 82 35 100 45 92 60 Z" fill="#0e2844" />
                    <path d="M 88 70 C 105 82 95 100 80 92 Z" fill="#0e2844" />
                    <path d="M 70 88 C 58 105 40 95 48 80 Z" fill="#0e2844" />
                    <path d="M 52 70 C 35 58 45 40 60 48 Z" fill="#0e2844" />
                    {/* Grille de protection */}
                    <circle cx="70" cy="70" r="42" fill="none" stroke="#16436f" strokeWidth="1" strokeDasharray="4 4" />
                </g>

                {/* 8. GRILLE D'AÉRATION MÉTALLIQUE (Vents) */}
                <g transform="translate(1340, 420)">
                    <rect x="0" y="0" width="180" height="180" rx="10" fill="#0c243e" stroke="#1d4f80" strokeWidth="2.5" />
                    <rect x="12" y="12" width="156" height="156" rx="6" fill="#08192b" stroke="#143c63" strokeWidth="1.5" />
                    {/* Lamelles d'aération */}
                    {[28, 48, 68, 88, 108, 128, 148].map((y, i) => (
                        <rect key={i} x="24" y={y} width="132" height="10" rx="2" fill="#051221" stroke="#103254" strokeWidth="1" />
                    ))}
                    {/* Vis aux quatre coins */}
                    <circle cx="6" cy="6" r="3" fill="#1b4670" />
                    <circle cx="174" cy="6" r="3" fill="#1b4670" />
                    <circle cx="6" cy="174" r="3" fill="#1b4670" />
                    <circle cx="174" cy="174" r="3" fill="#1b4670" />
                </g>

                {/* 9. PORTS ET PRISES RJ45 / HDMI */}
                <g transform="translate(860, 40)">
                    <rect x="0" y="0" width="55" height="280" rx="6" fill="#0c243f" stroke="#1c4d7e" strokeWidth="2" />
                    {/* Port RJ45 Ethernet */}
                    <rect x="12" y="30" width="31" height="28" rx="2" fill="#071627" stroke="#1b4b7a" strokeWidth="1.5" />
                    <rect x="18" y="38" width="19" height="14" fill="#030b14" />
                    {/* Port HDMI */}
                    <rect x="12" y="80" width="31" height="18" rx="2" fill="#071627" stroke="#1b4b7a" strokeWidth="1.5" />
                    {/* Port USB vertical */}
                    <rect x="12" y="125" width="31" height="15" rx="1" fill="#071627" stroke="#1b4b7a" strokeWidth="1.5" />
                    <rect x="15" y="128" width="12" height="9" fill="#1e4e7e" />
                    {/* Voyants de statut des ports */}
                    <circle cx="28" cy="170" r="3" fill="#22c55e" filter="url(#subtleGlow)" />
                    <circle cx="28" cy="190" r="3" fill="#38bdf8" filter="url(#subtleGlow)" />
                </g>

                {/* 10. FAISCEAUX DE CÂBLES COLORÉS (Gauche et Droite) */}
                {/* GROUPE GAUCHE : Câbles émergeant du bord gauche vers le centre */}
                <g strokeWidth="9" strokeLinecap="round" fill="none">
                    {/* Câbles bleu/cyan */}
                    <path
                        d="M -30 20 C 140 60, 180 280, 20 480"
                        stroke="url(#cableTeal)"
                        className="cyber-cable-glow"
                    />
                    <path
                        d="M -20 180 C 110 240, 130 420, -10 620"
                        stroke="url(#cableTeal)"
                    />
                    {/* Câbles violet / pourpre */}
                    <path
                        d="M -40 300 C 160 380, 140 680, 10 900"
                        stroke="url(#cablePurple)"
                        className="cyber-cable-glow"
                    />
                    <path
                        d="M -30 400 C 120 460, 100 750, 40 980"
                        stroke="url(#cablePurple)"
                    />
                    {/* Câbles rose / magenta */}
                    <path
                        d="M -20 80 C 190 120, 150 480, 80 720"
                        stroke="url(#cablePink)"
                    />
                    {/* Câbles vert pomme */}
                    <path
                        d="M -20 540 C 90 600, 70 820, 140 1020"
                        stroke="url(#cableLime)"
                    />
                    {/* Attaches / colliers de serrage métalliques sur le faisceau gauche */}
                    <g fill="#0b223c" stroke="#38bdf8" strokeWidth="1.5">
                        <rect x="65" y="240" width="18" height="28" rx="4" transform="rotate(-15 65 240)" />
                        <rect x="85" y="520" width="18" height="30" rx="4" transform="rotate(10 85 520)" />
                        <rect x="50" y="760" width="18" height="26" rx="4" transform="rotate(-8 50 760)" />
                    </g>
                </g>

                {/* GROUPE DROIT : Câbles épais descendant depuis le haut droit */}
                <g strokeWidth="9" strokeLinecap="round" fill="none">
                    <path
                        d="M 1680 -20 C 1620 180, 1820 420, 1960 520"
                        stroke="url(#cablePurple)"
                        className="cyber-cable-glow"
                    />
                    <path
                        d="M 1720 -30 C 1660 160, 1860 380, 1980 460"
                        stroke="url(#cableTeal)"
                    />
                    <path
                        d="M 1760 -20 C 1710 200, 1800 520, 1940 780"
                        stroke="url(#cableLime)"
                    />
                    <path
                        d="M 1820 -10 C 1780 220, 1840 600, 1920 840"
                        stroke="url(#cableOrange)"
                    />
                    {/* Câble bleu cyan se branchant sur le port bas droit */}
                    <path
                        d="M 1940 720 C 1820 800, 1780 920, 1720 1020"
                        stroke="url(#cableTeal)"
                        strokeWidth="7"
                    />
                    <path
                        d="M 1960 840 C 1880 900, 1860 980, 1840 1060"
                        stroke="url(#cablePink)"
                        strokeWidth="7"
                    />
                    {/* Colliers de serrage droite */}
                    <g fill="#0b223c" stroke="#38bdf8" strokeWidth="1.5">
                        <rect x="1670" y="140" width="28" height="18" rx="4" transform="rotate(25 1670 140)" />
                        <rect x="1810" y="440" width="28" height="18" rx="4" transform="rotate(-30 1810 440)" />
                    </g>
                </g>

                {/* 11. LEDS CLIGNOTANTES AMBIANTES */}
                <g>
                    <circle cx="280" cy="500" r="3.5" fill="#22c55e" className="cyber-led-pulse" />
                    <circle cx="310" cy="500" r="3.5" fill="#38bdf8" className="cyber-led-pulse-delay" />
                    <circle cx="1600" cy="540" r="4" fill="#22d3ee" className="cyber-led-pulse" />
                    <circle cx="1625" cy="540" r="4" fill="#22c55e" className="cyber-led-pulse-delay" />
                    <circle cx="1470" cy="790" r="3.5" fill="#38bdf8" className="cyber-led-pulse" />
                    <circle cx="1500" cy="790" r="3.5" fill="#f43f5e" className="cyber-led-pulse-delay" />
                </g>
            </svg>
        </div>
    );
}

export default MotherboardBackground;
