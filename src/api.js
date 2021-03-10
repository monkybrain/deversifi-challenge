const axios = require('axios')

/**
 * Optimistically fetch orderbook via API
 * 
 * @returns {Promise} Promise object contains list of price and amount for all bid and ask orders
 */
exports.getOrderbook = async () => {
  const { data: orders } = await axios.get('https://api.deversifi.com/bfx/v2/book/tETHUSD/R0')
  return {
    bid: orders
      .slice(0, orders.length / 2)
      .map(([_id, price, amount]) => [price, amount]),
    ask: orders
      .slice(orders.length / 2)
      .map(([_id, price, amount]) => [price, amount * -1])
  }
}
