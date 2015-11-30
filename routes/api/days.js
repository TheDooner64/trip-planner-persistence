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

router.delete('/day/:dayID/', function (req, res, next) {
	//delete whole day
	Day.remove({number: req.params.dayID}).then(function(updateReport) {
		res.send(updateReport);
	}).then(null, next);
})

router.delete('/allEvents/:dayID', function(req, res, next) {
	Day.update({number: req.params.dayID}, {$set: {hotel: [], restaurants: [], activities: []}})
	.then(function(updateReport) {
		res.send(updateReport);
	}).then(null, next);
})

router.delete('/event/:dayID', function(req, res, next) {
	console.log('test');
	var removeEvent = req.body;
	console.log(removeEvent);
	if(removeEvent.type === 'hotels') removeEvent.type = 'hotel';
	if(removeEvent.type === 'hotel') {
		Hotel.findOne({name: removeEvent.name})
			.then(function(oneHotel) {
				Day.update({number: req.params.dayID}, {$pullAll: {hotel: [oneHotel._id]}})
					.then(function (updateReport) {
						res.send(updateReport);
					})
			}).then(null, function(err) {
				console.error(err.message);
				res.send(err);
			});
	} else if (removeEvent.type === 'restaurants') {
		console.log("in restaurants remove");
		Restaurant.findOne({name: removeEvent.name})
			.then(function(oneRest) {
				Day.update({number: req.params.dayID}, {$pullAll: {restaurants: [oneRest._id]}})
					.then(function (updateReport) {
						res.send(updateReport);
					})
			}).then(null, function(err) {
				console.error(err.message);
				res.send(err);
			});
	} else {
		Activity.findOne({name: removeEvent.name})
			.then(function(oneAct) {
				Day.update({number: req.params.dayID}, {$pullAll: {activities: [oneAct._id]}})
					.then(function (updateReport) {
						res.send(updateReport);
					})
			}).then(null, function(err) {
				console.error(err.message);
				res.send(err);
			});
	}
})



module.exports = router;






