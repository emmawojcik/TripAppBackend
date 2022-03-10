var express = require('express');
var router = express.Router();
var superagent = require('superagent');
var apiKey = ''; // REPLACE WITH YOUR API KEY

// make google places api request for place suggestions based on user input
router.post('/autocomplete',(request, response) => {
    var placeName = request.body.placeName;

    superagent.get('https://maps.googleapis.com/maps/api/place/autocomplete/json')
    .query({ key: apiKey, input: placeName })
    .end((err, res) => {
    
    if (err) { return console.log(err); }
    var predictions = [];
    if (res && res.body && res.body.predictions){
        res.body.predictions.forEach(function (item, index) {
            predictions.push({placeName: item.description, placeIdentifier: item.place_id})
        });
    }
    var body = predictions;
    response.send(JSON.stringify(body));
    });
});

// make google places api request for place details using place identifier
router.post('/placeDetails', (request, response) => {
    var placeIdentifier = request.body.placeIdentifier;

    superagent.get('https://maps.googleapis.com/maps/api/place/details/json')
    .query({ key: apiKey, place_id: placeIdentifier})
    .end((err, res) => {
        if(err) { return console.log(err); }
        var result = {
            // set the properties that may not be retrieved to be null
            openingHours: null,
            website: null,
            phoneNumber: null
        };
        var body = {result:null};
        if (res && res.body && res.body.result){
            if (res.body.result.geometry && res.body.result.geometry.location){
                result.latitude = res.body.result.geometry.location.lat;
                result.longitude = res.body.result.geometry.location.lng;
            }
            if(res.body.result.photos && res.body.result.photos.length > 0){
                result.photoReference = res.body.result.photos[0].photo_reference;
            }
            if(res.body.result.website){
                result.website = res.body.result.website;
            }
            if(res.body.result.formatted_address){
                result.address = res.body.result.formatted_address;
            }
            if(res.body.result.international_phone_number){
                result.phoneNumber = res.body.result.international_phone_number;
            }
            if(res.body.result.opening_hours && res.body.result.opening_hours.weekday_text){
                result.openingHours = res.body.result.opening_hours.weekday_text;
            }
            if(res.body.result.name){
                result.name = res.body.result.name;
            }
            body.result = result;
        }
        response.send(JSON.stringify(body));
    });

})

// make google places api request for photos using photo reference
router.post('/placeImage', (request, response) => {
    var photoReference = request.body.photoReference;
    var maxHeight = request.body.maxHeight;

    superagent.get('https://maps.googleapis.com/maps/api/place/photo')
    .query({key: apiKey, photoreference: photoReference, maxheight: maxHeight})
    .end((err, res) => {
        response.redirect(res.redirects[0]);
    });  
})

// make google places api request for nearby places for map
router.post('/mapSearch', (request,response) => {
    var location = request.body.location;
    var type = request.body.type;
    var radius = request.body.radius;

    superagent.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
    .query({ 
        // set up parameters to create url path
        key: apiKey, 
        keyword: type,
        location: location,
        radius: radius
    })
    .end((err, res) => {
        if(err) { return console.log(err); }
        var body = {items:[]};
        if (res.body && res.body.results) {
            res.body.results.forEach((candidate, index) => {
                var result = {
                    photoReference:null,
                    rating:0,
                    type:type
                };
                if (candidate.geometry && candidate.geometry.location) {
                    result.latitude = candidate.geometry.location.lat;
                    result.longitude = candidate.geometry.location.lng;
                }
                if(candidate.photos && candidate.photos.length > 0) {
                    result.photoReference = candidate.photos[0].photo_reference;
                }
                if(candidate.name) {
                    result.name = candidate.name;
                }
                if (candidate.rating) { 
                    result.rating = candidate.rating;
                }
                result.placeIdentifier = candidate.place_id;
                body.items.push(result);
                console.log(candidate);
            });
        }
        var json = JSON.stringify(body);
        response.send(json);
    })
})
module.exports = router;