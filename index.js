const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const Parser = require("rss-parser");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const parser = new Parser();

let lastPost = null;

async function checkWoozworld() {
  try {
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);

    const feed = await parser.parseURL(
      "https://www.woozworld.com/blog/en_WD/categories/news/rss"
    );

    const latest = feed.items[0];

    if (!latest) return;

    if (latest.link !== lastPost) {
      lastPost = latest.link;

      const embed = new EmbedBuilder()
        .setTitle("New Woozworld Update!")
        .setDescription(`**${latest.title}**\n\n[Read Update](${latest.link})`)
        .setColor(0xff4fa3)
        .setTimestamp();

      channel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error(err);
  }
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  checkWoozworld();

  setInterval(checkWoozworld, 15 * 60 * 1000);
});

client.login(process.env.DISCORD_TOKEN);
