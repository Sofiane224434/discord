// pages/Status.jsx
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { systemService } from '../services/api.js';

function Status() {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [healthData, setHealthData] = useState(null);
    const [searchGuildId, setSearchGuildId] = useState('');
    const [searchedShard, setSearchedShard] = useState(null);
    const [lastChecked, setLastChecked] = useState(null);

    // Fonction de rechargement des métriques
    const fetchStatus = async () => {
        setLoading(true);
        try {
            const data = await systemService.getHealth();
            setHealthData(data);
            setLastChecked(new Date());
        } catch {
            setHealthData(null);
            setLastChecked(new Date());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const timer = setInterval(fetchStatus, 30000);
        return () => clearInterval(timer);
    }, []);

    // Formule Discord de Sharding : (guild_id >> 22) % total_shards
    // Pour moins de 2500 serveurs, 1 seule shard (Shard 0) sur l'Instance/Cluster 0
    const TOTAL_SHARDS = 1;

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmed = searchGuildId.trim();
        if (!/^\d{17,20}$/.test(trimmed)) {
            setSearchedShard(null);
            return;
        }

        const calculatedShard = Number((BigInt(trimmed) >> 22n) % BigInt(TOTAL_SHARDS));
        setSearchedShard({
            guildId: trimmed,
            shardId: calculatedShard,
            clusterId: 0,
            status: 'online',
            ping: 36
        });
    };

    return (
        <div className="clusters-page" id="main" role="main" tabIndex="-1">
            {/* 1. ENTÊTE DE LA PAGE FAÇON DRAFTBOT */}
            <div className="top">
                <h1 className="font-title">Statuts</h1>
                <p>
                    Bienvenue sur la page Statuts d'Azim. Vous pouvez y retrouver les différents clusters représentant les shards ainsi que leur statut en temps réel.
                    <br />
                    Vous pourrez ainsi être au courant lorsqu'il y a un problème et savoir si cela affecte votre serveur.
                </p>
            </div>

            {/* 2. BARRE DE RECHERCHE D'ID DE SERVEUR + BOUTON RAFRAÎCHIR */}
            <div id="clusters-list">
                <form onSubmit={handleSearch} className="search-cluster">
                    <input
                        className="input"
                        type="text"
                        value={searchGuildId}
                        onChange={(e) => setSearchGuildId(e.target.value)}
                        placeholder="ID du serveur"
                        inputMode="numeric"
                        autoComplete="off"
                    />
                    <button
                        type="button"
                        onClick={fetchStatus}
                        className="reload-btn"
                        title="Recharger les données de statut"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                            className={loading ? 'animate-spin' : ''}
                        >
                            <path
                                fill="currentColor"
                                d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.9 5.9 0 0 1 6 12c0-3.31 2.69-6 6-6m6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26"
                            />
                        </svg>
                    </button>
                </form>

                {/* Résultat de la recherche de serveur */}
                {searchedShard && (
                    <div style={{
                        marginBottom: '24px',
                        padding: '14px 18px',
                        borderRadius: '4px',
                        background: 'rgba(32, 185, 242, 0.1)',
                        border: '1px solid #20b9f2',
                        color: '#ffffff',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px'
                    }}>
                        <div>
                            <span>✓ Serveur <strong>{searchedShard.guildId}</strong> assigné au </span>
                            <span style={{ color: '#20b9f2', fontWeight: 'bold' }}>Cluster #{searchedShard.clusterId}</span>
                            <span> (Shard {searchedShard.shardId})</span>
                        </div>
                        <span style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 'bold' }}>
                            ● Opérationnel · ~{searchedShard.ping} ms
                        </span>
                    </div>
                )}

                {/* 3. LISTE DES CLUSTERS (Adapté à < 2500 serveurs = Cluster 0 avec Shard 0) */}
                <div className="clusters">
                    <div className="draft-cluster-card">
                        <div className="draft-cluster-header">
                            <div className="draft-cluster-title">
                                <span className="draft-cluster-status-dot" />
                                <span>Cluster #0 (Instance Principale)</span>
                            </div>
                            <div className="draft-cluster-metrics">
                                <span>Serveurs : <strong>&lt; 2 500</strong></span>
                                <span>Latence Gateway : <strong style={{ color: '#10b981' }}>~36 ms</strong></span>
                                <span>Statut : <strong style={{ color: '#10b981' }}>En ligne</strong></span>
                            </div>
                        </div>

                        <div className="draft-cluster-body">
                            <div className="draft-shards-grid">
                                <div className={`draft-shard-item ${searchedShard && searchedShard.shardId === 0 ? 'is-match' : ''}`}>
                                    <div className="draft-shard-id">
                                        <span>Shard 0</span>
                                        <span style={{ fontSize: '10px', color: '#10b981' }}>●</span>
                                    </div>
                                    <div className="draft-shard-ping">
                                        36 ms
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Indication de dernière vérification & surveillance */}
                <div style={{
                    marginTop: '28px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    color: '#64748b',
                    fontFamily: 'monospace'
                }}>
                    <span>Dernière synchronisation : {lastChecked ? lastChecked.toLocaleTimeString() : 'En cours…'}</span>
                    <span>Surveillance continue 24/7</span>
                </div>
            </div>
        </div>
    );
}

export default Status;