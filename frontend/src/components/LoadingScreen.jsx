function LoadingScreen({
    label = 'Chargement en cours…',
    subtext = 'Synchronisation avec le système Azim',
    fullScreen = false,
}) {
    const containerClasses = fullScreen
        ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050e18]/92 backdrop-blur-md px-4 text-center'
        : 'flex min-h-[280px] w-full flex-col items-center justify-center py-12 px-4 text-center';

    return (
        <div className={containerClasses} role="status" aria-live="polite">
            <div className="relative mb-6 flex items-center justify-center">
                {/* Outer rotating glowing cyan gradient ring */}
                <div className="absolute size-20 animate-spin rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-500/40" style={{ animationDuration: '1.2s' }} />

                {/* Counter-rotating subtle blue ring */}
                <div className="absolute size-24 animate-spin rounded-full border border-transparent border-b-sky-400/60 border-l-blue-600/30" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />

                {/* Soft pulse glow backdrop */}
                <div className="absolute size-16 animate-pulse rounded-full bg-cyan-500/20 blur-md" />

                {/* Bot Icon with glowing border */}
                <div className="relative flex size-14 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/50 bg-[#081625] shadow-lg shadow-cyan-950/60">
                    <img
                        src="/icon.png"
                        alt="AzimBot"
                        className="size-11 object-contain transition-transform duration-300 hover:scale-105"
                    />
                </div>
            </div>

            {/* Title & Animated Subtext */}
            <div className="space-y-1.5 max-w-sm">
                <p className="text-base font-bold tracking-wide text-white drop-shadow-sm">
                    {label}
                </p>
                {subtext ? (
                    <p className="text-xs font-medium text-cyan-200/70">
                        {subtext}
                    </p>
                ) : null}
            </div>

            {/* Subtle loading bar indicator */}
            <div className="mt-5 h-1 w-32 overflow-hidden rounded-full bg-slate-800/80">
                <div className="h-full w-full origin-left animate-pulse bg-gradient-to-r from-cyan-500 to-sky-400" />
            </div>
        </div>
    );
}

export default LoadingScreen;
