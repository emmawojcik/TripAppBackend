var mysql = require('mysql')

module.exports = class Database {

  constructor() {

  }
  runQuery(query, completion) {
    var connection = mysql.createConnection({
      host: 'localhost',
      user: 'root', // <CHANGE TO YOUR MYSQL DATABASE USERNAME>
      password: '', // <CHANGE TO YOUR MYSQL DATABASE PASSWORD> 
      database: 'trip-planner'
    })

    // create connection to mysql database
    connection.connect()
    
    // execute query via connection
    connection.query(query, function (error, rows, fields) {
      if (error) {
        console.log('database error:');
        console.log(error);
      }
      completion(rows, error);
    })
    
    connection.end()  
  }

}