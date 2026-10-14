import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon.jsx';

// Fenêtre de confirmation du site (remplace window.confirm / window.prompt), utilisée via hooks/useConfirm.jsx
function ConfirmDialog({ title, message, confirmLabel, cancelLabel, danger = false, input = null, onClose }) {
    const { t } = useTranslation();
    const [value, setValue] = useState(input?.defaultValue || '');
    const confirmRef = useRef(null);
    const inputRef = useRef(null);

    const cancel = useCallback(() => onClose(input ? null : false), [input, onClose]);
    const accept = () => onClose(input ? value.trim() : true);

    // Focus sur le champ (ou le bouton principal), Échap pour annuler
    useEffect(() => {
        (inputRef.current || confirmRef.current)?.focus();
        const onKey = (e) => { if (e.key === 'Escape') cancel(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [cancel]);

    return (
        <div className="ui-modal" role="presentation" onClick={cancel}>
            <section
                className="ui-modal__panel ui-confirm"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="ui-confirm-title"
                aria-describedby="ui-confirm-message"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={(e) => { e.preventDefault(); accept(); }}>
                    <div className="ui-confirm__body">
                        <span className={`ui-confirm__icon${danger ? ' is-danger' : ''}`}>
                            <Icon name={danger ? 'alert' : 'help'} size={22} />
                        </span>
                        <div>
                            <h2 id="ui-confirm-title">{title}</h2>
                            {message ? <p id="ui-confirm-message">{message}</p> : null}
                        </div>
                    </div>

                    {input ? (
                        <label className="ui-field ui-confirm__field">
                            <span className="ui-field__label">{input.label}</span>
                            <input
                                ref={inputRef}
                                className="ui-input"
                                value={value}
                                maxLength={input.maxLength || 300}
                                placeholder={input.placeholder}
                                onChange={(e) => setValue(e.target.value)}
                            />
                        </label>
                    ) : null}

                    <footer className="ui-modal__foot">
                        <button type="button" className="ui-btn ui-btn--ghost" onClick={cancel}>{cancelLabel || t('common.cancel')}</button>
                        <button ref={confirmRef} type="submit" className={`ui-btn ${danger ? 'ui-btn--danger-solid' : 'ui-btn--primary'}`}>
                            {confirmLabel || t('common.confirm')}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}

export default ConfirmDialog;
