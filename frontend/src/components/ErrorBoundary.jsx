// components/ErrorBoundary.jsx — si une page plante, un message et un bouton « Recharger » au lieu d'un écran vide
import { Component } from 'react';
import { withTranslation } from 'react-i18next';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error) {
        console.error('[Site] Erreur d’affichage :', error);
    }

    render() {
        const { error } = this.state;
        const { t, children } = this.props;
        if (!error) return children;
        return (
            <div className="pg pg--narrow err-boundary" role="alert">
                <h1>{t('errors.page_title')}</h1>
                <p>{t('errors.page_lead')}</p>
                <button type="button" className="ui-btn ui-btn--primary" onClick={() => window.location.reload()}>
                    {t('errors.reload')}
                </button>
            </div>
        );
    }
}

const TranslatedErrorBoundary = withTranslation()(ErrorBoundary);

export default TranslatedErrorBoundary;
