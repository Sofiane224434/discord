import { useCallback, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

// Fenêtre de confirmation du site (remplace window.confirm / window.prompt).
//   const [confirm, dialog] = useConfirm();
//   const ok = await confirm({ title, message, confirmLabel, danger: true });            -> true | false
//   const reason = await confirm({ title, message, input: { label, placeholder } });     -> texte | null
//   ... puis afficher {dialog} dans le rendu.
export function useConfirm() {
    const [request, setRequest] = useState(null);

    const confirm = useCallback((options) => new Promise((resolve) => {
        setRequest({ ...options, resolve });
    }), []);

    const close = (value) => {
        request?.resolve(value);
        setRequest(null);
    };

    const dialog = request ? <ConfirmDialog {...request} onClose={close} /> : null;
    return [confirm, dialog];
}

export default useConfirm;
