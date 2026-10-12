import { useState } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeUnlockModal() {
    const { showUnlockModal, setShowUnlockModal, unlockIslam } = useTheme();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    if (!showUnlockModal) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const res = unlockIslam(code);
        if (!res.success) {
            setError(res.error || 'Code secret incorrect.');
        } else {
            setCode('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-[#041a12] via-[#06241a] to-[#02120b] p-6 shadow-2xl shadow-emerald-950/80">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={() => { setShowUnlockModal(false); setError(''); setCode(''); }}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg p-1"
                    aria-label="Fermer"
                >
                    ✕
                </button>

                {/* Header with Secret Icon */}
                <div className="flex items-center gap-3.5 mb-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-slate-800/90 border border-slate-700 text-2xl shadow-lg">
                        🔑
                    </div>
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                            Extension Secrète
                        </span>
                        <h2 className="text-lg font-bold text-white mt-1">
                            Débloquer un Module
                        </h2>
                    </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                    Entrez votre code d'accès secret pour activer les fonctionnalités et personnalisations correspondantes sur le site.
                </p>

                {error ? (
                    <div className="mb-4 rounded-lg border border-rose-500/50 bg-rose-950/40 p-3 text-xs text-rose-200 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                            Code secret d'activation
                        </label>
                        <input
                            type="password"
                            required
                            autoFocus
                            placeholder="Entrez le code secret…"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="form-input w-full font-mono text-sm border-emerald-800/60 focus:border-emerald-500 focus:ring-emerald-500/40"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => { setShowUnlockModal(false); setError(''); setCode(''); }}
                            className="btn btn-soft text-xs"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={!code.trim()}
                            className="btn bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-400 text-xs font-semibold shadow-lg shadow-emerald-950/60 hover:brightness-110 disabled:opacity-50"
                        >
                            Débloquer et Activer ✨
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
