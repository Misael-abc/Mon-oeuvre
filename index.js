const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Route pour votre site réveilleur (Cron-job.org / UptimeRobot)
app.get('/ping', (req, res) => {
    res.status(200).send('Serveur Render actif');
});

// 2. Route Proxy pour votre navigateur Puter
app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).send('Paramètre ?url= manquant');
    }

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });

        const contentType = response.headers.get('content-type') || 'text/html';

        // Si c'est une image, un fichier CSS ou JS, on le renvoie directement
        if (!contentType.includes('text/html')) {
            res.set('Content-Type', contentType);
            res.set('Access-Control-Allow-Origin', '*');
            const arrayBuffer = await response.arrayBuffer();
            return res.send(Buffer.from(arrayBuffer));
        }

        let html = await response.text();
        const parsedUrl = new URL(targetUrl);
        const origin = parsedUrl.origin;

        // Réécriture des chemins relatifs (/style.css, /logo.png) vers le vrai domaine
        html = html.replace(/(href|src)="\/([^\/][^"]*)"/g, `$1="${origin}/$2"`);
        html = html.replace(/(href|src)='\/([^\/][^']*)'/g, `$1='${origin}/$2'`);

        // Autorise l'affichage dans l'iframe de Puter
        res.set('Content-Type', 'text/html; charset=utf-8');
        res.set('Access-Control-Allow-Origin', '*');
        res.send(html);

    } catch (error) {
        res.status(500).send(`<h3>Erreur de chargement :</h3><p>${error.message}</p>`);
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
