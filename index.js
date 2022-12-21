require('dotenv').config();
require("isomorphic-fetch")
const creds = require('./.config/creds.json');

const token = process.env['TOKEN'];
const Discord = require('discord.js');
const fs = require("fs");
const { IntentsBitField, PermissionFlagsBits, PermissionsBitField, ChannelType } = require('discord.js');

const client = new Discord.Client({
  intents: [
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessages,
  ],
});

const channels = require("./channels.js")
let queryApi = require("./queryApi")

let leaderboard = {};


const users = require('./users.json');

names = Object.keys(users);
var aocToDisc = {};
for (var i = 0; i < names.length; i++) {
  let aoc = users[names[i]]["What is your Advent of Code Username? (Make sure you are logged in to see it!)"];
  let disc = users[names[i]]["If you are participating in the RCC Discord server, you will be automatically added to specific channels when you complete stars. You can join here: https://discord.gg/hsN92V4  - Please enter your Discord username so we can verify you."]
  if (disc == '') continue;
  else if (!disc.includes("#")) aocToDisc[aoc] = disc.trim()
  else aocToDisc[aoc] = disc.split("#")[0].trim()
}

const refresh = async () => {
  await queryApi().then((t) => {
    leaderboard = t;
    return t;
  })
}

let debug = true;
function log(m) {
  if(debug) console.log(m)
}

async function fullRefresh() {
  log("\n\nStarting Full Refresh")
  await refresh();
  log("AOC Leaderboard Query completed")

  const completedDays = {};
  const aocData = leaderboard["members"];
  const aocIds = Object.keys(aocData);
  for (var i = 0; i < aocIds.length; i++) {
    let n = Object.keys(aocData[aocIds[i]].completion_day_level);
    // console.log(n);
    n = n.map((d) => {
      return {i:d,d:aocData[aocIds[i]].completion_day_level[d]};
    }).filter((d) => d.d[2]).map((d) => d.i);
    const username = aocToDisc[aocData[aocIds[i]].name];

    if (username) completedDays[username] = n;
  }
  log("Days of users fetched")


  const guild = client.guilds.cache.get(creds.ROCHESTER_GUILD);
    const guildChannels = await guild.channels.fetch();

  const out = JSON.parse(fs.readFileSync("./out.json"))
  log("Fetched guild and user details")

  console.log(Object.keys(completedDays));
    for (let i=0; i<Object.keys(completedDays).length; i++) {
      let user = Object.keys(completedDays)[i];
    let id = out[user.toLowerCase()]
    if (!id){
      console.log("couldnt find " + user);
      continue;
    }

    let days = completedDays[user];
    // let days array of numbers from 1 to 25
    // let days = new Array(6).fill(0).map((_, i) => i + 1);
  // for each isn't async it's going to spam all the requests at once
    for (let completed of days) {
      // console.log(channels[completed])

      const guild = client.guilds.resolve(creds.ROCHESTER_GUILD);

      let channel = [...guildChannels.values()].find(c => c.id == channels[completed]);
      if (channel) {

        if (!channel.permissionOverwrites.resolve(id)) {
          // duser is discord user
          // hmm how can we get user obj

          await channel.permissionOverwrites.create(id, {
            SendMessages: true,
            ViewChannel: true
          });
          console.log("added " + user + " to " + completed)
          await channel.send("added <@" + id + "> !")
        } else {
          //already is in channel
        }
      } else {
        // already removed
        console.log("channel not found")
      }
    };
  };
}

// When the client is ready, run this code (only once)

client.once('ready', async () => {
  console.log('Ready!');

  async function discordFetch() {
    const guild = client.guilds.resolve(creds.ROCHESTER_GUILD);
    const members = await guild.members.fetch();
    let savejson = {}
    members.forEach((user) => {
      savejson[user.user.username.toLowerCase()] = user.id;
    })
    fs.writeFile('./out.json', JSON.stringify(savejson), function(err) {
      if (err) throw err;
    });
  }

  setInterval(() => {
    discordFetch();
  }, 1800000);

  await discordFetch();
  fullRefresh();

  setInterval(async () => {
    await fullRefresh();
  }, 60000);
});


// client
//   .on("debug", console.log)
//   .on("warn", console.log)

// Login to Discord with your client's token
client.login(token);