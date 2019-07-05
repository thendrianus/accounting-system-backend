var tsservice = require('../../tsservice');
var async = require('async');
var moment = require('moment');
var accountList = require('./glDefaultAccountList');

const controller = (req, res, conn, row, callback) => {
  const CUS_DB = req.body.company_db;

  var ledgerfirst_month = parseInt(req.body.ledgerfirst_month);
  var ledgerlast_month = parseInt(req.body.ledgerlast_month);
  var ledgeryear = parseInt(req.body.ledgeryear);
  var ledgeryear_last_month = ledgerlast_month < ledgerfirst_month ? ledgeryear + 1 : ledgeryear;

  var strVal = "";

  var numberOfMonths = (ledgeryear_last_month - ledgeryear) * 12 + (ledgerlast_month - ledgerfirst_month) + 1;

  var year, month;
  for (var index = 0; index < numberOfMonths; index++) {
    if (ledgerfirst_month + index > 12) {
      year = ledgeryear + 1;
      month = ledgerfirst_month + index - 12;
    } else {
      year = ledgeryear;
      month = ledgerfirst_month + index
    }

    var status = 1;

    if (strVal != "") {
      strVal += ",";
      status = 3;
    }

    strVal += "( '" + moment.monthsShort(month - 1) + " - " + year + "', '" + index + "' , '" + tsservice.mysqlDate() + "', '" + tsservice.mysqlDate() + "', " + status + ", '-', '" + tsservice.mysqlDate() + "', '" + tsservice.mysqlDate() + "', " + req.body.create_by + ", " + req.body.create_by + ", 1,1 )";

    if (index == numberOfMonths - 1) {
      strVal += ", ( 'Audit Period', '" + (index + 1) + "' , '" + tsservice.mysqlDate() + "', '" + tsservice.mysqlDate() + "', " + status + ", '-', '" + tsservice.mysqlDate() + "', '" + tsservice.mysqlDate() + "', " + req.body.create_by + ", " + req.body.create_by + ", 1, 1 )";

    }

  }

  var myfireStr = `INSERT INTO ${CUS_DB}.generalledger_period( generalledger_period, period_order , start_date, end_date, generalledger_status_id, description, create_datetime, update_datetime, create_by, update_by, is_active, is_use ) VALUES ${strVal}`;

  //   -INSERT-GENERALLEDGER_PERIOD
  var query = conn.query(myfireStr, function (err, rows) {

    if (err) {
      row.success = false; console.log(err);
      row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
      conn.rollback(function () {
        res.send(row); return;
      });
    }
    var periodId = rows.insertId;
    var isFailed = false;

    async.forEach(accountList, function (item, back) {
      
      var myfireStr = `INSERT INTO ${CUS_DB}.general_journal(general_journal_code, reference_code, general_journal_type_id, generalledger_period_id, transaction_date, description, create_by, update_by, create_datetime, update_datetime, is_use, is_active) VALUES('BAJ${item.code}', '${item.code}', 2, '${periodId}', now(), 'beginning balance ${item.account}', 1, 1, now(), now(), 1, 1)`;

      //   -INSERT-GENERAL_JOURNAL
      var query = conn.query(myfireStr, function (err, rows) {
        
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
          isFailed = true;
        }

        var myfireStr = `INSERT INTO ${CUS_DB}.account(account_code, account, account_category_type_id, currency_id, is_header, description, is_temporary, general_journal_id, create_by, update_by, create_datetime, update_datetime, is_use, is_active) VALUES('${item.code}','${item.account}',${item.type_id},'${item.currency_id}',${item.is_header},'${item.description}',${item.is_temporary},'${rows.insertId}',1 ,1 , now(), now(), 1, 1)`;

        //   -INSERT-ACCOUNT
        var query = conn.query(myfireStr, function (err, rows) {
          
          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
            isFailed = true;
          }

          back();

        });

      });

    }, function (err) {

      if (err || isFailed == true) {
        conn.rollback(function () {
          res.send(row); return;
        });
      } else {
        callback(true)
      }

    });

  });
}

module.exports = controller;