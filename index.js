const ccxt = require('ccxt');
const moment = require('moment');
const delay = require('delay');
const fs = require('fs');
const myConsole = new console.Console(fs.createWriteStream('./trade_log.txt'));


const binance = new ccxt.binance({
  apiKey: 'WCsXJCRHicKaExRTY2vHTNAwM9PXa7BaD4uRoxCUxotH2ocRbrR49glEImSYD26E',
  secret: 's9nRWoVWIFlMiXWTTHmpch7FGkrkLneITuvtiWzXkJGbAnciDtgbQ46Wo5pDgYmd'
})
binance.setSandboxMode(true)

async function printBalance(btcPrice) {
  const balance = await binance.fetchBalance();
  const total = balance.total
  myConsole.log(`Balance: BTC ${total.BTC}, USDT: ${total.USDT}`)
  myConsole.log(`Total USDT: BTC ${(total.BTC - 1) * btcPrice + total.USDT} \n`)

}

async function tick() {
  const binance = new ccxt.binance();

  const price = await binance.fetchOHLCV('BTC/USDT', '30m', undefined, 100);
  const bPrices = price.map(price => {
    return {
      timestamp: moment(price[0]).format(),
      open: price[1],
      high: price[2],
      low: price[3],
      close: price[4],
      volume: price[5]
    }
  })
  const averagePrice = bPrices.reduce((acc, price) => acc + price.close, 0) / 100
  const lastPrice = bPrices[bPrices.length - 1].close
  myConsole.log(`Average Price: ${averagePrice}. Last price: ${lastPrice}`)
  const difference = lastPrice / averagePrice
  myConsole.log(`Difference: ${(difference - 1)*100}%`)
  let direction = null;
  if (difference <= 0.98) {
    let direction = 'buy';
  } else if (difference >= 1.05) {
    let direction = 'sell';
  }

  const TRADE_SIZE = 100
  const quantity = TRADE_SIZE / lastPrice
  if (direction) {
    const order = await binance.createMarketOrder('BTC/USDT', direction, quantity)
    myConsole.log(`${moment().format()}: ${direction} ${quantity} BTC at ${lastPrice}`);
  }
  printBalance(lastPrice)
}

async function main() {
  while (true) {
    await tick();
    await delay(60 * 1000);
  }
}

main();