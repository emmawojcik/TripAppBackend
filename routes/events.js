var express = require('express');
var Database = require('./database');
var CredentialsManager = require('./credentials');
var router = express.Router();
var superagent = require('superagent');
var apiKey = ''; // REPLACE WITH YOUR API KEY

// create new event
router.post ('/new', (request, response) => {
    var database = new Database();
    var credentialsManager = new CredentialsManager();

    var eventName = request.body.eventName
    var placeName = request.body.placeName
    var startDate = request.body.startDate
    var duration = request.body.duration
    var tripId = request.body.tripId
    var placeIdentifier = request.body.placeIdentifier
    var emailAddress = request.body.emailAddress
    var password = request.body.password

    // login first to validate user
    credentialsManager.login(emailAddress, password, (userId) => {
        if (userId){
            superagent.get('https://maps.googleapis.com/maps/api/place/details/json')
            .query({ key: apiKey, place_id: placeIdentifier})
            .end((err, res) => {
                if(err) { return console.log(err); }
                
                // retrieve latitude and longitude to store with event in database - reduce api calls from app
                var latitude = null;
                var longitude = null;
                if (res && res.body && res.body.result){
                    if (res.body.result.geometry && res.body.result.geometry.location){
                        latitude = res.body.result.geometry.location.lat;
                        longitude = res.body.result.geometry.location.lng;
                    }
                }
            var createEventQuery = 'INSERT INTO `events` (`name`, `place_name`, `start_date`, `duration`, `place_identifier`, `trip_id`, `user_id`, `latitude`, `longitude`) VALUES ("'+eventName+'", "'+placeName+'", "'+startDate+'", "'+duration+'", "'+placeIdentifier+'","'+tripId+'", "'+userId+'", "'+latitude+'", "'+longitude+'")';
    
            database.runQuery(createEventQuery, (rows, error) => {
    
                var body = "";
            
                if (error) {
                    response.statusCode = 401;
                    body = { response: 'failed' };
                  
                } else {
                    body = { response: 'success' };
                    response.statusCode = 201;
                }
            
                response.send(JSON.stringify(body));
            });
        }); 
        }
    });
}); 

// get all user's events
router.post ('/allEvents', (request, response) => {

    // get all events for a trip
    var database = new Database();
    var credentialsManager = new CredentialsManager();
    var emailAddress = request.body.emailAddress
    var password = request.body.password
    var tripId = request.body.tripId

    // login first to validate user
    credentialsManager.login(emailAddress, password, (userId) => {

    if (userId){
        var selectEventsQuery = 'SELECT `name`, `place_name`, `start_date`, `duration`, `id`, `place_identifier`, `latitude`, `longitude` FROM `events` WHERE `trip_id` = "'+tripId+'" ORDER BY `start_date` ASC';

        database.runQuery(selectEventsQuery, (rows,error) => {

            var body = "";

            if (error) {
                response.statusCode = 401;
                body = { response: 'failed' }
        
            } else {
                body = rows
                response.statusCode = 200;
            }
            response.send(JSON.stringify(body));
            });
        }
    }) 

});

// delete an event
router.post ('/deleteEvent', (request, response) => {

    var database = new Database();
    var credentialsManager = new CredentialsManager();
  
    var emailAddress = request.body.emailAddress
    var password = request.body.password
    var eventId = request.body.eventId
  
    credentialsManager.login(emailAddress, password, (userId) => {
      if (userId){
        var deleteEventQuery = 'DELETE FROM `events` WHERE `id` = "'+eventId+'"';
  
        database.runQuery(deleteEventQuery, (rows,error) =>{
          if (error) {
            response.statusCode = 401;
            body = { response: 'failed' };
              
          } else {
            body = { response: 'success' };
            response.statusCode = 200;
            }
            response.send(JSON.stringify(body));
        });
      }
    });  
})

module.exports = router;