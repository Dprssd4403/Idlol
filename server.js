import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Tu información
const RIOT_NAME = "Dprssd";
const RIOT_TAG = "4403";
const REGION_ROUTING = "americas"; // Para obtener PUUID
const REGION_PLATFORM = "la1";     // LAN

// Ruta principal
app.get("/", (req, res) => {
    res.send("API de LoL funcionando ✔");
});

// Ruta para mostrar todo el rank
app.get("/rank", async (req, res) => {
    try {
        // 1. Obtener PUUID
        const puuidRes = await fetch(
            `https://${REGION_ROUTING}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${RIOT_NAME}/${RIOT_TAG}?api_key=${process.env.RIOT_API_KEY}`
        );

        if (!puuidRes.ok) {
            return res.send("No se pudo obtener el PUUID. Revisa tu API KEY.");
        }

        const puuidData = await puuidRes.json();
        const puuid = puuidData.puuid;

        // 2. Obtener Summoner ID + nivel
        const summonerRes = await fetch(
            `https://${REGION_PLATFORM}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${process.env.RIOT_API_KEY}`
        );

        if (!summonerRes.ok) {
            return res.send("No se pudo obtener tu Summoner ID.");
        }

        const summonerData = await summonerRes.json();
        const summonerId = summonerData.id;
        const nivel = summonerData.summonerLevel;

        // 3. Obtener rangos (SoloQ y Flex)
        const rankedRes = await fetch(
            `https://${REGION_PLATFORM}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${process.env.RIOT_API_KEY}`
        );

        if (!rankedRes.ok) {
            return res.send("No se pudo obtener tu rango.");
        }

        const rankedData = await rankedRes.json();

        const soloQ = rankedData.find(e => e.queueType === "RANKED_SOLO_5x5");
        const flex = rankedData.find(e => e.queueType === "RANKED_FLEX_SR");

        // Si no tiene SoloQ
        const soloQText = soloQ
            ? `${soloQ.tier} ${soloQ.rank} (${soloQ.leaguePoints} LP)`
            : "Sin rango";

        // Si no tiene Flex
        const flexText = flex
            ? `${flex.tier} ${flex.rank} (${flex.leaguePoints} LP)`
            : "Sin rango";

        // Respuesta final
        const respuesta = `${RIOT_NAME} (LAN) → SoloQ: ${soloQText} | Flex: ${flexText} | Nivel: ${nivel}`;

        res.send(respuesta);

    } catch (error) {
        console.error(error);
        res.send("Error en el servidor.");
    }
});

// Necesario para Railway
app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor funcionando en Railway ✔");
});
