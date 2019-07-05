var async = require('async');

//same with update
module.exports = function(conn, req, row, inventoryledger_link_id) {
  const CUS_DB = req.body.company_db;
  return new Promise(function (resolve, reject) {

    var querystr = "";

    async.forEach(req.body.purchase_detail, function (item, callback) {

      if (item.ledgerprocess == 0 && item.is_active == 1) {

        if (querystr != "") {
          querystr += ', ';
        }

        let debitAccount = item.warehouse_id;
        let creditAccount = 0;

        if (req.body.isreturn == 1) {
          item.ordered = item.ordered;
          item.orderedeqv = item.orderedeqv;
          debitAccount = 0;
          creditAccount = item.warehouse_id;
        }

        item.inventory_hpp = ((item.ordered * item.price) - item.discount_amount) / item.ordered + item.landed_cost + (req.body.landed_cost / req.body.purchase_detail.length);

        var debitSum = `((SELECT COALESCE(SUM(i.debit), 0) AS  "debit_sum" FROM ${CUS_DB}.inventoryledger i INNER JOIN ${CUS_DB}.inventoryledger_link il ON i.inventoryledger_link_id = il.inventoryledger_link_id WHERE i.inventory_id = ${item.inventory_id} AND i.debit <> 0 AND il.inventoryledger_link_type_id <> 8) + ${item.ordered})`;

        if(debitAccount > 0){
          querystr += '("' + item.ordered + '","' + item.orderedeqv + '","' + 0 + '","' + 0 + '","' + inventoryledger_link_id + '","' + item.inventory_id + '","' + item.inventory_hpp + '", ' + debitSum + ' ,"' + req.body.rate + '","' + debitAccount + '","' + req.body.currency_id + '","' + req.body.transaction_date + '","' + req.body.transaction_date + '","' + item.isfix_asset + '","' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '",1 , 1, 1)';
        }
        if(creditAccount > 0){
          querystr += '("' + 0 + '","' + 0 + '","' + item.ordered + '","' + item.orderedeqv + '","' + inventoryledger_link_id + '","' + item.inventory_id + '","' + item.inventory_hpp + '", ' + debitSum + ' ,"' + req.body.rate + '","' + creditAccount + '","' + req.body.currency_id + '","' + req.body.transaction_date + '","' + req.body.transaction_date + '","' + item.isfix_asset + '","' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '", 1, 1, 1)';
        }
        
      }
      callback();
    }, function (err) {

      if (err) {
        row.success = false; console.log(err);
        row.label = 'Server failed prosess data. try again or contact our IT support';
        reject(row);
      }
      if (querystr != "") {

        var myfireStr = `INSERT INTO ${CUS_DB}.inventoryledger( debit, debiteqv, credit, crediteqv, inventoryledger_link_id, inventory_id, hpp, debit_sum, rate, warehouse_id, currency_id, expired_date, reminder_expired_date, isfix_asset, create_by, create_datetime, update_by, update_datetime, is_use , is_active, reverse ) VALUES ` + querystr;
        console.log(myfireStr)
        //   -INSERT-INVENTORYLEDGER
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
            reject(row);
          }
          resolve(true);

        });

      }

    });

  });

}