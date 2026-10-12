import { useTheme } from '../context/ThemeContext.jsx';

function LoadingScreen({
    label = 'Chargement en cours…',
    subtext = 'Synchronisation avec le système Azim',
    fullScreen = false,
}) {
    const { theme } = useTheme();
    const isIslam = theme === 'islam';

    const containerClasses = fullScreen
        ? `fixed inset-0 z-50 flex flex-col items-center justify-center ${
            isIslam ? 'bg-[#021810]/95' : 'bg-[#050e18]/92'
        } backdrop-blur-md px-4 text-center`
        : 'flex min-h-[280px] w-full flex-col items-center justify-center py-12 px-4 text-center';

    return (
        <div className={containerClasses} role="status" aria-live="polite">
            <div className="relative mb-6 flex items-center justify-center">
                {/* Outer rotating glowing gradient ring */}
                <div
                    className={`absolute size-28 animate-spin rounded-full border-2 border-transparent ${
                        isIslam
                            ? 'border-t-emerald-400 border-r-amber-400/60'
                            : 'border-t-cyan-400 border-r-cyan-500/40'
                    }`}
                    style={{ animationDuration: '1.2s' }}
                />

                {/* Counter-rotating subtle ring */}
                <div
                    className={`absolute size-32 animate-spin rounded-full border border-transparent ${
                        isIslam
                            ? 'border-b-emerald-300/60 border-l-emerald-600/30'
                            : 'border-b-sky-400/60 border-l-blue-600/30'
                    }`}
                    style={{ animationDirection: 'reverse', animationDuration: '2s' }}
                />

                {/* Soft pulse glow backdrop */}
                <div
                    className={`absolute size-24 animate-pulse rounded-full ${
                        isIslam ? 'bg-emerald-500/25' : 'bg-cyan-500/25'
                    } blur-md`}
                />

                {/* Bot Icon with themed glowing border */}
                <div
                    className={`relative flex size-20 items-center justify-center overflow-hidden rounded-2xl border-2 ${
                        isIslam
                            ? 'border-emerald-400/70 bg-[#031d13] shadow-xl shadow-emerald-950/80 ring-1 ring-amber-400/30'
                            : 'border-cyan-400/60 bg-[#081625] shadow-xl shadow-cyan-950/70'
                    }`}
                >
                    <img
                        src={isIslam ? '/icon-islam.png' : '/icon.png'}
                        alt="AzimBot"
                        className="size-16 object-contain transition-transform duration-300 hover:scale-105"
                    />
                </div>
            </div>

            {/* Title & Animated Subtext */}
            <div className="space-y-1.5 max-w-sm">
                <p className="text-base font-bold tracking-wide text-white drop-shadow-sm">
                    {label}
                </p>
                {subtext ? (
                    <p
                        className={`text-xs font-medium ${
                            isIslam ? 'text-emerald-200/80' : 'text-cyan-200/70'
                        }`}
                    >
                        {subtext}
                    </p>
                ) : null}
            </div>

            {/* Subtle loading bar indicator */}
            <div className="mt-5 h-1 w-32 overflow-hidden rounded-full bg-slate-800/80">
                <div
                    className={`h-full w-full origin-left animate-pulse bg-gradient-to-r ${
                        isIslam
                            ? 'from-emerald-500 via-emerald-400 to-amber-400'
                            : 'from-cyan-500 to-sky-400'
                    }`}
                />
            </div>
        </div>
    );
}

export default LoadingScreen;
