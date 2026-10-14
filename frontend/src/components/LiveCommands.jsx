import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon.jsx';
import { systemService } from '../services/api.js';
import { useTheme } from '../context/ThemeContext.jsx';

const SUBCOMMAND = 1;
const SUBCOMMAND_GROUP = 2;

// Liste des commandes lue directement sur le bot : une nouvelle commande ou sous-commande apparaît
// ici dès qu'elle est déployée, sans toucher à la documentation.
function LiveCommands() {
    const { t, i18n } = useTranslation();
    const { isIslamUnlocked } = useTheme();
    const lang = (i18n.resolvedLanguage || i18n.language || 'fr').startsWith('en') ? 'en' : 'fr';
    const [commands, setCommands] = useState(null);
    const [error, setError] = useState(false);
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(null);

    useEffect(() => {
        systemService.getCommands()
            .then((data) => setCommands(Array.isArray(data.commands) ? data.commands : []))
            .catch(() => setError(true));
    }, []);

    const list = useMemo(() => {
        const q = query.trim().toLowerCase().replace(/^\//, '');
        return (commands || [])
            .filter((command) => isIslamUnlocked || !command.islamic)
            .map((command) => ({ key: command.name, ...command[lang] }))
            .filter((command) => !q || [command.name, command.description, ...(command.options || []).map((o) => `${o.name} ${o.description}`)]
                .some((text) => String(text).toLowerCase().includes(q)))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [commands, lang, query, isIslamUnlocked]);

    if (error) return <p className="dc-live__state">{t('docs.commands_error')}</p>;
    if (!commands) return <p className="dc-live__state">{t('docs.commands_loading')}</p>;

    return (
        <section className="dc-live" aria-label={t('docs.commands_label')}>
            <div className="dc-live__bar">
                <label className="ui-search">
                    <Icon name="search" size={16} />
                    <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('docs.commands_search')} />
                </label>
                <span className="dc-live__count">{t('docs.commands_count', { count: list.length })}</span>
            </div>

            <ul className="dc-live__list">
                {list.map((command) => {
                    const subs = (command.options || []).filter((o) => o.type === SUBCOMMAND || o.type === SUBCOMMAND_GROUP);
                    const params = (command.options || []).filter((o) => o.type !== SUBCOMMAND && o.type !== SUBCOMMAND_GROUP);
                    const isOpen = open === command.key || Boolean(query.trim());
                    const hasDetails = subs.length > 0 || params.length > 0;
                    return (
                        <li key={command.key} className={`dc-live__item${isOpen ? ' is-open' : ''}`}>
                            <button
                                type="button"
                                className="dc-live__head"
                                onClick={() => setOpen(isOpen && !query.trim() ? null : command.key)}
                                aria-expanded={isOpen}
                                disabled={!hasDetails}
                            >
                                <code>/{command.name}</code>
                                <span>{command.description}</span>
                                {subs.length ? <small>{t('docs.commands_subs', { count: subs.length })}</small> : null}
                                {hasDetails ? <Icon name="chevronDown" size={16} className="dc-live__chevron" /> : null}
                            </button>

                            {isOpen && hasDetails ? (
                                <div className="dc-live__body">
                                    {params.length ? <Params options={params} t={t} /> : null}
                                    {subs.map((sub) => (
                                        <div key={sub.name} className="dc-live__sub">
                                            <div className="dc-live__sub-head">
                                                <code>/{command.name} {sub.name}</code>
                                                <span>{sub.description}</span>
                                            </div>
                                            {sub.options?.length ? <Params options={sub.options} t={t} /> : null}
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </li>
                    );
                })}
            </ul>
            {list.length === 0 ? <p className="dc-live__state">{t('docs.commands_none')}</p> : null}
        </section>
    );
}

function Params({ options, t }) {
    return (
        <ul className="dc-live__params">
            {options.map((option) => (
                <li key={option.name}>
                    <code>{option.name}</code>
                    {option.required ? <em>{t('docs.commands_required')}</em> : null}
                    <span>
                        {option.description}
                        {option.choices?.length ? <small> — {option.choices.join(' · ')}</small> : null}
                    </span>
                </li>
            ))}
        </ul>
    );
}

export default LiveCommands;
