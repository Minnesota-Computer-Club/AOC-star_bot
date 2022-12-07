// Query AOC leaderboard and get data back
// In the future we might have to implement support for multiple leaderboards

const leaderboard = process.env['LEADERBOARD']
const session = process.env['SESSION']

require("isomorphic-fetch")

const url = `https://adventofcode.com/2022/leaderboard/private/view/${leaderboard}.json`

module.exports = async () => { 
  
const f = await fetch(url, {
  method: 'GET',
  headers: {
    'Cookie': 'session='+session
  }
});

  return await f.json();
};