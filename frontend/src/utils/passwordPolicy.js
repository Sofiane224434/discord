// utils/passwordPolicy.js — même règle que le serveur (backend/config/password-policy.js)
export const PASSWORD_MIN_LENGTH = 12;

export const PASSWORD_RULES = [
    { id: 'length', test: (p) => p.length >= PASSWORD_MIN_LENGTH },
    { id: 'lower', test: (p) => /[a-z]/.test(p) },
    { id: 'upper', test: (p) => /[A-Z]/.test(p) },
    { id: 'digit', test: (p) => /\d/.test(p) },
    { id: 'special', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function isStrongPassword(password) {
    return PASSWORD_RULES.every((rule) => rule.test(String(password || '')));
}
