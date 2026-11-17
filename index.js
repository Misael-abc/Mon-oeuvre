const express = require('express');
const Unblocker = require('unblocker');

const app = express();

// Configuration du moteur proxy Unblocker
const unblocker = new Unblocker({
    prefix: '/proxy/'
});

// Autorise votre application Puter à communiquer avec ce serveur
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// Active le proxy
app.use(unblocker);

// Route spéciale pour réveiller le serveur (Keep-Alive)
app.get('/ping', (req, res) => {
    res.status(200).send('Serveur actif !');
});

// Démarrage du serveur sur le port attribué par Render
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Serveur proxy en ligne sur le port ${port}`);
}).on('upgrade', unblocker.onUpgrade); // Indispensable pour les jeux en ligne (WebSockets)
