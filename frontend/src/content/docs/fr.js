// content/docs/fr.js — contenu de la documentation (français)
// Même structure (slugs, ids de sections) que en.js : seuls les textes changent.
// La liste complète des commandes (/docs/commandes) est lue en direct sur le bot : ici, seulement les guides.
import { ADD_BOT_URL } from '../../config/links.js';

const DOCS_FR = [
    {
        category: 'Bien démarrer',
        items: [
            {
                slug: 'accueil',
                title: 'Accueil',
                icon: 'book',
                summary: 'Présentation d’AzimBot, ses fonctionnalités et comment démarrer.',
                sections: [
                    { id: 'introduction', label: 'Introduction' },
                    { id: 'fonctionnalites-cles', label: 'Fonctionnalités clés' },
                    { id: 'architecture', label: 'Réglages & sécurité' },
                    { id: 'demarrage-rapide', label: 'Démarrage rapide' },
                ],
                content: {
                    badge: '',
                    heading: 'Accueil',
                    lead: 'Bienvenue sur la documentation d’AzimBot. Retrouvez ici des conseils, des tutoriels et les réponses à vos questions.',
                    blocks: [
                        {
                            type: 'hint',
                            variant: 'info',
                            title: 'Première utilisation',
                            text: 'Invitez AzimBot avec les permissions recommandées, puis tapez `/help` sur votre serveur ou ouvrez le panel web pour tout régler.'
                        },
                        {
                            type: 'section',
                            id: 'introduction',
                            title: 'Qu’est-ce qu’AzimBot ?',
                            paragraphs: [
                                'AzimBot réunit les outils pour gérer, animer et protéger un serveur Discord dans un seul bot, gratuit et en français.',
                                'Plus besoin de 10 bots différents : AzimBot gère l’assistant IA, l’accueil des membres, les niveaux, la modération et les alertes YouTube et TikTok.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'fonctionnalites-cles',
                            title: 'Les fonctionnalités',
                            items: [
                                { strong: 'Assistant IA :', text: 'réponses avec `/ask` ou dans un salon dédié, consignes et langue réglables par serveur.' },
                                { strong: 'Modération :', text: '`/mod` pour bannir, expulser, exclure, avertir, verrouiller un salon ; `/purge` supprime jusqu’à 1000 messages ou vide un salon entier.' },
                                { strong: 'Accueil des membres :', text: 'messages de bienvenue dans un salon ou en privé, règles selon les rôles.' },
                                { strong: 'Niveaux :', text: 'XP par message, cartes `/rank`, classement et rôles de récompense.' },
                                { strong: 'Alertes réseaux :', text: 'nouvelles vidéos YouTube et lives TikTok annoncés automatiquement.' },
                                { strong: 'Français ou anglais :', text: '`/langue` passe les commandes et les réponses d’Azim dans la langue de votre serveur.' }
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'tip',
                            isIslamic: true,
                            title: 'Mode Islam',
                            text: 'Sur les serveurs en mode Islam : horaires de prière, radio Coran dans les salons vocaux, La Mecque en direct avec `/mecque`, invocations, hadiths, quiz et compagnon du Ramadan.'
                        },
                        {
                            type: 'section',
                            id: 'architecture',
                            title: 'Réglages & sécurité',
                            paragraphs: [
                                'Chaque serveur a ses propres réglages : IA, salons, langue, modération. Tout ce qui se règle par commande se règle aussi sur le panel.',
                                'Seuls les membres qui gèrent un serveur peuvent modifier ses réglages, après connexion avec leur compte Discord.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'demarrage-rapide',
                            title: 'Prêt à configurer ?',
                            paragraphs: [
                                'Suivez le guide d’installation pour ajouter le bot et lui donner les bons rôles, puis consultez la liste de toutes les commandes.'
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'commandes',
                title: 'Toutes les commandes',
                icon: 'terminal',
                featured: true,
                summary: 'Toutes les commandes d’AzimBot, avec leurs sous-commandes et options, toujours à jour.',
                sections: [],
                content: {
                    badge: 'Répertoire complet',
                    heading: 'Toutes les commandes d’AzimBot',
                    lead: 'Toutes les commandes d’Azim avec leurs sous-commandes et options. La liste est lue directement sur le bot : elle est toujours à jour.',
                    blocks: []
                }
            },
            {
                slug: 'installation',
                title: 'Installation',
                icon: 'settings',
                summary: 'Inviter le bot et lui donner les permissions Discord nécessaires.',
                sections: [
                    { id: 'invitation', label: 'Inviter le bot' },
                    { id: 'permissions', label: 'Permissions requises' },
                    { id: 'hierarchie', label: 'Hiérarchie des rôles' },
                ],
                content: {
                    badge: 'Guide d’installation',
                    heading: 'Installation & permissions',
                    lead: 'Ajoutez AzimBot à votre serveur en quelques clics et vérifiez qu’il a les permissions dont il a besoin.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'invitation',
                            title: '1. Inviter AzimBot sur votre serveur',
                            paragraphs: [
                                'Le bouton ci-dessous ouvre la page d’autorisation officielle de Discord, avec les permissions recommandées déjà cochées.',
                            ],
                            actionButton: { label: 'Ajouter AzimBot à Discord ↗', url: ADD_BOT_URL }
                        },
                        {
                            type: 'hint',
                            variant: 'warning',
                            title: 'Droit requis',
                            text: 'Il faut la permission « Gérer le serveur » (ou être propriétaire) pour ajouter un bot.'
                        },
                        {
                            type: 'section',
                            id: 'permissions',
                            title: '2. Permissions recommandées',
                            table: {
                                headers: ['Permission Discord', 'Utilité', 'Obligatoire'],
                                rows: [
                                    ['Voir les salons, envoyer des messages, intégrer des liens', 'Répondre aux commandes avec des messages enrichis', 'Oui'],
                                    ['Gérer les rôles', 'Rôles de bienvenue et de récompense de niveau', 'Oui'],
                                    ['Gérer les messages', '`/purge messages`', 'Pour la modération'],
                                    ['Bannir, expulser, exclure temporairement', '`/mod bannir`, `/mod expulser`, `/mod exclure`', 'Pour la modération'],
                                    ['Gérer les salons', '`/mod verrouiller`, `/mod mode_lent`, `/purge salon`', 'Pour la modération'],
                                    ['Créer une invitation', 'Lien de votre serveur sur le site (`/vitrine`)', 'Optionnel'],
                                    ['Se connecter & parler (vocal)', 'Radio Coran (mode Islam)', 'Optionnel']
                                ]
                            }
                        },
                        {
                            type: 'hint',
                            variant: 'info',
                            title: 'Bot ajouté avant la version 5.0 ?',
                            text: 'Les nouvelles permissions de modération ne s’ajoutent pas toutes seules : réinvitez le bot avec le bouton ci-dessus, ou donnez-les à son rôle dans les paramètres du serveur.'
                        },
                        {
                            type: 'section',
                            id: 'hierarchie',
                            title: '3. Hiérarchie des rôles (important)',
                            paragraphs: [
                                'Dans Paramètres du serveur > Rôles, placez le rôle d’AzimBot au-dessus des rôles qu’il doit donner (bienvenue, niveaux) et des membres qu’il doit pouvoir sanctionner.',
                                'Discord interdit à un bot d’agir sur un rôle ou un membre placé plus haut que lui.'
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'parametres',
                title: 'Paramètres',
                icon: 'settings',
                summary: 'Premières commandes, langue du bot et panel web.',
                sections: [
                    { id: 'commandes-initiales', label: 'Premières commandes' },
                    { id: 'langue', label: 'Langue du bot' },
                    { id: 'connexion-panel', label: 'Le panel' },
                ],
                content: {
                    badge: 'Prise en main',
                    heading: 'Premiers pas avec AzimBot',
                    lead: 'Une fois le bot sur votre serveur, utilisez ses commandes slash ou réglez tout depuis le panel web.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'commandes-initiales',
                            title: 'Vos premières commandes',
                            codeList: [
                                { cmd: '/help', desc: 'Liste les commandes disponibles sur votre serveur, toujours à jour.' },
                                { cmd: '/ask question:Bonjour Azim !', desc: 'Pose une question à l’assistant IA.' },
                                { cmd: '/site', desc: 'Donne le lien du site et du panel.' },
                                { cmd: '/version', desc: 'Affiche la version du bot et les nouveautés (option historique).' },
                                { cmd: '/report', desc: 'Signale un bug ou propose une idée à l’équipe.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'langue',
                            title: 'Français ou anglais',
                            paragraphs: [
                                '`/langue` change la langue d’Azim sur votre serveur : noms et descriptions des commandes, réponses et messages. Le changement s’applique en quelques secondes.',
                                'Le même réglage existe sur le panel, dans l’onglet « Serveur & modération ».'
                            ],
                            codeList: [
                                { cmd: '/langue langue:English', desc: 'Passe Azim en anglais sur ce serveur (les commandes deviennent /mod, /purge, /language…).' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'connexion-panel',
                            title: 'Le panel de gestion',
                            paragraphs: [
                                'Ouvrez le Panel et connectez-vous avec Discord : vous voyez les serveurs que vous gérez.',
                                'Cliquez sur « Configurer » : IA, commandes, bienvenue, niveaux, alertes réseaux, modération, langue et profil du bot se règlent au même endroit.'
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'ia',
                title: 'Messages & IA',
                icon: 'sparkles',
                summary: 'Poser des questions à l’IA, salon dédié, consignes et langue de réponse.',
                sections: [
                    { id: 'fonctionnement-ia', label: 'Fonctionnement de l’IA' },
                    { id: 'parametres-ia', label: 'Réglages' },
                    { id: 'commandes-ia', label: 'Commandes associées' },
                ],
                content: {
                    badge: 'Intelligence artificielle',
                    heading: 'Assistant IA',
                    lead: 'Un assistant qui répond aux questions de vos membres, avec le ton et les règles de votre serveur.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'fonctionnement-ia',
                            title: 'Comment fonctionne l’IA ?',
                            paragraphs: [
                                'Azim répond avec `/ask`, quand on l’appelle par son nom déclencheur dans un message, ou en continu dans un salon IA dédié.',
                                'Les questions sont envoyées au service Groq le temps de générer la réponse (voir la page Confidentialité).'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'parametres-ia',
                            title: 'Réglages (panel ou /config)',
                            table: {
                                headers: ['Réglage', 'Commande', 'Description'],
                                rows: [
                                    ['Langue de réponse', '`/config ia_langue`', 'Langue dans laquelle l’IA répond'],
                                    ['Consignes', '`/config ia_prompt`', 'Personnalité, ton et règles de l’assistant'],
                                    ['Nom déclencheur', '`/config nomai`', 'Le nom qui fait répondre l’IA dans un message'],
                                    ['Clés Groq', '`/config ia_cle_ajouter`', 'Vos propres clés pour l’IA (masquées dans les listes)']
                                ]
                            }
                        },
                        {
                            type: 'section',
                            id: 'commandes-ia',
                            title: 'Commandes IA',
                            codeList: [
                                { cmd: '/ask question:Explique-moi la relativité', desc: 'Pose une question à l’IA.' },
                                { cmd: '/zzzz minutes:30', desc: 'Met l’IA en veille dans ce salon (relancez pour la réveiller).' },
                                { cmd: '/salon nom:annonces style:…', desc: 'Propose un nom de salon stylisé et une description.' }
                            ]
                        }
                    ]
                }
            },
        ]
    },
    {
        category: 'Accueil des membres',
        items: [
            {
                slug: 'bienvenue',
                title: 'Arrivées & départs',
                icon: 'hand',
                summary: 'Messages de bienvenue dans un salon ou en privé, et règles selon les rôles.',
                sections: [
                    { id: 'messages-bienvenue', label: 'Message de bienvenue' },
                    { id: 'regles', label: 'Règles par rôle' },
                ],
                content: {
                    badge: 'Gestion des membres',
                    heading: 'Bienvenue des nouveaux membres',
                    lead: 'Accueillez chaque nouveau membre avec un message dans un salon, en privé, ou les deux.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'messages-bienvenue',
                            title: 'Le message de bienvenue',
                            paragraphs: [
                                'Choisissez le salon, la destination (salon, message privé ou les deux) et le moment d’envoi. Les variables `{user}`, `{server}` et `{count}` personnalisent le texte.'
                            ],
                            codeList: [
                                { cmd: '/welcome activer', desc: 'Active la bienvenue automatique.' },
                                { cmd: '/welcome salon canal:#bienvenue', desc: 'Choisit le salon de bienvenue.' },
                                { cmd: '/welcome destination mode:…', desc: 'Salon, message privé ou les deux.' },
                                { cmd: '/welcome message_defaut message_salon:Bienvenue {user} !', desc: 'Définit le message envoyé par défaut.' },
                                { cmd: '/welcome test', desc: 'Simule la bienvenue pour vérifier le rendu.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'regles',
                            title: 'Règles selon les rôles',
                            paragraphs: [
                                'Envoyez un message différent selon le rôle du membre (par exemple aux membres vérifiés), avec un salon spécifique si besoin.'
                            ],
                            codeList: [
                                { cmd: '/welcome regle_ajouter', desc: 'Ajoute une règle : nom, condition, rôle et message.' },
                                { cmd: '/welcome regles_lister', desc: 'Liste les règles actives.' },
                                { cmd: '/welcome regle_supprimer', desc: 'Supprime une règle.' }
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'roles',
                title: 'Gestion des rôles',
                icon: 'users',
                summary: 'Rôles de récompense par niveau et hiérarchie Discord.',
                sections: [
                    { id: 'roles-niveaux', label: 'Rôles de récompense' },
                    { id: 'hierarchie-discord', label: 'Hiérarchie Discord' },
                ],
                content: {
                    badge: 'Gestion des rôles',
                    heading: 'Rôles automatiques',
                    lead: 'Donnez automatiquement des rôles à vos membres les plus actifs.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'roles-niveaux',
                            title: 'Rôles de récompense par niveau',
                            paragraphs: [
                                'Quand un membre atteint un niveau, Azim lui donne le rôle associé et l’annonce. Réglable sur le panel (onglet Niveaux) ou par commande.'
                            ],
                            codeList: [
                                { cmd: '/rank recompense_ajouter niveau:10 role:@Actif', desc: 'Donne le rôle @Actif au niveau 10.' },
                                { cmd: '/rank recompenses_lister', desc: 'Liste les rôles de récompense.' },
                                { cmd: '/rank recompense_supprimer niveau:10', desc: 'Retire la récompense d’un niveau.' }
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'warning',
                            title: 'Règle de hiérarchie',
                            text: 'Le rôle d’AzimBot doit être placé au-dessus de tous les rôles qu’il donne, dans Paramètres du serveur > Rôles.'
                        }
                    ]
                }
            },
        ]
    },
    {
        category: 'Engagement',
        items: [
            {
                slug: 'niveaux',
                title: 'Niveaux',
                icon: 'activity',
                summary: 'XP par message, cartes /rank, classement et réglages.',
                sections: [
                    { id: 'mecanique-xp', label: 'Gagner de l’XP' },
                    { id: 'commandes-rank', label: 'Commandes /rank' },
                ],
                content: {
                    badge: 'Engagement',
                    heading: 'Niveaux & XP',
                    lead: 'Récompensez l’activité de vos membres avec de l’XP, des cartes de niveau et des rôles.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'mecanique-xp',
                            title: 'Comment gagner de l’XP ?',
                            paragraphs: [
                                'Chaque message rapporte de l’XP, avec un délai entre deux gains pour éviter le spam. Les passages de niveau peuvent être annoncés dans un salon choisi, ou en silence.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'commandes-rank',
                            title: 'Commandes de niveaux',
                            codeList: [
                                { cmd: '/rank voir', desc: 'Votre carte de niveau (option membre pour un autre membre).' },
                                { cmd: '/rank classement', desc: 'Les membres les plus actifs du serveur.' },
                                { cmd: '/rank config activer:Oui salon_annonces:#niveaux', desc: 'Active les niveaux et choisit le salon des annonces (admin).' },
                                { cmd: '/rank reinitialiser', desc: 'Remet à zéro l’XP d’un membre ou du serveur (admin).' }
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'reseaux',
                title: 'Alertes Réseaux',
                icon: 'megaphone',
                summary: 'Nouvelles vidéos YouTube et lives TikTok annoncés automatiquement.',
                sections: [
                    { id: 'youtube', label: 'Alertes YouTube' },
                    { id: 'tiktok', label: 'Alertes TikTok' },
                ],
                content: {
                    badge: 'Réseaux sociaux',
                    heading: 'Alertes YouTube & TikTok',
                    lead: 'Annoncez automatiquement les nouvelles vidéos et les lives dans le salon de votre choix.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'youtube',
                            title: 'YouTube',
                            paragraphs: [
                                'Ajoutez une chaîne par son @pseudo, son lien ou son identifiant. Les listes affichent le nom, le @pseudo et le lien de chaque chaîne, et le panel montre aussi sa photo.'
                            ],
                            codeList: [
                                { cmd: '/youtube add chaine:@pseudo', desc: 'Suit une chaîne.' },
                                { cmd: '/youtube remove chaine:@pseudo', desc: 'Arrête de suivre une chaîne.' },
                                { cmd: '/youtube list', desc: 'Les chaînes suivies, avec nom, @pseudo et lien.' },
                                { cmd: '/youtube config salon:#videos', desc: 'Salon où annoncer les nouvelles vidéos.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'tiktok',
                            title: 'TikTok (plusieurs comptes)',
                            paragraphs: [
                                'Azim vérifie régulièrement les comptes suivis et annonce leur passage en live.'
                            ],
                            codeList: [
                                { cmd: '/tiktok add compte:@pseudo', desc: 'Suit un compte TikTok.' },
                                { cmd: '/tiktok remove compte:@pseudo', desc: 'Arrête de suivre un compte.' },
                                { cmd: '/tiktok list', desc: 'Les comptes suivis, avec nom, @pseudo et lien.' },
                                { cmd: '/tiktok config salon:#lives', desc: 'Salon où annoncer les lives.' },
                                { cmd: '/tiktok activer', desc: 'Active la surveillance (et /tiktok desactiver pour l’arrêter).' },
                                { cmd: '/tiktok statut', desc: 'Statut live actuel des comptes suivis.' }
                            ]
                        }
                    ]
                }
            },
        ]
    },
    {
        category: 'Sécurité & outils',
        items: [
            {
                slug: 'moderation',
                title: 'Modération & Purge',
                icon: 'shield',
                summary: 'Sanctions, avertissements, salons verrouillés et suppression de messages.',
                sections: [
                    { id: 'commande-mod', label: 'Commande /mod' },
                    { id: 'journal', label: 'Journal des sanctions' },
                    { id: 'commande-purge', label: 'Commande /purge' },
                ],
                content: {
                    badge: 'Sécurité & modération',
                    heading: 'Modération & nettoyage',
                    lead: 'Toutes les actions de modération dans deux commandes : /mod pour les membres et les salons, /purge pour les messages.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'commande-mod',
                            title: 'La commande /mod',
                            paragraphs: [
                                'Chaque action vérifie vos permissions Discord : il faut par exemple « Bannir des membres » pour `/mod bannir`.'
                            ],
                            codeList: [
                                { cmd: '/mod bannir membre:@Membre raison:Spam', desc: 'Bannit un membre (option : supprimer ses messages récents).' },
                                { cmd: '/mod debannir utilisateur:ID', desc: 'Lève un bannissement.' },
                                { cmd: '/mod expulser membre:@Membre', desc: 'Expulse un membre (il peut revenir avec une invitation).' },
                                { cmd: '/mod exclure membre:@Membre duree:1h', desc: 'Exclut temporairement : le membre ne peut plus écrire ni parler.' },
                                { cmd: '/mod fin_exclusion membre:@Membre', desc: 'Met fin à l’exclusion.' },
                                { cmd: '/mod avertir membre:@Membre raison:…', desc: 'Donne un avertissement.' },
                                { cmd: '/mod avertissements membre:@Membre', desc: 'Liste les avertissements d’un membre (et /mod effacer_avertissements).' },
                                { cmd: '/mod mode_lent secondes:10', desc: 'Limite la fréquence des messages dans un salon.' },
                                { cmd: '/mod verrouiller', desc: 'Empêche les membres d’écrire dans un salon (et /mod deverrouiller).' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'journal',
                            title: 'Journal des sanctions',
                            paragraphs: [
                                'Sur le panel (onglet « Serveur & modération »), choisissez un salon où Azim note chaque sanction, et décidez si le membre sanctionné reçoit un message privé.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'commande-purge',
                            title: 'La commande /purge',
                            codeList: [
                                { cmd: '/purge messages nombre:200', desc: 'Supprime jusqu’à 1000 messages du salon.' },
                                { cmd: '/purge messages nombre:50 membre:@Membre', desc: 'Seulement les messages de ce membre (filtres aussi : bots, contient).' },
                                { cmd: '/purge messages nombre:100 anciens:Oui', desc: 'Inclut les messages de plus de 14 jours (plus lent).' },
                                { cmd: '/purge salon', desc: 'Vide entièrement le salon : il est recréé à l’identique, après confirmation.' }
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'warning',
                            title: 'Messages de plus de 14 jours',
                            text: 'Discord ne permet de supprimer en groupe que les messages de moins de 14 jours. Avec l’option anciens, Azim supprime les plus vieux un par un, ce qui prend plus de temps.'
                        }
                    ]
                }
            },
            {
                slug: 'utilitaires',
                title: 'Utilitaires & Profil',
                icon: 'terminal',
                summary: 'Infos serveur, rappels, vitrine sur le site, profil et langue du bot.',
                sections: [
                    { id: 'commandes-utiles', label: 'Commandes utiles' },
                    { id: 'vitrine', label: 'Votre serveur sur le site' },
                    { id: 'avatar-bot', label: 'Profil du bot' },
                ],
                content: {
                    badge: 'Outils pratiques',
                    heading: 'Utilitaires & profil du bot',
                    lead: 'Les outils du quotidien pour votre serveur et votre équipe.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'commandes-utiles',
                            title: 'Commandes du quotidien',
                            codeList: [
                                { cmd: '/serverinfo', desc: 'Statistiques du serveur : membres, salons, date de création.' },
                                { cmd: '/userinfo membre:@Membre', desc: 'Date d’arrivée et rôles d’un membre.' },
                                { cmd: '/remindme duree:1h message:Réunion', desc: 'Programme un rappel personnel.' },
                                { cmd: '/permissions', desc: 'Qui peut utiliser chaque commande sur ce serveur.' },
                                { cmd: '/pubtimer lancer', desc: 'Chrono de session pub pour le staff (terminer, total, classement).' },
                                { cmd: '/rappelbump', desc: 'Envoie le rappel de bump dans le salon prévu.' },
                                { cmd: '/ping', desc: 'Latence du bot.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'vitrine',
                            title: 'Votre serveur sur le site',
                            paragraphs: [
                                'Avec `/vitrine`, votre serveur apparaît avec un lien cliquable dans « Autres serveurs » sur le site d’Azim. Également réglable sur le panel.'
                            ],
                            codeList: [
                                { cmd: '/vitrine activer:Oui salon:#bienvenue', desc: 'Crée une invitation vers ce salon et l’affiche sur le site.' },
                                { cmd: '/vitrine activer:Non', desc: 'Retire le lien du site.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'avatar-bot',
                            title: 'Profil du bot sur votre serveur',
                            paragraphs: [
                                'Changez le nom, la description, l’activité et la photo d’Azim sur votre serveur, avec `/config` ou depuis l’onglet « Profil & logs » du panel.'
                            ],
                            codeList: [
                                { cmd: '/config nom nouveau_nom:Azim', desc: 'Change le nom du bot.' },
                                { cmd: '/config avatar image:…', desc: 'Change sa photo (et /config avatar_reset pour revenir à l’officielle).' },
                                { cmd: '/botavatar', desc: 'Affiche, télécharge ou rétablit la photo officielle.' },
                                { cmd: '/config log_salon salon:#logs', desc: 'Salon où Azim signale ses erreurs et redémarrages.' }
                            ]
                        }
                    ]
                }
            }
        ]
    },
    {
        category: 'Aide & support',
        items: [
            {
                slug: 'faq',
                title: 'Foire Aux Questions',
                icon: 'help',
                summary: 'Questions fréquentes, problèmes courants et support.',
                sections: [
                    { id: 'general', label: 'Questions générales' },
                    { id: 'permissions-faq', label: 'Permissions & rôles' },
                ],
                content: {
                    badge: 'Aide & dépannage',
                    heading: 'Foire Aux Questions',
                    lead: 'Les réponses aux questions les plus fréquentes sur AzimBot.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'general',
                            title: 'Questions générales',
                            items: [
                                { strong: 'Le bot est-il gratuit ?', text: 'Oui, toutes les fonctionnalités sont gratuites.' },
                                { strong: 'Azim ne répond pas à /ask ?', text: 'Vérifiez qu’il peut écrire et intégrer des liens dans le salon, et que l’IA n’est pas en veille (`/zzzz`).' },
                                { strong: 'Comment passer Azim en anglais ?', text: '`/langue langue:English`, ou dans le panel, onglet « Serveur & modération ».' },
                                { strong: 'Comment afficher mon serveur sur le site ?', text: '`/vitrine activer:Oui`, ou depuis le panel.' },
                                { strong: 'Où voir les nouveautés ?', text: '`/version` affiche la version actuelle et ses changements ; `/version historique:Oui` les précédentes.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'permissions-faq',
                            title: 'Permissions & rôles',
                            paragraphs: [
                                'Si Azim n’arrive pas à donner un rôle ou à sanctionner un membre, placez son rôle plus haut dans la liste des rôles du serveur.',
                                'Si une commande de modération est refusée, vérifiez que le rôle d’Azim a la permission correspondante (voir Installation).'
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'info',
                            title: 'Besoin d’aide ?',
                            text: 'Rejoignez le serveur support pour poser vos questions à l’équipe et à la communauté.'
                        }
                    ]
                }
            }
        ]
    },
    {
        category: 'Islam & spiritualité',
        isIslamicCategory: true,
        items: [
            {
                slug: 'islam-priere',
                title: 'Horaires & Adhan',
                icon: 'moon',
                summary: 'Horaires des 5 prières, qibla, calendrier hégirien et Ramadan.',
                sections: [
                    { id: 'calcul-priere', label: 'Calcul des horaires' },
                    { id: 'commande-priere', label: 'Commandes' },
                ],
                content: {
                    badge: 'Spiritualité',
                    heading: 'Horaires des prières',
                    lead: 'Les heures des 5 prières (Fajr, Dhuhr, Asr, Maghrib, Isha) pour votre ville, avec le compte à rebours de la prochaine.',
                    blocks: [
                        {
                            type: 'hint',
                            variant: 'tip',
                            title: 'Méthode de calcul',
                            text: 'Choisissez la méthode de calcul (UOIF, Ligue islamique mondiale…) avec l’option methode de `/priere`.'
                        },
                        {
                            type: 'section',
                            id: 'commande-priere',
                            title: 'Commandes',
                            codeList: [
                                { cmd: '/priere ville:Paris', desc: 'Les 5 horaires du jour et le compte à rebours de la prochaine prière.' },
                                { cmd: '/qibla ville:Marseille', desc: 'Direction de la Kaaba en degrés, avec la distance.' },
                                { cmd: '/hijri', desc: 'La date hégirienne du jour à côté de la date grégorienne.' },
                                { cmd: '/ramadan ville:Lyon', desc: 'Horaires d’Imsak et d’Iftar, compte à rebours et invocations.' }
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'islam-coran',
                title: 'Radio Coran 24/7',
                icon: 'book',
                summary: 'Radio Coran dans un ou plusieurs salons vocaux, et lecture du Coran.',
                sections: [
                    { id: 'radio-coran', label: 'Commande /radio' },
                    { id: 'plusieurs-salons', label: 'Plusieurs salons vocaux' },
                    { id: 'commande-coran', label: 'Commande /coran' },
                ],
                content: {
                    badge: 'Coran & vocal',
                    heading: 'Radio Coran 24/7',
                    lead: 'Le Noble Coran en continu dans vos salons vocaux, avec 22 récitateurs.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'radio-coran',
                            title: 'La commande /radio',
                            paragraphs: [
                                'Rejoignez un salon vocal et lancez `/radio`. Le message affiché permet de changer de récitateur, de sourate, de mettre en pause ou d’arrêter.'
                            ],
                            codeList: [
                                { cmd: '/radio', desc: 'Radio continue, à partir d’une sourate au hasard.' },
                                { cmd: '/radio sourate:18 recitateur:sudais', desc: 'Commence par Al-Kahf avec Abdul Rahman Al-Sudais.' },
                                { cmd: '/radio sourate:36 enchainer:Non', desc: 'Récite une seule sourate puis s’arrête.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'plusieurs-salons',
                            title: 'Plusieurs salons vocaux en même temps',
                            paragraphs: [
                                'Discord ne permet qu’un salon vocal par bot et par serveur. Pour diffuser dans un deuxième salon, Azim utilise des bots d’appoint (Azim 2, Azim 3…).',
                                'Lancez `/radio` depuis un autre salon vocal : si un bot d’appoint est libre, il le rejoint ; sinon la réponse donne le lien pour l’inviter sur votre serveur.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'commande-coran',
                            title: 'La commande /coran',
                            codeList: [
                                { cmd: '/coran sourate numero:1', desc: 'Lit une sourate complète en français.' },
                                { cmd: '/coran verset sourate:2 numero:255', desc: 'Affiche un verset précis.' },
                                { cmd: '/coran aleatoire', desc: 'Un verset au hasard.' },
                                { cmd: '/coran radio', desc: 'Même chose que /radio.' }
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'islam-mecque',
                title: 'La Mecque en direct',
                icon: 'play',
                summary: 'Regarder La Mecque ou Médine en direct, ensemble dans un salon vocal.',
                sections: [
                    { id: 'commande-mecque', label: 'Commande /mecque' },
                    { id: 'sources', label: 'Les directs' },
                ],
                content: {
                    badge: 'Direct',
                    heading: 'La Mecque en direct',
                    lead: 'Le direct de Masjid al-Haram, ou de Masjid an-Nabawi à Médine, regardé ensemble dans un salon vocal.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'commande-mecque',
                            title: 'La commande /mecque',
                            paragraphs: [
                                'Rejoignez un salon vocal et tapez `/mecque` : la vidéo s’ouvre dans Discord, et les membres du salon peuvent la rejoindre.',
                                'La vidéo démarre sans le son : cliquez sur « Activer le son ». Le bouton en bas à droite passe en plein écran.'
                            ],
                            codeList: [
                                { cmd: '/mecque', desc: 'Ouvre « La Mecque en direct » dans votre salon vocal.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'sources',
                            title: 'Les directs',
                            items: [
                                { strong: 'La Mecque :', text: 'Masjid al-Haram, diffusé par la chaîne Coran de la radio-télévision saoudienne.' },
                                { strong: 'Médine :', text: 'Masjid an-Nabawi, diffusé par la chaîne Sunna.' }
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'info',
                            title: 'Pourquoi pas un partage d’écran ?',
                            text: 'Discord ne permet pas aux bots de partager leur écran. Les Activités Discord sont la façon prévue pour regarder une vidéo ensemble.'
                        }
                    ]
                }
            },
            {
                slug: 'islam-rappels',
                title: 'Hadiths & Invocations',
                icon: 'moon',
                summary: 'Invocations, hadiths, 99 Noms d’Allah et quiz.',
                sections: [
                    { id: 'douas', label: 'Invocations & Noms' },
                    { id: 'hadiths', label: 'Hadiths' },
                    { id: 'quiz', label: 'Quiz' },
                ],
                content: {
                    badge: 'Rappels',
                    heading: 'Invocations, hadiths & quiz',
                    lead: 'Invocations de la Citadelle du Musulman, hadiths authentiques, les 99 Noms d’Allah et un quiz à plusieurs.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'douas',
                            title: 'Invocations & Noms d’Allah',
                            codeList: [
                                { cmd: '/doua sujet:matin', desc: 'Invocations du matin en arabe, phonétique et français (option aleatoire).' },
                                { cmd: '/asma numero:1', desc: 'Un des 99 Noms d’Allah avec sa signification (options nom, aleatoire).' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'hadiths',
                            title: 'Hadiths',
                            codeList: [
                                { cmd: '/hadith', desc: 'Un hadith authentique en arabe et en français (options theme, numero, aleatoire).' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'quiz',
                            title: 'Quiz à plusieurs',
                            codeList: [
                                { cmd: '/quiz creer', desc: 'Ouvre une partie : thème, difficulté, nombre de questions et temps par question.' },
                                { cmd: '/quiz score', desc: 'Le score de la partie en cours (et /quiz stop pour l’arrêter).' },
                                { cmd: '/quiz classement', desc: 'Le classement général des points.' }
                            ]
                        }
                    ]
                }
            }
        ]
    }
];

export default DOCS_FR;
