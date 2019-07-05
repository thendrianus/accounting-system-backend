
var async = require('async');
var tsservice = require('./../../tsservice');
module.exports = function (conn, req, row) {
  const CUS_DB = req.body.company_db;
  return new Promise(function (resolve, reject) {

    if(req.body.sale_link_id){
      resolve(req.body.sale_link_id);
    }else{
      var data = {
        description: '',
        create_by: 1,
        update_by: 1,
        create_datetime: tsservice.mysqlDate(req.body.transaction_date),
        update_datetime: tsservice.mysqlDate(req.body.transaction_date),
        is_use: 1,
        is_active: 1
      };
  
      tsservice.insertData(data, function (value) {
        //   -INSERT-PURCHASE_ORDER
        var query = conn.query(`INSERT INTO ${CUS_DB}.sale_link` + value, function (err, rows) {
  
          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
            reject(false);
          }
  
          resolve(rows.insertId);
        });
      });
    }

  });

}