# Deversifi Coding Challenge

Source: https://docs.google.com/document/d/1ACPYGtGSSKczvJ5gaMs1obzrfl_zrDbpLk0McRQ3id0/edit

## Task

Create a simple market making bot using Node.js

1. The bot should keep track of asset balances, starting with a virtual 10 ETH and 2000 USD

2. Use the orderbook API to determine best bid and best ask prices for the ETH-USD market
    - Documentation https://docs.deversifi.com/docs#getDvfBook
    - Example call https://api.deversifi.com/bfx/v2/book/tETHUSD/R0 

3. The bot should place 5x BID orders and 5x ASK orders at random price points and for random amounts within 5% of the best bid and best ask prices
    - placing orders can be done via logging indicating side and price
    - e.g. PLACE BID @ PRICE AMOUNT

4. Every 5 second the bot should refresh (via orderbook API) the state of the market

5. Any bid orders that are above the best bid or sell orders that are below the best ask should be considered filled and logged accordingly
e.g. FILLED BID @ PRICE AMOUNT (ETH - x.xxx USD + yyyy)

6. The bot should keep track of asset balances, updating on filled order events and can place / cancel order positions to fulfil requirements

7. The bot should show overall asset balances every 30 seconds

## Evaluation
- Code should be submitted in the form of a Github repo
- Performance is important and suggestions on how you would optimise if you had more time are welcome
- Keep the implementation simple
- Code should be clean and readable with appropriate test cases
- The task is not to evaluate your trading algorithm (but feel free to have fun with this part)
