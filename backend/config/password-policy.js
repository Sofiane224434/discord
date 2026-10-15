// config/password-policy.js — règle des mots de passe robustes (inscription, changement, contrôle à la connexion)
// Au moins 12 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial.
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

const RULES = [
    { test: (p) => p.length >= PASSWORD_MIN_LENGTH, message: `au moins ${PASSWORD_MIN_LENGTH} caractères` },
    { test: (p) => /[a-z]/.test(p), message: 'une lettre minuscule' },
    { test: (p) => /[A-Z]/.test(p), message: 'une lettre majuscule' },
    { test: (p) => /\d/.test(p), message: 'un chiffre' },
    { test: (p) => /[^A-Za-z0-9]/.test(p), message: 'un caractère spécial (ex : ! ? # @)' },
];

// Liste des règles non respectées (vide = mot de passe robuste)
export function passwordProblems(password) {
    const value = String(password || '');
    const missing = RULES.filter((rule) => !rule.test(value)).map((rule) => rule.message);
    if (value.length > PASSWORD_MAX_LENGTH) missing.push(`au plus ${PASSWORD_MAX_LENGTH} caractères`);
    return missing;
}

export function isStrongPassword(password) {
    return passwordProblems(password).length === 0;
}

export function passwordError(password) {
    const missing = passwordProblems(password);
    return missing.length ? `Le mot de passe doit contenir ${missing.join(', ')}.` : null;
}
