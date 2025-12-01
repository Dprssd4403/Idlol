import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Ruta principal
app.get("/", (req, res) => {
    res.send("API de LoL funcionando ✔");
});

// Ruta de rango
app.get("/rank", async (req, res) => {
    try {
        const puuidRes = await fetch(
            `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/Dprssd/4403?api_key=${process.env.RIOT_API_KEY}`
        );

        if (!puuidRes.ok) {
            return res.send("No se pudo obtener tu PUUID. Revisa tu API KEY.");
        }

        const puuidData = await puuidRes.json();
        const puuid = puuidData.puuid;

        const rankedRes = await fetch(
            `https://la1.api.riotgames.com/lol/league/v4/entries/by-summoner/${puuid}?api_key=${process.env.RIOT_API_KEY}`
        );

        if (!rankedRes.ok) {
            return res.send("No se pudo obtener tu rango.");
        }

        const rankedData = await rankedRes.json();
        const soloQ = rankedData.find(e => e.queueType === "RANKED_SOLO_5x5");

        if (!soloQ) return res.send("No tienes rank en SoloQ.");

        res.send(`${soloQ.tier} ${soloQ.rank} - ${soloQ.leaguePoints} LP`);
    } catch (error) {
        console.error(error);
        res.send("Error en el servidor.");
    }
});

// Necesario para Railway
app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor funcionando en Railway ✔");
});
