require('dotenv').config();
require("isomorphic-fetch")

const token = process.env['TOKEN'];
const Discord = require('discord.js');
const fs = require("fs");

const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES", "GUILD_MEMBERS"]
});

const channels = require("./channels.js")
let queryApi = require("./queryApi")

let leaderboard = {};

function refresh() {
  queryApi().then((t) => {
    console.log(t)
    leaderboard = t;
  })
}

// When the client is ready, run this code (only once)
client.once('ready', () => {

  console.log('Ready!');

  client.user.setActivity(`you solve aoc`, {
    type: 'WATCHING'
  });


  setInterval(() => {
    refresh()

  }, 900000)
  refresh()
});

// Login to Discord with your client's token
client.login(token);