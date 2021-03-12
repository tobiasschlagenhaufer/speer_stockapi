// All of the routes are stores here to avoid cluttering the server
var express = require('express');
var app = module.exports = express();
const Stock = require("./StockModel");
const User = require("./UserModel");

/**
 * USER LOGIN
 * 
 * @requset: POST
 * @params username
 * @param password
 */
app.post("/login", async function(req, res, next){
    let username = req.body.username;
    let password = req.body.password;

    // has the password and use that in our database
    try {
        const hash = await argon2.hash(password);
    } catch (err) {
        console.log("Error hashing password");
        return;
    }
    //try to find user with this username and password
    mongoose.connection.db.collection("users").findOne({username: username, password: hash}, function(err, result){
        if(err)throw err;
        
        //Login valid, credentials found so sign them in
        if(result){
            //set session vars
            req.session.loggedin = true;
            req.session.username = username;
            req.session.userid = result._id;

            //send to profile page
            //res.redirect("/users/"+result._id);
        }
        // Login invalid, no user found
        else{

            //return them to the home page
            //res.status(200).redirect("/");
        }

        // For this demo, just send a JSON response saying signed in
        res.json({ loggedIn: req.session.loggedin })
        return;
    });

});

/**
 * STOCK REQUEST
 * request a single stock
 * 
 * request: GET
 * @param ticker
 */
app.get("/stock/:ticker", function(req, res, next){
    const ticker = req.params.ticker;
    var data;
    Stock.findByTicker(ticker, function(err, results){
        // If error retrieving 
        if(err) throw err;

        // otherwise send back the query
        if(results){
            data = results[0];
        }
        else {
            data = null;
        }
        res.status(200).json({results: data});
        return;
    });
});

/**
 * BUY STOCK
 * buy n number of a single stock
 * 
 * request: POST
 * @param ticker
 */
 app.post("/buy", function(req, res, next){
    const ticker = req.query.ticker;
    const amt = req.query.amt;

    if (!ticker || !amt) {
        res.sendStatus(401).json({error: "Invalid parameters. Expected 'ticker' and 'amt'"});
        return;
    }

    // check if logged in
    auth(req, res, () => {
        // logged in
        Stock.findByTicker(ticker, function(err, results){
            // If error retrieving 
            if(err) throw err;
    
            // otherwise send back the query
            if(results){
                data = results[0];
            }
            else {
                data = null;
                res.status(404).json({error: "Stock not found"});
                return;
            }

            //create an object id to make query
            let userid = new ObjectId(req.session.userid);

            //person is logged in, find their user profile in db
            mongoose.connection.db.collection("users").findOne({_id: userid}, function(err, user){

                //check if enough in wallet
                if (user.wallet < (amt*data.price)) {
                    res.status(401).json({error: "Not enough funds"});
                    return;
                }

                //set our updated values
				user.wallet -= (amt*data.price);
                if (!user.owned_shares[data._id]) {
                    user.owned_shares[data._id] = 0;
                }
                user.owned_shares[data._id] += amt;
                user.save(done);

                res.status(200).json({success: "Bought stock successfully!"});
                return;
            });
        });
    });
});

/**
 * SELL STOCKS
 * sell n number of a single position
 * 
 * request: POST
 * @param ticker
 */
 app.post("/sell", function(req, res, next){
    const ticker = req.query.ticker;
    const amt = req.query.amt;

    if (!ticker || !amt) {
        res.sendStatus(401).json({error: "Invalid parameters. Expected 'ticker' and 'amt'"});
        return;
    }

    // check if logged in
    auth(req, res, () => {
        // logged in
        Stock.findByTicker(ticker, function(err, results){
            // If error retrieving 
            if(err) throw err;
    
            // otherwise send back the query
            if(results){
                data = results[0];
            }
            else {
                data = null;
                res.status(404).json({error: "Stock not found"});
                return;
            }

            //create an object id to make query
            let userid = new ObjectId(req.session.userid);

            //person is logged in, find their user profile in db
            mongoose.connection.db.collection("users").findOne({_id: userid}, function(err, user){

                //check if enough in wallet
                if (user < (amt*data.price)) {
                    res.status(401).json({error: "Not enough stocks"});
                    return;
                }

                //set our updated values
				user.wallet += (amt*data.price);
                user.owned_shares[data._id] -= amt;
                user.save(done);

                res.status(200).json({success: "Sold stock successfully!"});
                return;
            });
        });
    });
});

/**
 * BUY STOCK
 * add a single stock to subscribed watches
 * 
 * request: POST
 * @param ticker
 */
app.post("/subscribe/:ticker", function(req, res, next){
    const ticker = req.params.ticker;

    // check if logged in
    auth(req, res, () => {
        // logged in
        Stock.findByTicker(ticker, function(err, results){
            // If error retrieving 
            if(err) throw err;
    
            // otherwise send back the query
            if(results){
                data = results[0];
            }
            else {
                data = null;
                res.status(404).json({error: "Stock not found"});
                return;
            }

            //create an object id to make query
            let userid = new ObjectId(req.session.userid);

            //person is logged in, find their user profile in db
            mongoose.connection.db.collection("users").findOne({_id: userid}, function(err, user){

                //set our updated values
				user.subscribed_stocks.push(data._id);
                user.save(done);

                res.status(200).json({success: "Added stock to watchlist!"});
                return;
            });
        });
    });
});

/**
 * USER LOGOUT
 * 
 * @request: POST
 * @param: N/A
 */
app.post("/logout", function(req, res, next){
    //just set loggedin to false
    req.session.loggedin = false;

    res.json({logginIn: req.session.loggedin});
})

/**
 * Default 404 handler
 * When no other request is met, it is caught by this function 
 * 
 * request: GET
 * @params: any
 */
app.all("*",function(req,res){
    res.set(404).json({error: 'Endpoint not found'});
});

//auth function
function auth(req, res, next){
	//Check req info, load user info, etc.
	if (user.auth){ //Check if they are authorized
		next();
	}else{
		res.status(401).json({error: "Authenitcation error"});
	}
}