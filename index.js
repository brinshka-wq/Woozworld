const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const Parser = require("rss-parser");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const parser = new Parser();

let lastPost = null;

/* ---------------- SLASH COMMANDS ---------------- */

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!")
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("Slash commands registered.");
  } catch (error) {
    console.error(error);
  }
}

/* ---------------- WOOZWORLD NEWS ---------------- */

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
        .setTitle("🌍 New Woozworld Update!")
        .setDescription(`**${latest.title}**\n\n[Read Update](${latest.link})`)
        .setColor(0xff4fa3)
        .setTimestamp();

      channel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error(err);
  }
}

/* ---------------- BOT READY ---------------- */

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  await registerCommands();

  checkWoozworld();

  setInterval(checkWoozworld, 15 * 60 * 1000);
});

/* ---------------- SLASH COMMAND HANDLER ---------------- */

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

client.login(process.env.DISCORD_TOKEN);
