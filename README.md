## Stocks API: backend service for Speer Application 2021
Stocks API for Speer Summer internship application.
Tech behind it:
* Express
* MongoDB
* Mongoose
* argon2

## Run instructions:
1. npm i
2. Make sure you have mongoDB client installed
3. node ./database-init.js
4. node server.js

And you're ready to make requests!

## Endpoints
* /login (post)
* /logout (post)
* /portfolio (get)
* /stock/<ticker> (get)
* /buy?ticker=""&amt="" (post)
* /sell?ticker=""&amt="" (post)
* /subscribe/<ticker> (post)
* /addFunds?amt="" (post)
