var tsservice = require('./../../tsservice');

const controller = {
  //   REST-INSERT
  generaljournalSearch_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;

    var row = { success: true, data: { generaljournal: [] }, label: 'Data selected successfully' };

    req.getConnection(function (err, conn) {

      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      let whrString = ``
      if(req.body.general_journal_id){
        whrString = `AND t1.general_journal_id = ${req.body.general_journal_id}`
      }

      var myfireStr = `
        SELECT 
          t1.* , 
          t2.generalledger_period_id, 
          t2.transaction_date, 
          t3.general_journal_type_id, 
          t3.type_code, 
          t3.type_name 
        FROM ${CUS_DB}.general_journal t1 
          INNER JOIN ${CUS_DB}.general_journal t2 ON t1.general_journal_id = t2.general_journal_id 
          INNER JOIN ${CUS_DB}.general_journal_type t3 ON t1.general_journal_type_id = t3.general_journal_type_id 
        WHERE t1.is_use = 1 AND t1.is_active = 1 ${whrString} 
        ORDER BY t1.general_journal_id DESC`;
      console.log(myfireStr)
      //   -SELECT-GENERAL_JOURNAL   -JOIN-JOURNAL_CATEGORY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.generaljournal = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-SELECT
  getGeneraljournalOptions_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { generalLedgerPeriod: [], generaljournalCategory: [], generaljournalAccount: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {

      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.generalledger_period WHERE is_use = 1 AND is_active = 1 && generalledger_status_id = 1`;
      //   -SELECT-GENERALLEDGER_PERIOD
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.generalLedgerPeriod = rows;

        var myfireStr = `SELECT * FROM ${CUS_DB}.general_journal_type WHERE is_use = 1 AND is_active = 1`;
        //   -SELECT-JOURNAL_TYPE
        var query = conn.query(myfireStr, function (err, rows) {
          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.generaljournalCategory = rows;
           res.send(row); return;

        });
      });

    });

  },

  //   REST-INSERT
  generaljournal_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '', general_journal_code: '', general_journal_id: '' }, label: 'Data entered successfully' };
    // validation
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('general_journal_type_id', 'Journal Category Id is required');
    req.assert('generalledger_period_id', 'Generalledger Period Id is required');
    req.assert('description', 'Description is required');
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

    var general_journal_code = "";
    var general_journal_id = "";

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {

        var codeData = {
          special_code_id: "JOURNAL",
          table: "general_journal",
          column_id: "general_journal_id",
          column_code: "general_journal_code",
        }

        var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

        //   -SELECT-SPECIAL_CODE   -SELECT-GENERAL_JOURNAL
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }

          if (rows[0]['code']) {

            general_journal_code = rows[0]['code'];

            var data = {
              general_journal_code: general_journal_code,
              reference_code: '',
              general_journal_type_id: req.body.general_journal_type_id, //important code
              description: req.body.description,
              create_by: req.body.create_by,
              generalledger_period_id: req.body.generalledger_period_id,
              transaction_date: tsservice.mysqlDate(req.body.transaction_date),
              create_datetime: tsservice.mysqlDate(req.body.create_datetime),
              update_by: req.body.create_by,
              update_datetime: tsservice.mysqlDate(req.body.create_datetime),
              is_use: '1', is_active: '1'
            };

            tsservice.insertData(data, function (value) {
              //   -INSERT-GENERAL_JOURNAL
              var query = conn.query(`INSERT INTO ${CUS_DB}.general_journal` + value, function (err, rows) {

                if (err) {
                  row.success = false; console.log(err);
                  row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                  conn.rollback(function () {
                     res.send(row); return;
                  });
                }
                row.data.lastId = rows.insertId;
                row.data.general_journal_code = general_journal_code;
                row.data.general_journal_id = general_journal_id;
                conn.commit(function (err) {
                   res.send(row); return;
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

      });

    });

  },

  //   REST-UPDATE
  generaljournal_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('general_journal_id', 'Journal Id is required');
    req.assert('general_journal_code', 'Journal Code/No is required');
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('generalledger_period_id', 'Generalledger Period Id is required');
    req.assert('general_journal_id', 'Generalledger Link is required');
    req.assert('general_journal_type_id', 'Journal Category Id is required');
    req.assert('description', 'Description is required');
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

    // update data table general_journal
    var data = {
      general_journal_code: req.body.general_journal_code,
      general_journal_id: req.body.general_journal_id,
      general_journal_type_id: req.body.general_journal_type_id,
      description: req.body.description,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(req.body.update_datetime),
      is_use: req.body.is_use,
      is_active: req.body.is_active
    };

    // update general ledger link
    var data2 = {
      reference_code: req.body.general_journal_code,
      general_journal_type_id: '1', //important code
      description: 'Generated',
      generalledger_period_id: req.body.generalledger_period_id,
      transaction_date: tsservice.mysqlDate(req.body.transaction_date),
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(req.body.update_datetime),
      is_use: req.body.is_use,
      is_active: req.body.is_active
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-JOURNAL
        var query = conn.query(`UPDATE ${CUS_DB}.general_journal SET ${value} WHERE general_journal_id =${req.body.general_journal_id} `, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }

          tsservice.updateData(data2, function (value) {
            //   -UPDATE-GENERAL_JOURNAL
            var query = conn.query(`UPDATE ${CUS_DB}.general_journal SET ${value} WHERE general_journal_id =${req.body.general_journal_id} `, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
                 res.send(row); return;
              }
               res.send(row); return;

            });
          });


        });
      });

    });

  },

  //   REST-SELECT
  gllist_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { gllist: [] }, label: 'Data selected successfully' };
    // validation
    req.assert('action', 'action is required');
    req.assert('id', 'id is required');

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
      var joinStr = "";
      if (req.body.action == 'account_id') {
        whereStr = 'AND t1.account_id = "' + req.body.id + '"';
      } else if (req.body.action == 'general_journal_id') {
        whereStr = 'AND t1.general_journal_id = "' + req.body.id + '"';
      } else if (req.body.action == 'bbaccount_id') {
        joinStr = `INNER JOIN (SELECT general_journal_id FROM ${CUS_DB}.generalledger WHERE account_id = "${req.body.id}" GROUP BY general_journal_id) t6 ON t1.general_journal_id = t6.general_journal_id`;
        whereStr = 'AND t5.general_journal_type_id > 1 AND t5.general_journal_type_id < 6';
      }
      
      var myfireStr = `
        SELECT 
          t1.*, 
          DATE_FORMAT(t1.update_datetime, "%d %M %Y") as "update_date_show", 
          t2.account, 
          concat(t4.account_category_code,"-",t2.account_code) as "account_code", 
          t2.currency_id 
        FROM ${CUS_DB}.generalledger t1 
          INNER JOIN ${CUS_DB}.account t2 ON t1.account_id = t2.account_id 
          INNER JOIN ${CUS_DB}.account_category_type t3 ON t2.account_category_type_id = t3.account_category_type_id 
          INNER JOIN ${CUS_DB}.account_category t4 ON t3.account_category_id = t4.account_category_id 
          INNER JOIN ${CUS_DB}.general_journal t5 ON t1.general_journal_id = t5.general_journal_id ${joinStr} 
        WHERE t1.is_use = 1 AND t1.is_active = 1 ` + whereStr;
        
      console.log(myfireStr)
      //   -SELECT-GENERALLEDGER   -JOIN-ACCOUNT   -JOIN-ACCOUNT_CATEGORY_TYPE   -JOIN-ACCOUNT_CATEGORY
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.gllist = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  generaljournalgeneralledger_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data entered successfully' };
    // validation
    req.assert('general_journal_id', 'Generalledger Link is required');
    req.assert('account_id', 'Account is required');
    req.assert('debit', 'Debit is required');
    req.assert('credit', 'Credit is required');
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
      general_journal_id: req.body.general_journal_id,
      account_id: req.body.account_id,
      debit: req.body.debit,
      credit: req.body.credit,
      create_by: req.body.create_by,
      create_datetime: tsservice.mysqlDate(req.body.create_datetime),
      update_by: req.body.create_by,
      update_datetime: tsservice.mysqlDate(req.body.create_datetime),
      is_use: '1', is_active: '1'
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.insertData(data, function (value) {
        //   -INSERT-GENERALLEDGER
        var query = conn.query(`INSERT INTO ${CUS_DB}.generalledger` + value, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }

           res.send(row); return;

        });
      });

    });

  },

  //   REST-UPDATE
  generaljournalgeneralledger_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('generalledger_id', 'Generalledger Id is required');
    req.assert('general_journal_id', 'Generalledger Link is required');
    req.assert('account_id', 'Account is required');
    req.assert('account_code', 'Account Code/No is required');
    req.assert('account', 'Account is required');
    req.assert('debit', 'Debit is required');
    req.assert('credit', 'Credit is required');
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
      general_journal_id: req.body.general_journal_id,
      account_id: req.body.account_id,
      debit: req.body.debit,
      credit: req.body.credit,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(req.body.update_datetime),
      is_use: req.body.is_use,
      is_active: req.body.is_active
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-GENERALLEDGER
        var query = conn.query(`UPDATE ${CUS_DB}.generalledger SET ${value} WHERE generalledger_id =${req.body.generalledger_id} `, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
           res.send(row); return;

        });
      });

    });

  },

  //   REST-SELECT
  getglactionOptions_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { account: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.account_id, concat(t3.account_category_code, "-", t1.account_code, " / ",t1.account) AS "account" FROM ${CUS_DB}.account t1 INNER JOIN ${CUS_DB}.account_category_type t2 ON t1.account_category_type_id = t2.account_category_type_id INNER JOIN ${CUS_DB}.account_category t3 ON t2.account_category_id = t3.account_category_id WHERE t1.is_use = 1 AND t1.is_active = 1 && is_header != 1`;
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

  }
}

module.exports = controller;