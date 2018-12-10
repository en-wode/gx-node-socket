var mysql      = require('mysql');
var pool = mysql.createPool({
  host     : '47.98.162.168',
  user     : 'root',
  password : '123456',
  database : 'lanxiang'
});

module.exports =pool