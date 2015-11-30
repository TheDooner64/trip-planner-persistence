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
	res.send(req.params.dayID);
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

router.post('/:dayID/hotel', function(req, res, next) {
	res.status(200).send('hotel');
});
router.post('/:dayID/restaurants', function(req, res, next) {
	res.status(200).send('restaurants');
});
router.post('/:dayID/activities', function(req, res, next) {
	res.status(200).send('activities');
});

router.delete('/:dayID/', function (req, res, next) {
	console.log(req.body);
	res.status(200).send(req.body);
})

module.exports = router;