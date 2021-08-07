require("dotenv").config();

const axios = require("axios");

let interval = parseInt(process.env.REQUEST_INTERVAL, 10);
let uuid = process.env.MINECRAFT_UUID;

if (isNaN(interval)) interval = 60000;
if (!uuid) uuid = "ce3cac787f9140ed859b9fd86d7eccce";

const key = process.env.HYPIXEL_API_KEY;
const token = process.env.DISCORD_TOKEN;

if (!key) {
  console.log("No Hypixel API key found!");
  process.exit();
}

if (!token) {
  console.log("No Discord token found!");
  process.exit();
}

const headers = {
  authorization: token,
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.37 Chrome/91.0.4472.106 Electron/13.1.4 Safari/537.36",
};

let pastKills = 0;

async function update() {
  const res = await axios.get(`https://api.hypixel.net/player?key=${key}&uuid=${uuid}`);
  const kills = res?.data?.player?.stats?.SkyWars?.kills;
  if (!kills) {
    console.log("Failed to get skywars kills");
    return;
  }

  if (kills === pastKills) return;
  pastKills = kills;

  const killsStr = "Skywars Kills: " + kills.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  axios
    .patch("https://canary.discord.com/api/v9/users/@me", { bio: killsStr }, { headers })
    .then(() => {
      console.log("updated to: ", killsStr);
    })
    .catch((err) => {
      console.log("Error patching discord profile");
      console.log(err);
    });
}

update();
setInterval(update, interval);
