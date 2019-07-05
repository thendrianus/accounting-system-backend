var tsservice = require('./../../tsservice');
var async = require('async');

const controller = {
  //   REST-SELECT
  generalledgerperiod_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { generalledgerPeriod: [] }, label: 'Data selected successfully' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, t2.name AS "period_status", date_format(t1.end_date, "%e %b %Y") as "end_date_show", date_format(t1.start_date, "%e %b %Y") as "start_date_show" FROM ${CUS_DB}.generalledger_period t1 INNER JOIN ${CUS_DB}.generalledger_status t2 ON t1.generalledger_status_id = t2.generalledger_status_id WHERE t1.is_use = 1 AND t1.is_active = 1 ORDER BY t1.period_order`;
      //   -SELECT-GENERALLEDGER_PERIOD   -JOIN-COMPANY   -JOIN-GENERALLEDGER_STATUS
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.generalledgerPeriod = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-UPDATE
  generalledgerperiod_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: {}, label: 'Data updated successfully' };

    // validation
    req.assert('generalledger_period_id', 'Period Id is required');
    req.assert('period_order', 'Journal Code/No is required');
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

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {

        var myfireStr = `SELECT t3.currency_id,IFNULL(SUM(t1.debit), 0) AS "debit", IFNULL(SUM(t1.credit), 0) AS "credit", IFNULL(SUM(t1.debiteqv), 0) AS "debiteqv", IFNULL(SUM(t1.crediteqv), 0) AS "crediteqv" FROM ${CUS_DB}.generalledger t1 INNER JOIN ${CUS_DB}.general_journal t2 ON t1.general_journal_id = t2.general_journal_id INNER JOIN ${CUS_DB}.account t3 ON t1.account_id = t3.account_id WHERE t1.is_use = 1 AND t1.is_active = 1 AND t2.generalledger_period_id = "${req.body.generalledger_period_id}" GROUP BY t3.currency_id`;
        //   -SELECT-GENERALLEDGER   -JOIN-GENERAL_JOURNAL   -JOIN-ACCOUNT
        var query = conn.query(myfireStr, function (err, rows) {
          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }

          isBalance = true;
          notBalanceLabel = "";

          async.forEach(rows, function (item, callback) {

            if (item.debit != item.credit) {
              if (notBalanceLabel != "") {
                notBalanceLabel += 'AND';
              }

              notBalanceLabel += ' ' + item.currency_id + ' ';
            }

            callback();

          }, function (err) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Server failed prosess data. try again or contact our IT support';
              conn.rollback(function () {
                 res.send(row); return;
              });
            }

            if (notBalanceLabel == "") {

              var data = {
                end_date: tsservice.mysqlDate(),
                generalledger_status_id: 2,
                update_by: req.body.update_by,
                update_datetime: tsservice.mysqlDate(req.body.update_datetime)
              };

              tsservice.updateData(data, function (value) {
                //   -UPDATE-GENERALLEDGER_PERIOD
                var query = conn.query(`UPDATE ${CUS_DB}.generalledger_period SET ${value} WHERE generalledger_period_id =${req.body.generalledger_period_id} `, function (err, rows) {

                  if (err) {
                    row.success = false; console.log(err);
                    row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
                    conn.rollback(function () {
                       res.send(row); return;
                    });
                  }

                  var data = {
                    start_date: tsservice.mysqlDate(),
                    generalledger_status_id: 1,
                    update_by: req.body.update_by,
                    update_datetime: tsservice.mysqlDate(req.body.update_datetime)
                  };

                  tsservice.updateData(data, function (value) {
                    //   -UPDATE-GENERALLEDGER_PERIOD
                    var query = conn.query(`UPDATE ${CUS_DB}.generalledger_period SET ${value} WHERE generalledger_period_id = ${req.body.generalledger_period_id + 1} AND period_order = ${req.body.period_order + 1}`, function (err, rows) {

                      if (err) {
                        row.success = false; console.log(err);
                        row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
                        conn.rollback(function () {
                           res.send(row); return;
                        });
                      }

                      conn.commit(function (err) {
                         res.send(row); return;
                      });

                    });
                  });

                });
              });
            } else {
              row.success = false;
              row.label = 'Your account with ' + notBalanceLabel + ' currency is not balance, Please check again your account before closing period';
              conn.rollback(function () {
                 res.send(row); return;
              });
            }

          });


        });

      });

    });

  }
}

module.exports = controller;