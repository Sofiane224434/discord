// config/links.js — liens externes utilisés sur tout le site (un seul endroit à modifier)

// Invitation du serveur support « SUPPORT AZIMBOT ».
// ⚠️ Expire le 13/11/2026 : remplacer par une invitation permanente (« N'expire jamais »).
export const SUPPORT_URL = 'https://discord.gg/XZmM6BZR8';

// Identifiant public de l'application Discord d'Azim (invitation, Activité)
export const DISCORD_CLIENT_ID = '1462543984584032430';

// Ajout du bot sur un serveur
// (permissions : celles d'avant + bannir, expulser, exclure, gérer les salons, créer une invitation)
export const ADD_BOT_URL = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=1099780451415&scope=bot%20applications.commands`;

// Ouvre l'ajout du bot par un bouton : l'adresse Discord n'apparaît pas en bas du navigateur au survol
export function openAddBot() {
    window.open(ADD_BOT_URL, '_blank', 'noopener,noreferrer');
}
