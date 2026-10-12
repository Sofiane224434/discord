import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeSelector() {
    const { theme, isIslamUnlocked, setTheme, setShowUnlockModal } = useTheme();

    if (!isIslamUnlocked) {
        return (
            <div className="inline-flex items-center rounded-xl border border-slate-800 bg-slate-900/70 p-0.5 text-xs">
                <button
                    type="button"
                    onClick={() => setShowUnlockModal(true)}
                    title="Entrer un code secret"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-slate-400 hover:text-cyan-300 transition-all"
                >
                    <span>🔑</span>
                    <span className="hidden sm:inline">Code</span>
                </button>
            </div>
        );
    }

    return (
        <div className="inline-flex items-center rounded-xl border border-slate-800 bg-slate-900/70 p-0.5 text-xs">
            {/* Bouton Cyber */}
            <button
                type="button"
                onClick={() => setTheme('cyber')}
                title="Thème Standard Cyber (Bleu & Cyan)"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    theme === 'cyber'
                        ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400/40'
                        : 'text-slate-400 hover:text-slate-200'
                }`}
            >
                <span>🤖</span>
                <span className="hidden sm:inline">Cyber</span>
            </button>

            {/* Bouton Islam */}
            <button
                type="button"
                onClick={() => setTheme('islam')}
                title="Thème Islam & Spiritualité (Émeraude & Or)"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    theme === 'islam'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-amber-200 shadow-sm ring-1 ring-emerald-400/50'
                        : 'text-slate-400 hover:text-emerald-300'
                }`}
            >
                <span>🌙</span>
                <span className="hidden sm:inline">Islam</span>
            </button>
        </div>
    );
}
