const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let stockSchema = Schema({
	name: {type: String, required: true},
    ticker: {type: String, required: true},
	price: {type: Number, required: true},
});

stockSchema.statics.findIDArray = function(arr, callback) {
	this.find({'_id': {$in: arr}}, function(err, results) {
		if(err){
			callback(err);
			return;
		}
		callback(null, results);		
	});
}

stockSchema.statics.findByTicker = function(ticker, callback) {
	return this.where('ticker', ticker).exec(callback);
}

stockSchema.statics.findByName = function(name, callback) {
	return this.where('name', name).exec(callback);
}

module.exports = mongoose.model("Stock", stockSchema);