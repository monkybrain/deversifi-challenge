const { getOrderbook } = require('./api')
const { generateOrder } = require('./util')
const { executeOrders, showBalances } = require('./operations')

// Globals
const INTERVAL_EXECUTE_ORDERS = 5_000
const INTERVAL_SHOW_BALANCES = 30_000

const assets = {
  eth: 10,
  usd: 2000
}

const orders = {
  bid: [],
  ask: []
}

const run = async () => {
  // Get orderbook
  const orderbook = await getOrderbook()

  // Determine best bid and ask prices
  const bestBid = orderbook.bid[0]
  const bestAsk = orderbook.ask[0]

  for (let i = 0; i < 5; i++) {
    // Generate orders
    orders.bid[i] = generateOrder(bestBid[0])
    orders.ask[i] = generateOrder(bestAsk[0])

    // Log orders
    console.log(`Placed BID @ ${orders.bid[i][0]} ${orders.bid[i][1]}`)
    console.log(`Placed ASK @ ${orders.ask[i][0]} ${orders.ask[i][1]}`)
  }

  // Sort orders from best to worst price
  orders.bid.sort()
  orders.ask.sort().reverse()

  // Execute orders every <interval> milliseconds
  setInterval(() => executeOrders(assets, orders), INTERVAL_EXECUTE_ORDERS)

  // Show balances every <interval> milliseconds
  setInterval(() => showBalances(assets), INTERVAL_SHOW_BALANCES)
}

// Run program (and log any errors)
run().catch(console.error)
