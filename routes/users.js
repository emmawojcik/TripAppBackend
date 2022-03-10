var CredentialsManager = require('./credentials');
var express = require('express');
var router = express.Router();

router.post('/signup', (request, response) => {

  // create credentials manager
  var credentialsManager = new CredentialsManager();

  var emailAddress = request.body.emailAddress
  var password = request.body.password

  // sign up
  credentialsManager.signup(emailAddress, password, (successful) => {

    var body = "";

    if (successful) {
      // return success if user was created
      body = { response: 'success' };
      response.statusCode = 201;

    } else {

      // return failed if error occurred
      response.statusCode = 401;
      body = { response: 'failed' };
    }
    response.send(JSON.stringify(body));

  });
});

router.post('/login', (request, response) => {

  // create credentials manager
  var credentialsManager = new CredentialsManager();

  // get user login info
  var emailAddress = request.body.emailAddress
  var password = request.body.password

  // login
  credentialsManager.login(emailAddress, password, (userId) => {

    // setup default error reponse in case of error
    var body = { response: 'failure' };
    response.statusCode = 401;

    // check if user exists
    if (userId) {
      body = { response: 'success' };
      response.statusCode = 200;
    }
    // send the response
    response.send(JSON.stringify(body));
  });
});

module.exports = router;
