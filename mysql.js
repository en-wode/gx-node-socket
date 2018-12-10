var mysql      = require('mysql');
var pool = mysql.createPool({
  host     : '',
  user     : '',
  password : '',
  database : ''
});

module.exports =pool
