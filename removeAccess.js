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


const guildId = '575842109672652822';
const categoryId = '1050984934111719424'

// When the client is ready, run this code (only once)

let userId=  "698220057892880385"
client.once('ready', async () => {

  console.log('Ready!');
const guild = client.guilds.cache.get(guildId);
   if (guild) {
    // Do something with the guild
    let channel = await guild.channels.fetch(categoryId);
    await channel.permissionOverwrites.delete(userId)
    channel.send("removed " + userId + "!")
  } else {
    console.log(`Guild not found.`);
  }

});

// client
//     .on("debug", console.log)
//     .on("warn", console.log)

// Login to Discord with your client's token
client.login(token);