var Database = require('./database');
var crypto = require('crypto');

// generate random salt
var generateSalt = function() {
  var length = 16;
  return crypto.randomBytes(Math.ceil(length/2))
          .toString('hex')
          .slice(0,length);
};

// hashing the salted password using 'crypto' module
var sha512 = function(password, salt) {
  var hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  var passwordHash = hash.digest('hex');
  return {
      salt: salt,
      passwordHash: passwordHash
  };
};

module.exports = class CredentialsManager {

  constructor() {
  }

  signup(emailAddress, password, completion) {
        var database = new Database();

        var secretSalt = generateSalt();
        var passwordData = sha512(password, secretSalt);

        // create query to insert email address, hashed password and salt in database
        var insertQuery = 'INSERT INTO `users` (`email_address`, `password`, `salt`) VALUES ("'+emailAddress+'", "'+passwordData.passwordHash+'", "'+passwordData.salt+'")';
        // execute query
        database.runQuery(insertQuery, (rows, error) => {
            if (error) {
                completion(false);
            } else {
                completion(true);
            }
        });
  }
  
  login(emailAddress, password, completion) {
      
        // create database connection
        var database = new Database();

        // create query to get user's salt and password
        var selectQuery = 'SELECT `id`, `password`, `salt` FROM `users` WHERE `email_address` = "'+emailAddress+'"';
    
        // execute query
        database.runQuery(selectQuery, (rows, error) => {
        
            // check database results
            if (!error && rows && rows.length > 0 && rows[0].salt && rows[0].password) {
            
                // recreate user's hashed password
                var salt = rows[0].salt
                var passwordData = sha512(password, salt);

                // check hashed passwords match and set a successful response, return user id
                if (rows[0].password == passwordData.passwordHash) {
                    completion(rows[0].id);
                    return;
                }
            }
            // return null if user does not exist
            completion(null);
        });
    }
}