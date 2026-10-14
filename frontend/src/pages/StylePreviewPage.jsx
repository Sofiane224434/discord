import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './StylePreview.css';

export default function StylePreviewPage() {
  const [activeStyle, setActiveStyle] = useState('s1'); // 's1' | 's2' | 's3'
  const [isIslamMode, setIsIslamMode] = useState(false);
  const [bentoFilter, setBentoFilter] = useState('all');

  // Realistic mock data
  const servers = [
    {
      id: '1283533269047971894',
      name: 'Azim As-Sunnah',
      avatar: '🕌',
      members: 455,
      isInstalled: true,
      canManage: true,
      role: 'Administrateur',
      ping: '18ms',
      islamActive: true,
      bannerGradient: 'linear-gradient(135deg, #064e3b, #0f172a)',
    },
    {
      id: '992817263541829102',
      name: 'Gaming & Chill Community',
      avatar: '🎮',
      members: 1240,
      isInstalled: true,
      canManage: true,
      role: 'Modérateur',
      ping: '22ms',
      islamActive: false,
      bannerGradient: 'linear-gradient(135deg, #312e81, #1e1b4b)',
    },
    {
      id: '887261524351627384',
      name: 'Dev & Coding Zone',
      avatar: '⚡',
      members: 89,
      isInstalled: true,
      canManage: true,
      role: 'Créateur',
      ping: '19ms',
      islamActive: false,
      bannerGradient: 'linear-gradient(135deg, #0284c7, #082f49)',
    },
  ];

  const inviteable = [
    {
      id: '776152439182736451',
      name: 'Serveur Entre Amis',
      avatar: '👥',
      members: 15,
      isInstalled: false,
      canManage: true,
      role: 'Propriétaire',
    },
  ];

  const topCommands = [
    { name: '/coran ecouter', count: 342, pct: 90 },
    { name: '/priere horaires', count: 289, pct: 75 },
    { name: '/ia chat', count: 184, pct: 50 },
    { name: '/moderation ban', count: 96, pct: 30 },
  ];

  return (
    <div className={`preview-showcase-root ${isIslamMode ? 'islam-theme' : ''}`}>
      {/* Top Floating Control Bar */}
      <header className="preview-toolbar">
        <div className="preview-toolbar-title">
          <span className="preview-badge">LAB DE DESIGN</span>
          <strong>Comparateur de styles · Panel Azim</strong>
        </div>

        <div className="preview-toolbar-tabs">
          <button
            type="button"
            className={`preview-tab-btn ${activeStyle === 's1' ? 'active tab-linear' : ''}`}
            onClick={() => setActiveStyle('s1')}
          >
            <span>💎</span> Style 1 : Linear / Raycast Dark Pro
          </button>
          <button
            type="button"
            className={`preview-tab-btn ${activeStyle === 's2' ? 'active tab-bento' : ''}`}
            onClick={() => setActiveStyle('s2')}
          >
            <span>🍱</span> Style 2 : Bento Grid Discord Next-Gen
          </button>
          <button
            type="button"
            className={`preview-tab-btn ${activeStyle === 's3' ? 'active tab-cyber' : ''}`}
            onClick={() => setActiveStyle('s3')}
          >
            <span>⚡</span> Style 3 : Cyber Operations Center
          </button>
        </div>

        <button
          type="button"
          className={`preview-theme-toggle ${isIslamMode ? 'islam-active' : ''}`}
          onClick={() => setIsIslamMode(!isIslamMode)}
        >
          <span>{isIslamMode ? '🕌' : '🌙'}</span>
          <span>{isIslamMode ? 'Thème Islamique (Actif)' : 'Passer en thème Islam'}</span>
        </button>
      </header>

      <div className="preview-content">
        {/* Style description banner */}
        <div className="preview-style-banner">
          <div>
            <h2>
              {activeStyle === 's1' && 'Style 1 : Linear / Raycast Dark Pro (SaaS Ultra-Moderne)'}
              {activeStyle === 's2' && 'Style 2 : Bento Grid Discord Next-Gen (Cartes Visuelles & Riches)'}
              {activeStyle === 's3' && 'Style 3 : Cyber Operations Center (Haute Densité & Pro Tech)'}
            </h2>
            <p>
              {activeStyle === 's1' && 'Inspiré des meilleurs outils modernes : fond aurora mesh, cartes verre dépoli, sparklines d’activité, typographie ultra-nette et animations discrètes.'}
              {activeStyle === 's2' && 'Inspiré de Discord Nitro & Apple Bento : grandes cartes visuelles avec bannières de serveurs, filtres rapides en pilules et widgets IA interactifs.'}
              {activeStyle === 's3' && 'Inspiré des centres d’opérations techniques : jauges radiales en direct, logs d’audit instantanés, style console épuré mais technologique.'}
            </p>
          </div>
          <Link to="/dashboard" style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>
            ← Retour au Dashboard
          </Link>
        </div>

        {/* ===================================================================
            STYLE 1 RENDER: LINEAR / RAYCAST DARK PRO
            =================================================================== */}
        {activeStyle === 's1' && (
          <div className="s1-container">
            <div className="s1-glow-1" />
            <div className="s1-glow-2" />

            {/* Metrics with Sparklines */}
            <div className="s1-metrics-grid">
              <div className="s1-metric-card">
                <div className="s1-metric-header">
                  <span className="s1-metric-label">Serveurs connectés</span>
                  <span className="s1-metric-icon">🌐</span>
                </div>
                <div className="s1-metric-value-row">
                  <span className="s1-metric-value">3</span>
                  <span className="s1-metric-badge s1-badge-up">+33% ce mois</span>
                </div>
                <svg className="s1-sparkline" viewBox="0 0 100 24" fill="none">
                  <path d="M0 18 Q20 20 40 12 T80 8 T100 4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
                  <path d="M0 18 Q20 20 40 12 T80 8 T100 4 L100 24 L0 24 Z" fill="url(#s1g1)" opacity="0.15" />
                  <defs>
                    <linearGradient id="s1g1" x1="0" y1="0" x2="0" y2="1">
                      <stop stopColor="#6366f1" />
                      <stop offset="1" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="s1-metric-card">
                <div className="s1-metric-header">
                  <span className="s1-metric-label">Membres protégés</span>
                  <span className="s1-metric-icon">👥</span>
                </div>
                <div className="s1-metric-value-row">
                  <span className="s1-metric-value">1,784</span>
                  <span className="s1-metric-badge s1-badge-up">+142</span>
                </div>
                <svg className="s1-sparkline" viewBox="0 0 100 24" fill="none">
                  <path d="M0 20 Q30 16 50 14 T80 6 T100 2" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                  <path d="M0 20 Q30 16 50 14 T80 6 T100 2 L100 24 L0 24 Z" fill="url(#s1g2)" opacity="0.15" />
                  <defs>
                    <linearGradient id="s1g2" x1="0" y1="0" x2="0" y2="1">
                      <stop stopColor="#10b981" />
                      <stop offset="1" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="s1-metric-card">
                <div className="s1-metric-header">
                  <span className="s1-metric-label">Commandes · 24h</span>
                  <span className="s1-metric-icon">⚡</span>
                </div>
                <div className="s1-metric-value-row">
                  <span className="s1-metric-value">911</span>
                  <span className="s1-metric-badge s1-badge-ok">Pic à 18h</span>
                </div>
                <svg className="s1-sparkline" viewBox="0 0 100 24" fill="none">
                  <path d="M0 16 Q25 8 50 15 T75 5 T100 9" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
                  <path d="M0 16 Q25 8 50 15 T75 5 T100 9 L100 24 L0 24 Z" fill="url(#s1g3)" opacity="0.15" />
                  <defs>
                    <linearGradient id="s1g3" x1="0" y1="0" x2="0" y2="1">
                      <stop stopColor="#a855f7" />
                      <stop offset="1" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="s1-metric-card">
                <div className="s1-metric-header">
                  <span className="s1-metric-label">Latence Gateway</span>
                  <span className="s1-metric-icon">📡</span>
                </div>
                <div className="s1-metric-value-row">
                  <span className="s1-metric-value">18 ms</span>
                  <span className="s1-metric-badge s1-badge-up">Optimale</span>
                </div>
                <svg className="s1-sparkline" viewBox="0 0 100 24" fill="none">
                  <path d="M0 12 Q20 13 40 11 T70 12 T100 11" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                  <path d="M0 12 Q20 13 40 11 T70 12 T100 11 L100 24 L0 24 Z" fill="url(#s1g4)" opacity="0.15" />
                  <defs>
                    <linearGradient id="s1g4" x1="0" y1="0" x2="0" y2="1">
                      <stop stopColor="#38bdf8" />
                      <stop offset="1" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Main Section */}
            <div className="s1-main-grid">
              <div className="s1-panel">
                <div className="s1-panel-header">
                  <div className="s1-panel-title">
                    <span>Vos serveurs administrables</span>
                    <span className="s1-panel-pill">3 actifs</span>
                  </div>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Dernière sync il y a 2 min</span>
                </div>

                <div className="s1-server-list">
                  {servers.map((s) => (
                    <div className="s1-server-row" key={s.id}>
                      <div className="s1-server-identity">
                        <div className="s1-avatar-wrap">
                          <div className="s1-avatar">{s.avatar}</div>
                          <span className="s1-status-dot online" />
                        </div>
                        <div>
                          <div className="s1-server-name">{s.name}</div>
                          <div className="s1-server-role">{s.role} {s.islamActive && '· Mode Islam actif'}</div>
                        </div>
                      </div>
                      <div>
                        <span className="s1-badge-installed">● En ligne</span>
                      </div>
                      <div className="s1-members-count">
                        {s.members.toLocaleString()} membres
                      </div>
                      <div>
                        <button type="button" className="s1-action-btn">
                          Configurer <span>→</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Inviteable */}
                  {inviteable.map((s) => (
                    <div className="s1-server-row" key={s.id} style={{ opacity: 0.85 }}>
                      <div className="s1-server-identity">
                        <div className="s1-avatar-wrap">
                          <div className="s1-avatar" style={{ background: '#171923' }}>{s.avatar}</div>
                        </div>
                        <div>
                          <div className="s1-server-name">{s.name}</div>
                          <div className="s1-server-role">Non configuré</div>
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Non installé</span>
                      </div>
                      <div className="s1-members-count">
                        {s.members} membres
                      </div>
                      <div>
                        <button type="button" className="s1-action-btn s1-btn-invite">
                          Inviter Azim +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linear Right Sidebar */}
              <div className="s1-side-column">
                <div className="s1-panel" style={{ padding: '20px 24px' }}>
                  <div className="s1-panel-title" style={{ marginBottom: '18px' }}>
                    Commandes fréquentes
                  </div>
                  {topCommands.map((c) => (
                    <div className="s1-bar-item" key={c.name}>
                      <div className="s1-bar-info">
                        <span>{c.name}</span>
                        <span>{c.count} exécutions</span>
                      </div>
                      <div className="s1-bar-track">
                        <div className="s1-bar-fill" style={{ width: `${c.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="s1-panel" style={{ padding: '20px 24px' }}>
                  <div className="s1-panel-title" style={{ marginBottom: '14px' }}>
                    Activité récente
                  </div>
                  <div className="s1-activity-item">
                    <span className="s1-activity-dot" />
                    <span className="s1-activity-text">Vocal Coran lancé dans <strong>#salat</strong></span>
                    <span className="s1-activity-time">Il y a 3m</span>
                  </div>
                  <div className="s1-activity-item">
                    <span className="s1-activity-dot" style={{ background: '#10b981' }} />
                    <span className="s1-activity-text">Backup config auto réussie</span>
                    <span className="s1-activity-time">Il y a 14m</span>
                  </div>
                  <div className="s1-activity-item">
                    <span className="s1-activity-dot" style={{ background: '#a855f7' }} />
                    <span className="s1-activity-text">Alerte TikTok @azim déclenchée</span>
                    <span className="s1-activity-time">Il y a 1h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            STYLE 2 RENDER: BENTO GRID DISCORD NEXT-GEN
            =================================================================== */}
        {activeStyle === 's2' && (
          <div className="s2-container">
            {/* Top filter pills + search */}
            <div className="s2-filter-bar">
              <div className="s2-pills">
                <button
                  type="button"
                  className={`s2-pill ${bentoFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setBentoFilter('all')}
                >
                  Tous les serveurs (4)
                </button>
                <button
                  type="button"
                  className={`s2-pill ${bentoFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setBentoFilter('active')}
                >
                  Actifs avec Azim (3)
                </button>
                <button
                  type="button"
                  className={`s2-pill ${bentoFilter === 'invite' ? 'active' : ''}`}
                  onClick={() => setBentoFilter('invite')}
                >
                  À inviter (1)
                </button>
              </div>

              <div className="s2-search-box">
                <span>🔍</span>
                <input type="text" placeholder="Rechercher un serveur..." readOnly />
                <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 5px', borderRadius: '4px', fontSize: '10px' }}>⌘K</kbd>
              </div>
            </div>

            {/* Bento Grid layout */}
            <div className="s2-bento-grid">
              {/* Spotlight Hero Server */}
              <div className="s2-hero-card">
                <div className="s2-hero-banner" />
                <div className="s2-hero-overlay" />
                <div className="s2-hero-content">
                  <div className="s2-hero-identity">
                    <div className="s2-hero-avatar">🕌</div>
                    <div>
                      <div className="s2-hero-badge-islam">✨ SERVEUR PRINCIPAL · MODE ISLAM</div>
                      <h3 className="s2-hero-title">Azim As-Sunnah</h3>
                      <div className="s2-hero-stats">
                        <span>👥 <strong>455</strong> membres</span>
                        <span>📶 Latence <strong>18ms</strong></span>
                        <span>🟢 Statut <strong>Opérationnel</strong></span>
                      </div>
                    </div>
                  </div>
                  <button type="button" className="s2-hero-btn">
                    Gérer le serveur <span>⚡</span>
                  </button>
                </div>
              </div>

              {/* Bot Health & AI Widget */}
              <div className="s2-widget-card">
                <div className="s2-widget-head">
                  <span>ÉTAT DU BOT AZIM</span>
                  <span className="s2-widget-pulse">En ligne</span>
                </div>
                <div style={{ margin: '14px 0' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>99.98%</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Disponibilité sur les 30 derniers jours</div>
                </div>
                <div className="s2-widget-ai">
                  <div className="s2-widget-ai-title">
                    <span>🤖</span> Moteur IA Groq connecté
                  </div>
                  <div className="s2-widget-ai-sub">Prêt pour les réponses intelligentes & modération</div>
                </div>
              </div>

              {/* Secondary Server Cards */}
              <div className="s2-server-card">
                <div>
                  <div className="s2-card-head">
                    <div className="s2-card-avatar">🎮</div>
                    <div className="s2-card-meta">
                      <h4>Gaming & Chill Community</h4>
                      <span>1,240 membres · Modérateur</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 12px 0' }}>
                    Notifications Twitch actives & musique vocal connectée.
                  </p>
                </div>
                <div className="s2-card-footer">
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>● Bot actif</span>
                  <button type="button" className="s2-card-btn">Configurer →</button>
                </div>
              </div>

              <div className="s2-server-card">
                <div>
                  <div className="s2-card-head">
                    <div className="s2-card-avatar">⚡</div>
                    <div className="s2-card-meta">
                      <h4>Dev & Coding Zone</h4>
                      <span>89 membres · Créateur</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 12px 0' }}>
                    Webhook GitHub actif & logs de commits intégrés.
                  </p>
                </div>
                <div className="s2-card-footer">
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>● Bot actif</span>
                  <button type="button" className="s2-card-btn">Configurer →</button>
                </div>
              </div>

              {/* Dashed Add Card */}
              <div className="s2-card-dashed">
                <div className="s2-dashed-icon">+</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                  Ajouter à « Serveur Entre Amis »
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
                  Vous avez les permissions pour installer Azim
                </div>
                <button type="button" className="s2-card-btn" style={{ background: '#3b82f6', border: 'none' }}>
                  Inviter Azim en 1 clic
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            STYLE 3 RENDER: CYBER OPERATIONS CENTER (Clean Pro Tech)
            =================================================================== */}
        {activeStyle === 's3' && (
          <div className="s3-container">
            {/* Top Telemetry Hardware Bar */}
            <div className="s3-telemetry-bar">
              <div className="s3-telemetry-item">
                <div className="s3-radial-gauge">
                  <svg className="s3-gauge-svg" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="88" strokeDashoffset="28" strokeLinecap="round" />
                  </svg>
                  <span className="s3-gauge-val">68%</span>
                </div>
                <div className="s3-telemetry-data">
                  <span className="s3-telemetry-label">CPU Bot Usage</span>
                  <span className="s3-telemetry-text">Node.js V20 Cluster</span>
                </div>
              </div>

              <div className="s3-telemetry-item">
                <div className="s3-radial-gauge">
                  <svg className="s3-gauge-svg" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="88" strokeDashoffset="45" strokeLinecap="round" />
                  </svg>
                  <span className="s3-gauge-val">42%</span>
                </div>
                <div className="s3-telemetry-data">
                  <span className="s3-telemetry-label">Mémoire RAM</span>
                  <span className="s3-telemetry-text">312 MB / 1024 MB</span>
                </div>
              </div>

              <div className="s3-telemetry-item">
                <div className="s3-radial-gauge">
                  <svg className="s3-gauge-svg" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#a855f7" strokeWidth="3" strokeDasharray="88" strokeDashoffset="12" strokeLinecap="round" />
                  </svg>
                  <span className="s3-gauge-val">18m</span>
                </div>
                <div className="s3-telemetry-data">
                  <span className="s3-telemetry-label">Gateway Ping</span>
                  <span className="s3-telemetry-text">Région Europe-West</span>
                </div>
              </div>

              <div className="s3-telemetry-item">
                <div className="s3-radial-gauge">
                  <svg className="s3-gauge-svg" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="88" strokeDashoffset="8" strokeLinecap="round" />
                  </svg>
                  <span className="s3-gauge-val">99%</span>
                </div>
                <div className="s3-telemetry-data">
                  <span className="s3-telemetry-label">Disponibilité</span>
                  <span className="s3-telemetry-text">Uptime 14 jours</span>
                </div>
              </div>
            </div>

            {/* Operations Grid */}
            <div className="s3-ops-grid">
              <div className="s3-terminal-box">
                <div className="s3-terminal-header">
                  <div className="s3-term-dots">
                    <span className="s3-term-dot red" />
                    <span className="s3-term-dot yellow" />
                    <span className="s3-term-dot green" />
                  </div>
                  <span className="s3-term-title">TERMINAL // SERVEURS CONNECTÉS [CLUSTER-01]</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>SOCKET: ESTABLISHED</span>
                </div>

                <div>
                  {servers.map((s) => (
                    <div className="s3-server-tech-row" key={s.id}>
                      <span className="s3-tech-id">#{s.id.slice(0, 6)}</span>
                      <div className="s3-tech-name">
                        <span className="s3-tech-dot" />
                        <span>{s.name}</span>
                      </div>
                      <div>
                        <span className="s3-tech-badge">STATUS: ONLINE</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'monospace' }}>
                        {s.members} PEERS
                      </div>
                      <div>
                        <button type="button" className="s3-tech-btn">
                          [MANAGE_NODE]
                        </button>
                      </div>
                    </div>
                  ))}

                  {inviteable.map((s) => (
                    <div className="s3-server-tech-row" key={s.id} style={{ opacity: 0.7 }}>
                      <span className="s3-tech-id">#{s.id.slice(0, 6)}</span>
                      <div className="s3-tech-name">
                        <span className="s3-tech-dot" style={{ background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
                        <span>{s.name}</span>
                      </div>
                      <div>
                        <span className="s3-tech-badge" style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.1)' }}>
                          STATUS: UNATTACHED
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'monospace' }}>
                        {s.members} PEERS
                      </div>
                      <div>
                        <button type="button" className="s3-tech-btn" style={{ color: '#f59e0b', borderColor: '#f59e0b' }}>
                          [ATTACH_BOT]
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time telemetry log feed */}
              <div className="s3-right-feed">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', color: '#38bdf8' }}>
                    JOURNAL D'ÉVÉNEMENTS LIVE
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>STREAMING</span>
                </div>

                <div className="s3-log-row">
                  <span className="s3-log-ts">[16:54:12]</span>
                  <span className="s3-log-action">VOICE_CONNECT</span>
                  <span className="s3-log-target">Guild #128353</span>
                </div>
                <div className="s3-log-row">
                  <span className="s3-log-ts">[16:52:05]</span>
                  <span className="s3-log-action">GROQ_QUERY_OK</span>
                  <span className="s3-log-target">Latency 284ms</span>
                </div>
                <div className="s3-log-row">
                  <span className="s3-log-ts">[16:48:30]</span>
                  <span className="s3-log-action">PRAYER_NOTIF</span>
                  <span className="s3-log-target">Asr notif sent</span>
                </div>
                <div className="s3-log-row">
                  <span className="s3-log-ts">[16:40:11]</span>
                  <span className="s3-log-action">TIKTOK_CHECK</span>
                  <span className="s3-log-target">0 new videos</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
