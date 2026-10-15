// content/docs/en.js — documentation content (English)
// Same structure (slugs, section ids) as fr.js: only the texts change.
// The full command list (/docs/commandes) is read live from the bot: only guides live here.
import { ADD_BOT_URL } from '../../config/links.js';

const DOCS_EN = [
    {
        category: 'Getting started',
        items: [
            {
                slug: 'accueil',
                title: 'Home',
                icon: 'book',
                summary: 'What AzimBot does, its features and how to get started.',
                sections: [
                    { id: 'introduction', label: 'Introduction' },
                    { id: 'fonctionnalites-cles', label: 'Key features' },
                    { id: 'architecture', label: 'Settings & security' },
                    { id: 'demarrage-rapide', label: 'Quick start' },
                ],
                content: {
                    badge: '',
                    heading: 'Home',
                    lead: 'Welcome to the AzimBot documentation. Find tips, tutorials and answers to your questions.',
                    blocks: [
                        {
                            type: 'hint',
                            variant: 'info',
                            title: 'First time?',
                            text: 'Invite AzimBot with the recommended permissions, then type `/help` on your server or open the web panel to set everything up.'
                        },
                        {
                            type: 'section',
                            id: 'introduction',
                            title: 'What is AzimBot?',
                            paragraphs: [
                                'AzimBot brings the tools to run, liven up and protect a Discord server together in one free bot.',
                                'No need for 10 different bots: AzimBot handles the AI assistant, member welcome, levels, moderation and YouTube and TikTok alerts.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'fonctionnalites-cles',
                            title: 'Features',
                            items: [
                                { strong: 'AI assistant:', text: 'answers with `/ask` or in a dedicated channel, with instructions and language set per server.' },
                                { strong: 'Moderation:', text: '`/mod` to ban, kick, time out, warn and lock a channel; `/purge` deletes up to 1000 messages or empties a whole channel.' },
                                { strong: 'Member welcome:', text: 'welcome messages in a channel or by DM, with rules based on roles.' },
                                { strong: 'Levels:', text: 'XP per message, `/rank` cards, leaderboard and reward roles.' },
                                { strong: 'Social alerts:', text: 'new YouTube videos and TikTok lives announced automatically.' },
                                { strong: 'French or English:', text: '`/language` switches Azim’s commands and replies to your server’s language.' }
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'tip',
                            isIslamic: true,
                            title: 'Islam mode',
                            text: 'On servers with Islam mode: prayer times, Quran radio in voice channels, live Mecca with `/mecca`, supplications, hadiths, quiz and a Ramadan companion.'
                        },
                        {
                            type: 'section',
                            id: 'architecture',
                            title: 'Settings & security',
                            paragraphs: [
                                'Each server has its own settings: AI, channels, language, moderation. Everything you can set with a command can also be set in the panel.',
                                'Only members who manage a server can change its settings, after signing in with their Discord account.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'demarrage-rapide',
                            title: 'Ready to set up?',
                            paragraphs: [
                                'Follow the installation guide to add the bot and give it the right roles, then check the list of all commands.'
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'commandes',
                title: 'All commands',
                icon: 'terminal',
                featured: true,
                summary: 'Every AzimBot command, with subcommands and options, always up to date.',
                sections: [],
                content: {
                    badge: 'Full reference',
                    heading: 'All AzimBot commands',
                    lead: 'Every Azim command with its subcommands and options. The list is read directly from the bot, so it is always up to date.',
                    blocks: []
                }
            },
            {
                slug: 'installation',
                title: 'Installation',
                icon: 'settings',
                summary: 'Invite the bot and give it the Discord permissions it needs.',
                sections: [
                    { id: 'invitation', label: 'Invite the bot' },
                    { id: 'permissions', label: 'Required permissions' },
                    { id: 'hierarchie', label: 'Role hierarchy' },
                ],
                content: {
                    badge: 'Installation guide',
                    heading: 'Installation & permissions',
                    lead: 'Add AzimBot to your server in a few clicks and check that it has the permissions it needs.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'invitation',
                            title: '1. Invite AzimBot to your server',
                            paragraphs: [
                                'The button below opens Discord’s official authorization page, with the recommended permissions already selected.',
                            ],
                            actionButton: { label: 'Add AzimBot to Discord ↗', url: ADD_BOT_URL }
                        },
                        {
                            type: 'hint',
                            variant: 'warning',
                            title: 'Required right',
                            text: 'You need the “Manage Server” permission (or be the owner) to add a bot.'
                        },
                        {
                            type: 'section',
                            id: 'permissions',
                            title: '2. Recommended permissions',
                            table: {
                                headers: ['Discord permission', 'Used for', 'Required'],
                                rows: [
                                    ['View channels, send messages, embed links', 'Answering commands with rich messages', 'Yes'],
                                    ['Manage roles', 'Welcome roles and level reward roles', 'Yes'],
                                    ['Manage messages', '`/purge messages`', 'For moderation'],
                                    ['Ban, kick, time out members', '`/mod ban`, `/mod kick`, `/mod timeout`', 'For moderation'],
                                    ['Manage channels', '`/mod lock`, `/mod slowmode`, `/purge channel`', 'For moderation'],
                                    ['Create invite', 'Your server’s link on the website (`/showcase`)', 'Optional'],
                                    ['Connect & speak (voice)', 'YouTube sound in voice channels (`/play audio`)', 'Optional']
                                ]
                            }
                        },
                        {
                            type: 'hint',
                            variant: 'info',
                            title: 'Bot added before version 5.0?',
                            text: 'New moderation permissions are not added automatically: invite the bot again with the button above, or give them to its role in your server settings.'
                        },
                        {
                            type: 'section',
                            id: 'hierarchie',
                            title: '3. Role hierarchy (important)',
                            paragraphs: [
                                'In Server Settings > Roles, place AzimBot’s role above the roles it gives (welcome, levels) and above the members it must be able to sanction.',
                                'Discord does not let a bot act on a role or member placed higher than itself.'
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'parametres',
                title: 'Settings',
                icon: 'settings',
                summary: 'First commands, bot language and the web panel.',
                sections: [
                    { id: 'commandes-initiales', label: 'First commands' },
                    { id: 'langue', label: 'Bot language' },
                    { id: 'connexion-panel', label: 'The panel' },
                ],
                content: {
                    badge: 'Getting started',
                    heading: 'First steps with AzimBot',
                    lead: 'Once the bot is on your server, use its slash commands or set everything up from the web panel.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'commandes-initiales',
                            title: 'Your first commands',
                            codeList: [
                                { cmd: '/help', desc: 'Lists the commands available on your server, always up to date.' },
                                { cmd: '/ask question:Hello Azim!', desc: 'Asks the AI assistant a question.' },
                                { cmd: '/website', desc: 'Gives the link to the website and panel.' },
                                { cmd: '/version', desc: 'Shows the bot version and what’s new (history option).' },
                                { cmd: '/report', desc: 'Reports a bug or suggests an idea to the team.' },
                                { cmd: '/code value:…', desc: 'Turns an extension module on or off with an access code (administrators).' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'langue',
                            title: 'French or English',
                            paragraphs: [
                                '`/language` changes Azim’s language on your server: command names and descriptions, replies and messages. It applies within seconds.',
                                'The same setting is in the panel, under “Server & moderation”.'
                            ],
                            codeList: [
                                { cmd: '/langue langue:English', desc: 'Run in French first: switches Azim to English on this server (it then becomes /language).' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'connexion-panel',
                            title: 'The management panel',
                            paragraphs: [
                                'Open the Panel and sign in with Discord: you see the servers you manage.',
                                'Click “Configure”: AI, commands, welcome, levels, social alerts, moderation, language and bot profile are all set in one place.'
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'ia',
                title: 'Messages & AI',
                icon: 'sparkles',
                summary: 'Asking the AI, dedicated channel, instructions and reply language.',
                sections: [
                    { id: 'fonctionnement-ia', label: 'How the AI works' },
                    { id: 'parametres-ia', label: 'Settings' },
                    { id: 'commandes-ia', label: 'Related commands' },
                ],
                content: {
                    badge: 'Artificial intelligence',
                    heading: 'AI assistant',
                    lead: 'An assistant that answers your members’ questions, with your server’s tone and rules.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'fonctionnement-ia',
                            title: 'How does the AI work?',
                            paragraphs: [
                                'Azim answers with `/ask`, when called by its trigger name in a message, or continuously in a dedicated AI channel.',
                                'Questions are sent to the Groq service while the answer is generated (see the Privacy page).'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'parametres-ia',
                            title: 'Settings (panel or /config)',
                            table: {
                                headers: ['Setting', 'Command', 'Description'],
                                rows: [
                                    ['Reply language', '`/config ai_language`', 'Language the AI answers in'],
                                    ['Instructions', '`/config ai_prompt`', 'Personality, tone and rules of the assistant'],
                                    ['Trigger name', '`/config ai_name`', 'The name that makes the AI answer in a message'],
                                    ['Groq keys', '`/config ai_key_add`', 'Your own AI keys: stored encrypted, never shown in full again, and each one can be removed (`/config ai_key_remove`). Without a key, AI is off on the server.'],
                                    ['Who can talk to the AI', 'Panel, AI tab', 'Everyone by default, or only administrators, or specific roles']
                                ]
                            }
                        },
                        {
                            type: 'section',
                            id: 'commandes-ia',
                            title: 'AI commands',
                            codeList: [
                                { cmd: '/ask question:Explain relativity', desc: 'Asks the AI a question.' },
                                { cmd: '/zzzz minutes:30', desc: 'Puts the AI to sleep in this channel (run again to wake it up).' },
                                { cmd: '/channelname name:announcements style:…', desc: 'Suggests a styled channel name and description.' }
                            ]
                        }
                    ]
                }
            },
        ]
    },
    {
        category: 'Member welcome',
        items: [
            {
                slug: 'bienvenue',
                title: 'Joins & leaves',
                icon: 'hand',
                summary: 'Welcome messages in a channel or by DM, and rules based on roles.',
                sections: [
                    { id: 'messages-bienvenue', label: 'Welcome message' },
                    { id: 'regles', label: 'Role rules' },
                ],
                content: {
                    badge: 'Member management',
                    heading: 'Welcoming new members',
                    lead: 'Greet every new member with a message in a channel, by DM, or both.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'messages-bienvenue',
                            title: 'The welcome message',
                            paragraphs: [
                                'Pick the channel, the destination (channel, DM or both) and when it is sent. The `{user}`, `{server}` and `{count}` variables personalise the text.'
                            ],
                            codeList: [
                                { cmd: '/welcome enable', desc: 'Turns automatic welcome on.' },
                                { cmd: '/welcome channel channel:#welcome', desc: 'Picks the welcome channel.' },
                                { cmd: '/welcome destination mode:…', desc: 'Channel, DM or both.' },
                                { cmd: '/welcome default_message channel_message:Welcome {user}!', desc: 'Sets the default message.' },
                                { cmd: '/welcome test', desc: 'Simulates the welcome to check how it looks.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'regles',
                            title: 'Rules based on roles',
                            paragraphs: [
                                'Send a different message depending on the member’s role (for example verified members), in a specific channel if needed.'
                            ],
                            codeList: [
                                { cmd: '/welcome rule_add', desc: 'Adds a rule: name, condition, role and message.' },
                                { cmd: '/welcome rule_list', desc: 'Lists active rules.' },
                                { cmd: '/welcome rule_remove', desc: 'Removes a rule.' }
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'roles',
                title: 'Role management',
                icon: 'users',
                summary: 'Level reward roles and Discord hierarchy.',
                sections: [
                    { id: 'roles-niveaux', label: 'Reward roles' },
                    { id: 'hierarchie-discord', label: 'Discord hierarchy' },
                ],
                content: {
                    badge: 'Role management',
                    heading: 'Automatic roles',
                    lead: 'Give roles to your most active members automatically.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'roles-niveaux',
                            title: 'Level reward roles',
                            paragraphs: [
                                'When a member reaches a level, Azim gives them the matching role and announces it. Set it in the panel (Levels tab) or with a command.'
                            ],
                            codeList: [
                                { cmd: '/rank reward_add level:10 role:@Active', desc: 'Gives @Active at level 10.' },
                                { cmd: '/rank reward_list', desc: 'Lists reward roles.' },
                                { cmd: '/rank reward_remove level:10', desc: 'Removes a level’s reward.' }
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'warning',
                            title: 'Hierarchy rule',
                            text: 'AzimBot’s role must be above every role it gives, in Server Settings > Roles.'
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
                summary: 'XP per message, /rank cards, leaderboard and settings.',
                sections: [
                    { id: 'mecanique-xp', label: 'Earning XP' },
                    { id: 'commandes-rank', label: '/rank commands' },
                ],
                content: {
                    badge: 'Engagement',
                    heading: 'Levels & XP',
                    lead: 'Reward your members’ activity with XP, level cards and roles.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'mecanique-xp',
                            title: 'How is XP earned?',
                            paragraphs: [
                                'Every message earns XP, with a delay between gains to prevent spam. Level-ups can be announced in a chosen channel, or silently.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'commandes-rank',
                            title: 'Level commands',
                            codeList: [
                                { cmd: '/rank show', desc: 'Your level card (member option for someone else).' },
                                { cmd: '/rank leaderboard', desc: 'The most active members of the server.' },
                                { cmd: '/rank config enable:True announce_channel:#levels', desc: 'Turns levels on and picks the announcement channel (admin).' },
                                { cmd: '/rank reset', desc: 'Resets a member’s or the server’s XP (admin).' }
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'reseaux',
                title: 'Social alerts',
                icon: 'megaphone',
                summary: 'New YouTube videos and TikTok lives announced automatically.',
                sections: [
                    { id: 'youtube', label: 'YouTube alerts' },
                    { id: 'tiktok', label: 'TikTok alerts' },
                ],
                content: {
                    badge: 'Social media',
                    heading: 'YouTube & TikTok alerts',
                    lead: 'Announce new videos and lives automatically in the channel of your choice.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'youtube',
                            title: 'YouTube',
                            paragraphs: [
                                'Add a channel by its @handle, link or ID. Lists show each channel’s name, @handle and link, and the panel also shows its picture.'
                            ],
                            codeList: [
                                { cmd: '/youtube add channel:@handle', desc: 'Follows a channel.' },
                                { cmd: '/youtube remove channel:@handle', desc: 'Stops following a channel.' },
                                { cmd: '/youtube list', desc: 'Followed channels, with name, @handle and link.' },
                                { cmd: '/youtube config channel:#videos', desc: 'Channel where new videos are announced.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'tiktok',
                            title: 'TikTok (several accounts)',
                            paragraphs: [
                                'Azim regularly checks the followed accounts and announces when they go live.'
                            ],
                            codeList: [
                                { cmd: '/tiktok add account:@handle', desc: 'Follows a TikTok account.' },
                                { cmd: '/tiktok remove account:@handle', desc: 'Stops following an account.' },
                                { cmd: '/tiktok list', desc: 'Followed accounts, with name, @handle and link.' },
                                { cmd: '/tiktok config channel:#lives', desc: 'Channel where lives are announced.' },
                                { cmd: '/tiktok enable', desc: 'Turns monitoring on (and /tiktok disable to stop it).' },
                                { cmd: '/tiktok status', desc: 'Current live status of followed accounts.' }
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'lecture',
                title: 'YouTube in voice',
                icon: 'music',
                summary: 'Listen to a YouTube video’s sound, or watch it together, in a voice channel.',
                sections: [
                    { id: 'lecture-audio', label: 'Sound in voice' },
                    { id: 'lecture-video', label: 'Watch together' },
                ],
                content: {
                    badge: 'Music & videos',
                    heading: 'YouTube in voice',
                    lead: 'Start any YouTube video, from its link or a search: the sound in the voice channel, or the video to watch together.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'lecture-audio',
                            title: 'Sound in the voice channel',
                            paragraphs: [
                                'Join a voice channel and run `/play audio`. If something is already playing in that channel, the video is added to the queue. The message buttons pause, skip or stop.',
                                'Several channels of the same server can listen at once, thanks to helper bots.'
                            ],
                            codeList: [
                                { cmd: '/play audio query:lofi hip hop', desc: 'Searches YouTube and plays the first result.' },
                                { cmd: '/play audio query:https://youtu.be/…', desc: 'Plays the video at this link (video, short or live).' },
                                { cmd: '/play audio query:… loop:True', desc: 'Replays the video in a loop (also with the player’s Loop button).' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'lecture-video',
                            title: 'The video, watched together',
                            paragraphs: [
                                '`/play video` opens Azim’s Activity in your voice channel with the requested video. Members of the channel can join it; each one watches from the start.',
                                'Run `/play video` again while a video is playing: the new one joins the queue, shown in the Activity.',
                                'Pause, play, next video, loop and stop are shared by the whole channel: in the Activity, or with the buttons of the message Azim posts.',
                                'The video starts muted: click “Turn sound on”.'
                            ],
                            codeList: [
                                { cmd: '/play video query:https://youtu.be/…', desc: 'Opens this video in the voice channel.' },
                                { cmd: '/play video query:… loop:True', desc: 'The video restarts at the end (Loop button in the Activity).' }
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'info',
                            title: 'Good to know',
                            text: 'Private, members-only or age-restricted videos cannot be played.'
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
                title: 'Moderation & Purge',
                icon: 'shield',
                summary: 'Sanctions, warnings, locked channels and message deletion.',
                sections: [
                    { id: 'commande-mod', label: '/mod command' },
                    { id: 'journal', label: 'Sanction log' },
                    { id: 'commande-purge', label: '/purge command' },
                ],
                content: {
                    badge: 'Security & moderation',
                    heading: 'Moderation & cleanup',
                    lead: 'Every moderation action in two commands: /mod for members and channels, /purge for messages.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'commande-mod',
                            title: 'The /mod command',
                            paragraphs: [
                                'By default, `/mod` and `/purge` are only visible to and usable by administrators. The panel (Commands tab) can open them to specific roles.',
                                'Each action also checks your Discord permissions: for example, `/mod ban` needs “Ban Members”.'
                            ],
                            codeList: [
                                { cmd: '/mod ban member:@Member reason:Spam', desc: 'Bans a member (option: delete their recent messages).' },
                                { cmd: '/mod unban user:ID', desc: 'Lifts a ban.' },
                                { cmd: '/mod kick member:@Member', desc: 'Kicks a member (they can come back with an invite).' },
                                { cmd: '/mod timeout member:@Member duration:1h', desc: 'Times out a member: they can no longer write or speak.' },
                                { cmd: '/mod untimeout member:@Member', desc: 'Ends a timeout.' },
                                { cmd: '/mod warn member:@Member reason:…', desc: 'Gives a warning.' },
                                { cmd: '/mod warnings member:@Member', desc: 'Lists a member’s warnings (and /mod clear_warnings).' },
                                { cmd: '/mod slowmode seconds:10', desc: 'Limits how often messages can be sent in a channel.' },
                                { cmd: '/mod lock', desc: 'Stops members from writing in a channel (and /mod unlock).' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'journal',
                            title: 'Sanction log',
                            paragraphs: [
                                'In the panel (“Server & moderation” tab), pick a channel where Azim logs every sanction, and choose whether the sanctioned member gets a DM.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'commande-purge',
                            title: 'The /purge command',
                            codeList: [
                                { cmd: '/purge messages amount:200', desc: 'Deletes up to 1000 messages in the channel.' },
                                { cmd: '/purge messages amount:50 member:@Member', desc: 'Only this member’s messages (also filters: bots, contains).' },
                                { cmd: '/purge messages amount:100 older:True', desc: 'Includes messages older than 14 days (slower).' },
                                { cmd: '/purge channel', desc: 'Empties the whole channel: it is recreated identically, after confirmation.' }
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'warning',
                            title: 'Messages older than 14 days',
                            text: 'Discord only allows bulk deletion of messages younger than 14 days. With the old option, Azim deletes older ones one by one, which takes longer.'
                        }
                    ]
                }
            },
            {
                slug: 'utilitaires',
                title: 'Utilities & Profile',
                icon: 'terminal',
                summary: 'Server info, reminders, showcase on the website, bot profile and language.',
                sections: [
                    { id: 'commandes-utiles', label: 'Useful commands' },
                    { id: 'vitrine', label: 'Your server on the website' },
                    { id: 'avatar-bot', label: 'Bot profile' },
                ],
                content: {
                    badge: 'Handy tools',
                    heading: 'Utilities & bot profile',
                    lead: 'Everyday tools for your server and your team.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'commandes-utiles',
                            title: 'Everyday commands',
                            codeList: [
                                { cmd: '/serverinfo', desc: 'Server statistics: members, channels, creation date.' },
                                { cmd: '/userinfo member:@Member', desc: 'A member’s join date and roles.' },
                                { cmd: '/remindme delay:1h message:Meeting', desc: 'Schedules a personal reminder.' },
                                { cmd: '/permissions', desc: 'Who can use each command on this server.' },
                                { cmd: '/pubtimer start', desc: 'Promotion session timer for staff (stop, total, leaderboard).' },
                                { cmd: '/bumpreminder', desc: 'Sends the bump reminder in the dedicated channel.' },
                                { cmd: '/ping', desc: 'Bot latency.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'vitrine',
                            title: 'Your server on the website',
                            paragraphs: [
                                'With `/showcase`, your server appears with a clickable link under “Other servers” on Azim’s website. Also available in the panel.'
                            ],
                            codeList: [
                                { cmd: '/showcase enable:True channel:#welcome', desc: 'Creates an invite to this channel and shows it on the website.' },
                                { cmd: '/showcase enable:False', desc: 'Removes the link from the website.' },
                                { cmd: '/showcase enable:False anonymous:True', desc: 'The server is no longer listed under “Other servers”: it only counts among the anonymous servers.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'avatar-bot',
                            title: 'Bot profile on your server',
                            paragraphs: [
                                'Change Azim’s name, description, activity and picture on your server with `/config`, or from the panel’s “Profile & logs” tab.'
                            ],
                            codeList: [
                                { cmd: '/config name new_name:Azim', desc: 'Changes the bot’s name.' },
                                { cmd: '/config avatar image:…', desc: 'Changes its picture (and /config avatar_reset to go back to the official one).' },
                                { cmd: '/botavatar', desc: 'Shows, downloads or restores the official picture.' },
                                { cmd: '/config log_channel channel:#logs', desc: 'Channel where Azim reports its errors and restarts.' }
                            ]
                        }
                    ]
                }
            }
        ]
    },
    {
        category: 'Help & support',
        items: [
            {
                slug: 'faq',
                title: 'FAQ',
                icon: 'help',
                summary: 'Frequent questions, common problems and support.',
                sections: [
                    { id: 'general', label: 'General questions' },
                    { id: 'permissions-faq', label: 'Permissions & roles' },
                ],
                content: {
                    badge: 'Help & troubleshooting',
                    heading: 'Frequently asked questions',
                    lead: 'Answers to the most common questions about AzimBot.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'general',
                            title: 'General questions',
                            items: [
                                { strong: 'Is the bot free?', text: 'Yes, every feature is free.' },
                                { strong: 'Azim does not answer /ask?', text: 'Check that it can write and embed links in the channel, and that the AI is not asleep (`/zzzz`).' },
                                { strong: 'How do I switch Azim to English?', text: '`/langue langue:English` (the French command name), or in the panel, “Server & moderation” tab.' },
                                { strong: 'How do I show my server on the website?', text: '`/showcase enable:True`, or from the panel.' },
                                { strong: 'Where can I see what’s new?', text: '`/version` shows the current version and its changes; `/version history:True` the previous ones.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'permissions-faq',
                            title: 'Permissions & roles',
                            paragraphs: [
                                'If Azim cannot give a role or sanction a member, move its role higher in the server’s role list.',
                                'If a moderation command is refused, check that Azim’s role has the matching permission (see Installation).',
                                'Each command only shows up in Discord for the people who can use it: commands reserved for administrators or “Manage Server” are invisible to other members, and a command disabled in the panel disappears. A command opened to specific roles stays visible to everyone, but Azim refuses other members; to hide it as well, set it in Server Settings > Integrations > Azim.'
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'info',
                            title: 'Need help?',
                            text: 'Join the support server to ask the team and the community.'
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
                summary: 'The 5 prayer times, qibla, Hijri calendar and Ramadan.',
                sections: [
                    { id: 'calcul-priere', label: 'Time calculation' },
                    { id: 'commande-priere', label: 'Commands' },
                ],
                content: {
                    badge: 'Spirituality',
                    heading: 'Prayer times',
                    lead: 'The times of the 5 prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) for your city, with a countdown to the next one.',
                    blocks: [
                        {
                            type: 'hint',
                            variant: 'tip',
                            title: 'Calculation method',
                            text: 'Pick the calculation method (UOIF, Muslim World League…) with the method option of `/prayer`.'
                        },
                        {
                            type: 'section',
                            id: 'commande-priere',
                            title: 'Commands',
                            codeList: [
                                { cmd: '/prayer city:Paris', desc: 'Today’s 5 times and the countdown to the next prayer.' },
                                { cmd: '/qibla city:Marseille', desc: 'Direction of the Kaaba in degrees, with the distance.' },
                                { cmd: '/hijri', desc: 'Today’s Hijri date next to the Gregorian date.' },
                                { cmd: '/ramadan city:Lyon', desc: 'Imsak and Iftar times, countdown and supplications.' }
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'islam-coran',
                title: 'Quran radio 24/7',
                icon: 'book',
                summary: 'Quran radio in one or several voice channels, and Quran reading.',
                sections: [
                    { id: 'radio-coran', label: '/radio command' },
                    { id: 'plusieurs-salons', label: 'Several voice channels' },
                    { id: 'commande-coran', label: '/quran command' },
                ],
                content: {
                    badge: 'Quran & voice',
                    heading: 'Quran radio 24/7',
                    lead: 'The Noble Quran non-stop in your voice channels, with 22 reciters.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'radio-coran',
                            title: 'The /radio command',
                            paragraphs: [
                                'Join a voice channel and run `/radio`. The message lets you change reciter or surah, pause or stop.'
                            ],
                            codeList: [
                                { cmd: '/radio', desc: 'Non-stop radio, starting from a random surah.' },
                                { cmd: '/radio surah:18 reciter:sudais', desc: 'Starts with Al-Kahf by Abdul Rahman Al-Sudais.' },
                                { cmd: '/radio surah:36 continue:False', desc: 'Recites a single surah then stops.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'plusieurs-salons',
                            title: 'Several voice channels at once',
                            paragraphs: [
                                'Discord allows one voice channel per bot and per server. To play in a second channel, Azim uses helper bots (Azim 2, Azim 3…).',
                                'Run `/radio` from another voice channel: if a helper bot is free it joins; otherwise the reply gives the link to invite it to your server.'
                            ]
                        },
                        {
                            type: 'section',
                            id: 'commande-coran',
                            title: 'The /quran command',
                            codeList: [
                                { cmd: '/quran surah number:1', desc: 'Reads a full surah in French.' },
                                { cmd: '/quran verse surah:2 number:255', desc: 'Shows a specific verse.' },
                                { cmd: '/quran random', desc: 'A random verse.' },
                                { cmd: '/quran radio', desc: 'Same as /radio.' }
                            ]
                        }
                    ]
                }
            },
            {
                slug: 'islam-mecque',
                title: 'Mecca live',
                icon: 'play',
                summary: 'Watch Mecca or Medina live, together in a voice channel.',
                sections: [
                    { id: 'commande-mecque', label: '/mecca command' },
                    { id: 'sources', label: 'The live streams' },
                ],
                content: {
                    badge: 'Live',
                    heading: 'Mecca live',
                    lead: 'The live stream of Masjid al-Haram, or of Masjid an-Nabawi in Medina, watched together in a voice channel.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'commande-mecque',
                            title: 'The /mecca command',
                            paragraphs: [
                                'Join a voice channel and type `/mecca`: the video opens inside Discord, and members of the channel can join it.',
                                'The video starts muted: click “Turn sound on”. The bottom-right button switches to full screen.'
                            ],
                            codeList: [
                                { cmd: '/mecca', desc: 'Opens “Mecca live” in your voice channel.' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'sources',
                            title: 'The live streams',
                            items: [
                                { strong: 'Mecca:', text: 'Masjid al-Haram, broadcast by the Saudi Quran channel.' },
                                { strong: 'Medina:', text: 'Masjid an-Nabawi, broadcast by the Sunnah channel.' }
                            ]
                        },
                        {
                            type: 'hint',
                            variant: 'info',
                            title: 'Why not screen sharing?',
                            text: 'Discord does not let bots share their screen. Discord Activities are the intended way to watch a video together.'
                        }
                    ]
                }
            },
            {
                slug: 'islam-rappels',
                title: 'Hadiths & Supplications',
                icon: 'moon',
                summary: 'Supplications, hadiths, the 99 Names of Allah and quiz.',
                sections: [
                    { id: 'douas', label: 'Supplications & Names' },
                    { id: 'hadiths', label: 'Hadiths' },
                    { id: 'quiz', label: 'Quiz' },
                ],
                content: {
                    badge: 'Reminders',
                    heading: 'Supplications, hadiths & quiz',
                    lead: 'Supplications from the Fortress of the Muslim, authentic hadiths, the 99 Names of Allah and a multiplayer quiz.',
                    blocks: [
                        {
                            type: 'section',
                            id: 'douas',
                            title: 'Supplications & Names of Allah',
                            codeList: [
                                { cmd: '/dua topic:morning', desc: 'Morning supplications in Arabic, phonetics and translation (random option).' },
                                { cmd: '/asma number:1', desc: 'One of the 99 Names of Allah with its meaning (name, random options).' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'hadiths',
                            title: 'Hadiths',
                            codeList: [
                                { cmd: '/hadith', desc: 'An authentic hadith in Arabic and French (theme, number, random options).' }
                            ]
                        },
                        {
                            type: 'section',
                            id: 'quiz',
                            title: 'Multiplayer quiz',
                            codeList: [
                                { cmd: '/quiz create', desc: 'Opens a game: theme, difficulty, number of questions and time per question.' },
                                { cmd: '/quiz score', desc: 'Score of the current game (and /quiz stop to end it).' },
                                { cmd: '/quiz leaderboard', desc: 'Overall points leaderboard.' }
                            ]
                        }
                    ]
                }
            }
        ]
    }
];

export default DOCS_EN;
