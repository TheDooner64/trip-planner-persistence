var mongoose = require('mongoose');

var PlaceSchema = new mongoose.Schema({
	address: String,
	city: String,
	state: String,
	phone: String,
	location: [Number],
    marker: Object
});

module.exports = mongoose.model('Place', PlaceSchema);
