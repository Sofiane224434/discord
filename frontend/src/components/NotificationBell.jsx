// components/NotificationBell.jsx — pastille dans l'en-tête quand l'équipe a répondu à un de vos retours
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { feedbackService } from '../services/api.js';
import Icon from './Icon.jsx';

const POLL_MS = 60_000;
export const NOTIFICATIONS_EVENT = 'azim:notifications';

function NotificationBell() {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const [count, setCount] = useState(0);

    const load = useCallback(() => {
        feedbackService.getNotifications()
            .then((data) => setCount(Number(data?.count || 0)))
            .catch(() => null);
    }, []);

    useEffect(() => {
        load();
        const timer = setInterval(load, POLL_MS);
        // La page Retours & idées prévient quand les réponses ont été vues
        const onChange = (event) => setCount(Number(event.detail?.count ?? 0));
        window.addEventListener(NOTIFICATIONS_EVENT, onChange);
        return () => {
            clearInterval(timer);
            window.removeEventListener(NOTIFICATIONS_EVENT, onChange);
        };
    }, [load]);

    const label = count ? t('header.notifications_new', { count }) : t('header.notifications');

    return (
        <Link
            to="/feedback"
            className={`az-bell${count ? ' has-news' : ''}${pathname.startsWith('/feedback') ? ' is-active' : ''}`}
            aria-label={label}
            title={label}
        >
            <Icon name="bell" size={18} />
            {count ? <span className="az-bell__badge">+{count > 9 ? '9' : count}</span> : null}
        </Link>
    );
}

export default NotificationBell;
