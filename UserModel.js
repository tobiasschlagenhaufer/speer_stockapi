const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = Schema({
	username: {type: String, required: true},
	password: {type: String, required: true},
    wallet: {type: Number, default: 0},
    owned_shares: {
        stock_id: {
            num_shares: Number
        }},
	subscribed_stocks: [{type: Number, required: true}],
});

module.exports = mongoose.model("User", userSchema);