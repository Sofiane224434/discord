// content/docs/en.js — documentation content (English)
// Same structure (slugs, section ids) as fr.js: only the texts change.
import { ADD_BOT_URL } from '../../config/links.js';

const DOCS_EN = [
    {
        category: 'Getting started',
        items: [
            {
                slug: 'accueil',
                title: 'Home',
                icon: 'book',
                summary: 'Overview of AzimBot, its key features and how it is built.',
                sections: [
                    { id: 'introduction', label: 'Introduction' },
                    { id: 'fonctionnalites-cles', label: 'Key features' },
                    { id: 'architecture', label: 'Architecture & security' },
                    { id: 'demarrage-rapide', label: 'Quick start' },
                ],
                content: {
                    badge: '',
                    heading: 'Home',
                    lead: 'Welcome to the AzimBot documentation. Find tips, tutorials and answers to your questions here.',
                    blocks: [
                        {
                            type: 'hint',
                            variant: 'info',
                            title: 'First time here?',
                            text: 'Get started in under 2 minutes: invite AzimBot with the recommended permissions, then type `/help` or open your web panel.'
                        },
                        {
                            type: 'section',
                            id: 'introduction',
                            title: 'What is AzimBot?',
                            paragraphs: [
                                'AzimBot brings together every tool you need to manage, entertain and protect a Discord server, in a single modern interface.',
                                'No more juggling 10 overlapping bots: AzimBot handles your AI assistant, custom welcome messages, XP levels, moderation and social media alerts.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'fonctionnalites-cles',
                            title: 'Core features',
                            items: [
                                { strong: 'Advanced AI assistant:', text: 'Contextual conversational answers, a per-server custom prompt and image understanding.' },
                                { strong: 'Moderation & protection:', text: 'Targeted channel cleanup with /purge, strict access permissions and detailed logs.' },
                                { strong: 'Welcome & automatic roles:', text: 'Rich welcome messages, direct messages and automatic roles as soon as someone joins.' },
                                { strong: 'Levels & engagement:', text: 'XP earned per message, /rank profile cards and configurable reward roles.' },
                                { strong: 'Social alerts:', text: 'Instant notifications for your YouTube channels and TikTok lives.' }
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'tip',
                            isIslamic: true,
                            title: 'Dedicated Islamic mode & theme',
                            text: 'AzimBot includes a complete spiritual module (prayer times, 24/7 Quran audio in voice channels, invocations from the Fortress of the Muslim and authentic hadiths), unlocked with a secret code or from your server settings.'
                        },
                        {
                            type: 'section',
                            id: 'architecture',
                            title: 'Architecture & security',
                            paragraphs: [
                                'Every setting is scoped to its server: AI configurations, banned words and channels are strictly isolated in a secured database.',
                                'The bot follows Discord’s latest standards (Slash Commands v10, Discord.js v14 and OAuth2 with JWT).'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'demarrage-rapide',
                            title: 'Ready to set it up?',
                            paragraphs: [
                                'Follow the installation guide below to authorize the bot on your server and give it the roles it needs.'
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'installation',
                title: 'Installation',
                icon: 'settings',
                summary: 'How to invite the bot and set up the Discord permissions it needs.',
                sections: [
                    { id: 'invitation', label: 'Invite the bot' },
                    { id: 'permissions', label: 'Required permissions' },
                    { id: 'hierarchie', label: 'Role hierarchy' },
                ],
                content: {
                    badge: 'Installation guide',
                    heading: 'Installation & Discord permissions',
                    lead: 'Add AzimBot to your Discord server in a few clicks and make sure its permissions let it work at 100%.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'invitation',
                            title: '1. Invite AzimBot to your server',
                            paragraphs: [
                                'Click the button below to open Discord’s official OAuth2 authorization page:',
                            ],
                            actionButton: { label: 'Add AzimBot to Discord ↗', url: ADD_BOT_URL }
                        },
                        {
                            type: 'hint',
                            variant: 'warning',
                            title: 'Server management permission',
                            text: 'You need the "Manage Server" permission, or to own the Discord server, to add a bot to it.'
                        },
                        {
                            type: 'section',
                            id: 'permissions',
                            title: '2. Recommended permissions',
                            paragraphs: [
                                'To use every feature, here are the essential permissions granted when inviting the bot:'
                            ],
                            table: {
                                headers: ['Discord permission', 'Used for', 'Required'],
                                rows: [
                                    ['View channels & Send messages', 'Lets Azim read and answer commands', 'Yes'],
                                    ['Manage roles', 'Welcome roles and level rewards', 'Yes'],
                                    ['Manage messages', 'Needed for the /purge moderation command', 'Yes'],
                                    ['Embed links & Attach files', 'Rich embeds and level cards', 'Yes'],
                                    ['Connect & Speak (voice)', 'Audio streaming and voice announcements', 'Optional']
                                ]
                            }
                        },
                        {
                            type: 'section',
                            id: 'hierarchie',
                            title: '3. Role hierarchy (important)',
                            paragraphs: [
                                'In your Discord server settings > Roles, drag the AzimBot role above the roles it has to give to members (welcome roles, level roles).',
                                'Discord does not allow a bot to manage a role placed higher than its own.'
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'parametres',
                title: 'Settings',
                icon: 'settings',
                summary: 'Basic commands and access to the web dashboard.',
                sections: [
                    { id: 'commandes-initiales', label: 'First commands' },
                    { id: 'connexion-panel', label: 'Opening the panel' },
                ],
                content: {
                    badge: 'Getting started',
                    heading: 'First steps with AzimBot',
                    lead: 'Once the bot is on your server, you can use its slash commands right away or set your preferences from the dashboard.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'commandes-initiales',
                            title: 'Your first slash commands',
                            codeList: [
                                { cmd: '/help', desc: 'Shows the interactive list of commands available on your server.' },
                                { cmd: '/ask prompt:Hello Azim!', desc: 'Asks the server’s AI assistant a question.' },
                                { cmd: '/site', desc: 'Shows the link to the official website and admin panel.' },
                                { cmd: '/report', desc: 'Sends a suggestion or reports a bug to the development team.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'connexion-panel',
                            title: 'Opening the management panel',
                            paragraphs: [
                                'Go to the Panel page (/dashboard) and log in with your Discord account.',
                                'You will see the servers you manage. Click "Configure" to access every module live.'
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'ia',
                title: 'Messages & AI',
                icon: 'sparkles',
                summary: 'AI model settings, custom prompt and dedicated channel.',
                sections: [
                    { id: 'fonctionnement-ia', label: 'How the AI works' },
                    { id: 'parametres-ia', label: 'Available settings' },
                    { id: 'commandes-ia', label: 'Related commands' },
                ],
                content: {
                    badge: 'Artificial intelligence',
                    heading: 'AI assistant & customization',
                    lead: 'Give your community a smart assistant that answers questions, livens up channels and matches your server’s personality.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'fonctionnement-ia',
                            title: 'How does the AI work?',
                            paragraphs: [
                                'AzimBot relies on high-performance models to write natural, accurate answers in French, English, Arabic and other languages.',
                                'It answers on demand with the `/ask` command, or in a continuous conversation when a dedicated AI channel is set.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'parametres-ia',
                            title: 'Settings available in the panel',
                            table: {
                                headers: ['Setting', 'Type', 'Description'],
                                rows: [
                                    ['ia_langue', 'Text', 'Main language of the assistant (fr, en, ar, etc.)'],
                                    ['ia_prompt', 'Long text', 'Personality, tone of voice and strict rules'],
                                    ['ia_channel', 'Discord channel', 'Text channel where the AI answers without a command'],
                                    ['ia_active', 'Boolean', 'Turns the AI on or off for the whole server']
                                ]
                            }
                        },
                        {
                            type: 'section',
                            id: 'commandes-ia',
                            title: 'AI commands',
                            codeList: [
                                { cmd: '/ask prompt:Explain the theory of relativity', desc: 'Asks a one-off question and gets a detailed answer.' },
                                { cmd: '/config ia_prompt', desc: 'Updates the assistant’s custom instructions.' },
                                { cmd: '/zzzz', desc: 'Temporarily pauses the AI in the current channel.' }
                            ]
                        }
                    ]
                }
            },
        ]
    },
    {
        category: 'Welcoming members',
        items: [
            {
                slug: 'bienvenue',
                title: 'Joins & leaves',
                icon: 'hand',
                summary: 'Welcome messages, direct messages and roles given as soon as someone joins.',
                sections: [
                    { id: 'messages-bienvenue', label: 'Welcome messages' },
                    { id: 'roles-auto', label: 'Automatic roles' },
                ],
                content: {
                    badge: 'Member management',
                    heading: 'Custom welcome & automatic roles',
                    lead: 'Make a great first impression on every newcomer with rich welcome messages and roles given from the very first second.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'messages-bienvenue',
                            title: 'Setting up the welcome message',
                            paragraphs: [
                                'Choose a public text channel where Azim welcomes people, or send a warm direct message to the new member.',
                                'Use dynamic variables such as `{user}`, `{server}` and `{count}` to personalize your text.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'roles-auto',
                            title: 'Autoroles',
                            paragraphs: [
                                'As soon as a user joins the server, AzimBot can give them one or more default roles (e.g. Member, Unverified).'
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'roles',
                title: 'Role management',
                icon: 'users',
                summary: 'Automatic roles, hierarchy and permissions.',
                sections: [
                    { id: 'roles-bienvenue', label: 'Roles on join' },
                    { id: 'roles-niveaux', label: 'XP reward roles' },
                    { id: 'hierarchie-discord', label: 'Discord hierarchy' },
                ],
                content: {
                    badge: 'Role management',
                    heading: 'Managing & giving roles',
                    lead: 'Automate your server’s ranks: autoroles for new members and exclusive roles unlocked by activity milestones.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'roles-bienvenue',
                            title: '1. Roles given on join',
                            paragraphs: [
                                'As soon as a new member joins your community, AzimBot can give them one or more predefined roles with no manual work.',
                                'Set these roles directly from the "Welcome" tab of your admin panel.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'roles-niveaux',
                            title: '2. Level reward roles',
                            paragraphs: [
                                'Keep members engaged with roles unlocked automatically when they reach levels 5, 10, 20 or 50.',
                                'AzimBot proudly announces the new role with a custom card.'
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'warning',
                            title: 'Key hierarchy rule',
                            text: 'Make sure the AzimBot role sits above every role it has to give, in Server Settings > Roles.'
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
                title: 'Levels',
                icon: 'activity',
                summary: 'XP system, level milestones, /rank cards and server leaderboard.',
                sections: [
                    { id: 'mecanique-xp', label: 'How XP works' },
                    { id: 'commandes-rank', label: '/rank commands' },
                ],
                content: {
                    badge: 'Engagement & gamification',
                    heading: 'Levels & XP system',
                    lead: 'Reward your most active members with automatic XP, visual cards and roles unlocked at each milestone.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'mecanique-xp',
                            title: 'How do members earn XP?',
                            paragraphs: [
                                'Each message is worth 15 to 25 XP, with a 60-second cooldown to prevent spam.',
                                'As they level up, members can automatically receive exclusive roles.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'commandes-rank',
                            title: 'Level commands',
                            codeList: [
                                { cmd: '/rank', desc: 'Shows your personal level card and XP bar.' },
                                { cmd: '/rank membre:@Friend', desc: 'Shows another member’s progress card.' }
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'reseaux',
                title: 'Social alerts',
                icon: 'megaphone',
                summary: 'Automatic announcements for YouTube channels and TikTok lives.',
                sections: [
                    { id: 'youtube', label: 'YouTube alerts' },
                    { id: 'tiktok', label: 'TikTok alerts' },
                ],
                content: {
                    badge: 'Integrations & media',
                    heading: 'YouTube & TikTok alerts',
                    lead: 'Never miss a new video or live again with automatic alerts in the channel of your choice.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'youtube',
                            title: 'YouTube tracking',
                            paragraphs: [
                                'Add your favorite channels by @handle (e.g. @Inoxtag, @MrBeast), full link or UC… ID to get a rich message with thumbnail, title and direct link as soon as a video goes live.'
                            ],
                            codeList: [
                                { cmd: '/youtube add chaine:@handle', desc: 'Tracks a channel by @handle, link or UC… ID.' },
                                { cmd: '/youtube remove chaine:@handle', desc: 'Stops tracking a channel.' },
                                { cmd: '/youtube list', desc: 'Lists every YouTube channel tracked on the server.' },
                                { cmd: '/youtube config salon:#channel', desc: 'Sets the text channel that receives video alerts.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'tiktok',
                            title: 'TikTok tracking (multiple accounts)',
                            paragraphs: [
                                'Follow several TikTok creators at once! The bot checks their status regularly and instantly alerts your community with an announcement and a live embed when they go live.'
                            ],
                            codeList: [
                                { cmd: '/tiktok add compte:@handle', desc: 'Tracks a TikTok account (@handle or link).' },
                                { cmd: '/tiktok remove compte:@handle', desc: 'Removes a TikTok account from the list.' },
                                { cmd: '/tiktok list', desc: 'Lists every tracked TikTok account and its status.' },
                                { cmd: '/tiktok config salon:#channel', desc: 'Sets the text channel for live alerts.' },
                                { cmd: '/tiktok statut [compte]', desc: 'Checks the live status of one or all accounts.' }
                            ]
                        }
                    ]
                }
            },
        ]
    },
    {
        category: 'Security & tools',
        items: [
            {
                slug: 'moderation',
                title: 'Moderation & purge',
                icon: 'shield',
                summary: 'Quick moderation commands, message purge and alerts.',
                sections: [
                    { id: 'outils-moderation', label: 'Moderation tools' },
                    { id: 'commande-purge', label: 'The /purge command' },
                ],
                content: {
                    badge: 'Security & moderation',
                    heading: 'Moderation & channel cleanup',
                    lead: 'Keep your channels clean and pleasant with AzimBot’s quick moderation commands.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'outils-moderation',
                            title: 'Tools for your moderators',
                            paragraphs: [
                                'AzimBot gives you everything you need to act fast during a raid, spam wave or heated discussion.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'commande-purge',
                            title: 'The /purge command',
                            paragraphs: [
                                'The `/purge` command instantly deletes between 1 and 100 recent messages in a text channel.'
                            ],
                            codeList: [
                                { cmd: '/purge nombre:50', desc: 'Deletes the last 50 messages of the channel.' },
                                { cmd: '/purge nombre:20 utilisateur:@Member', desc: 'Deletes only the messages sent by that member.' }
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'warning',
                            title: 'Discord’s 14-day limit',
                            text: 'The Discord API does not allow bulk deletion of messages older than 14 days.'
                        }
                    ]
                }
            },
            {
                slug: 'utilitaires',
                title: 'Utilities & profile',
                icon: 'terminal',
                summary: 'Handy commands, server info, reminders and the bot’s profile picture.',
                sections: [
                    { id: 'commandes-utiles', label: 'Handy commands' },
                    { id: 'avatar-bot', label: 'AzimBot’s profile picture' },
                ],
                content: {
                    badge: 'Handy tools',
                    heading: 'Utility commands & avatar',
                    lead: 'A set of practical tools for your server’s daily life.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'commandes-utiles',
                            title: 'Everyday commands',
                            codeList: [
                                { cmd: '/serverinfo', desc: 'Shows full server statistics (members, channels, creation date).' },
                                { cmd: '/userinfo membre:@Member', desc: 'Shows when a member joined and their roles.' },
                                { cmd: '/remindme temps:1h texte:Team meeting', desc: 'Schedules a reminder sent by the bot.' },
                                { cmd: '/ping', desc: 'Measures latency with the Discord API.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'avatar-bot',
                            title: 'Profile picture (/botavatar)',
                            paragraphs: [
                                'AzimBot comes with an official high-definition profile picture for your Discord server.',
                                'You can view it, download the official image or restore the default avatar at any time with `/botavatar`.'
                            ]
                        }
                    ]
                }
            }
        ]
    },
    {
        category: 'Commands & support',
        items: [
            {
                slug: 'commandes',
                title: 'All commands',
                icon: 'terminal',
                summary: 'Complete catalog of every AzimBot slash command.',
                sections: [
                    { id: 'questions-outils', label: 'Questions & tools' },
                    { id: 'reglages-accueil', label: 'Settings & welcome' },
                    { id: 'moderation-niveaux', label: 'Moderation & levels' },
                    { id: 'alertes-reseaux', label: 'Alerts & social' },
                ],
                content: {
                    badge: 'Full reference',
                    heading: 'Every AzimBot command',
                    lead: 'All the commands available on your server, with their syntax and what they do.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'questions-outils',
                            title: 'Questions & tools',
                            codeList: [
                                { cmd: '/ask prompt:[text]', desc: 'Asks the server’s AI assistant a question.' },
                                { cmd: '/site', desc: 'Shows the official website and the dashboard.' },
                                { cmd: '/report', desc: 'Reports a bug or submits a suggestion for AzimBot.' },
                                { cmd: '/help', desc: 'Shows active commands and how to use them on the server.' },
                                { cmd: '/botavatar', desc: 'Shows, downloads or restores the bot’s profile picture.' },
                                { cmd: '/ping', desc: 'Measures Discord and WebSocket latency.' },
                                { cmd: '/remindme temps:[delay] texte:[note]', desc: 'Schedules a personal reminder.' },
                                { cmd: '/salon nom:[text]', desc: 'Suggests a channel name and description.' },
                                { cmd: '/version', desc: 'Shows the bot’s version and changelog.' },
                                { cmd: '/serverinfo', desc: 'Shows server information and statistics.' },
                                { cmd: '/userinfo membre:[@user]', desc: 'Shows a member’s Discord profile.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'reglages-accueil',
                            title: 'Settings & welcome',
                            codeList: [
                                { cmd: '/config', desc: 'Sets the AI language, prompt, logs and bot profile.' },
                                { cmd: '/welcome', desc: 'Sets up welcome messages and automatic roles.' },
                                { cmd: '/code valeur:[code]', desc: 'Turns extension modules on or off with an access code.' },
                                { cmd: '/permissions', desc: 'Shows the permissions each command requires.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'moderation-niveaux',
                            title: 'Moderation & levels',
                            codeList: [
                                { cmd: '/purge nombre:[1-100]', desc: 'Deletes a batch of messages using filters.' },
                                { cmd: '/zzzz', desc: 'Temporarily pauses AI auto-replies in the channel.' },
                                { cmd: '/rank', desc: 'Shows your level card and XP bar.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'alertes-reseaux',
                            title: 'Alerts & social media',
                            codeList: [
                                { cmd: '/youtube add chaine:[@handle/URL]', desc: 'Tracks a YouTube channel and announces new videos.' },
                                { cmd: '/tiktok add compte:[@handle/URL]', desc: 'Instant alert when a TikTok account goes live (multiple accounts).' },
                                { cmd: '/pubtimer', desc: 'Tracks the time your team spends on posts.' },
                                { cmd: '/rappelbump', desc: 'Sends the server bump reminder.' }
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'faq',
                title: 'FAQ',
                icon: 'help',
                summary: 'Frequent questions, troubleshooting and support.',
                sections: [
                    { id: 'general', label: 'General questions' },
                    { id: 'permissions-faq', label: 'Permissions & roles' },
                ],
                content: {
                    badge: 'Help & troubleshooting',
                    heading: 'Frequently asked questions',
                    lead: 'Quick answers to the most common questions about using AzimBot.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'general',
                            title: 'General questions',
                            items: [
                                { strong: 'Is the bot free?', text: 'Yes, all the main features (AI, levels, welcome, moderation, alerts) are 100% free.' },
                                { strong: 'Why doesn’t the bot answer /ask?', text: 'Check that the bot has the "Send Messages" and "Embed Links" permissions in that channel, and that the AI hasn’t been paused with /zzzz.' },
                                { strong: 'How do I change the settings?', text: 'Log in to the management panel with your Discord account, or use the /config command.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'permissions-faq',
                            title: 'Permissions & automatic roles',
                            paragraphs: [
                                'If AzimBot can’t give a welcome or level role, check that the bot’s role is higher in Discord’s role list than the roles it has to give.'
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'info',
                            title: 'Need more help?',
                            text: 'Join our official Discord support server to ask the team directly or chat with the community.'
                        }
                    ]
                }
            }
        ]
    },
    {
        category: 'Islam & spirituality',
        isIslamicCategory: true,
        items: [
            {
                slug: 'islam-priere',
                title: 'Prayer times & Adhan',
                icon: 'moon',
                summary: 'Accurate times for the 5 daily prayers, countdown and Adhan alerts.',
                sections: [
                    { id: 'calcul-priere', label: 'How times are calculated' },
                    { id: 'commande-priere', label: 'The /priere command' },
                ],
                content: {
                    badge: 'Islamic spirituality',
                    heading: 'Prayer times & Adhan',
                    lead: 'Show the exact times of the 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) for your city or GPS coordinates.',
                    blocks: [
                        {
                            type: 'hint',
                            variant: 'tip',
                            title: 'Accurate astronomical calculation',
                            text: 'AzimBot supports the official calculation methods (UOIF 12°, Muslim World League, etc.) for precise times.'
                        },
                        {
                            type: 'section',
                            id: 'commande-priere',
                            title: 'The /priere command',
                            codeList: [
                                { cmd: '/priere ville:Paris', desc: 'Shows the 5 prayer times for the city with a countdown to the next prayer.' },
                                { cmd: '/qibla ville:Marseille', desc: 'Calculates the exact direction of the Kaaba (Mecca) in compass degrees, with the distance.' },
                                { cmd: '/hijri', desc: 'Shows the Islamic lunar calendar date and the White Days reminders.' }
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'islam-coran',
                title: 'Quran radio 24/7',
                icon: 'book',
                summary: 'Continuous Quran radio in voice channels and verse lookup.',
                sections: [
                    { id: 'radio-coran', label: 'Quran radio 24/7' },
                    { id: 'commande-coran', label: 'The /coran command' },
                ],
                content: {
                    badge: 'Holy Quran & voice',
                    heading: 'Quran radio 24/7 & verses',
                    lead: 'Stream the Noble Quran in high-quality audio 24 hours a day in your voice channels, with over 20 renowned reciters.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'radio-coran',
                            title: 'The /radio command',
                            paragraphs: [
                                'Bring the bot into a voice channel to start an uninterrupted live stream.'
                            ],
                            codeList: [
                                { cmd: '/radio action:play recitateur:Al-Afasy', desc: 'Starts the continuous Quran radio with Mishary Rashid Al-Afasy.' },
                                { cmd: '/radio action:stop', desc: 'Stops the stream and disconnects the bot from the voice channel.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'commande-coran',
                            title: 'The /coran command',
                            paragraphs: [
                                'Look up any surah or verse to show the Arabic text, its transliteration and a faithful French translation.'
                            ],
                            codeList: [
                                { cmd: '/coran sourate:1 verset:1', desc: 'Shows Al-Fatiha verse 1 with audio recitation.' }
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'islam-rappels',
                title: 'Hadiths & invocations',
                icon: 'moon',
                summary: 'Invocations from the Fortress of the Muslim and An-Nawawi’s 40 Hadiths.',
                sections: [
                    { id: 'douas', label: 'Invocations (/doua)' },
                    { id: 'hadiths', label: 'Teachings (/hadith)' },
                ],
                content: {
                    badge: 'Wisdom & reflection',
                    heading: 'Invocations & authentic hadiths',
                    lead: 'Hundreds of protection, morning and evening invocations, plus collections of authentic hadiths.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'douas',
                            title: 'The /doua command',
                            codeList: [
                                { cmd: '/doua categorie:matin', desc: 'Shows the authentic morning invocations with transliteration and translation.' },
                                { cmd: '/asma', desc: 'Shows the 99 Names of Allah (Asma ul-Husna) with their deep meaning.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'hadiths',
                            title: 'The /hadith command',
                            codeList: [
                                { cmd: '/hadith', desc: 'Draws a random hadith from Imam An-Nawawi’s 40 or Sahih Al-Bukhari.' }
                            ]
                        }
                    ]
                }
            }
        ]
    }
];

export default DOCS_EN;
