# En-têtes de l'Activité Discord (/activite) : Discord l'affiche dans son application (cadre discordsays.com),
# donc pas de X-Frame-Options et des cadres parents autorisés limités à Discord.
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self' https://win.holol.com https://cdn-globecast.akamaized.net https://live.kwikmotion.com; worker-src 'self' blob:; frame-ancestors 'self' https://discord.com https://*.discord.com https://discordsays.com https://*.discordsays.com; base-uri 'self'; form-action 'self'; object-src 'none'" always;
