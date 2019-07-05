
var tsservice = require('./../../tsservice');

const controller = {

  //   REST-SELECT
  getBbrpList_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    req.assert('receive_payable_type', '');
    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    if (req.body.receive_payable_type == 1) {
      var general_journal_type_id = 4;
    } else {
      var general_journal_type_id = 5;
    }

    var row = { success: true, data: { BbrpList: [] }, label: 'Data selected successfully' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, t2.transaction_date, DATE_FORMAT(t2.transaction_date, "%d %M %Y") AS "show_date", t4.account, t4.account_id, t5.name AS "businesspartner_name", t5.businesspartner_code, coalesce(sum(t3.debit), 0) AS "debit", COALESCE(SUM(t3.credit), 0) AS "credit", COALESCE(SUM(t3.credit) - SUM(t3.debit), 0) AS "ballance", COALESCE(SUM(t3.credit) - SUM(t3.debit), 0) AS "nominal" FROM ${CUS_DB}.receive_payable t1 INNER JOIN ${CUS_DB}.general_journal t2 ON t1.general_journal_id = t2.general_journal_id LEFT JOIN ( SELECT * FROM ${CUS_DB}.generalledger WHERE account_id <> 1) t3 ON t1.general_journal_id = t3.general_journal_id INNER JOIN ${CUS_DB}.account t4 ON t3.account_id = t4.account_id INNER JOIN ${CUS_DB}.businesspartner t5 ON t1.businesspartner_id = t5.businesspartner_id WHERE t2.general_journal_type_id = ${general_journal_type_id} AND t1.is_use = 1 AND t1.is_active = 1 AND t1.receive_payable_category_id = 1 GROUP BY t1.general_journal_id`;

      //   -SELECT-RECEIVE_PAYABLE   -JOIN-GENERAL_JOURNAL   -JOIN-GENERALLEDGER   -JOIN-ACCOUNT   -JOIN-BUSINESSPARTNER
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        row.data.BbrpList = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-SELECT 
  bbrpAccount_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { account: [] }, label: 'Berhasil' };

    req.assert('receive_payable_type', 'Used data is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var whereStr = "";
    if (req.body.receive_payable_type == 1) {
      //Receivable
      whereStr = " AND t2.account_category_id = 1 AND t2.account_category_type_id = 10";
    } else {
      //Payable
      whereStr = " AND t2.account_category_id = 2";
    }

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.account_id, t1.currency_id, t2.plus, t2.minus, concat(t3.account_category_code, "-", t1.account_code, " / ",t1.account) AS "account", convert(t1.account_id, char(50)) as "value", concat(t3.account_category_code, "-", t1.account_code," - ",t1.account) as "label" FROM ${CUS_DB}.account t1 INNER JOIN ${CUS_DB}.account_category_type t2 ON t1.account_category_type_id = t2.account_category_type_id INNER JOIN ${CUS_DB}.account_category t3 ON t2.account_category_id = t3.account_category_id WHERE t1.is_use = 1 AND t1.is_active = 1 && is_header != 1 ` + whereStr;
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
  bbrp_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '', receive_payable_code: '', general_journal_id: '' }, label: 'Data entered successfully' };
    // validation
    // req.assert('receive_payable_id','Account BB RP is required');
    // req.assert('general_journal_id','Generalledger Link is required');
    req.assert('reference', 'PO Number is required');
    req.assert('businesspartner_id', 'Business Partner Order is required');
    req.assert('duedays', 'Due Days is required');
    req.assert('receive_payable_type', 'Account BB RP Type is required');
    req.assert('branch_id', 'Branch is required');
    req.assert('description', 'Description is required');
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('account_id', 'Account is required');
    req.assert('debit', 'Debit is required');
    req.assert('credit', 'credit is required');
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

    if (req.body.receive_payable_type == 1) {
      var general_journal_type_id = 4;
      var description = 'beginning balance receiveale';
    } else {
      var general_journal_type_id = 5;
      var description = 'beginning balance payable';
    }

    var data = {
      reference_code: '',
      general_journal_type_id: general_journal_type_id, //important code
      general_journal_code: '',
      description: description,
      generalledger_period_id: '',
      transaction_date: tsservice.mysqlDate(req.body.transaction_date),
      create_by: req.body.create_by,
      create_datetime: tsservice.mysqlDate(req.body.create_datetime),
      update_by: req.body.create_by,
      update_datetime: tsservice.mysqlDate(req.body.create_datetime),
      is_use: '1',
      is_active: '1'
    };

    var general_journal_id = '';

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
          special_code_id: "RECEIVEPAYABLE",
          table: "receive_payable",
          column_id: "receive_payable_id",
          column_code: "receive_payable_code",
        }

        var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code", (SELECT generalledger_period_id FROM ${CUS_DB}.generalledger_period WHERE generalledger_status_id = 1 AND is_active =1 AND is_use =1 limit 1) as "generalledger_period_id", (${querystrCode}) as "journal_code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;
        //   -SELECT-SPECIAL_CODE   -SELECT-RECEIVE_PAYABLE
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }

          if (rows[0]['code'] && rows[0]['generalledger_period_id']) {

            row.data.receive_payable_code = rows[0]['code'];
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
                var data1 = {
                  general_journal_id: general_journal_id,
                  receive_payable_category_id: 1,
                  reference: req.body.reference,
                  duedays: req.body.duedays,
                  receive_payable_type: req.body.receive_payable_type,
                  businesspartner_id: req.body.businesspartner_id,
                  branch_id: req.body.branch_id,
                  description: req.body.description,
                  create_datetime: tsservice.mysqlDate(req.body.create_datetime),
                  update_by: req.body.create_by,
                  update_datetime: tsservice.mysqlDate(req.body.create_datetime),
                  is_use: '1',
                  is_active: '1'
                };

                tsservice.insertData(data1, function (value) {
                  //   -INSERT-RECEIVE_PAYABLE
                  var query = conn.query(`INSERT INTO ${CUS_DB}.receive_payable` + value, function (err, rows) {

                    if (err) {
                      row.success = false; console.log(err);
                      row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                      conn.rollback(function () {
                         res.send(row); return;
                      });
                    }
                    //update delete
                    var data2 = {
                      general_journal_id: general_journal_id,
                      account_id: req.body.account_id,
                      debit: req.body.debit,
                      credit: req.body.credit,
                      create_by: req.body.create_by,
                      create_datetime: tsservice.mysqlDate(req.body.create_datetime),
                      update_by: req.body.create_by,
                      update_datetime: tsservice.mysqlDate(req.body.create_datetime),
                      is_use: '1',
                      is_active: '1'
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

  },

  //   REST-UPDATE
  bbrp_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('receive_payable_id', 'Account BB RP is required');
    req.assert('general_journal_id', 'Generalledger Link is required');
    req.assert('reference', 'PO Number is required');
    req.assert('businesspartner_id', 'Business Partner Order is required');
    req.assert('duedays', 'Due Days is required');
    req.assert('branch_id', 'Branch is required');
    req.assert('receive_payable_type', 'Account BB RP Type is required');
    req.assert('description', 'Description is required');
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('account_id', 'Account is required');
    req.assert('debit', 'Debit is required');
    req.assert('credit', 'credit is required');
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
          var query = conn.query(`UPDATE ${CUS_DB}.general_journal SET ${value} WHERE general_journal_id =${req.body.general_journal_id} `, function (err, rows) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
              conn.rollback(function () {
                 res.send(row); return;
              });
            }

            var data = {
              reference: req.body.reference,
              duedays: req.body.duedays,
              businesspartner_id: req.body.businesspartner_id,
              branch_id: req.body.branch_id,
              receive_payable_type: req.body.receive_payable_type,
              description: req.body.description,
              update_by: req.body.update_by,
              update_datetime: tsservice.mysqlDate(req.body.update_datetime),
              is_use: req.body.is_use,
              is_active: req.body.is_active
            };

            tsservice.updateData(data, function (value) {
              //   -UPDATE-RECEIVE_PAYBALE
              var query = conn.query(`UPDATE ${CUS_DB}.receive_payable SET ${value} WHERE receive_payable_id =${req.body.receive_payable_id} `, function (err, rows) {

                if (err) {
                  row.success = false; console.log(err);
                  row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
                  conn.rollback(function () {
                     res.send(row); return;
                  });
                }

                var data = {
                  description: req.body.description,
                  update_by: req.body.update_by,
                  update_datetime: tsservice.mysqlDate(req.body.update_datetime),
                  is_use: req.body.is_use,
                  is_active: req.body.is_active
                };

                tsservice.updateData(data, function (value) {
                  //   -UPDATE-RECEIVE_PAYABLE
                  var query = conn.query(`UPDATE ${CUS_DB}.receive_payable SET ${value} WHERE receive_payable_id =${req.body.receive_payable_id} `, function (err, rows) {

                    if (err) {
                      row.success = false; console.log(err);
                      row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
                      conn.rollback(function () {
                         res.send(row); return;
                      });
                    }

                    if ((req.body.debit - req.body.ballance) != 0) {
                      var data2 = {
                        general_journal_id: req.body.general_journal_id,
                        account_id: req.body.account_id,
                        debit: req.body.debit,
                        credit: req.body.credit,
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
                      row.success = false; console.log(err);
                      row.label = 'Debit and ballance not equal to zero';
                      conn.rollback(function () {
                         res.send(row); return;
                      });
                    }

                  });
                });

              });
            });

          });
        });

      });

    });

  },

  //   REST-SELECT
  BbrpBusinessPartner_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    req.assert('receive_payable_type', '');
    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var row = { success: true, data: { businessPartner: [] }, label: 'Data selected successfully' };

    if (req.body.receive_payable_type == 1) {
      var businesspartner_category_id = 2;
    } else {
      var businesspartner_category_id = 3;
    }

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT *, CONVERT(businesspartner_id, char(50)) AS "value", CONCAT(businesspartner_code, " - ", name) AS "label" FROM ${CUS_DB}.businesspartner WHERE is_active =1 AND is_use =1 AND (businesspartner_category_id = 1 OR businesspartner_category_id = "${businesspartner_category_id}")`;
      //   -SELECT-BUSINESSPARTNER
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        row.data.businessPartner = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-SELECT
  BbrpBranch_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { branch: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.branch WHERE is_active =1 AND is_use =1`;
      //   -SELECT-BRANCH
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        row.data.branch = rows;
         res.send(row); return;

      });

    });

  }

}

module.exports = controller;
