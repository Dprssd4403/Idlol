import express from "express";
import fetch from "node-fetch";

const app = express();

// Tu API key va en Railway → Variables (RIOT_API_KEY)
const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Datos de tu cuenta
const REGION = "la2";          // LAN
const GAME_NAME = "Dprssd";    // Tu nombre
const TAGLINE = "4403";        // Tu tag

app.get("/", async (req, res) => {
  try {
    // 1. Obtener información de la cuenta
    const acc = await fetch(
      `https://${REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${GAME_NAME}/${TAGLINE}?api_key=${RIOT_API_KEY}`
    ).then(r => r.json());

    if (!acc.puuid) return res.send("No se pudo obtener tu PUUID.");

    const puuid = acc.puuid;

    // 2. Obtener rangos
    const ranks = await fetch(
      `https://${REGION}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`
    ).then(r => r.json());

    if (!Array.isArray(ranks) || ranks.length === 0)
      return res.send("No tienes rangos registrados.");

    // Buscar SOLOQ
    const solo = ranks.find(x => x.queueType === "RANKED_SOLO_5x5");

    if (!solo)
      return res.send("No tienes ranking en SoloQ.");

    // Formato bonito
    const text = `${solo.tier} ${solo.rank} — ${solo.leaguePoints} LP`;

    res.send(text);

  } catch (err) {
    console.error(err);
    res.send("Error obteniendo tu rango.");
  }
});

// Railway usa PORT automáticamente
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log("Servidor corriendo en puerto " + PORT));
