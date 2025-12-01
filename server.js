import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Tu info
const RIOT_NAME = "Dprssd";
const RIOT_TAG = "4403";
const REGION_ROUTING = "americas"; // Para PUUID
const REGION_PLATFORM = "la1"; // LAN

// Ruta principal
app.get("/", (req, res) => {
    res.send("API de LoL funcionando ✔");
});

// Ruta de rango
app.get("/rank", async (req, res) => {
    try {
        // 1. Obtener PUUID
        const puuidRes = await fetch(
            `https://${REGION_ROUTING}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${RIOT_NAME}/${RIOT_TAG}?api_key=${process.env.RIOT_API_KEY}`
        );

        if (!puuidRes.ok) {
            return res.send("No se pudo obtener tu PUUID. Revisa tu API KEY.");
        }

        const puuidData = await puuidRes.json();
        const puuid = puuidData.puuid;

        // 2. Obtener rank usando el PUUID (OJO: es summonerId, no PUUID directo)
        const summonerRes = await fetch(
            `https://${REGION_PLATFORM}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${process.env.RIOT_API_KEY}`
        );

        if (!summonerRes.ok) {
            return res.send("No se pudo obtener tu Summoner ID.");
        }

        const summonerData = await summonerRes.json();
        const summonerId = summonerData.id;

        // 3. Obtener rango
        const rankedRes = await fetch(
            `https://${REGION_PLATFORM}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${process.env.RIOT_API_KEY}`
        );

        if (!rankedRes.ok) {
            return res.send("No se pudo obtener tu rango.");
        }

        const rankedData = await rankedRes.json();
        const soloQ = rankedData.find(e => e.queueType === "RANKED_SOLO_5x5");

        if (!soloQ) {
            return res.send(`${RIOT_NAME} no tiene rank en SoloQ.`);
        }

        // 4. Respuesta personalizada
        const texto = `${RIOT_NAME} (LAN) → ${soloQ.tier} ${soloQ.rank} - ${soloQ.leaguePoints} LP`;

        res.send(texto);

    } catch (error) {
        console.error(error);
        res.send("Error en el servidor.");
    }
});

// Necesario para Railway
app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor funcionando en Railway ✔");
});
