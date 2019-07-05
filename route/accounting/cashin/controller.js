
var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  getCashinOptions_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { bankAccount: [], cashinBusinesspartner: [], cashinDepartment: [], project: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, t2.*, convert(t1.account_id, char(50)) as "value", concat(t2.account_code," - ",t2.account) as "label" FROM ${CUS_DB}.account_bank t1 INNER JOIN ${CUS_DB}.account t2 ON t1.account_id = t2.account_id WHERE t1.is_use = 1 AND t1.is_active = 1 AND t2.is_use AND t2.is_active`;
      //   -SELECT-ACCOUNT_BANK   -JOIN-ACCOUNT
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.bankAccount = rows;

        var myfireStr = `SELECT *, CONVERT(businesspartner_id, char(50)) AS "value", CONCAT(businesspartner_code, " - ", NAME) AS "label" FROM ${CUS_DB}.businesspartner WHERE is_use = 1 AND is_active = 1`;
        //   -SELECT-BUSINESSPARTNER
        var query = conn.query(myfireStr, function (err, rows) {
          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.cashinBusinesspartner = rows;
          var myfireStr = `SELECT * FROM ${CUS_DB}.department WHERE is_use = 1 AND is_active = 1`;
          //   -SELECT-DEPARTMENT
          var query = conn.query(myfireStr, function (err, rows) {
            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
               res.send(row); return;
            }
            row.data.cashinDepartment = rows;

            var myfireStr = `SELECT * FROM ${CUS_DB}.project WHERE is_use = 1 AND is_active = 1`;
            //   -SELECT-PROJECT
            var query = conn.query(myfireStr, function (err, rows) {
              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
                 res.send(row); return;
              }
              row.data.project = rows;
               res.send(row); return;

            });

          });

        });
      });

    });

  },

  //   REST-INSERT
  cashin_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '', cashin_code: '', general_journal_id: '' }, label: 'Data entered successfully' };
    // validation
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('businesspartner_id', 'Journal Category Id is required');
    req.assert('account_id', 'Generalledger Period Id is required');
    req.assert('department_id', 'Deparment Id is required');
    req.assert('check_no', 'Deparment Id is required');
    req.assert('nominal', 'Deparment Id is required');
    req.assert('project_id', 'Deparment Id is required');
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

    var cashin_code = "";
    var general_journal_id = "";
    var generalledger_id = "";

    var data = {
      reference_code: '',
      general_journal_type_id: '8', //important code
      general_journal_code: '',
      description: 'Generated',
      generalledger_period_id: '',
      transaction_date: tsservice.mysqlDate(req.body.transaction_date),
      create_by: req.body.create_by,
      create_datetime: tsservice.mysqlDate(req.body.create_datetime),
      update_by: req.body.create_by,
      update_datetime: tsservice.mysqlDate(req.body.create_datetime),
      is_use: '1', is_active: '1'
    };

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

        var querystrCode = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

        var codeData = {
          special_code_id: "CASHIN",
          table: "cashin",
          column_id: "cashin_id",
          column_code: "cashin_code",
        }

        var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code", (SELECT generalledger_period_id FROM ${CUS_DB}.generalledger_period WHERE is_use = 1 AND is_active = 1 ORDER BY update_datetime DESC LIMIT 1) as "generalledger_period_id", (${querystrCode}) as "journal_code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;
        //   -SELECT-SPECIAL_CODE   -SELECT-CASHIN
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }

          if (rows[0]['code'] && rows[0]['generalledger_period_id']) {

            cashin_code = rows[0]['code'];
            data.reference_code = cashin_code;
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

                var data2 = {
                  general_journal_id: general_journal_id,
                  account_id: req.body.account_id,
                  debit: req.body.nominal,
                  credit: 0,
                  create_by: req.body.create_by,
                  create_datetime: tsservice.mysqlDate(req.body.create_datetime),
                  update_by: req.body.create_by,
                  update_datetime: tsservice.mysqlDate(req.body.create_datetime),
                  is_use: '1', is_active: '1'
                };

                tsservice.insertData(data2, function (value) {
                  //   -INSERT-GENERALLEDGER
                  var query = conn.query(`INSERT INTO ${CUS_DB}.general_journal` + value, function (err, rows) {

                    if (err) {
                      row.success = false; console.log(err);
                      row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                      conn.rollback(function () {
                         res.send(row); return;
                      });
                    }
                    generalledger_id = rows.insertId;
                    continues(req, cashin_code, general_journal_id, generalledger_id, conn);

                  });
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

    function continues(req, cashin_code, general_journal_id, generalledger_id, conn) {

      const CUS_DB = req.body.company_db;
      
      var data = {
        cashin_code: cashin_code,
        general_journal_id: general_journal_id,
        account_id: req.body.account_id,
        generalledger_id: generalledger_id,
        businesspartner_id: req.body.businesspartner_id,
        department_id: req.body.department_id,
        check_no: req.body.check_no,
        nominal: req.body.nominal,
        project_id: req.body.project_id,
        description: req.body.description,
        create_by: req.body.create_by,
        create_datetime: tsservice.mysqlDate(req.body.create_datetime),
        update_by: req.body.create_by,
        update_datetime: tsservice.mysqlDate(req.body.create_datetime),
        is_use: '1', is_active: '1'
      };

      tsservice.insertData(data, function (value) {
        //   -INSERT-CASHIN
        var query = conn.query(`INSERT INTO ${CUS_DB}.cashin` + value, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }
          row.data.lastId = rows.insertId;
          row.data.cashin_code = cashin_code;
          row.data.general_journal_id = general_journal_id;
          conn.commit(function (err) {
             res.send(row); return;
          });

        });
      });

    }

  },

  //   REST-UPDATE
  cashin_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('cashin_id', 'Journal Id is required');
    req.assert('cashin_code', 'Journal Code/No is required');
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('account_id', 'Generalledger Period Id is required');
    req.assert('general_journal_id', 'Generalledger Link is required');
    req.assert('businesspartner_id', 'Journal Category Id is required');
    req.assert('department_id', 'Deparment Id is required');
    req.assert('check_no', 'Deparment Id is required');
    req.assert('nominal', 'Deparment Id is required');
    req.assert('project_id', 'Deparment Id is required');
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

    // update data table cashin
    var data = {
      cashin_code: req.body.cashin_code,
      general_journal_id: req.body.general_journal_id,
      account_id: req.body.account_id,
      businesspartner_id: req.body.businesspartner_id,
      department_id: req.body.department_id,
      check_no: req.body.check_no,
      nominal: req.body.nominal,
      project_id: req.body.project_id,
      description: req.body.description,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(req.body.update_datetime),
      is_use: req.body.is_use,
      is_active: req.body.is_active
    };

    // update general ledger link
    var data2 = {
      reference_code: req.body.cashin_code,
      general_journal_type_id: '8', //important code
      description: 'Generated',
      transaction_date: tsservice.mysqlDate(req.body.transaction_date),
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
          //   -UPDATE-CASHIN
          var query = conn.query(`UPDATE ${CUS_DB}.cashin SET ${value} WHERE cashin_id =${req.body.cashin_id} `, function (err, rows) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
              conn.rollback(function () {
                 res.send(row); return;
              });
            }

            tsservice.updateData(data2, function (value) {
              //   -UPDATE-GENERAL_JOURNAL
              var query = conn.query(`UPDATE ${CUS_DB}.general_journal SET ${value} WHERE general_journal_id =${req.body.general_journal_id} `, function (err, rows) {

                if (err) {
                  row.success = false; console.log(err);
                  row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
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

      });

    });

  },

  //   REST-SELECT
  cashinSearch_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { cashin: [] }, label: 'Data selected successfully' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.* , t2.generalledger_period_id, t2.transaction_date, t3.department FROM ${CUS_DB}.cashin t1 INNER JOIN ${CUS_DB}.general_journal t2 ON t1.general_journal_id = t2.general_journal_id INNER JOIN ${CUS_DB}.department t3 ON t1.department_id = t3.department_id WHERE t1.is_use = 1 AND t1.is_active = 1`;
      //   -SELECT-CASHIN   -JOIN-GENERAL_JOURNAL   -JOIN-DEPARTMENT
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.cashin = rows;
         res.send(row); return;
      });

    });

  }
}

module.exports = controller;

