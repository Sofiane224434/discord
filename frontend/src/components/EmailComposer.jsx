import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.js';
import { emailService } from '../services/api.js';

function EmailComposer() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [formData, setFormData] = useState({ to: '', subject: '', message: '', name: '' });
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.email) {
            setFormData((current) => ({ ...current, to: current.to || user.email, name: current.name || user.firstname || '' }));
        }
    }, [user]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFeedback({ type: '', message: '' });
        setLoading(true);

        try {
            const response = await emailService.send(formData);
            setFeedback({ type: 'success', message: response.message || t('email.success') });
        } catch (error) {
            setFeedback({ type: 'error', message: error.message || t('email.error') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="email-composer site-panel">
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label htmlFor="to" className="email-label">{t('email.to')}</label>
                    <input id="to" name="to" type="email" value={formData.to} onChange={handleChange} required className="form-input" />
                </div>
                <div>
                    <label htmlFor="name" className="email-label">{t('email.name')}</label>
                    <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className="form-input" />
                </div>
            </div>
            <div>
                <label htmlFor="subject" className="email-label">{t('email.subject')}</label>
                <input id="subject" name="subject" type="text" value={formData.subject} onChange={handleChange} required className="form-input" />
            </div>
            <div>
                <label htmlFor="message" className="email-label">{t('email.message')}</label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows="7" className="form-input" />
            </div>
            {feedback.message && (
                <p className={feedback.type === 'success' ? 'rounded-lg bg-green-50 px-4 py-3 text-green-700' : 'rounded-lg bg-red-50 px-4 py-3 text-red-700'}>
                    {feedback.message}
                </p>
            )}
            <button type="submit" disabled={loading} className="btn btn-primary disabled:opacity-60">
                {loading ? t('email.sending') : t('email.submit')}
            </button>
        </form>
    );
}

export default EmailComposer;