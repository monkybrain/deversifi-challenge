const axios = require('axios')

// Globals
const ORDERBOOK_LENGTH = 50
const INTERVAL_EXECUTE_ORDERS = 5000
const INTERVAL_SHOW_BALANCES = 30000

const assets = {
  eth: 100,
  usd: 2000
}

const orders = {
  bid: [],
  ask: []
}

const run = async () => {
  const orderbook = await getOrderbook()

  console.log(orderbook)

  // Determine best bid and ask prices
  const bestBid = orderbook.bid[0]
  const bestAsk = orderbook.ask[0]

  console.log('Best bid', bestBid)
  console.log('Best ask', bestAsk)

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

  console.log(orders)

  // Execute orders every <interval> milliseconds
  setInterval(executeOrders, 1_000)

  // Show balances every <interval> milliseconds
  setInterval(showBalances, 5_000)
}

const executeOrders = async () => {
  // Get current orderbook
  const orderbook = await getOrderbook()

  // Match bot's bid orders with orderbook asks
  // Start with bot's lowest bids

  // For each ask order in orderbook (from lowest to highest)
  for (let i = 0; i < orderbook.ask.length; i++) {

    // If out of funds, break loop
    if (assets.usd <= 0) break

    // Get ask price and amount
    const askPrice = orderbook.ask[i][0]
    const askAmount = orderbook.ask[i][1]

    // For each of bot's bid orders (from lowest to highest)
    for (let j = 0; j < orders.bid.length; j++) {

      // Get bid price and amount
      const [bidPrice, bidAmount] = orders.bid[j]

      // If bid price exceeds ask price, try to fill order
      if (bidPrice >= askPrice) {

        // Calculate max amount available for purchase given USD balance
        const maxAmount = assets.usd / askPrice

        // Cap order amount to max amount
        const orderAmount = bidAmount > maxAmount ? maxAmount : bidAmount

        // Adjust balances
        assets.eth = assets.eth + orderAmount
        assets.usd = assets.usd - (orderAmount * askPrice)

        // Adjust bot orders and orderbook
        orders.bid[j][1] = bidAmount - orderAmount
        orderbook.ask[i] = [askPrice, askAmount - orderAmount]

        // If bid order amount smaller or equal to orderbook ask amount -> consider order filled
        if (orderAmount <= askAmount) {
          console.log(`Filled BID @ ${askPrice} ${orderAmount} (${bidPrice}, ${bidAmount})`)
          // Else -> only partially filled
        } else {
          console.log(`Partially filled BID @ ${askPrice} ${orderAmount} (${bidPrice})`)
        }
      }
    }

    // Remove filled orders
    // console.log('\nBefore', orders, orderbook.ask)
    orders.bid = orders.bid.filter(([_price, amount]) => amount != 0)
    orderbook.ask = orderbook.ask.filter(([_price, amount]) => amount != 0)
    // console.log('\nAfter\n', orders, orderbook.ask)
  }

  // Match bot's ask orders with orderbook bids
  // Start with bot's highest ask

  // For each bid order in orderbook (from highest to lowest)
  for (let i = 0; i < orderbook.bid.length; i++) {

    // If out of funds, break loop
    if (assets.eth <= 0) break

    // Get bid price and amount
    const bidPrice = orderbook.bid[i][0]
    const bidAmount = orderbook.bid[i][1]

    // For each of bot's ask orders (from highest to lowest)...
    for (let j = 0; j < orders.ask.length; j++) {

      // ...get ask price and amount
      const [askPrice, askAmount] = orders.ask[j]

      // If bid price exceeds ask price, try to fill order
      if (bidPrice >= askPrice) {

        // Calculate max amount available for sale given ETH balance
        const maxAmount = assets.eth

        // Cap order amount to max amount
        const orderAmount = askAmount > maxAmount ? maxAmount : askAmount

        // If order amount smaller than bid amount -> fill order
        if (orderAmount <= bidAmount) {

          // Adjust balances
          assets.eth = assets.eth - orderAmount
          assets.usd = assets.usd + (orderAmount * bidPrice)

          // Remove order
          orders.ask.splice(j, 1)

          // Log event
          console.log(`Filled ASK @ ${bidPrice} ${orderAmount}`)

          console.log(orders)
          console.log(assets)

        } else {
          // If order amount exceeds ask amount, partially fill order

          // Partially fill order
          orders.ask[j][1] = askAmount - orderAmount

          // Adjust balances
          assets.eth = assets.eth - orderAmount
          assets.usd = assets.usd + (orderAmount * bidPrice)

          // Log event
          console.log(`Partially filled ASK @ ${bidPrice} ${orderAmount}`)

          console.log(orders)
          console.log(assets)
        }
      }
    }
  }
}

/**
 * Show ETH and USD balances
 */
const showBalances = () =>
  console.log(`Assets: ${assets.eth.toFixed(2)} ETH, ${assets.usd.toFixed(2)} USD`)

/**
 * Get orderbook and sort bid and ask orders from best to worst price
 * 
 * @returns {Promise} Promise object contains list of price and amount for all bid and ask orders
 */
const getOrderbook = async () => {
  const response = await axios.get('https://api.deversifi.com/bfx/v2/book/tETHUSD/R0')
  const orders = response.data
  return {
    bid: orders.slice(0, orders.length / 2).map(([_id, price, amount]) => [price, amount]),
    ask: orders.slice(orders.length / 2).map(([_id, price, amount]) => [price, amount * -1])
  }
}

/**
 * Generate order with random amount (up to 5) and random price within 5% of given price
 * 
 * @param  {string} price
 */
const generateOrder = (price) =>
  [
    // Price
    price * (1 + ((Math.random() * 0.1) - 0.05)),
    // Amount
    Math.random() * 5
  ]

// Run program (and log any errors)
run().catch(console.error)

// Improvements: don't batch all bid and ask orders