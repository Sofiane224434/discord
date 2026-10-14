import { useState } from 'react';
import Icon from './Icon.jsx';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext.jsx';

function LoadingScreen({
    label,
    subtext,
    fullScreen = false,
}) {
    const { t } = useTranslation();
    const shownLabel = label ?? t('loading.default');
    const shownSubtext = subtext ?? t('loading.default_sub');
    const { theme } = useTheme();
    const isIslam = theme === 'islam';
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);

    const imgSrc = isIslam ? '/icon-islam.png' : '/icon.png';

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
                    {!imgError && (
                        <img
                            src={imgSrc}
                            alt="AzimBot"
                            onLoad={() => setImgLoaded(true)}
                            onError={() => setImgError(true)}
                            className={`size-16 object-contain transition-opacity duration-300 ${
                                imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                            }`}
                        />
                    )}
                    {(!imgLoaded || imgError) && (
                        <span
                            className="absolute text-3xl select-none animate-pulse"
                            aria-hidden="true"
                        >
                            <Icon name={isIslam ? 'moon' : 'sparkles'} size={28} />
                        </span>
                    )}
                </div>
            </div>

            {/* Label principal avec effet de brillance subtile */}
            <h3
                className={`text-lg font-bold tracking-tight ${
                    isIslam
                        ? 'bg-gradient-to-r from-emerald-200 via-emerald-100 to-amber-200 bg-clip-text text-transparent'
                        : 'bg-gradient-to-r from-cyan-200 via-white to-sky-200 bg-clip-text text-transparent'
                }`}
            >
                {shownLabel}
            </h3>

            {/* Sous-titre informatif */}
            {shownSubtext && (
                <p className="mt-1.5 max-w-sm text-xs text-slate-400 leading-relaxed">
                    {shownSubtext}
                </p>
            )}

            {/* Barre de progression indéterminée moderne */}
            <div className="mt-5 h-1 w-48 overflow-hidden rounded-full bg-slate-800/80">
                <div
                    className={`h-full w-1/3 rounded-full animate-indeterminate ${
                        isIslam
                            ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400'
                            : 'bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500'
                    }`}
                />
            </div>
        </div>
    );
}

export default LoadingScreen;
