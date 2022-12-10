require('dotenv').config();
require("isomorphic-fetch")
const creds = require('./.config/creds.json');

const token = process.env['TOKEN'];
const Discord = require('discord.js');
const fs = require("fs");
const { IntentsBitField, PermissionFlagsBits, PermissionsBitField  } = require('discord.js');

const client = new Discord.Client({
  intents: [
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.Guilds,
    // IntentsBitField.Flags.MessageContent,
    // IntentsBitField.Flags.GuildMessages,
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
function fullRefresh() {
  refresh().then(async _ => {
    const completedDays = {};
    const aocData = leaderboard["members"];
    const aocIds = Object.keys(aocData);
    for (var i = 0; i < aocIds.length; i++) {
      const n = Object.keys(aocData[aocIds[i]].completion_day_level);
      const username = aocToDisc[aocData[aocIds[i]].name];
      if (username) completedDays[username] = n;
    }

    const guild = client.guilds.cache.get(creds.ROCHESTER_GUILD);
    const me = await guild.members.fetchMe();
    if (me.permissions.has(PermissionFlagsBits.ManageGuild)) {
      console.log("I have the Permission Manage Channels");
      console.log(me.permissions.toArray())

    } else {
      console.log("I don't have Permission Manage Channels");
      console.log(me.permissions.toArray())
    }


    const out = JSON.parse(fs.readFileSync("./out.json"))
    Object.keys(completedDays).forEach((user) => {
      let id = out[user.toLowerCase()]
      if (!id) return console.log("couldnt find " + user);

      // let days = completedDays[user];
      // let days array of numbers from 1 to 25
      // let days = new Array(6).fill(0).map((_, i) => i + 1);
      let days = [1];



      days.forEach(async (completed) => {
        // console.log(channels[completed])

        const guild = client.guilds.resolve(creds.ROCHESTER_GUILD);
        const channelss = await guild.channels.fetch();
        let channel = [...channelss.values()].find(c => c.id == channels[completed]);
        if (channel) {
          const id = user.id;

          if (!channel.permissionOverwrites.resolve(id)) {

            // duser is discord user
            // hmm how can we get user obj

            //                 channel.permissionOverwrites.create(id, {
            //                   SEND_MESSAGES: true,
            //                   VIEW_CHANNEL: true
            //                 });
            // console.log("added "+user+" to "+completed)
            //                 channel.send("added "+user+"!")

          } else {
            //already is in channel
          }

          for (value of channel.permissionOverwrites.cache.values()) {
            // await channel.permissionOverwrites.cache.get(key).delete();
            // if (value.allow.has(PermissionFlagsBits.ViewChannel)) {
            //   await channel.permissionOverwrites.edit(value.id, {
            //     SendMessages: false,
            //     ViewChannel: false
            //   });
            // }
          }

        } else {
          // already removed
          console.log("already removed")
        }

      })

    })
  })
};

setInterval(() => {
  fullRefresh();
}, 60000)
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
    fs.writeFile('./out.json', JSON.stringify(savejson), function (err) {
      if (err) throw err;
      console.log('complete');
    }
    );
  }

  setInterval(() => {
    discordFetch();
  }, 1800000)
  await discordFetch();
  fullRefresh();
});

client.on("messageCreate", (msg) => {
  // console.log('??')
  if (!msg.author.bot) msg.reply("ee")
})

// client
//     .on("debug", console.log)
//     .on("warn", console.log)

// Login to Discord with your client's token
client.login(token);