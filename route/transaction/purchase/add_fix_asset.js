
var async = require('async');
//same with update
module.exports = function (conn, req, row) {
  const CUS_DB = req.body.company_db;
  return new Promise(function (resolve, reject) {

    var querystr = "";

    async.forEach(req.body.purchase_detail, function (item, callback) {

      if (item.ledgerprocess == 0 && item.is_active == 1 && item.isfix_asset == 1) {
        if (querystr != "" && req.body.isreturn != 1) {
          querystr += ', ';
        }

        if (req.body.isreturn != 1) {

          querystr += '("-","' + item.inventory_id + '"," - ",1,"' + req.body.transaction_date + '","' + item.inventory_hpp + '", 0 ,"' + req.body.rate + '" ,"1" ,"' + item.warehouse_id + '","' + req.body.currency_id + '","' + req.body.branch_id + '","-", "0","' + req.body.create_by + '","' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_datetime + '",1,1)';

        }

      } else {
        console.log('noo' + 'item.ledgerprocess == 0 ' + item.ledgerprocess + ' && item.is_active == 1 ' + item.is_active + ' && isfix_asset == 1' + item.isfix_asset);
      }
      callback();
    }, function (err) {
      if (err) {
        row.success = false; console.log(err);
        row.label = 'Server failed prosess data. try again or contact our IT support';
        reject(row);
      }

      if (querystr != "") {

        var myfireStr = `INSERT INTO ${CUS_DB}.fix_asset( fix_asset_code, inventory_id, label, fix_asset_group_id, buying_date, price, residue, rate, life_time, warehouse_id, currency_id, branch_id, description, status_id, create_by, update_by, create_datetime, update_datetime, is_use, is_active ) VALUES ` + querystr;

        //   -INSERT-FIX_ASSET
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
            reject(row);
          }
          resolve(true);

        });
      } else {
        resolve(true);
      }

    });

  });

}