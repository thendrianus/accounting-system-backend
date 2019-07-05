var tsservice = require('./../../tsservice');
var async = require('async');

const controller = {
  //   REST-SELECT
  pos_sessionselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { pos_session: [] }, label: 'Berhasil' };

    req.assert('is_use', 'Used data is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var strwhere = "";
      if (req.body.is_use == '1') {
        var strwhere = "t1.is_use = 1 AND";
      }

      var myfireStr = `SELECT t1.*, t2.name,t3.pos_stand, t4.pos_session_status, t5.warehouse, t6.employee_code, t6.firstname, t6.lastname, t1.pos_session_status_id as "oripos_session_status_id", DATE_FORMAT(t1.session_begin, "%M %d %Y") as "session_begin_format", DATE_FORMAT(t1.session_end, "%M %d %Y") as "session_end_format", DATE_FORMAT(t1.session_start, "%M %d %Y") as "session_start_format", DATE_FORMAT(t1.session_finish, "%M %d %Y") as "session_finish_format" FROM ${CUS_DB}.pos_session t1 INNER JOIN ${CUS_DB}.branch t2 ON t1.branch_id = t2.branch_id INNER JOIN ${CUS_DB}.pos_stand t3 ON t1.pos_stand_id = t3.pos_stand_id INNER JOIN ${CUS_DB}.pos_session_status t4 ON t1.pos_session_status_id = t4.pos_session_status_id INNER JOIN ${CUS_DB}.warehouse t5 ON t1.warehouse_id = t5.warehouse_id INNER JOIN ${CUS_DB}.employee t6 ON t1.salesman_id = t6.employee_id WHERE ${strwhere} t1.is_active = 1 ORDER BY t1.pos_session_id DESC`;
      
      //   -SELECT-POS_SESSION   -JOIN-BRANCH   -JOIN-POS_STAND   -JOIN-POS_SESSION_STATUS   -JOIN-WAREHOUSE   -JOIN-EMPLOYEE
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.pos_session = rows;
         res.send(row); return;
      });

    });

  },
  //   REST-INSERT
  pos_session_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;

    var row = { success: true, data: { pos_session_id: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('pos_stand_id', '');
    req.assert('pos_session_status_id', '');
    req.assert('currency_id', '');
    req.assert('salesman_id', '');
    req.assert('rate', '');
    req.assert('branch_id', 'Branch No / Id is required');
    req.assert('warehouse_id', '');
    req.assert('description', 'Description is required');
    req.assert('session_begin', '');
    req.assert('session_end', '');
    req.assert('timelimit', '');
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

    var general_journal_id = '';
    var inventoryledger_link_id = '';

    req.getConnection(function (err, conn) {

      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {
        //--cmt-print: mysql cannot connect
        if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

        add_inventoryledger_link(conn).then(function (result) { // 1. INSERT INVENTORYLEDGER LINK

          inventoryledger_link_id = result;
          add_general_journal(conn).then(function (result) { // 2. INSERT GENERAL JOURNAL

            general_journal_id = result;

            var data = {
              general_journal_id: general_journal_id,
              inventoryledger_link_id: inventoryledger_link_id,
              pos_stand_id: req.body.pos_stand_id,
              pos_session_status_id: req.body.pos_session_status_id,
              salesman_id: req.body.salesman_id,
              currency_id: req.body.currency_id,
              rate: req.body.rate,
              branch_id: req.body.branch_id,
              warehouse_id: req.body.warehouse_id,
              description: req.body.description,
              session_begin: tsservice.mysqlDate(req.body.session_begin),
              session_end: tsservice.mysqlDate(req.body.session_end),
              session_start: tsservice.mysqlDate(),
              session_finish: tsservice.mysqlDate(),
              timelimit: req.body.timelimit,
              create_by: req.body.create_by,
              update_by: req.body.update_by,
              create_datetime: tsservice.mysqlDate(),
              update_datetime: tsservice.mysqlDate(),
              is_use: '1',
              is_active: '1'
            };

            tsservice.insertData(data, function (value) {
              //   -INSERT-POS_SESSION
              var query = conn.query(`INSERT INTO ${CUS_DB}.pos_session` + value, function (err, rows) {

                if (err) {
                  row.success = false; console.log(err);
                  row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
                  conn.rollback(function () {
                     res.send(row); return;
                  });
                }

                row.data.pos_session_id = rows.insertId;
                conn.commit(function (err) {
                   res.send(row); return;
                });

              });
            });

          }).catch(error => { // 2 END
            conn.rollback(function () {
              console.log('false add_general_journal');
               res.send(row); return;
            });
          });

        }).catch(error => { // 1 END
          conn.rollback(function () {
            console.log('false add_inventoryledger_link');
             res.send(row); return;
          });
        });

      });
    });

    function add_inventoryledger_link(conn) {
      return new Promise(function (resolve, reject) {

        var data = {
          reference_code: req.body.pos_stand_id,
          inventoryledger_link_type_id: 6, //important code
          description: 'POS',
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
              reject(false);
            }

            resolve(rows.insertId);
          });
        });
      });
    }

    function add_general_journal(conn) {
      return new Promise(function (resolve, reject) {

        var myfireStr = `SELECT generalledger_period_id as "period" FROM ${CUS_DB}.generalledger_period WHERE is_use = 1 AND is_active = 1 AND generalledger_status_id = 1 LIMIT 1`;

        //   -SELECT-GENERALLEDGER_PERIOD
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }

          if (rows[0]['period']) {

            var data = {
              general_journal_code: '',
              reference_code: req.body.pos_stand_id,
              general_journal_type_id: '7', //important code
              description: 'POS',
              create_by: req.body.create_by,
              generalledger_period_id: rows[0]['period'],
              transaction_date: tsservice.mysqlDate(req.body.create_datetime),
              create_datetime: tsservice.mysqlDate(req.body.create_datetime),
              update_by: req.body.create_by,
              update_datetime: tsservice.mysqlDate(req.body.create_datetime),
              is_use: '1', is_active: '1'
            };

            var codeData = {
              special_code_id: "JOURNAL",
              table: "general_journal",
              column_id: "general_journal_id",
              column_code: "general_journal_code",
            }

            var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

            var query = conn.query(myfireStr, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
                conn.rollback(function () {
                   res.send(row); return;
                });
              }
              if (rows[0]['code']) {
                data.general_journal_code = rows[0]['code'];
                tsservice.insertData(data, function (value) {
                  //   -INSERT-GENERAL_JOURNAL
                  var query = conn.query(`INSERT INTO ${CUS_DB}.general_journal` + value, function (err, rows) {

                    if (err) {
                      row.success = false; console.log(err);
                      row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';

                      reject(false);
                    }

                    resolve(rows.insertId);

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

          } else {
            row.success = false; console.log(err);
            row.label = 'Failed to select important code. Please contact our IT support';
             res.send(row); return;
          }

        });

      });

    }

  },

  //   REST-UPDATE
  pos_session_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('pos_session_id', '');
    req.assert('general_journal_id', '');
    req.assert('inventoryledger_link_id', '');
    req.assert('pos_stand_id', '');
    req.assert('pos_session_status_id', '');
    req.assert('oripos_session_status_id', '');
    req.assert('salesman_id', '');
    req.assert('currency_id', '');
    req.assert('rate', '');
    req.assert('branch_id', 'Branch No / Id is required');
    req.assert('warehouse_id', '');
    req.assert('description', 'Description is required');
    req.assert('session_begin', '');
    req.assert('session_end', '');
    req.assert('timelimit', '');
    req.assert('update_by', 'Updated By is required');
    req.assert('update_datetime', 'Update Date and time is required');
    req.assert('is_use', 'Used data is required');
    req.assert('is_active', 'Active data is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var data = {
      pos_stand_id: req.body.pos_stand_id,
      pos_session_status_id: req.body.pos_session_status_id,
      salesman_id: req.body.salesman_id,
      currency_id: req.body.currency_id,
      rate: req.body.rate,
      branch_id: req.body.branch_id,
      warehouse_id: req.body.warehouse_id,
      description: req.body.description,
      session_begin: tsservice.mysqlDate(req.body.session_begin),
      session_end: tsservice.mysqlDate(req.body.session_end),
      session_start: tsservice.mysqlDate(),
      session_finish: tsservice.mysqlDate(),
      timelimit: req.body.timelimit,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(),
      is_use: req.body.is_use,
      is_active: req.body.is_active,
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {

        tsservice.updateData(data, function (value) {
          //   -UPDATE-POS_SESSION
          console.log(`UPDATE ${CUS_DB}.pos_session SET ${value} WHERE pos_session_id =${req.body.pos_session_id} `)
          var query = conn.query(`UPDATE ${CUS_DB}.pos_session SET ${value} WHERE pos_session_id =${req.body.pos_session_id} `, function (err, rows) {
            console.log("====================================================1")
            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
              conn.rollback(function () {
                 res.send(row); return;
              });
            }

            if (req.body.oripos_session_status_id != req.body.pos_session_status_id && req.body.pos_session_status_id == 3) {
              //process generalledger and inventoryledger
              console.log("====================================================2")
              var myfireStr = `SELECT SUM(t1.ordered) AS "ordered", SUM(t1.orderedeqv) AS "orderedeqv", t1.inventory_id, SUM(t1.inventory_hpp) AS "inventory_hpp", t1.warehouse_id FROM ${CUS_DB}.pos_detail t1 INNER JOIN ${CUS_DB}.pos t2 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t2.pos_session_id = ${req.body.pos_session_id} GROUP BY t1.inventory_id AND t1.warehouse_id`;

              //   -SELECT-POS_DETAIL -SELECT-POS
              var query = conn.query(myfireStr, function (err, rows) {
                if (err) {
                  row.success = false; console.log(err);
                  row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
                  conn.rollback(function () {
                     res.send(row); return;
                  });
                }
                var posDetailData = rows;
                console.log("====================================================3")
                add_inventoryledger(conn, req, row, posDetailData).then(function (result) { // 1. INSERT INVENTORYLEDGER
                  //sini
                  
                  console.log("====================================================4")
                  //   -SELECT-POS_DETAIL -SELECT-POS
                  var query = conn.query(myfireStr, function (err, rows) {
                    if (err) {
                      row.success = false; console.log(err);
                      row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
                      conn.rollback(function () {
                         res.send(row); return;
                      });
                    }
                    posDetailData = rows;

                    add_generalledger(conn, req, row, posDetailData).then(function (result) { // 2. INSERT GENERALLEDGER
                      console.log("====================================================5")
                      conn.commit(function (err) {
                         res.send(row); return;
                      });
                    }).catch(error => { // 2 END
                      console.log(error)
                      conn.rollback(function () {
                        console.log('false add_generalledger');
                        row = error;
                         res.send(row); return;
                      });
                    });

                  });

                }).catch(error => { // 1 END
                  console.log(error)
                  conn.rollback(function () {
                    console.log('false add_inventoryledger');
                    row = error;
                     res.send(row); return;
                  });
                });

              });
            } else {

              conn.commit(function (err) {
                 res.send(row); return;
              });

            }

          });
        });

      });

    });

    function add_inventoryledger(conn, req, row, posDetailData) {
      const CUS_DB = req.body.company_db;
      return new Promise(function (resolve, reject) {

        var querystr = "";
        console.log(posDetailData)
        console.log("posDetailData")
        async.forEach(posDetailData, function (item, callback) {
          console.log(item)
          // if (item.ledgerprocess == 0 && item.is_active == 1) {
            if (querystr != "") {
              querystr += ', ';
            }
            let debitAccount = 0;
            let creditAccount = item.warehouse_id;

            if (req.body.isreturn == 1) {
              item.ordered = item.ordered * -1;
              item.orderedeqv = item.orderedeqv * -1;
              debitAccount = item.warehouse_id;
              creditAccount = 0;
            }

            var debitSum = `((SELECT COALESCE(SUM(i.debit), 0) AS  "debit_sum" FROM ${CUS_DB}.inventoryledger i INNER JOIN ${CUS_DB}.inventoryledger_link il ON i.inventoryledger_link_id = il.inventoryledger_link_id WHERE i.inventory_id = ${item.inventory_id} AND i.debit <> 0 AND il.inventoryledger_link_type_id <> 8) + ${item.ordered})`;

            if(debitAccount > 0){
              querystr += '("' + item.ordered + '","' + item.orderedeqv + '","' + 0 + '","' + 0 + '","' + req.body.inventoryledger_link_id + '","' + item.inventory_id + '","' + item.inventory_hpp + '", ' + debitSum + ' ,"' + req.body.rate + '","' + debitAccount + '","' + req.body.currency_id + '","' + req.body.transaction_date + '","' + req.body.transaction_date + '", 0,"' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '",1 ,1, 1)';
            }

            if(creditAccount > 0){
              querystr += '("' + 0 + '","' + 0 + '","' + item.ordered + '","' + item.orderedeqv + '","' + req.body.inventoryledger_link_id + '","' + item.inventory_id + '","' + item.inventory_hpp + '", ' + debitSum + ' ,"' + req.body.rate + '","' + creditAccount + '","' + req.body.currency_id + '","' + req.body.transaction_date + '","' + req.body.transaction_date + '", 0,"' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '", 1, 1, 1)';
            }
          // }
          callback();
        }, function (err) {
          console.log("err")  
          console.log(err)
          // if (err) {
          //   row.success = false; console.log(err);
          //   row.label = 'Server failed prosess data. try again or contact our IT support';
          //   reject(row);
          // }
          console.log(querystr)
          console.log("querystr")
          if (querystr != "") {

            var myfireStr = `INSERT INTO ${CUS_DB}.inventoryledger( debit, debiteqv, credit, crediteqv, inventoryledger_link_id, inventory_id, hpp, debit_sum, rate, warehouse_id, currency_id, expired_date, reminder_expired_date, isfix_asset, create_by, create_datetime, update_by, update_datetime, is_use , is_active, reverse ) VALUES ` + querystr;
            console.log(myfireStr)
            //   -INSERT-INVENTORYLEDGER
            var query = conn.query(myfireStr, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
                reject(row);
              }
              resolve(true);

            });
          }

        });

      });

    }

    function add_generalledger(conn, req, row, posDetailData) {
      console.log("+++++++++++++++++++++++++++++1")
      const CUS_DB = req.body.company_db;
      
      return new Promise(function (resolve, reject) {
        //!!table-account_linked-select

        var myfireStr = `
          SELECT 
            (SELECT account_id FROM ${CUS_DB}.account_linked WHERE account_link_id = 3 AND is_active =1 AND is_use =1 ) as "plus_asset_cash_account", 
            (SELECT account_id FROM ${CUS_DB}.account_linked WHERE account_link_id = 4 AND is_active =1 AND is_use =1 ) as "plus_income_account", 
            (SELECT account_id FROM ${CUS_DB}.account_linked WHERE account_link_id = 2 AND is_active =1 AND is_use =1 ) as "minus_asset_inventory_account", 
            (SELECT account_id FROM ${CUS_DB}.account_linked WHERE account_link_id = 18 AND is_active =1 AND is_use =1 ) as "plus_cost_hpp_account", 
            (SELECT account_id FROM ${CUS_DB}.account_linked WHERE account_link_id = 5 AND is_active =1 AND is_use =1 ) as "plus_cost_transportation_account"`;
        // --account_link_id 8 // --account_link_id 5 // --account_link_id 4 // --account_link_id 3

        //   -SELECT-ACCOUNT_LINKED
        var query = conn.query(myfireStr, function (err, rows) {
          console.log("+++++++++++++++++++++++++++++2")
          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
            reject(row);
          }

          if (rows[0]) {
            console.log("+++++++++++++++++++++++++++++3")
            var plus_income_account = rows[0]['plus_income_account']; //from customer
            var plus_asset_cash_account = rows[0]['plus_asset_cash_account']; // sell account if cash
            var plus_cost_transportation_account = rows[0]['plus_cost_transportation_account'];
            var minus_asset_inventory_account = rows[0]['minus_asset_inventory_account'];
            var plus_cost_hpp_account = rows[0]['plus_cost_hpp_account'];

            var sub_total_value = posDetailData[0]['orisub_total'];
            var tax_value = posDetailData[0]['oritax']; 
            // var downpayment_value = posDetailData[0]['oridownpayment'];
            var landed_cost_value = posDetailData[0]['orilanded_cost'];
            var grand_total_value = sub_total_value + landed_cost_value + tax_value - posDetailData[0]['discount_amount'];
            // var receivable_value = grand_total_value - downpayment_value;

            var glquery = "";
            console.log("+++++++++++++++++++++++++++++4")
            let insertDataValue = {
              general_journal_id: req.body.general_journal_id,
              account_id: '',
              debit: 0,
              debiteqv: 0,
              credit: 0,
              crediteqv: 0,
              create_by: req.body.create_by,
              create_datetime: req.body.create_datetime,
              update_by: req.body.create_by,
              update_datetime: req.body.create_datetime,
              is_use: 1,
              is_active: 1
            }
            
            //cash
            tsservice.insertDataValue({
              ...insertDataValue,
              account_id: plus_asset_cash_account,
              debit: grand_total_value,
              debiteqv: grand_total_value,
              credit: 0,
              crediteqv: 0
            }, (data) => {
              console.log(data)
              glquery += `${data},`;
            })

            //minus inventory
            tsservice.insertDataValue({
              ...insertDataValue,
              account_id: minus_asset_inventory_account,
              debit: 0,
              debiteqv: 0,
              credit: {
                type: "query",
                value: `SELECT SUM(t1.inventory_hpp * t1.ordered) FROM ${CUS_DB}.pos_detail t1 INNER JOIN ${CUS_DB}.pos t2 ON t1.pos_id = t2.pos_id WHERE t2.pos_session_id = ${req.body.pos_session_id}`
              },
              crediteqv: {
                type: "query",
                value: `SELECT SUM(t1.inventory_hpp * t1.ordered) FROM ${CUS_DB}.pos_detail t1 INNER JOIN ${CUS_DB}.pos t2 ON t1.pos_id = t2.pos_id WHERE t2.pos_session_id = ${req.body.pos_session_id}`
              },
            }, (data) => {
              console.log(data)
              glquery += `${data},`;
            })

            //add HPP
            tsservice.insertDataValue({
              ...insertDataValue,
              account_id: plus_cost_hpp_account,
              debit: {
                type: "query",
                value: `SELECT SUM(t1.inventory_hpp * t1.ordered) FROM ${CUS_DB}.pos_detail t1 INNER JOIN ${CUS_DB}.pos t2 ON t1.pos_id = t2.pos_id WHERE t2.pos_session_id = ${req.body.pos_session_id}`
              },
              debiteqv: {
                type: "query",
                value: `SELECT SUM(t1.inventory_hpp * t1.ordered) FROM ${CUS_DB}.pos_detail t1 INNER JOIN ${CUS_DB}.pos t2 ON t1.pos_id = t2.pos_id WHERE t2.pos_session_id = ${req.body.pos_session_id}`
              },
              credit: 0,
              crediteqv: 0
            }, (data) => {
              console.log(data)
              glquery += `${data},`;
            })

            //landed_cost
            if (landed_cost_value != 0) {
              tsservice.insertDataValue({
                ...insertDataValue,
                account_id: plus_cost_transportation_account,
                debit: landed_cost_value,
                debiteqv: landed_cost_value,
                credit: 0,
                crediteqv: 0
              }, (data) => {
                console.log(data)
                glquery += `${data},`;
              })
            }

            // grand_total = subtotal + landed cost + tax
            //grand total
            tsservice.insertDataValue({
              ...insertDataValue,
              account_id: plus_income_account,
              debit: 0,
              debiteqv: 0,
              credit: grand_total_value-tax_value,
              crediteqv: grand_total_value-tax_value
            }, (data) => {
              console.log(data)
              glquery += `${data}`;
            })

            if (tax_value != 0) {

              tsservice.insertDataValue({
                ...insertDataValue,
                account_id: plus_income_account,
                debit: 0,
                debiteqv: 0,
                credit: tax_value,
                crediteqv: tax_value
              }, (data) => {
                console.log(data)
                glquery += `,${data}`;
              })

            }
            console.log("+++++++++++++++++++++++++++++5")
            var myfireStr = `INSERT INTO ${CUS_DB}.generalledger( general_journal_id, account_id, debit, debiteqv, credit, crediteqv, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + glquery;
            //masalah di sini
            //   -INSERT-GENERALLEDGER
            var query = conn.query(myfireStr, function (err, rows) {
              console.log("+++++++++++++++++++++++++++++6")
              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                reject(row);
              }

              resolve(true);

            });

          } else {
            console.log("+++++++++++++++++++++++++++++7")
            row.success = false; console.log(err);
            row.label = 'Failed to select important code. Please contact our IT support';
             res.send(row); return;
          }


        });

      });


    }

  },
}

module.exports = controller;
