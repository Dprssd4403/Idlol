import express from "express";
import fetch from "node-fetch";

const app = express();

const RIOT_API_KEY = process.env.RGAPI-49cb2c26-e5ae-4d41-aa4d-b25a194b5648;
const REGION = "la1";
const GAME_NAME = "Dprssd";
const TAGLINE = "4403";

app.get("/", async (req, res) => {
  try {
    const acc = await fetch(
      `https://${REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${GAME_NAME}/${TAGLINE}?api_key=${RIOT_API_KEY}`
    ).then(r => r.json());

    const puuid = acc.puuid;

    const ranks = await fetch(
      `https://${REGION}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`
    ).then(r => r.json());

    const solo = ranks.find(x => x.queueType === "RANKED_SOLO_5x5");

    if (!solo) return res.send("No tienes ranking en SoloQ");

    res.send(`${solo.tier} ${solo.rank} - ${solo.leaguePoints} LP`);
  } catch (err) {
    res.send("Error obteniendo rango.");
  }
});

app.listen(3000, () => console.log("Servidor corriendo"));
