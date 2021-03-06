$(function () {
    var map = initialize_gmaps();
    var currentDay = 1;
    var numOfDays = 0;
    var placeMapIcons = {
        activities: '/images/star-3.png',
        restaurants: '/images/restaurant.png',
        hotels: '/images/lodging_0star.png'
    };
    var todaysMarkers = [];

    var $dayButtons = $('.day-buttons');
    var $addDayButton = $('.add-day');
    var $placeLists = $('.list-group');
    var $dayTitle = $('#day-title');
    var $addPlaceButton = $('.add-place-button');

    var createItineraryItem = function (placeName) {
        var $item = $('<li></li>');
        var $div = $('<div class="itinerary-item"></div>');
        $item.append($div);
        $div.append('<span class="title">' + placeName + '</span>');
        $div.append('<button class="btn btn-xs btn-danger remove btn-circle">x</button>');

        return $item;
    };

    var setDayButtons = function () {
        $dayButtons.find('button').not('.add-day').remove();
        days.forEach(function (day, index) {
            $addDayButton.before(createDayButton(index + 1));
        });
    };

    var getPlaceObject = function (typeOfPlace, nameOfPlace) {
        var placeCollection = window['all_' + typeOfPlace];
        return placeCollection.filter(function (place) {
            return place.name === nameOfPlace;
        })[0];
    };

    var getIndexOfPlace = function (nameOfPlace, collection) {
        var i = 0;
        for (; i < collection.length; i++) {
            if (collection[i].place.name === nameOfPlace) {
                return i;
            }
        }
        return -1;
    };

    var createDayButton = function (dayNum) {
        return $('<button class="btn btn-circle day-btn"></button>').text(dayNum);
    };

    var reset = function () {
        var dayPlaces = days[currentDay - 1];
        if (!dayPlaces) return;

        $placeLists.empty();

        dayPlaces.forEach(function (place) {
            place.marker.setMap(null);
        });
    };

    var removeDay = function () {
        if(currentDay === numOfDays && currentDay > 1) {
            //remove day from database, and remove button
            $.ajax({
                method: "DELETE",
                url: 'api/days/day/'+currentDay,
                data: null,
                success: function(responseData) {
                    currentDay--;
                    numOfDays--;
                    setDay(currentDay);
                    console.log(responseData);
                    //select and remove button
                    var removeMe = $('div.day-buttons')[0].children[numOfDays];
                    removeMe.remove();
                    $('button').attr('disabled', false);
                },
                error: function(errorObj) {
                    console.error(errorObj.message);
                    $('button').attr('disabled', false);
                }
            })
        } else {
            $.ajax({
                method: "DELETE",
                url: 'api/days/allEvents/' + currentDay, 
                data: null,
                success: function(responseData) {
                    setDay(currentDay);
                    $('button').attr('disabled', false);
                },
                error: function(errorObj) {
                    console.error(errorObj.message);
                    $('button').attr('disabled', false);
                }
            })
            //clear all fields for current day
        }
        // if (days.length === 1) return;

        // reset();

        // days.splice(dayNum - 1, 1);

        // setDayButtons();
        // setDay(1);

    };

    var mapFit = function () {

        var bounds = new google.maps.LatLngBounds();
        var currentPlaces = days[currentDay - 1];

        currentPlaces.forEach(function (place) {
            bounds.extend(place.marker.position);
        });

        map.fitBounds(bounds);

    };

    var setDay = function (dayNum) {
        todaysMarkers.forEach(function(marker) {
            marker.setMap(null);
        });

        todaysMarkers = [];

        $.ajax({
            method: "GET",
            url: '/api/days/'+dayNum,
            data: null,
            success: function(singleDay) {
                var $dayButtons = $('.day-btn').not('.add-day');
                $placeLists.empty();
                currentDay = dayNum;
                if(!singleDay) return;
                singleDay.hotel.forEach(function (place) {
                    $('#hotels-list').find('ul').append(createItineraryItem(place.name));
                    var createdMapMarker = drawLocation(map, place.place[0].location, {
                        icon: placeMapIcons["hotels"]
                    });
                    createdMapMarker['placeName'] = place.name;
                    todaysMarkers.push(createdMapMarker);
                });

                singleDay.restaurants.forEach(function (place) {
                    $('#restaurants-list').find('ul').append(createItineraryItem(place.name));
                    var createdMapMarker = drawLocation(map, place.place[0].location, {
                        icon: placeMapIcons["restaurants"]
                    });
                    createdMapMarker['placeName'] = place.name;
                    todaysMarkers.push(createdMapMarker);
                });

                singleDay.activities.forEach(function (place) {
                    $('#activities-list').find('ul').append(createItineraryItem(place.name));
                    var createdMapMarker = drawLocation(map, place.place[0].location, {
                        icon: placeMapIcons["activities"]
                    });
                    createdMapMarker['placeName'] = place.name;
                    todaysMarkers.push(createdMapMarker);
                });

                $dayButtons.removeClass('current-day');
                $dayButtons.eq(dayNum - 1).addClass('current-day');

                $dayTitle.children('span').text('Day ' + dayNum.toString());

                // mapFit();
                $('button').attr('disabled', false);
            },
            error: function(errorObj) {
                console.error(errorObj);
                $('button').attr('disabled', false);
            }
        });
    };

    $addPlaceButton.on('click', function () {
        $('button').attr('disabled', true);
        var $this = $(this);
        var sectionName = $this.parent().attr('id').split('-')[0];
        var placeName = $this.siblings('select').val();

        $.ajax({
            method: "POST",
            url: '/api/days/' + currentDay + "/" + sectionName,
            data: placeName,
            success: function(responseData) {
                console.log("Ran while trying to add " + responseData.name);
                var $listToAppendTo = $('#' + sectionName + '-list').find('ul');
                var createdMapMarker = drawLocation(map, responseData.place[0].location, {
                    icon: placeMapIcons[sectionName]
                });
                createdMapMarker['placeName'] = placeName;
                todaysMarkers.push(createdMapMarker);

                $listToAppendTo.append(createItineraryItem(placeName));

                // mapFit();
                $('button').attr('disabled', false);
            },
            error: function(errorObj) {
                console.error(errorObj);
                $('button').attr('disabled', false);
            }
        });
    });

    function updateTodaysMarkers(nameToRemove) {
        todaysMarkers.forEach(function(marker) {
            if(marker.placeName === nameToRemove) marker.setMap(null);
        });
        todaysMarkers = todaysMarkers.filter(function(marker) {
            return marker.placeName !== nameToRemove;
        });
    }

    $placeLists.on('click', '.remove', function (e) {
        $('button').attr('disabled', true);
        var $this = $(this);
        var $listItem = $this.parent().parent();
        var nameOfPlace = $this.siblings('span').text();
        var typeOfPlace = $this.parent().parent().parent().parent().attr('id').split('-')[0];
        console.log("Beginning delete");
        $.ajax({
            method: "DELETE",
            url: '/api/days/event/'+currentDay,
            data: {name: nameOfPlace, type: typeOfPlace},
            success: function(responseData) {
                console.log(responseData);
                $listItem.remove();
                updateTodaysMarkers(nameOfPlace);
                $('button').attr('disabled', false);
            },
            error: function(errorObj){
                console.error(errorObj);
                $('button').attr('disabled', false);
            }
        });

        // var indexOfThisPlaceInDay = getIndexOfPlace(nameOfPlace, days[currentDay - 1]);
        // var placeInDay = days[currentDay - 1][indexOfThisPlaceInDay];

        // placeInDay.marker.setMap(null);
        // days[currentDay - 1].splice(indexOfThisPlaceInDay, 1);

    });

    $dayButtons.on('click', '.day-btn', function () {
        $('button').attr('disabled', true);
        setDay($(this).index() + 1);
    });

    $addDayButton.on('click', function () {
        $('button').attr('disabled', true);
        numOfDays = $(this).index()+1;
        createNewDay(numOfDays);
    });

    $dayTitle.children('button').on('click', function () { 
        $('button').attr('disabled', true);
        removeDay(currentDay);
    });

    function createNewDay(newNumOfDays) {
        $.ajax({
            method: "POST",
            url: '/api/days/'+newNumOfDays,
            data: null,
            success: function(responseData) {
                if(!responseData.localeCompare('Day created')) {
                    var $newDayButton = createDayButton(newNumOfDays);
                    $addDayButton.before($newDayButton);
                    currentDay = newNumOfDays;
                    setDay(currentDay);
                }
                $('button').attr('disabled', false);
            },
            error: function(errorObj) {
                console.error(errorObj);
                $('button').attr('disabled', false);
            }
        });
    }

    createNewDay(1);

    $.ajax({
        method: "GET",
        url: '/api/days',
        data: null,
        success: function(dayArr) {
            numOfDays = dayArr.length;
            dayArr = dayArr.sort(function(a, b) {
                return a.number - b.number;
            });
            dayArr.forEach(function(day) {
                var $newDayButton = createDayButton(day.number);
                $addDayButton.before($newDayButton);
            });
            $('button').attr('disabled', false);
        },
        error: function(errorObj) {
            console.error(errorObj);
            $('button').attr('disabled', false);
        }
    })

    setDay(currentDay);
});