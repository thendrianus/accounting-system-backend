
var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  getBbcashList_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;

    var row = { success: true, data: { BbcashList: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, DATE_FORMAT(t1.transaction_date,"%d %M %Y") as "transaction_date_show", t3.account, t3.account_id, coalesce(sum(t2.debit), 0) AS "debit", coalesce(sum(t2.debit), 0) AS "ballance" FROM (SELECT * FROM ${CUS_DB}.general_journal WHERE is_active = 1 AND general_journal_type_id = 3) t1 LEFT JOIN ( SELECT * FROM ${CUS_DB}.generalledger WHERE is_active =1 ) t2 ON t1.general_journal_id = t2.general_journal_id INNER JOIN ${CUS_DB}.account t3 ON t2.account_id = t3.account_id GROUP BY t1.general_journal_id`;

      //   -SELECT-ACCOUNT_BB_CASH   -JOIN-GENERALLEDGER   -JOIN-ACCOUNT
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        row.data.BbcashList = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-SELECT
  bbcashAccount_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { account: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.account_id, t1.currency_id, t2.plus, t2.minus, concat(t3.account_category_code, "-", t1.account_code, " / ",t1.account) AS "account", convert(t1.account_id, char(50)) as "value", concat(t3.account_category_code, "-", t1.account_code," - ",t1.account) as "label" FROM ${CUS_DB}.account t1 INNER JOIN ${CUS_DB}.account_category_type t2 ON t1.account_category_type_id = t2.account_category_type_id INNER JOIN ${CUS_DB}.account_category t3 ON t2.account_category_id = t3.account_category_id WHERE t1.is_use = 1 AND t1.is_active = 1 && is_header != 1 AND t2.account_category_id = 1`;
      //   -SELECT-ACCOUNT   -JOIN-ACCOUNT_CATEGORY_TYPE   -JOIN-ACCOUNT_CATEGORY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        row.data.account = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-INSERT
  bbcash_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '', general_journal_id: '' }, label: 'Data entered successfully' };
    // validation
    // req.assert('general_journal_id','Generalledger Link is required');
    req.assert('description', 'Description is required');
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('account_id', 'Account is required');
    req.assert('debit', 'Debit is required');
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


    var data = {
      reference_code: '',
      general_journal_type_id: '3', //important code
      general_journal_code: '',
      description: req.body.description,
      generalledger_period_id: '',
      transaction_date: tsservice.mysqlDate(req.body.transaction_date),
      create_by: req.body.create_by,
      create_datetime: tsservice.mysqlDate(req.body.create_datetime),
      update_by: req.body.create_by,
      update_datetime: tsservice.mysqlDate(req.body.create_datetime),
      is_use: '1', is_active: '1'
    };

    var general_journal_id = '';

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      if (req.body.debit != 0) {

        conn.beginTransaction(function (err) {

          var codeData = {
            special_code_id: "JOURNAL",
            table: "general_journal",
            column_id: "general_journal_id",
            column_code: "general_journal_code",
          } 

          var querystrCode = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

          var myfireStr = `SELECT special_code as "code", (SELECT generalledger_period_id FROM ${CUS_DB}.generalledger_period WHERE generalledger_status_id = 1 AND is_active =1 AND is_use =1 limit 1) as "generalledger_period_id", (${querystrCode}) as "journal_code" FROM ${CUS_DB}.special_code WHERE is_use = 1 AND is_active = 1 AND special_code_id = "BEGINNINGCASH" LIMIT 1`;

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

              data.reference_code = rows[0]['code'];
              data.general_journal_code = rows[0]['journal_code'];
              data.generalledger_period_id = rows[0]['generalledger_period_id'];

              tsservice.insertData(data, function (value) {
                //   -SELECT-GENERAL_JOURNAL
                var query = conn.query(`INSERT INTO ${CUS_DB}.general_journal` + value, function (err, rows) {

                  if (err) {
                    row.success = false; console.log(err);
                    row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                    conn.rollback(function () {
                       res.send(row); return;
                    });
                  }

                  general_journal_id = rows.insertId;
                  row.data.general_journal_id = rows.insertId;

                  //update delete
                  var data2 = {
                    general_journal_id: general_journal_id,
                    account_id: req.body.account_id,
                    debit: req.body.debit,
                    credit: 0,
                    create_by: req.body.create_by,
                    create_datetime: tsservice.mysqlDate(req.body.create_datetime),
                    update_by: req.body.create_by,
                    update_datetime: tsservice.mysqlDate(req.body.create_datetime),
                    is_use: '1', is_active: '1'
                  };

                  tsservice.insertData(data2, function (value) {
                    //   -INSERT-GENERALLEDGER
                    var query = conn.query(`INSERT INTO ${CUS_DB}.generalledger` + value, function (err, rows) {

                      if (err) {
                        row.success = false; console.log(err);
                        row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                        conn.rollback(function () {
                           res.send(row); return;
                        });
                      }else{
                        conn.commit(function (err) {
                           res.send(row); return;
                        });
                      }

                    });
                  })

                });
              })

            } else {
              row.success = false; console.log(err);
              row.label = 'Failed to select important code. Please contact our IT support';
              conn.rollback(function () {
                 res.send(row); return;
              });
            }

          });

        });

      } else {
        row.success = false; console.log(err);
        row.label = 'The Nominal Cannot be 0';
         res.send(row); return;
      }

    });

  },

  //   REST-UPDATE
  bbcash_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('general_journal_id', 'Generalledger Link is required');
    req.assert('description', 'Description is required');
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('account_id', 'Account is required');
    req.assert('debit', 'Debit is required');
    req.assert('ballance', 'Ballance is required');
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

    var data = {
      transaction_date: tsservice.mysqlDate(req.body.transaction_date),
      description: req.body.description,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(req.body.update_datetime),
      is_use: req.body.is_use,
      is_active: req.body.is_active
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {
        tsservice.updateData(data, function (value) {
          //   -UPDATE-GENERAL_JOURNAL
          var query = conn.query(`UPDATE ${CUS_DB}.general_journal SET ${value} WHERE general_journal_id = ` + req.body.general_journal_id + " ", function (err, rows) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
              conn.rollback(function () {
                 res.send(row); return;
              });
            }

            if (req.body.debit - req.body.ballance != 0) {
              var data2 = {
                general_journal_id: req.body.general_journal_id,
                account_id: req.body.account_id,
                debit: req.body.debit - req.body.ballance,
                credit: 0,
                create_by: req.body.update_by,
                create_datetime: tsservice.mysqlDate(req.body.update_datetime),
                update_by: req.body.update_by,
                update_datetime: tsservice.mysqlDate(req.body.update_datetime),
                is_use: '1', is_active: '1'
              };

              tsservice.insertData(data2, function (value) {
                //   -INSERT-GENERALLEDGER
                var query = conn.query(`INSERT INTO ${CUS_DB}.generalledger` + value, function (err, rows) {

                  if (err) {
                    row.success = false; console.log(err);
                    row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                    conn.rollback(function () {
                       res.send(row); return;
                    });
                  }else{
                    conn.commit(function (err) {
                       res.send(row); return;
                    });
                  }

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

  }

}

module.exports = controller;
