/**
 * Generate order with random amount (up to 5) and random price within 5% of given price
 * 
 * @param  {string} price
 */
exports.generateOrder = (price) =>
  [
    // Price
    price * (1 + ((Math.random() * 0.1) - 0.05)),
    // Amount
    Math.random() * 5
  ]
