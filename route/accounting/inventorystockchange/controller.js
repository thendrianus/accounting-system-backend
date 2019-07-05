var tsservice = require('./../../tsservice');
var async = require('async');

const controller = {
  //   REST-SELECT
  getInventorychgList_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { InventorychgList: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT *, DATE_FORMAT(transaction_date, "%d %M %Y") AS "show_date" FROM ${CUS_DB}.inventory_stock_change WHERE is_use = 1 AND is_active =1 AND methode_id = 5`;

      //   -SELECT-INVENTORYLEDGER_LINK
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        row.data.InventorychgList = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-SELECT
  inventorychgs_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { inventory: [], inventoryList: [] }, label: 'Data selected successfully' };

    req.assert('inventory_group_id', '');
    req.assert('brand_id', '');
    req.assert('warehouse_id', '');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var whereStr = "";

      if (req.body.inventory_group_id != '-') {
        whereStr += ' AND t1.inventory_group_id = "' + req.body.inventory_group_id + '" ';
      }

      if (req.body.brand_id != '-') {
        whereStr += ' AND t1.brand_id = "' + req.body.brand_id + '" ';
      }

      if (req.body.warehouse_id != '-') {
        whereStr += ' AND t6.warehouse_id = "' + req.body.warehouse_id + '" ';
      }

      var myfireStr = `SELECT t1.*, t1.selling_price as "price", t2.brand, t4.inventory_group, "true" as auto_inventory_code, "" as oldimage, "true" as if_auto_inventory_code, t1.name as "inventory", CONVERT(t1.inventory_id, char(50)) AS "value", CONCAT(t1.inventory_code, " - ", t1.name) AS "label", t5.rate, COALESCE(t6.stock, 0) AS "stock", 0 AS "quantity", t6.warehouse_id, t6.warehouse, t6.expired_date, t6.reminder_expired_date, IF(YEAR(t6.expired_date) <> "3014" , DATE_FORMAT(t6.expired_date,"%d %M %Y"), "General") AS "ex_date_show" FROM ${CUS_DB}.inventory t1 INNER JOIN ${CUS_DB}.brand t2 ON t1.brand_id = t2.brand_id INNER JOIN ${CUS_DB}.inventory_detail_category t3 ON t1.inventory_detail_category_id = t3.inventory_detail_category_id INNER JOIN ${CUS_DB}.inventory_group t4 ON t1.inventory_group_id = t4.inventory_group_id INNER JOIN ${CUS_DB}.currencies t5 ON t1.currency_id = t5.currency_id LEFT JOIN (SELECT COALESCE(SUM(i.debit) - SUM(i.credit),0) AS "stock", i.inventory_id, i.warehouse_id, w.warehouse, i.reminder_expired_date, i.expired_date FROM ${CUS_DB}.inventoryledger i INNER JOIN ${CUS_DB}.warehouse w ON i.warehouse_id = w.warehouse_id WHERE i.is_active = 1 AND i.warehouse_id <> 1 GROUP BY CONCAT(i.expired_date,"-",i.inventory_id, "-", i.warehouse_id)) t6 ON t1.inventory_id = t6.inventory_id WHERE t1.ispurchase = 1 AND t1.is_use = 1 AND t1.is_active = 1 ${whereStr} ORDER BY t1.create_datetime DESC`;

      //   -SELECT-INVENTORY   -JOIN-BRAND   -JOIN-INVENTORY_DETAIL_CATEGORY   -JOIN-INVENTORY_GROUP
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        row.data.inventoryList = rows;

        if (req.body.inventoryledger_link_id) {

          var myfireStr = `SELECT t1.*, t1.debit - t1.credit AS "quantity" , t2.warehouse, t3.inventory_code, t3.name as "inventory_name", t3.uom1 FROM ${CUS_DB}.inventoryledger t1 INNER JOIN ${CUS_DB}.warehouse t2 ON t1.warehouse_id = t2.warehouse_id INNER JOIN ${CUS_DB}.inventory t3 ON t1.inventory_id = t3.inventory_id WHERE t1.warehouse_id <> 1 AND t1.inventoryledger_link_id = "${req.body.inventoryledger_link_id}"`;

          var query = conn.query(myfireStr, function (err, rows) {
            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
               res.send(row); return;
            }

            row.data.inventory = rows;
             res.send(row); return;

          });

        } else {
           res.send(row); return;
        }

      });

    });

  },

  //   REST-INSERT
  inventorychg_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { inventory_stock_change_id: '', general_journal_id: '', inventoryledger_link_id: '' }, label: 'Data entered successfully' };
    // validation

    req.assert('description', 'Description is required');
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('reference', 'Reference is required');
    req.assert('branch_id', 'Branch is required');
    req.assert('type_id', 'Type Id is required');
    req.assert('methode_id', 'Methode Id is required');
    req.assert('account_id', 'Methode Id is required');
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

        if (req.body.inventory_stock_change_id) {

          var data = {
            general_journal_id: req.body.general_journal_id,
            description: req.body.description,
            transaction_date: tsservice.mysqlDate(req.body.transaction_date),
            reference: req.body.reference,
            branch_id: req.body.branch_id,
            account_id: req.body.account_id,
            type_id: req.body.type_id,
            methode_id: req.body.methode_id,
            inventoryledger_link_id: req.body.inventoryledger_link_id,
            update_by: req.body.update_by,
            update_datetime: tsservice.mysqlDate(req.body.update_datetime),
            is_use: '1', is_active: '1'
          };

          tsservice.updateData(data, function (value) {
            //   -UPDATE-INVENTORY_STOCK_CHANGE
            var query = conn.query(`UPDATE ${CUS_DB}.inventory_stock_change SET ${value} WHERE inventory_stock_change_id =${req.body.inventory_stock_change_id} `, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
                conn.rollback(function () {
                   res.send(row); return;
                });
              }

              continues(conn, req, req.body.inventoryledger_link_id, req.body.general_journal_id, req.body.inventory_stock_change_id, row).then(function (result) {

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

          var myfireStr = `SELECT special_code as "code", (SELECT generalledger_period_id FROM ${CUS_DB}.generalledger_period WHERE generalledger_status_id = 1 AND is_active =1 AND is_use =1 limit 1) as "generalledger_period_id" FROM ${CUS_DB}.special_code WHERE is_use = 1 AND is_active = 1 AND special_code_id = "INOPNA" LIMIT 1`;

          //   -SELECT-GENERALLEDGER_PERIOD
          var query = conn.query(myfireStr, function (err, rows) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
              conn.rollback(function () {
                 res.send(row); return;
              });
            }

            if (rows[0]['code'] && rows[0]['generalledger_period_id']) {

              var data = {
                general_journal_code: rows[0]['code'],
                reference_code: 'BBINV',
                general_journal_type_id: '19', //important code
                description: 'beginning balance inventory',
                generalledger_period_id: rows[0]['generalledger_period_id'],
                transaction_date: tsservice.mysqlDate(),
                create_by: req.body.create_by,
                create_datetime: tsservice.mysqlDate(req.body.create_datetime),
                update_by: req.body.create_by,
                update_datetime: tsservice.mysqlDate(req.body.create_datetime),
                is_use: '1',
                is_active: '1'
              };
              tsservice.insertData(data, function (value) {
                //INSERT-GENERAL_JOURNAL
                var query = conn.query(`INSERT INTO ${CUS_DB}.general_journal` + value, function (err, rows) {

                  if (err) {
                    row.success = false; console.log(err);
                    row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                    conn.rollback(function () {
                       res.send(row); return;
                    });
                  }
                  row.data.general_journal_id = rows.insertId;

                  var myfireStr = `SELECT special_code as "code" FROM ${CUS_DB}.special_code WHERE is_use = 1 AND is_active = 1 AND special_code_id = "INOPNA" LIMIT 1`;

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
                        inventoryledger_link_type_id: 5, //important code
                        description: 'Inventory Opname',
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
                            general_journal_id: row.data.general_journal_id,
                            description: req.body.description,
                            transaction_date: tsservice.mysqlDate(req.body.transaction_date),
                            reference: req.body.reference,
                            branch_id: req.body.branch_id,
                            account_id: req.body.account_id,
                            type_id: req.body.type_id,
                            methode_id: req.body.methode_id,
                            inventoryledger_link_id: inventoryledger_link_id,
                            create_by: req.body.create_by,
                            create_datetime: tsservice.mysqlDate(req.body.create_datetime),
                            update_by: req.body.create_by,
                            update_datetime: tsservice.mysqlDate(req.body.create_datetime),
                            is_use: '1', is_active: '1'
                          };

                          tsservice.insertData(data1, function (value) {
                            //INSERT-INVENTORY_STOCK_CHANGE
                            var query = conn.query(`INSERT INTO ${CUS_DB}.inventory_stock_change` + value, function (err, rows) {

                              if (err) {
                                row.success = false; console.log(err);
                                row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                                conn.rollback(function () {
                                   res.send(row); return;
                                });
                              }

                              continues(conn, req, inventoryledger_link_id, row.data.general_journal_id, rows.insertId, row).then(function (result) {
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

                });
              });

            } else {
              row.success = false; console.log(err);
              row.label = 'Failed to select important code. Please contact our IT support';
              conn.rollback(function () {
                 res.send(row); return;
              });
            }

          });

        }

      });

    });

    function continues(conn, req, inventoryledger_link_id, general_journal_id, inventory_stock_change_id, row) {

      const CUS_DB = req.body.company_db;
      
      return new Promise(function (resolve, reject) {

        var queryStr = ""

        async.forEach(req.body.detail, function (item, callback) {

          theValue = 0;

          if (item.quantity != 0) {

            if (item.quantity - item.stock > 0) {
              //Tambah stock
              //tambah buku
              theValue = item.quantity - item.stock;
              debitAccount = item.warehouse_id;
              creditAccount = 0;

            } else if (item.quantity - item.stock < 0) {

              theValue = item.stock - item.quantity;
              debitAccount = 0;
              creditAccount = item.warehouse_id;

            }

            if (theValue != 0) {

              if (queryStr != '') {
                queryStr += ", ";
              }

              var debitSum = `((SELECT COALESCE(SUM(i.debit), 0) AS  "debit_sum" FROM ${CUS_DB}.inventoryledger i INNER JOIN ${CUS_DB}.inventoryledger_link il ON i.inventoryledger_link_id = il.inventoryledger_link_id WHERE i.inventory_id = ${item.inventory_id} AND i.debit <> 0 AND il.inventoryledger_link_type_id <> 8) + ${theValue})`;

              if(creditAccount> 0){
                queryStr += '( 0, 0, ' + theValue + ', 0, "' + inventoryledger_link_id + '", "' + item.inventory_id + '", ' + item.hpp + ', ' + debitSum + ' , ' + item.rate + ', ' + creditAccount + ', "' + item.currency_id + '", "' + tsservice.mysqlDate(item.expired_date) + '", ' + item.reminder_expired_date + ', ' + item.isfix_asset + ', ' + req.body.create_by + ', ' + req.body.update_by + ', "' + tsservice.mysqlDate(req.body.create_datetime) + '", "' + tsservice.mysqlDate(req.body.create_datetime) + '", 1, 1, 1 )';
              }

              //THE DEBIT CREDIT AND WAREHOUSE IS CHANGE
              if(debitAccount> 0){
                queryStr += '( ' + theValue + ', 0, 0, 0, "' + inventoryledger_link_id + '", "' + item.inventory_id + '", ' + item.hpp + ', ' + debitSum + ' , ' + item.rate + ', ' + debitAccount + ', "' + item.currency_id + '", "' + tsservice.mysqlDate(item.expired_date) + '", ' + item.reminder_expired_date + ', ' + item.isfix_asset + ', ' + req.body.create_by + ', ' + req.body.update_by + ', "' + tsservice.mysqlDate(req.body.create_datetime) + '", "' + tsservice.mysqlDate(req.body.create_datetime) + '", 1, 1, 1 )';
              }

            }

          }

          callback();

        }, function (err) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Server failed prosess data. try again or contact our IT support';
            reject(row);
          }

          if (queryStr != "") {
            var myfireStr = `INSERT INTO ${CUS_DB}.inventoryledger( debit, debiteqv, credit, crediteqv, inventoryledger_link_id, inventory_id, hpp, debit_sum, rate, warehouse_id, currency_id, expired_date, reminder_expired_date, isfix_asset, create_by, update_by, create_datetime, update_datetime, is_use, is_active , reverse) VALUES ` + queryStr;

            //   -INSERT-INVENTORYLEDGER
            var query = conn.query(myfireStr, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                reject(row);
              }

              //LINKED ACCOUNT FOR INVENTORY

              var myfireStr = `SELECT * FROM ${CUS_DB}.account_linked WHERE is_use = 1 AND is_active = 1 AND account_link_id = 2 LIMIT 1`; // --account_link_id 2

              //   -SELECT-INVENTORY_LINKED-SELECT-INVENTORYLEDGER
              var query = conn.query(myfireStr, function (err, rows) {

                if (err) {
                  row.success = false; console.log(err);
                  row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
                  reject(row);
                }

                theValue = 0;
                async.forEach(req.body.detail, function (item, callback) {

                  if (item.quantity != 0) {

                    if (item.quantity - item.stock > 0) {
                      //Tambah stock
                      //tambah buku
                      theValue += (item.quantity - item.stock) * (item.hpp * item.rate);
                    } else if (item.quantity - item.stock < 0) {

                      theValue -= (item.stock - item.quantity) * (item.hpp * item.rate);
                    }

                  }

                  callback();

                }, function (err) {

                  if (err) {
                    row.success = false; console.log(err);
                    row.label = 'Server failed prosess data. try again or contact our IT support';
                    reject(row);
                  }

                  if (theValue == 0) {
                    resolve(row);
                  } else {
                    if (theValue > 0) {
                      queryStr = '( ' + general_journal_id + ', ' + req.body.account_id + ', 0, 0, ' + theValue + ', 0, 1, 1, "' + tsservice.mysqlDate(req.body.create_datetime) + '", "' + tsservice.mysqlDate(req.body.create_datetime) + '", 1, 1 )';

                      queryStr += ', ( ' + general_journal_id + ', ' + rows[0].account_id + ', ' + theValue + ', 0, 0, 0, 1, 1, "' + tsservice.mysqlDate(req.body.create_datetime) + '", "' + tsservice.mysqlDate(req.body.create_datetime) + '", 1, 1 )';
                    } else {
                      queryStr = '( ' + general_journal_id + ', ' + rows[0].account_id + ', 0, 0, ' + (theValue * -1) + ', 0, 1, 1, "' + tsservice.mysqlDate(req.body.create_datetime) + '", "' + tsservice.mysqlDate(req.body.create_datetime) + '", 1, 1 )';

                      queryStr += ', ( ' + general_journal_id + ', ' + req.body.account_id + ', ' + (theValue * -1) + ', 0, 0, 0, 1, 1, "' + tsservice.mysqlDate(req.body.create_datetime) + '", "' + tsservice.mysqlDate(req.body.create_datetime) + '", 1, 1 )';
                    }

                    var myfireStr = `INSERT INTO ${CUS_DB}.generalledger( general_journal_id, account_id, debit, debiteqv, credit, crediteqv, create_by, update_by, create_datetime, update_datetime, is_use, is_active ) VALUES ` + queryStr;

                    //   -INSERT-GENERALLEDGER
                    var query = conn.query(myfireStr, function (err, rows) {

                      if (err) {
                        row.success = false; console.log(err);
                        row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                        reject(row);
                      }

                      resolve(row);

                    });
                  }

                });

              });

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