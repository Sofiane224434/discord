import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeSelector() {
    const { theme, isIslamUnlocked, setTheme } = useTheme();

    if (!isIslamUnlocked) {
        return null;
    }

    return (
        <div className="inline-flex items-center rounded-xl border border-emerald-900/60 bg-emerald-950/40 p-0.5 text-xs shadow-inner">
            {/* Bouton Cyber */}
            <button
                type="button"
                onClick={() => setTheme('cyber')}
                title="Thème Standard Cyber"
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
                title="Thème Islam (Émeraude & Or)"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    theme === 'islam'
                        ? 'bg-emerald-600 text-amber-100 shadow-md ring-1 ring-emerald-400/60'
                        : 'text-slate-400 hover:text-emerald-300'
                }`}
            >
                <span>🌙</span>
                <span className="hidden sm:inline">Islam</span>
            </button>
        </div>
    );
}
