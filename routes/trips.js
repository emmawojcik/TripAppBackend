var express = require('express');
var Database = require('./database');
var CredentialsManager = require('./credentials');
var router = express.Router();
var superagent = require('superagent');
var apiKey = ''; // REPLACE WITH YOUR API KEY


// get all user's trips
router.post('/allTrips', (request, response) => {

  var database = new Database();
  var credentialsManager = new CredentialsManager();

  var emailAddress = request.body.emailAddress
  var password = request.body.password

  // login first to validate user
  credentialsManager.login(emailAddress, password, (userId) => {

    //if there is a user id (i.e. the credentials are valid)
    if (userId){
      var selectTripsQuery = 'SELECT `name`, `start_date`, `end_date`, `id`, `place_identifier`, `photo_reference` FROM `trips` WHERE `user_id` = "'+userId+'" ORDER BY `start_date` ASC';

      database.runQuery(selectTripsQuery, (rows, error) => {

        var body = "";
        
        if (error) {
          response.statusCode = 400;
          body = { response: 'failed' }
            
        } else {
          body = rows
          response.statusCode = 200;
          }
          response.send(JSON.stringify(body));
      })
    }
  })  
});

// make a new trip
router.post ('/new', (request, response) => {
    var database = new Database();
    var credentialsManager = new CredentialsManager();

    var tripName = request.body.tripName
    var destination = request.body.destination
    var startDate = request.body.startDate
    var endDate = request.body.endDate
    var placeIdentifier = request.body.placeIdentifier
    var emailAddress = request.body.emailAddress
    var password = request.body.password

    credentialsManager.login(emailAddress, password, (userId) => {
        if (userId){
            superagent.get('https://maps.googleapis.com/maps/api/place/details/json')
            .query({ key: apiKey, place_id: placeIdentifier})
            .end((err, res) => {
            if(err) { return console.log(err); }

            // get a photo reference for trip location to store with trip in database - reduce api calls from app
            var photoReference = null;
            if (res && res.body && res.body.result){
              if (res.body.result.photos && res.body.result.photos.length > 0) {
               photoReference = res.body.result.photos[0].photo_reference; 
              }                    
            }
            var createTripQuery = 'INSERT INTO `trips` (`name`, `destination`, `start_date`, `end_date`, `user_id`, `place_identifier`, `photo_reference`) VALUES ("'+tripName+'", "'+destination+'", "'+startDate+'", "'+endDate+'", "'+userId+'", "'+placeIdentifier+'", "'+photoReference+'")';

            database.runQuery(createTripQuery, (rows, error) => {

                var body = "";
            
                if (error) {
                  response.statusCode = 400;
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

// delete trip
router.post('/deleteTrip', (request, response) => {

  var database = new Database();
  var credentialsManager = new CredentialsManager();

  var emailAddress = request.body.emailAddress
  var password = request.body.password
  var tripId = request.body.tripId

  credentialsManager.login(emailAddress, password, (userId) => {
    if (userId){
      var deleteTripQuery = 'DELETE FROM `trips` WHERE `id` = "'+tripId+'"';

      database.runQuery(deleteTripQuery, (rows,error) =>{
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

});

module.exports = router;
