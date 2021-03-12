let stocks = [
    {
        name: "Apple Inc.",
        ticker: "AAPL",
        price: 123
    },
    {
        name: "AT&T",
        ticker: "T",
        price: 29.54
    },
    {
        name: "Tesla",
        ticker: "TSLA",
        price: 734.21
    },
    {
        name: "PepsiCo",
        ticker: "PEP",
        price: 133.22
    },
    {
        name: "Microsoft",
        ticker: "MSFT",
        price: 237.13
    },
    {
        name: "Wal-Mart",
        ticker: "WMT",
        price: 132.13
    },
];

users = ["toby", "tom", "speer", "michael"];

const mongoose = require('mongoose');
const User = require("./UserModel");
const Stock = require("./StockModel");
const argon2 = require('argon2');

mongoose.connect('mongodb://localhost/stockapi', {useNewUrlParser: true});
let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function() {
	mongoose.connection.db.dropDatabase(async function(err, result){
		if(err){
			console.log("Error dropping database:");
			console.log(err);
			return;
		}
		console.log("Dropped database. Starting re-creation.");

        let finishedStocks = 0;
		stocks.forEach(async stock => {
			let s = new Stock();
			s.name = stock.name
			s.ticker = stock.ticker;
			s.price = stock.price;
			
			s.save(async function(err, result){
				if(err){
					console.log("Error saving stock: " + JSON.stringify(s));
					console.log(err.message);
				}
                finishedStocks++;

                if(finishedStocks == stocks.length){
					console.log("Finished Stocks.");
					let finishedUsers = 0;
					for (user of users) {
						let u = new User();
                        let hash = await argon2.hash(user);
						u.username = user;
						u.password = hash;
						u.wallet = 0;
                        u.owned_shares = [];
						u.save(function(err, result){
							if(err){
								console.log("Error saving user: " + JSON.stringify(u));
								console.log(err.message);
							}
							
							finishedUsers++;

							if(finishedUsers == users.length){
								console.log("Finished Users.");
								mongoose.connection.close()
							}
						});
					};
                }
			});
		});
	});
});

