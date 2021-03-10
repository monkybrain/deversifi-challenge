const { getOrderbook } = require('./api')

/**
 * Show asset balances
 */
exports.showBalances = (assets) => {
  console.log('\nAssets:')
  Object.keys(assets).forEach((symbol) => {
    console.log(`${symbol.toUpperCase()}: ${assets[symbol]}`)
  })
}

/**
 * Execute orders, i.e. match bot's orders with orderbook
 */
exports.executeOrders = async (assets, orders) => {
  // Get current orderbook
  const orderbook = await getOrderbook()

  // Match bot's bid orders with orderbook asks
  matchBidOrders(assets, orders, orderbook)

  // Match bot's ask orders with orderbook bids
  matchAskOrders(assets, orders, orderbook)
}

const matchBidOrders = (assets, orders, orderbook) => {
  // For each ask order in orderbook (from lowest to highest)
  for (let i = 0; i < orderbook.ask.length; i++) {

    // If out of funds, break loop
    if (assets.usd <= 0) break

    // For each of bot's bid orders (from lowest to highest)
    for (let j = 0; j < orders.bid.length; j++) {

      // If out of funds, break loop
      if (assets.usd <= 0) break

      // Get bid/ask price/amount
      const [askPrice, askAmount] = orderbook.ask[i]
      const [bidPrice, bidAmount] = orders.bid[j]

      // Skip filled orders
      if (askAmount <= 0) continue

      // If bid price exceeds ask price, fill order
      if (bidPrice >= askPrice) {

        // Calculate max amount available for purchase given USD balance
        const maxAmount = assets.usd / askPrice

        // Cap order amount to max amount
        const orderAmount = bidAmount > maxAmount ? maxAmount : bidAmount

        // Update balances
        assets.eth = assets.eth + orderAmount
        assets.usd = assets.usd - (orderAmount * askPrice)

        // Update bot orders and orderbook
        orders.bid[j][1] = bidAmount - orderAmount
        orderbook.ask[i] = [askPrice, askAmount - orderAmount]

        // If bid amount smaller or equal to ask amount, consider order filled
        if (orderAmount <= askAmount) {
          console.log(`Filled BID @ ${askPrice} ${orderAmount}`)
          // Else, only partially filled
        } else {
          console.log(`Partially filled BID @ ${askPrice} ${orderAmount}`)
        }
      }
    }

    // Remove filled orders
    orders.bid = orders.bid.filter(([_price, amount]) => amount != 0)
  }
}

const matchAskOrders = (assets, orders, orderbook) => {
  // For each bid order in orderbook (from highest to lowest)
  for (let i = 0; i < orderbook.bid.length; i++) {

    // If out of funds, break loop
    if (assets.eth <= 0) break

    // For each of bot's ask orders (from highest to lowest)
    for (let j = 0; j < orders.ask.length; j++) {

      // If out of funds, break loop
      if (assets.eth <= 0) break

      // Get bid/ask price/amount
      const [bidPrice, bidAmount] = orderbook.bid[i]
      const [askPrice, askAmount] = orders.ask[j]

      // Skip filled orders
      if (bidAmount <= 0) continue

      // If bid price exceeds ask price, fill order
      if (bidPrice >= askPrice) {

        // Calculate max amount available for sale given ETH balance
        const maxAmount = assets.eth

        // Cap order amount to max amount
        const orderAmount = askAmount > maxAmount ? maxAmount : askAmount

        // Update balances
        assets.eth = assets.eth - orderAmount
        assets.usd = assets.usd + (orderAmount * bidPrice)

        // Update bot orders and orderbook
        orders.ask[j][1] = askAmount - orderAmount
        orderbook.bid[i] = [bidPrice, bidAmount - orderAmount]

        // If ask amount smaller or equal to bid amount, consider order filled
        if (orderAmount <= askAmount) {
          console.log(`Filled ASK @ ${bidPrice} ${orderAmount}`)
          // Else, only partially filled
        } else {
          console.log(`Partially filled ASK @ ${bidPrice} ${orderAmount}`)
        }
      }
    }

    // Remove filled orders
    orders.ask = orders.ask.filter(([_price, amount]) => amount != 0)
  }
}
