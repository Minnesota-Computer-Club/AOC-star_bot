require('dotenv').config();
require("isomorphic-fetch")
const creds = require('./.config/creds.json');

const token = process.env['TOKEN'];
const Discord = require('discord.js');
const fs = require("fs");
const { Client, IntentsBitField, PermissionFlagsBits } = require('discord.js');

const client = new Discord.Client({
  intents: [IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.Guilds]
});


const guildId = '1050962046310686760';
const categoryId = '1050969521286021150'

// When the client is ready, run this code (only once)

client.once('ready', async () => {

  console.log('Ready!');
const guild = client.guilds.cache.get(guildId);
   if (guild) {
    // Do something with the guild
    let category = await guild.channels.fetch(categoryId);
    [...category.children.cache.values()].forEach(async (channel) => {
      await channel.delete();
      console.log("deleted "+channel.name)
    })
    await category.delete();
  } else {
    console.log(`Guild not found.`);
  }

});

// client
//     .on("debug", console.log)
//     .on("warn", console.log)

// Login to Discord with your client's token
client.login(token);