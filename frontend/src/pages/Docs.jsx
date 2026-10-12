import { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../hooks/useAuth.js';

const ADD_BOT_URL = 'https://discord.com/oauth2/authorize?client_id=1462543984584032430&permissions=268823632&scope=bot%20applications.commands';

// Données exhaustives de la documentation
const DOCS_DATA = [
    {
        category: '', // Groupe principal en tête sans titre (façon DraftBot)
        items: [
            {
                slug: 'accueil',
                title: 'Accueil',
                icon: '📍',
                summary: 'Présentation globale d’AzimBot, fonctionnalités phares et architecture.',
                sections: [
                    { id: 'introduction', label: 'Introduction' },
                    { id: 'fonctionnalites-cles', label: 'Fonctionnalités clés' },
                    { id: 'architecture', label: 'Architecture & Sécurité' },
                    { id: 'demarrage-rapide', label: 'Démarrage rapide' },
                ],
                content: {
                    badge: '',
                    heading: 'Accueil',
                    lead: 'Bienvenue sur la documentation d’AzimBot. Retrouvez ici des conseils, des tutoriels et les réponses à vos questions.',
                    blocks: [
                        {
                            type: 'draft_intro',
                        },
                        {
                            type: 'hint',
                            variant: 'info',
                            title: 'Première utilisation',
                            text: 'Pour démarrer en moins de 2 minutes, invitez simplement AzimBot avec les permissions recommandées et tapez `/help` ou accédez à votre panel web.'
                        },
                        {
                            type: 'section',
                            id: 'introduction',
                            title: 'Qu’est-ce qu’AzimBot ?',
                            paragraphs: [
                                'AzimBot combine tous les outils indispensables pour gérer, animer et sécuriser un serveur Discord au sein d’une seule interface moderne.',
                                'Finis les 10 bots différents qui se chevauchent : AzimBot gère votre assistant IA, vos messages d’accueil personnalisés, vos niveaux d’XP, votre modération et vos alertes de réseaux sociaux.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'fonctionnalites-cles',
                            title: 'Les piliers fondamentaux',
                            items: [
                                { strong: '🤖 Assistant IA Avancé :', text: 'Réponses conversationnelles contextuelles, personnalisation du prompt par serveur et analyse multimodale.' },
                                { strong: '🛡️ Modération & Protection :', text: 'Filtres antispam, purge de salon ciblée avec /purge, permissions d’accès strictes et logs détaillés.' },
                                { strong: '👋 Accueil & Rôles automatiques :', text: 'Messages de bienvenue immersifs, messages privés, attribution de rôle automatique dès l’arrivée.' },
                                { strong: '🏆 Niveaux & Engagement :', text: 'Système d’XP actif par message, cartes de profil /rank et rôles de récompense configurables.' },
                                { strong: '🔔 Veille Réseaux :', text: 'Notifications instantanées pour vos chaînes YouTube et lives TikTok en temps réel.' }
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'tip',
                            isIslamic: true,
                            title: 'Mode & Thème Islamique Dédié',
                            text: 'AzimBot intègre un module spirituel complet exclusif (Horaires de prière, Coran audio 24/7 dans les salons vocaux, Invocations de la Citadelle du Musulman et Hadiths authentiques), activable via code secret ou depuis les paramètres de votre serveur.'
                        },
                        {
                            type: 'section',
                            id: 'architecture',
                            title: 'Architecture & Sécurité',
                            paragraphs: [
                                'Tous les réglages sont cloisonnés par serveur : les configurations IA, les mots interdits et les salons sont strictement isolés dans une base de données sécurisée.',
                                'Le bot respecte scrupuleusement les dernières normes de Discord (Slash Commands V10, Discord.js v14 et OAuth2 avec chiffrement JWT).'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'demarrage-rapide',
                            title: 'Prêt à configurer ?',
                            paragraphs: [
                                'Suivez le guide d’installation ci-après pour autoriser le bot sur votre serveur et attribuer les rôles nécessaires.'
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'installation',
                title: 'Installation',
                icon: '🛠️',
                summary: 'Comment inviter le bot et configurer les permissions Discord requises.',
                sections: [
                    { id: 'invitation', label: 'Inviter le bot' },
                    { id: 'permissions', label: 'Permissions requises' },
                    { id: 'hierarchie', label: 'Hiérarchie des rôles' },
                ],
                content: {
                    badge: 'Guide d’installation',
                    heading: 'Installation & Droits Discord',
                    lead: 'Apprenez à ajouter AzimBot sur votre serveur Discord en quelques clics et assurez-vous que ses permissions lui permettent de fonctionner à 100%.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'invitation',
                            title: '1. Inviter AzimBot sur votre serveur',
                            paragraphs: [
                                'Cliquez sur le bouton ci-dessous pour ouvrir le portail officiel d’autorisation OAuth2 de Discord :',
                            ],
                            actionButton: { label: 'Ajouter AzimBot à Discord ↗', url: ADD_BOT_URL }
                        },
                        {
                            type: 'hint',
                            variant: 'warning',
                            title: 'Droit d’administration du serveur',
                            text: 'Vous devez posséder la permission "Gérer le serveur" ou être le propriétaire du serveur Discord pour pouvoir y ajouter un bot.'
                        },
                        {
                            type: 'section',
                            id: 'permissions',
                            title: '2. Tableau des permissions recommandées',
                            paragraphs: [
                                'Pour exploiter l’intégralité des fonctionnalités, voici les autorisations essentielles accordées lors de l’invitation :'
                            ],
                            table: {
                                headers: ['Permission Discord', 'Utilité', 'Obligatoire'],
                                rows: [
                                    ['Voir les salons & Envoyer des messages', 'Permet à Azim d’écouter et répondre aux commandes', 'Oui'],
                                    ['Gérer les rôles', 'Attribution des rôles de bienvenue et récompenses de niveaux', 'Oui'],
                                    ['Gérer les messages', 'Nécessaire pour la commande de modération /purge', 'Oui'],
                                    ['Intégrer des liens & Joindre des fichiers', 'Affichage des embeds riches et cartes de niveau', 'Oui'],
                                    ['Se connecter & Parler (Vocal)', 'Diffusion audio et annonces vocales', 'Optionnel']
                                ]
                            }
                        },
                        {
                            type: 'section',
                            id: 'hierarchie',
                            title: '3. Hiérarchie des rôles (Important)',
                            paragraphs: [
                                'Dans les paramètres de votre serveur Discord > Rôles, faites glisser le rôle d’AzimBot au-dessus des rôles qu’il doit attribuer aux membres (rôles de bienvenue, rôles de niveau).',
                                'Discord interdit formellement à un bot de gérer un rôle situé plus haut que le sien dans la liste.'
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'parametres',
                title: 'Paramètres',
                icon: '⚙️',
                summary: 'Prise en main des commandes de base et accès au dashboard web.',
                sections: [
                    { id: 'commandes-initiales', label: 'Commandes initiales' },
                    { id: 'connexion-panel', label: 'Connexion au panel' },
                ],
                content: {
                    badge: 'Prise en main',
                    heading: 'Premiers pas avec AzimBot',
                    lead: 'Une fois le bot présent sur votre serveur, vous pouvez interagir immédiatement avec les commandes slash ou paramétrer vos préférences depuis le dashboard.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'commandes-initiales',
                            title: 'Vos premières commandes slash',
                            codeList: [
                                { cmd: '/help', desc: 'Affiche la liste interactive des commandes disponibles sur votre serveur.' },
                                { cmd: '/ask prompt:Bonjour Azim !', desc: 'Pose une question à l’assistant IA du serveur.' },
                                { cmd: '/site', desc: 'Affiche le lien vers le site officiel et le panel d’administration.' },
                                { cmd: '/report', desc: 'Transmet une suggestion ou signale un bug à l’équipe de développement.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'connexion-panel',
                            title: 'Accéder au panel de gestion',
                            paragraphs: [
                                'Rendez-vous sur la page Panel (/dashboard) et connectez-vous avec votre compte Discord.',
                                'Vous verrez la liste des serveurs que vous administrez. Cliquez sur "Configurer" pour accéder à tous les modules en direct.'
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'ia',
                title: 'Messages & IA',
                icon: '💬',
                summary: 'Configuration du modèle IA, personnalisation du prompt et salon dédié.',
                sections: [
                    { id: 'fonctionnement-ia', label: 'Fonctionnement de l’IA' },
                    { id: 'parametres-ia', label: 'Paramètres disponibles' },
                    { id: 'commandes-ia', label: 'Commandes associées' },
                ],
                content: {
                    badge: 'Intelligence Artificielle',
                    heading: 'Assistant IA & Personnalisation',
                    lead: 'Offrez à votre communauté un assistant intelligent capable de répondre aux questions, d’animer les salons et de respecter la personnalité propre à votre serveur.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'fonctionnement-ia',
                            title: 'Comment fonctionne l’IA ?',
                            paragraphs: [
                                'AzimBot s’appuie sur les modèles les plus performants pour générer des réponses naturelles et précises en français, anglais, arabe et autres langues.',
                                'Il peut répondre soit sur demande via la commande `/ask`, soit en conversation continue si un salon IA dédié est paramétré.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'parametres-ia',
                            title: 'Paramètres configurables dans le Panel',
                            table: {
                                headers: ['Paramètre', 'Type', 'Description'],
                                rows: [
                                    ['ia_langue', 'Texte', 'Langue principale de l’assistant (fr, en, ar, etc.)'],
                                    ['ia_prompt', 'Texte long', 'Consignes de personnalité, ton de voix et règles strictes'],
                                    ['ia_channel', 'Salon Discord', 'Salon textuel réservé où l’IA répond sans commande'],
                                    ['ia_active', 'Booléen', 'Activation ou désactivation globale de l’IA sur le serveur']
                                ]
                            }
                        },
                        {
                            type: 'section',
                            id: 'commandes-ia',
                            title: 'Commandes IA',
                            codeList: [
                                { cmd: '/ask prompt:Explique-moi la théorie de la relativité', desc: 'Pose une question ponctuelle avec réponse enrichie.' },
                                { cmd: '/config ia_prompt', desc: 'Met à jour les consignes personnalisées de l’assistant.' },
                                { cmd: '/zzzz', desc: 'Met temporairement l’IA en pause dans le salon actuel.' }
                            ]
                        }
                    ]
                }
            },
        ]
    },
    {
        category: 'ACCUEIL DES MEMBRES',
        items: [
            {
                slug: 'bienvenue',
                title: 'Arrivées & départs',
                icon: '👋',
                summary: 'Messages d’arrivée, messages privés et attribution de rôles dès l’adhésion.',
                sections: [
                    { id: 'messages-bienvenue', label: 'Messages d’arrivée' },
                    { id: 'roles-auto', label: 'Rôles automatiques' },
                ],
                content: {
                    badge: 'Gestion des membres',
                    heading: 'Accueil personnalisé & Rôles automatiques',
                    lead: 'Créez une première impression mémorable pour chaque nouveau venu avec des messages de bienvenue illustrés et des rôles attribués dès la première seconde.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'messages-bienvenue',
                            title: 'Configuration du message d’accueil',
                            paragraphs: [
                                'Vous pouvez définir un salon textuel public où Azim souhaitera la bienvenue, ou envoyer un message privé chaleureux au nouveau membre.',
                                'Utilisez les variables dynamiques telles que `{user}`, `{server}` et `{count}` pour personnaliser votre texte.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'roles-auto',
                            title: 'Autorôles',
                            paragraphs: [
                                'Dès qu’un utilisateur rejoint le serveur, AzimBot peut lui assigner un ou plusieurs rôles par défaut (ex: Rôle Membre, Rôle Non-Vérifié).'
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'roles',
                title: 'Gestion des rôles',
                icon: '🏷️',
                summary: 'Configuration des rôles automatiques, hiérarchie et permissions.',
                sections: [
                    { id: 'roles-bienvenue', label: 'Rôles à l’arrivée' },
                    { id: 'roles-niveaux', label: 'Rôles de récompense XP' },
                    { id: 'hierarchie-discord', label: 'Hiérarchie Discord' },
                ],
                content: {
                    badge: 'Gestion des rôles',
                    heading: 'Gestion & Attribution des Rôles',
                    lead: 'Automatisez la gestion des rangs de votre serveur Discord : autorôles pour nouveaux membres et rôles exclusifs attribués par palier d’activité.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'roles-bienvenue',
                            title: '1. Rôles attribués à l’arrivée',
                            paragraphs: [
                                'Dès qu’un nouveau membre rejoint votre communauté, AzimBot peut lui assigner un ou plusieurs rôles prédéfinis sans intervention manuelle.',
                                'Configurez ces rôles directement depuis l’onglet "Accueil & Membres" de votre panel d’administration.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'roles-niveaux',
                            title: '2. Rôles de récompense par palier de niveau',
                            paragraphs: [
                                'Fidélisez votre serveur en définissant des rôles débloqués automatiquement lorsque les membres atteignent les niveaux 5, 10, 20 ou 50.',
                                'AzimBot annonce fièrement le déblocage du nouveau rôle avec une carte personnalisée.'
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'warning',
                            title: 'Règle essentielle de hiérarchie',
                            text: 'Assurez-vous que le rôle d’AzimBot est positionné au-dessus de tous les rôles qu’il doit attribuer dans les Paramètres du Serveur > Rôles.'
                        }
                    ]
                }
            },
        ]
    },
    {
        category: 'ENGAGEMENT',
        items: [
            {
                slug: 'niveaux',
                title: 'Niveaux',
                icon: '📈',
                summary: 'Système d’XP, paliers de niveau, cartes /rank et classement de serveur.',
                sections: [
                    { id: 'mecanique-xp', label: 'Mécanique d’expérience' },
                    { id: 'commandes-rank', label: 'Commandes /rank' },
                ],
                content: {
                    badge: 'Engagement & Gamification',
                    heading: 'Système de Niveaux & XP',
                    lead: 'Récompensez l’activité de vos membres les plus fidèles avec un système d’XP automatique, des cartes visuelles et des rôles débloqués par palier.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'mecanique-xp',
                            title: 'Comment les membres gagnent de l’XP ?',
                            paragraphs: [
                                'Chaque message envoyé rapporte entre 15 et 25 points d’expérience avec un cooldown de 60 secondes pour éviter le spam abusif.',
                                'Au fil des niveaux, des rôles exclusifs peuvent être attribués automatiquement.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'commandes-rank',
                            title: 'Commandes de niveaux',
                            codeList: [
                                { cmd: '/rank', desc: 'Affiche votre carte de niveau personnelle avec votre jauge d’XP.' },
                                { cmd: '/rank membre:@Ami', desc: 'Affiche la carte de progression d’un autre membre.' }
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'reseaux',
                title: 'Alertes Réseaux',
                icon: '🔔',
                summary: 'Surveillance et annonces automatiques pour chaînes YouTube et TikTok Live.',
                sections: [
                    { id: 'youtube', label: 'Alertes YouTube' },
                    { id: 'tiktok', label: 'Alertes TikTok' },
                ],
                content: {
                    badge: 'Intégrations & Médias',
                    heading: 'Alertes YouTube & TikTok',
                    lead: 'Ne manquez plus aucune sortie de vidéo ou lancement de live grâce aux alertes automatisées dans le salon de votre choix.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'youtube',
                            title: 'Surveillance YouTube',
                            paragraphs: [
                                'Ajoutez l’identifiant d’une chaîne YouTube pour recevoir un message riche avec miniature, titre et lien direct dès qu’une vidéo est mise en ligne.'
                            ],
                            codeList: [
                                { cmd: '/youtube channel:UC...', desc: 'Configure la surveillance d’une chaîne YouTube.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'tiktok',
                            title: 'Surveillance TikTok',
                            paragraphs: [
                                'Détectez le passage en live de vos créateurs préférés et prévenez instantanément votre communauté.'
                            ],
                            codeList: [
                                { cmd: '/tiktok username:@creator', desc: 'Alerte dès le démarrage d’un live TikTok.' }
                            ]
                        }
                    ]
                }
            },
        ]
    },
    {
        category: 'SÉCURITÉ & OUTILS',
        items: [
            {
                slug: 'moderation',
                title: 'Modération & Purge',
                icon: '🛡️',
                summary: 'Commandes de modération rapide, purge de messages et gestion des alertes.',
                sections: [
                    { id: 'outils-moderation', label: 'Outils de modération' },
                    { id: 'commande-purge', label: 'Commande /purge' },
                ],
                content: {
                    badge: 'Sécurité & Modération',
                    heading: 'Modération & Nettoyage de salon',
                    lead: 'Gardez vos salons propres et agréables pour vos membres grâce aux commandes de modération rapide d’AzimBot.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'outils-moderation',
                            title: 'Outils à disposition de vos modérateurs',
                            paragraphs: [
                                'AzimBot fournit une panoplie complète pour agir rapidement en cas de raid, de spam ou de débordement.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'commande-purge',
                            title: 'La commande /purge',
                            paragraphs: [
                                'La commande `/purge` permet de supprimer instantanément entre 1 et 100 messages récents dans un salon textuel.'
                            ],
                            codeList: [
                                { cmd: '/purge nombre:50', desc: 'Supprime les 50 derniers messages du salon.' },
                                { cmd: '/purge nombre:20 utilisateur:@Membre', desc: 'Supprime uniquement les messages envoyés par ce membre précis.' }
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'warning',
                            title: 'Limite Discord des 14 jours',
                            text: 'L’API Discord ne permet pas la suppression en masse de messages datant de plus de 14 jours.'
                        }
                    ]
                }
            },
            {
                slug: 'utilitaires',
                title: 'Utilitaires & Profil',
                icon: '🔧',
                summary: 'Commandes pratiques, infos de serveur, rappels et gestion de la photo de profil du bot.',
                sections: [
                    { id: 'commandes-utiles', label: 'Commandes utiles' },
                    { id: 'avatar-bot', label: 'Photo de profil d’AzimBot' },
                ],
                content: {
                    badge: 'Outils pratiques',
                    heading: 'Commandes Utilitaires & Avatar',
                    lead: 'Accédez à une suite d’outils pratiques pour le quotidien de votre serveur.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'commandes-utiles',
                            title: 'Commandes du quotidien',
                            codeList: [
                                { cmd: '/serverinfo', desc: 'Affiche les statistiques complètes du serveur (membres, salons, date de création).' },
                                { cmd: '/userinfo membre:@Membre', desc: 'Consulte la date d’arrivée et les rôles d’un membre.' },
                                { cmd: '/remindme temps:1h texte:Réunion équipe', desc: 'Programme un rappel automatique envoyé par le bot.' },
                                { cmd: '/ping', desc: 'Mesure la latence avec l’API Discord.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'avatar-bot',
                            title: 'Personnalisation de la photo de profil (/botavatar)',
                            paragraphs: [
                                'AzimBot propose une photo de profil officielle haute définition pour votre serveur Discord.',
                                'Vous pouvez afficher, télécharger l’image officielle ou rétablir l’avatar par défaut à tout moment via `/botavatar`.'
                            ]
                        }
                    ]
                }
            }
        ]
    },
    {
        category: 'COMMANDES & SUPPORT',
        items: [
            {
                slug: 'commandes',
                title: 'Toutes les commandes',
                icon: '⚡',
                summary: 'Catalogue complet et interactif de toutes les commandes slash d’AzimBot.',
                sections: [
                    { id: 'questions-outils', label: 'Questions & Outils' },
                    { id: 'reglages-accueil', label: 'Réglages & Accueil' },
                    { id: 'moderation-niveaux', label: 'Modération & Niveaux' },
                    { id: 'alertes-reseaux', label: 'Alertes & Réseaux' },
                ],
                content: {
                    badge: 'Répertoire complet',
                    heading: 'Toutes les commandes d’AzimBot',
                    lead: 'Retrouvez l’ensemble des commandes disponibles sur votre serveur, leur syntaxe et leur utilité.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'questions-outils',
                            title: 'Questions & Outils',
                            codeList: [
                                { cmd: '/ask prompt:[texte]', desc: 'Pose une question à l’assistant IA du serveur.' },
                                { cmd: '/site', desc: 'Consulte le site officiel et accède au tableau de bord.' },
                                { cmd: '/report', desc: 'Signale un bug ou soumets une suggestion pour AzimBot.' },
                                { cmd: '/help', desc: 'Affiche les commandes actives et leur usage sur le serveur.' },
                                { cmd: '/botavatar', desc: 'Affiche, télécharge ou rétablit la photo de profil du bot.' },
                                { cmd: '/ping', desc: 'Mesure la latence Discord et WebSocket.' },
                                { cmd: '/remindme temps:[délai] texte:[note]', desc: 'Programme un rappel personnel automatique.' },
                                { cmd: '/salon nom:[texte]', desc: 'Propose un nom et une description de salon.' },
                                { cmd: '/version', desc: 'Affiche la version et l’historique du bot.' },
                                { cmd: '/serverinfo', desc: 'Consulte les informations et statistiques du serveur.' },
                                { cmd: '/userinfo membre:[@user]', desc: 'Affiche le profil Discord d’un membre.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'reglages-accueil',
                            title: 'Réglages & Accueil',
                            codeList: [
                                { cmd: '/config', desc: 'Règle la langue IA, le prompt, les journaux et le profil du bot.' },
                                { cmd: '/welcome', desc: 'Configure les messages d’arrivée et les rôles automatiques.' },
                                { cmd: '/code valeur:[code]', desc: 'Active ou désactive des modules d’extension avec un code d’accès.' },
                                { cmd: '/permissions', desc: 'Consulte les autorisations requises pour chaque commande.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'moderation-niveaux',
                            title: 'Modération & Niveaux',
                            codeList: [
                                { cmd: '/purge nombre:[1-100]', desc: 'Supprime un ensemble de messages selon des filtres.' },
                                { cmd: '/zzzz', desc: 'Suspend temporairement les réponses automatiques de l’IA dans le salon.' },
                                { cmd: '/rank', desc: 'Affiche votre carte de niveau et votre jauge d’XP.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'alertes-reseaux',
                            title: 'Alertes & Réseaux sociaux',
                            codeList: [
                                { cmd: '/youtube channel:[ID/URL]', desc: 'Surveille une chaîne YouTube et annonce ses nouvelles vidéos.' },
                                { cmd: '/tiktok username:[compte]', desc: 'Alerte instantanément lors du passage en live TikTok.' },
                                { cmd: '/pubtimer', desc: 'Suit le temps consacré aux publications de l’équipe.' },
                                { cmd: '/rappelbump', desc: 'Envoie le rappel de bump du serveur Discord.' }
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'faq',
                title: 'Foire Aux Questions',
                icon: '❓',
                summary: 'Questions fréquentes, résolution de problèmes et support.',
                sections: [
                    { id: 'general', label: 'Questions générales' },
                    { id: 'permissions-faq', label: 'Permissions & Rôles' },
                ],
                content: {
                    badge: 'Aide & Dépannage',
                    heading: 'Foire Aux Questions & Support',
                    lead: 'Trouvez rapidement des réponses aux interrogations les plus fréquentes concernant l’utilisation d’AzimBot.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'general',
                            title: 'Questions générales',
                            items: [
                                { strong: 'Le bot est-il gratuit ?', text: 'Oui, toutes les fonctionnalités principales (IA, niveaux, accueil, modération, alertes) sont 100% gratuites.' },
                                { strong: 'Pourquoi le bot ne répond pas à /ask ?', text: 'Vérifiez que le bot possède la permission "Envoyer des messages" et "Intégrer des liens" dans le salon concerné, et que l’IA n’a pas été mise en pause via /zzzz.' },
                                { strong: 'Comment modifier les réglages ?', text: 'Connectez-vous sur le Panel de gestion avec votre compte Discord ou utilisez la commande /config.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'permissions-faq',
                            title: 'Permissions & Rôles automatiques',
                            paragraphs: [
                                'Si AzimBot n’arrive pas à attribuer un rôle de bienvenue ou de niveau, vérifiez que le rôle du bot se situe plus haut dans la liste des rôles Discord que les rôles qu’il doit distribuer.'
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'info',
                            title: 'Besoin d’aide supplémentaire ?',
                            text: 'Rejoignez notre serveur support Discord officiel pour poser vos questions directement à l’équipe ou échanger avec la communauté.'
                        }
                    ]
                }
            }
        ]
    },
    {
        category: 'ISLAM & SPIRITUALITÉ',
        isIslamicCategory: true,
        items: [
            {
                slug: 'islam-priere',
                title: 'Horaires & Adhan',
                icon: '🕌',
                summary: 'Calcul précis des 5 prières quotidiennes, compte à rebours et alertes Adhan.',
                sections: [
                    { id: 'calcul-priere', label: 'Calcul des horaires' },
                    { id: 'commande-priere', label: 'Commande /priere' },
                ],
                content: {
                    badge: 'Spiritualité Islamique',
                    heading: 'Horaires des Prières & Adhan',
                    lead: 'Affichez les heures exactes des 5 prières quotidiennes (Fajr, Dhuhr, Asr, Maghrib, Isha) calculées selon votre ville ou coordonnées GPS.',
                    blocks: [
                        {
                            type: 'hint',
                            variant: 'tip',
                            title: 'Calcul astronomique précis',
                            text: 'AzimBot prend en compte les méthodes officielles de calcul (UOIF 12°, Ligue Islamique Mondiale, etc.) pour vous garantir une exactitude parfaite.'
                        },
                        {
                            type: 'section',
                            id: 'commande-priere',
                            title: 'La commande /priere',
                            codeList: [
                                { cmd: '/priere ville:Paris', desc: 'Affiche les 5 horaires de prière pour la ville demandée avec compte à rebours de la prochaine prière.' },
                                { cmd: '/qibla ville:Marseille', desc: 'Calcule la direction exacte de la Kaaba (La Mecque) avec degrés de boussole et distance.' },
                                { cmd: '/hijri', desc: 'Consulte la date du calendrier islamique lunaire et les rappels des Jours Blancs.' }
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'islam-coran',
                title: 'Radio Coran 24/7',
                icon: '📖',
                summary: 'Radio Coran en continu dans les salons vocaux et recherche de versets.',
                sections: [
                    { id: 'radio-coran', label: 'Radio Coran 24/7' },
                    { id: 'commande-coran', label: 'Commande /coran' },
                ],
                content: {
                    badge: 'Saint Coran & Vocaux',
                    heading: 'Radio Coran 24/7 & Versets',
                    lead: 'Diffusez le Noble Coran en haute qualité audio 24 heures sur 24 dans vos salons vocaux avec plus de 20 récitateurs renommés.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'radio-coran',
                            title: 'La commande /radio',
                            paragraphs: [
                                'Connectez le bot dans un salon vocal pour lancer la diffusion en direct sans interruption.'
                            ],
                            codeList: [
                                { cmd: '/radio action:play recitateur:Al-Afasy', desc: 'Lance la radio Coran continue avec Mishary Rashid Al-Afasy.' },
                                { cmd: '/radio action:stop', desc: 'Arrête la diffusion et déconnecte le bot du salon vocal.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'commande-coran',
                            title: 'La commande /coran',
                            paragraphs: [
                                'Recherchez n’importe quelle sourate ou verset pour afficher le texte arabe calligraphié, la phonétique et la traduction française fidèle.'
                            ],
                            codeList: [
                                { cmd: '/coran sourate:1 verset:1', desc: 'Affiche Al-Fatiha verset 1 avec lecture audio.' }
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'islam-rappels',
                title: 'Hadiths & Invocations',
                icon: '🤲',
                summary: 'Invocations de la Citadelle du Musulman et 40 Hadiths Nawawi.',
                sections: [
                    { id: 'douas', label: 'Invocations (/doua)' },
                    { id: 'hadiths', label: 'Enseignements (/hadith)' },
                ],
                content: {
                    badge: 'Sagesse & Méditation',
                    heading: 'Invocations & Hadiths Authentiques',
                    lead: 'Consultez des centaines d’invocations de protection, du matin et du soir, ainsi que les recueils de hadiths authentiques.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'douas',
                            title: 'La commande /doua',
                            codeList: [
                                { cmd: '/doua categorie:matin', desc: 'Affiche les invocations authentiques du matin avec transcription phonétique et traduction.' },
                                { cmd: '/asma', desc: 'Consulte les 99 Noms d’Allah (Asma ul-Husna) avec leur signification profonde.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'hadiths',
                            title: 'La commande /hadith',
                            codeList: [
                                { cmd: '/hadith', desc: 'Tire un hadith au sort parmi les 40 de l’Imam An-Nawawi ou Sahih Al-Bukhari.' }
                            ]
                        }
                    ]
                }
            }
        ]
    }
];

function Docs() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { theme, isIslamUnlocked } = useTheme();
    const { isAuthenticated } = useAuth();

    // État de recherche instantanée
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedCmd, setCopiedCmd] = useState(null);

    // Filtrer les catégories selon le déblocage Islam
    const availableCategories = useMemo(() => {
        return DOCS_DATA.filter((cat) => !cat.isIslamicCategory || isIslamUnlocked);
    }, [isIslamUnlocked]);

    // Liste plate de tous les articles disponibles
    const allArticles = useMemo(() => {
        return availableCategories.flatMap((cat) =>
            cat.items.map((item) => ({ ...item, categoryName: cat.category }))
        );
    }, [availableCategories]);

    // Trouver l'article courant
    const currentSlug = slug || 'accueil';
    const currentArticle = useMemo(() => {
        return allArticles.find((a) => a.slug === currentSlug) || allArticles[0];
    }, [allArticles, currentSlug]);

    // Pagination Précédent / Suivant
    const currentIndex = allArticles.findIndex((a) => a.slug === currentArticle?.slug);
    const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
    const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

    // Filtrage dynamique pour la barre de recherche
    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return availableCategories;
        const q = searchQuery.toLowerCase().trim();
        return availableCategories
            .map((cat) => ({
                ...cat,
                items: cat.items.filter(
                    (item) =>
                        item.title.toLowerCase().includes(q) ||
                        item.summary.toLowerCase().includes(q) ||
                        item.content.heading.toLowerCase().includes(q)
                )
            }))
            .filter((cat) => cat.items.length > 0);
    }, [availableCategories, searchQuery]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedCmd(text);
        setTimeout(() => setCopiedCmd(null), 2000);
    };

    return (
        <div className="doc-page">
            <div className="doc-page__container">
                {/* ========================================================= */}
                {/* COLONNE GAUCHE : doc-nav (Sidebar de navigation façon DraftBot) */}
                {/* ========================================================= */}
                <aside className="doc-nav" aria-label="Navigation de la documentation">
                    {/* Barre de recherche DraftBot */}
                    <div className="doc-nav__search-box">
                        <div className="doc-nav__search-wrapper">
                            <svg className="doc-nav__search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher dans la doc..."
                                className="doc-nav__search-input"
                            />
                            {searchQuery ? (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="doc-nav__search-clear"
                                    aria-label="Effacer la recherche"
                                >
                                    ✕
                                </button>
                            ) : (
                                <kbd className="doc-nav__search-kbd">Ctrl K</kbd>
                            )}
                        </div>
                    </div>

                    {/* Liste des catégories & Liens d'articles */}
                    <div className="doc-nav__tree">
                        {filteredCategories.length === 0 ? (
                            <p className="doc-nav__no-results">Aucun résultat trouvé pour "{searchQuery}".</p>
                        ) : (
                            filteredCategories.map((cat, catIdx) => (
                                <div key={cat.category || `cat-${catIdx}`} className="doc-nav__category">
                                    {cat.category && (
                                        <h3 className="doc-nav__category-title">
                                            {cat.isIslamicCategory ? '🕌 ' : ''}{cat.category}
                                        </h3>
                                    )}
                                    <ul className="doc-nav__list">
                                        {cat.items.map((item) => {
                                            const isActive = item.slug === currentArticle?.slug;
                                            return (
                                                <li key={item.slug} className="doc-nav__item">
                                                    <Link
                                                        to={`/docs/${item.slug}`}
                                                        className={`doc-nav__link ${isActive ? 'is-active' : ''}`}
                                                    >
                                                        {item.icon ? (
                                                            <span className="doc-nav__icon" aria-hidden="true">{item.icon}</span>
                                                        ) : (
                                                            <span className="doc-nav__link-bullet" aria-hidden="true" />
                                                        )}
                                                        <span className="doc-nav__link-text">{item.title}</span>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* ========================================================= */}
                {/* COLONNE CENTRALE : doc-content (Contenu prose façon DraftBot) */}
                {/* ========================================================= */}
                <main className="doc-content" role="main">
                    {/* Fil d'ariane (Breadcrumbs - masqué sur l'Accueil façon DraftBot) */}
                    {currentArticle?.slug !== 'accueil' && (
                        <nav className="doc-breadcrumbs" aria-label="Fil d’Ariane">
                            <Link to="/">Accueil</Link>
                            <span className="doc-breadcrumbs__sep">/</span>
                            <Link to="/docs/accueil">Documentation</Link>
                            {currentArticle?.categoryName && (
                                <>
                                    <span className="doc-breadcrumbs__sep">/</span>
                                    <span className="doc-breadcrumbs__category">{currentArticle.categoryName}</span>
                                </>
                            )}
                            <span className="doc-breadcrumbs__sep">/</span>
                            <span className="doc-breadcrumbs__current">{currentArticle?.title}</span>
                        </nav>
                    )}

                    {/* En-tête d'article façon DraftBot */}
                    <header className="doc-header">
                        {currentArticle?.slug !== 'accueil' && currentArticle?.content?.badge && (
                            <div className="doc-header__badge-row">
                                <span className="doc-header__badge">{currentArticle?.content?.badge}</span>
                                <span className="doc-header__tag">AzimBot v2.4</span>
                            </div>
                        )}
                        <h1 className="doc-header__title">{currentArticle?.content?.heading}</h1>
                        <p className="doc-header__lead">{currentArticle?.content?.lead}</p>
                    </header>

                    {/* Contenu principal */}
                    <div className="doc-prose">
                        {currentArticle?.content?.blocks?.map((block, idx) => {
                            if (block.isIslamic && !isIslamUnlocked) {
                                return null;
                            }
                            if (block.type === 'draft_intro') {
                                return (
                                    <div key={idx} className="doc-draft-intro">
                                        <p className="doc-section__p">
                                            Afin que votre découverte de <strong>AzimBot</strong> via notre documentation se passe au mieux, voici quelques détails concernant la rédaction :
                                        </p>
                                        <p className="doc-section__p">
                                            La documentation regroupe <strong>les commandes</strong> et fonctionnalités par <strong>module</strong>, vous permettant ainsi d’appréhender au mieux le bot, de manière claire et intuitive.
                                        </p>
                                        <p className="doc-section__p">
                                            Si vous souhaitez directement accéder à une fonctionnalité en particulier, vous pouvez utiliser la <strong>barre de recherche</strong>.
                                        </p>
                                        <div className="doc-support-callout">
                                            <span className="doc-support-callout__icon" aria-hidden="true">ℹ️</span>
                                            <p className="doc-support-callout__text">
                                                Si vous souhaitez contacter le <strong>Support</strong>, retrouvez-nous sur Discord en{' '}
                                                <a
                                                    href="https://discord.gg/azim"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="doc-support-callout__link"
                                                >
                                                    cliquant ici
                                                </a>.
                                            </p>
                                        </div>
                                    </div>
                                );
                            }

                            if (block.type === 'hint') {
                                return (
                                    <div key={idx} className={`doc-hint doc-hint--${block.variant}`}>
                                        <div className="doc-hint__icon" aria-hidden="true">
                                            {block.variant === 'info' && '💡'}
                                            {block.variant === 'warning' && '⚠️'}
                                            {block.variant === 'tip' && '✨'}
                                        </div>
                                        <div className="doc-hint__body">
                                            <h4 className="doc-hint__title">{block.title}</h4>
                                            <p className="doc-hint__text">{block.text}</p>
                                        </div>
                                    </div>
                                );
                            }

                            if (block.type === 'section') {
                                return (
                                    <section key={idx} id={block.id} className="doc-section">
                                        <h2 className="doc-section__heading">
                                            <a href={`#${block.id}`} className="doc-section__anchor">#</a>
                                            {block.title}
                                        </h2>

                                        {block.paragraphs?.map((p, pIdx) => (
                                            <p key={pIdx} className="doc-section__p">{p}</p>
                                        ))}

                                        {block.actionButton && (
                                            <div className="doc-section__action">
                                                <a
                                                    href={block.actionButton.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="btn btn-primary"
                                                >
                                                    {block.actionButton.label}
                                                </a>
                                            </div>
                                        )}

                                        {block.items && (
                                            <ul className="doc-section__list">
                                                {block.items.map((it, itIdx) => (
                                                    <li key={itIdx}>
                                                        <strong>{it.strong}</strong> {it.text}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {block.table && (
                                            <div className="doc-table-wrapper">
                                                <table className="doc-table">
                                                    <thead>
                                                        <tr>
                                                            {block.table.headers.map((h, hIdx) => (
                                                                <th key={hIdx}>{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {block.table.rows.map((row, rIdx) => (
                                                            <tr key={rIdx}>
                                                                {row.map((cell, cIdx) => (
                                                                    <td key={cIdx}>
                                                                        {cIdx === 0 ? <code>{cell}</code> : cell}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {block.codeList && (
                                            <div className="doc-code-list">
                                                {block.codeList.map((codeItem, cIdx) => (
                                                    <div key={cIdx} className="doc-code-card">
                                                        <div className="doc-code-card__header">
                                                            <code className="doc-code-card__cmd">{codeItem.cmd}</code>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopy(codeItem.cmd)}
                                                                className="doc-code-card__copy-btn"
                                                                title="Copier la commande"
                                                            >
                                                                {copiedCmd === codeItem.cmd ? '✓ Copié' : 'Copier'}
                                                            </button>
                                                        </div>
                                                        <p className="doc-code-card__desc">{codeItem.desc}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                );
                            }

                            return null;
                        })}
                    </div>

                    {/* Pagination DraftBot (Précédent / Suivant) */}
                    <div className="doc-pagination">
                        {prevArticle ? (
                            <Link to={`/docs/${prevArticle.slug}`} className="doc-pagination__card doc-pagination__card--prev">
                                <span className="doc-pagination__label">← Précédent</span>
                                <span className="doc-pagination__title">{prevArticle.title}</span>
                            </Link>
                        ) : <div />}

                        {nextArticle ? (
                            <Link to={`/docs/${nextArticle.slug}`} className="doc-pagination__card doc-pagination__card--next">
                                <span className="doc-pagination__label">Suivant →</span>
                                <span className="doc-pagination__title">{nextArticle.title}</span>
                            </Link>
                        ) : <div />}
                    </div>
                </main>

                {/* ========================================================= */}
                {/* COLONNE DROITE : doc-tocs (Table des matières façon DraftBot) */}
                {/* ========================================================= */}
                <aside className="doc-tocs" aria-label="Sommaire de la page">
                    <div className="doc-tocs__inner">
                        {/* Liens rapides façon DraftBot (En haut !) */}
                        <div className="doc-tocs__section doc-tocs__section--quicklinks">
                            <h4 className="doc-tocs__heading">Liens rapides</h4>
                            <ul className="doc-tocs__quick-list">
                                <li>
                                    <Link to="/feedback" className="doc-tocs__quick-link">
                                        <span className="doc-tocs__quick-icon">✏️</span>
                                        <span>Modifier cette page</span>
                                    </Link>
                                </li>
                                <li>
                                    <a href="https://discord.gg/azim" target="_blank" rel="noreferrer" className="doc-tocs__quick-link">
                                        <span className="doc-tocs__quick-icon">🎧</span>
                                        <span>Support Discord</span>
                                    </a>
                                </li>
                                <li>
                                    <a href={ADD_BOT_URL} target="_blank" rel="noreferrer" className="doc-tocs__quick-link">
                                        <span className="doc-tocs__quick-icon">🤖</span>
                                        <span>Inviter AzimBot</span>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Sur cette page */}
                        {currentArticle?.sections && currentArticle.sections.length > 0 && (
                            <div className="doc-tocs__section mt-6">
                                <h4 className="doc-tocs__heading">SUR CETTE PAGE</h4>
                                <ul className="doc-tocs__list">
                                    {currentArticle.sections.map((sec) => (
                                        <li key={sec.id} className="doc-tocs__item">
                                            <a href={`#${sec.id}`} className="doc-tocs__link">
                                                {sec.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default Docs;
