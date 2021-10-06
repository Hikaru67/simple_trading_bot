const chart = require('asciichart');
const fs = require('fs');
const delay = require('delay');

function plotAsset() {
  const lines = fs.readFileSync('./trade_log.txt', 'utf8').split('\n')
  const assets = [];

  for (let line of lines) {
    if (line.includes('Difference: ')) {
      const asset = line.replace('Difference: ', '').trim()
      assets.push(parseFloat(asset))
    }
  }
  console.clear()
  console.log(chart.plot(assets, {
    height: 30
  }))
}

async function main() {
  while (true) {
    plotAsset();
    await delay(10 * 1000);
  }
}

main();