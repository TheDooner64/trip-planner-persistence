var express = require('express');
var router = express.Router();
var models = require('../../models/');
var Day = models.Day;
var Hotel = models.Hotel;
var Restaurant = models.Restaurant;
var Activity = models.Activity;

router.get('/', function(req, res, next) {
	console.log('---In Correct Route---');
	Day.find({}).then(function(allDays) {
		console.log(allDays);
		res.send(allDays);
	}).then(null, next);
})

router.get('/:dayID', function(req, res, next) {
	Day.findOne({number: req.params.dayID})
	.populate("hotel")
	.populate("restaurants")
	.populate("activities")
	.then(function(matchedDay) {
		res.send(matchedDay);
	}).then(null, function(err, req, res, next) {
		res.send("There was an error");
	});
});

router.post('/:dayID', function(req, res, next) {
	Day.find({number: req.params.dayID}).then(function(matchedDays) {
		if(!matchedDays.length) {
			Day.create([{number: req.params.dayID}]);
			res.send("Day created");
		} else {
			res.send("Day already exists");
		}
	}).then(null, function(err, req, res, next) {
		res.send("There was an error");
	});
})

router.post('/:dayID/hotels', function(req, res, next) {
	var placeName = Object.keys(req.body)[0];
	Hotel.find({name: placeName})
		.then(function(hotel) {
			console.log(hotel);
			Day.update({ number: req.params.dayID }, { $push: { hotel: hotel[0]._id }}, { runValidators: true })
			.then(function(updateReport) {
				console.log(updateReport);
				res.send(hotel[0]);
			}).then(null, next);
	});
});

router.post('/:dayID/restaurants', function(req, res, next) {
	var placeName = Object.keys(req.body)[0];
	Restaurant.find({name: placeName})
		.then(function(restaurant) {
			console.log(restaurant);
			Day.update({ number: req.params.dayID }, { $push: { restaurants: restaurant[0]._id }}, { runValidators: true })
			.then(function(updateReport) {
				console.log(updateReport);
				res.send(restaurant[0]);
			}).then(null, next);
	});
});

router.post('/:dayID/activities', function(req, res, next) {
	var placeName = Object.keys(req.body)[0];
	Activity.find({name: placeName})
		.then(function(activity) {
			console.log(activity);
			Day.update({ number: req.params.dayID }, { $push: { activities: activity[0]._id }}, { runValidators: true })
			.then(function(updateReport) {
				console.log(updateReport);
				res.send(activity[0]);
			}).then(null, next);
	});
});

router.delete('/:dayID/', function (req, res, next) {
	res.status(200).send(req.body);
})

module.exports = router;