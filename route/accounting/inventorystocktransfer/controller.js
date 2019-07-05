var tsservice = require('./../../tsservice');
var async = require('async');

const controller = {
  //   REST-SELECT
  getInventorytransferList_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { InventorytransferList: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT *, DATE_FORMAT(transaction_date, "%d %M %Y") AS "show_date" FROM ${CUS_DB}.inventory_stock_transfer WHERE is_use = 1 AND is_active =1`;

      //   -SELECT-INVENTORYLEDGER_LINK
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        row.data.InventorytransferList = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-SELECT
  inventorytransfers_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { inventory: [] }, label: 'Data selected successfully' };

    req.assert('inventoryledger_link_id', '');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, t1.debit - t1.credit AS "quantity" , t2.warehouse, t3.inventory_code, t3.name as "inventory_name", t3.uom1 FROM ${CUS_DB}.inventoryledger t1 INNER JOIN ${CUS_DB}.warehouse t2 ON t1.warehouse_id = t2.warehouse_id INNER JOIN ${CUS_DB}.inventory t3 ON t1.inventory_id = t3.inventory_id WHERE t1.debit <> 0 AND t1.inventoryledger_link_id = "${req.body.inventoryledger_link_id}"`;

      //   -SELECT-INVENTORYLEDGER   -JOIN-WAREHOUSE   -JOIN-INVENTORY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        row.data.inventory = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-INSERT
  inventorytransfer_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { inventory_stock_transfer_id: '', inventoryledger_link_id: '' }, label: 'Data entered successfully' };
    // validation

    req.assert('description', 'Description is required');
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('reference', 'Reference is required');
    req.assert('branch_id', 'Branch is required');
    req.assert('from_warehouse_id', 'from_warehouse Id is required');
    req.assert('to_warehouse_id', 'to_warehouse Id is required');
    req.assert('create_by', 'Created by is required');
    req.assert('create_datetime', 'Create date and time is required');
    req.assert('is_use', 'Used data is required');
    req.assert('is_active', 'Active data is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var inventoryledger_link_id = '';

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {

        if (req.body.inventory_stock_transfer_id) {

          var data = {
            description: req.body.description,
            transaction_date: tsservice.mysqlDate(req.body.transaction_date),
            reference: req.body.reference,
            branch_id: req.body.branch_id,
            from_warehouse_id: req.body.from_warehouse_id,
            to_warehouse_id: req.body.to_warehouse_id,
            inventoryledger_link_id: req.body.inventoryledger_link_id,
            update_by: req.body.update_by,
            update_datetime: tsservice.mysqlDate(req.body.update_datetime),
            is_use: '1', is_active: '1'
          };

          tsservice.updateData(data, function (value) {
            //   -UPDATE-inventory_stock_transfer
            var query = conn.query(`UPDATE ${CUS_DB}.inventory_stock_transfer SET ${value} WHERE inventory_stock_transfer_id =${req.body.inventory_stock_transfer_id} `, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
                conn.rollback(function () {
                   res.send(row); return;
                });
              }

              continues(conn, req, req.body.inventoryledger_link_id, req.body.inventory_stock_transfer_id, row).then(function (result) {

                conn.commit(function (err) {
                  row = result;
                   res.send(row); return;
                });

              }).catch(error => {
                conn.rollback(function () {
                  row = error;
                   res.send(row); return;
                });
              });


            });
          });

        } else {

          var myfireStr = `SELECT special_code as "code" FROM ${CUS_DB}.special_code WHERE is_use = 1 AND is_active = 1 AND special_code_id = "ITRANS" LIMIT 1`;

          //   -SELECT-SPECIAL_CODE
          var query = conn.query(myfireStr, function (err, rows) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
              conn.rollback(function () {
                 res.send(row); return;
              });
            }
            if (rows[0]['code']) {

              var data = {
                reference_code: rows[0]['code'],
                inventoryledger_link_type_id: 8, //important code
                description: 'Inventory Transfer',
                transaction_date: tsservice.mysqlDate(req.body.create_datetime),
                create_by: req.body.create_by,
                create_datetime: tsservice.mysqlDate(req.body.create_datetime),
                update_by: req.body.create_by,
                update_datetime: tsservice.mysqlDate(req.body.create_datetime),
                is_use: '1', is_active: '1'
              };

              tsservice.insertData(data, function (value) {
                //   -INSERT-INVENTORYLEDGER_LINK
                var query = conn.query(`INSERT INTO ${CUS_DB}.inventoryledger_link` + value, function (err, rows) {

                  if (err) {
                    row.success = false; console.log(err);
                    row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                    conn.rollback(function () {
                       res.send(row); return;
                    });
                  }

                  row.data.inventoryledger_link_id = rows.insertId;
                  inventoryledger_link_id = rows.insertId;

                  var data1 = {
                    description: req.body.description,
                    transaction_date: tsservice.mysqlDate(req.body.transaction_date),
                    reference: req.body.reference,
                    branch_id: req.body.branch_id,
                    from_warehouse_id: req.body.from_warehouse_id,
                    to_warehouse_id: req.body.to_warehouse_id,
                    inventoryledger_link_id: inventoryledger_link_id,
                    create_by: req.body.create_by,
                    create_datetime: tsservice.mysqlDate(req.body.create_datetime),
                    update_by: req.body.create_by,
                    update_datetime: tsservice.mysqlDate(req.body.create_datetime),
                    is_use: '1', is_active: '1'
                  };

                  tsservice.insertData(data1, function (value) {
                    //INSERT-inventory_stock_transfer
                    var query = conn.query(`INSERT INTO ${CUS_DB}.inventory_stock_transfer` + value, function (err, rows) {

                      if (err) {
                        row.success = false; console.log(err);
                        row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                        conn.rollback(function () {
                           res.send(row); return;
                        });
                      }

                      row.data.inventory_stock_transfer_id = rows.insertId;

                      continues(conn, req, inventoryledger_link_id, rows.insertId, row).then(function (result) {
                        conn.commit(function (err) {
                          row = result;
                           res.send(row); return;
                        });

                      }).catch(error => {
                        conn.rollback(function () {
                          row = error;
                           res.send(row); return;
                        });
                      });

                    });
                  });

                });
              });

            } else {
              row.success = false; console.log(err);
              row.label = 'Failed to select important code. Please contact our IT support';
               res.send(row); return;
            }

          });

        }

      });

    });

    function continues(conn, req, inventoryledger_link_id, inventory_stock_transfer_id, row) {
      const CUS_DB = req.body.company_db;
      
      return new Promise(function (resolve, reject) {

        var queryStr = ""
        async.forEach(req.body.detail, function (item, callback) {

          if (item.inventoryledger_id == '') {

            if (queryStr != '') {
              queryStr += ", ";
            }

            var ballancingVal = 0;
            var newExpiredDate = item.expired_date;
            var newExpiredDateReminder = item.reminder_expired_date;

            if (item.newExpired) {
              ballancingVal = item.quantity;
              newExpiredDate = item.new_expired_date;
              newExpiredDateReminder = item.new_reminder_expired_date;
            }

            var debitSum = `((SELECT COALESCE(SUM(i.debit), 0) AS  "debit_sum" FROM ${CUS_DB}.inventoryledger i INNER JOIN ${CUS_DB}.inventoryledger_link il ON i.inventoryledger_link_id = il.inventoryledger_link_id WHERE i.inventory_id = ${item.inventory_id} AND i.debit <> 0 AND il.inventoryledger_link_type_id <> 8) + ${item.quantity})`;

            queryStr += '( 0, 0, ' + item.quantity + ', ' + ballancingVal + ', "' + inventoryledger_link_id + '", "' + item.inventory_id + '", ' + item.hpp + ', ' + debitSum + ' , ' + item.rate + ', ' + req.body.from_warehouse_id + ', "' + item.currency_id + '", "' + tsservice.mysqlDate(item.expired_date) + '", ' + item.reminder_expired_date + ', ' + item.isfix_asset + ', ' + req.body.create_by + ', ' + req.body.update_by + ', "' + tsservice.mysqlDate(req.body.create_datetime) + '", "' + tsservice.mysqlDate(req.body.create_datetime) + '", 1, 1, 0 )';

            //THE DEBIT CREDIT AND WAREHOUSE IS CHANGE
            queryStr += '( ' + item.quantity + ', 0, 0, 0, "' + inventoryledger_link_id + '", "' + item.inventory_id + '", ' + item.hpp + ', ' + debitSum + ' , ' + item.rate + ', ' + req.body.to_warehouse_id + ', "' + item.currency_id + '", "' + tsservice.mysqlDate(newExpiredDate) + '", ' + newExpiredDateReminder + ', ' + item.isfix_asset + ', ' + req.body.create_by + ', ' + req.body.update_by + ', "' + tsservice.mysqlDate(req.body.create_datetime) + '", "' + tsservice.mysqlDate(req.body.create_datetime) + '", 1, 1, 0 )';

          }

          callback();

        }, function (err) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Server failed prosess data. try again or contact our IT support';
            reject(row);
          }

          if (queryStr != "") {
            var myfireStr = `INSERT INTO ${CUS_DB}.inventoryledger( debit, debiteqv, credit, crediteqv, inventoryledger_link_id, inventory_id, hpp, debit_sum, rate, warehouse_id, currency_id, expired_date, reminder_expired_date, isfix_asset, create_by, update_by, create_datetime, update_datetime, is_use, is_active,reverse  ) VALUES ` + queryStr;

            //   -INSERT-INVENTORYLEDGER
            var query = conn.query(myfireStr, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                reject(row);
              }

              resolve(row);

            });
          } else {
            resolve(row);
          }

        });

      });
    }

  }
}

module.exports = controller;