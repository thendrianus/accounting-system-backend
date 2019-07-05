var tsservice = require('./../../tsservice');

const controller = {
  //   REST-INSERT
  reconciliation_bank_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '', reconciliation_bank_code: '', general_journal_id: '' }, label: 'Data entered successfully' };
    // validation
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('account_id', 'Generalledger Period Id is required');
    req.assert('reference', 'Deparment Id is required');
    req.assert('nominal', 'Deparment Id is required');
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

    var reconciliation_bank_code = "";
    var general_journal_id = "";
    var generalledger_id = "";

    var data = {
      general_journal_code: '',
      reference_code: '',
      general_journal_type_id: '8', //important code
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
          special_code_id: "REBANK",
          table: "reconciliation_bank",
          column_id: "reconciliation_bank_id",
          column_code: "reconciliation_bank_code",
        }

        var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code", (SELECT generalledger_period_id FROM ${CUS_DB}.generalledger_period WHERE is_use = 1 AND is_active = 1 ORDER BY update_datetime DESC LIMIT 1) as "generalledger_period_id", (SELECT SUM(debit-credit) FROM ${CUS_DB}.generalledger WHERE is_active = 1 AND account_id = ${req.body.account_id}) as "debitMinCredit", (SELECT account_id FROM ${CUS_DB}.account_linked WHERE is_use = 1 AND is_active = 1 AND account_link_id = 13 LIMIT 1) as "account_id" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`; // --account_link_id 13

        //   -SELECT-SPECIAL_CODE   -SELECT-RECONCILIATION_BANK
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }

          if (rows[0]['code'] && rows[0]['generalledger_period_id'] && rows[0]['account_id']) {

            reconciliation_bank_code = rows[0]['code'];
            data.reference_code = reconciliation_bank_code;
            data.generalledger_period_id = rows[0]['generalledger_period_id'];

            var data2 = {
              general_journal_id: "",
              account_id: rows[0]['account_id'],
              debit: 0,
              credit: 0,
              create_by: req.body.create_by,
              create_datetime: tsservice.mysqlDate(req.body.create_datetime),
              update_by: req.body.create_by,
              update_datetime: tsservice.mysqlDate(req.body.create_datetime),
              is_use: '1', is_active: '1'
            };

            var debitParam = 0;
            var creditParam = 0;

            if (rows[0]['debitMinCredit'] != null && rows[0]['debitMinCredit'] != req.body.nominal) {
              var margin = req.body.nominal - rows[0]['debitMinCredit'];

              if (margin < 0) {
                data2.debit = margin;
                creditParam = margin;
                //if debit - credit = < 0 thats mean debit to reconciliation account
              } else {
                data2.credit = margin;
                debitParam = margin;
                //if debit - credit = > 0 thats mean credit to reconciliation account
              }

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
                  //   -INSERT-GENERAL_JOURNAL
                  tsservice.insertData(data, function (value) {
                    var query = conn.query(`INSERT INTO ${CUS_DB}.general_journal` + value, function (err, rows) {

                      if (err) {
                        row.success = false; console.log(err);
                        row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                        conn.rollback(function () {
                           res.send(row); return;
                        });
                      }
                      general_journal_id = rows.insertId;
                      data2.general_journal_id = general_journal_id;

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

                          data2.debit = debitParam;
                          data2.credit = creditParam;
                          data2.account_id = req.body.account_id;

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

                              continues(req, reconciliation_bank_code, general_journal_id, conn);

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

            } else {
              row.success = true;
              row.label = 'No need to Reconcile';
              conn.rollback(function () {
                 res.send(row); return;
              });
            }

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

    function continues(req, reconciliation_bank_code, general_journal_id, conn) {

      const CUS_DB = req.body.company_db;
      
      var data = {
        reconciliation_bank_code: reconciliation_bank_code,
        general_journal_id: general_journal_id,
        account_id: req.body.account_id,
        reference: req.body.reference,
        nominal: req.body.nominal,
        description: req.body.description,
        create_by: req.body.create_by,
        create_datetime: tsservice.mysqlDate(req.body.create_datetime),
        update_by: req.body.create_by,
        update_datetime: tsservice.mysqlDate(req.body.create_datetime),
        is_use: '1', is_active: '1'
      };

      tsservice.insertData(data, function (value) {
        //   -INSERT-RECONCILIATION_BANK
        var query = conn.query(`INSERT INTO ${CUS_DB}.reconciliation_bank` + value, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }
          row.data.lastId = rows.insertId;
          row.data.reconciliation_bank_code = reconciliation_bank_code;
          row.data.general_journal_id = general_journal_id;
          conn.commit(function (err) {
             res.send(row); return;
          });

        });
      });

    }

  },

  //   REST-UPDATE
  reconciliation_bank_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('reconciliation_bank_id', 'Journal Id is required');
    req.assert('reconciliation_bank_code', 'Journal Code/No is required');
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('account_id', 'Generalledger Period Id is required');
    req.assert('general_journal_id', 'Generalledger Link is required');
    req.assert('reference', 'Deparment Id is required');
    req.assert('nominal', 'Deparment Id is required');
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

    // update data table reconciliation_bank
    var data = {
      reconciliation_bank_code: req.body.reconciliation_bank_code,
      general_journal_id: req.body.general_journal_id,
      account_id: req.body.account_id,
      reference: req.body.reference,
      nominal: req.body.nominal,
      description: req.body.description,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(req.body.update_datetime),
      is_use: req.body.is_use,
      is_active: req.body.is_active
    };

    // update general ledger link
    var data2 = {
      reference_code: req.body.reconciliation_bank_code,
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

      tsservice.updateData(data, function (value) {
        //   -UPDATE-RECONCILIATION_BANK
        var query = conn.query(`UPDATE ${CUS_DB}.reconciliation_bank SET ${value} WHERE reconciliation_bank_id =${req.body.reconciliation_bank_id} `, function (err, rows) {

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
  reconciliation_bankSearch_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { reconciliation_bank: [] }, label: 'Data selected successfully' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.* , t2.generalledger_period_id, t2.transaction_date FROM ${CUS_DB}.reconciliation_bank t1 INNER JOIN ${CUS_DB}.general_journal t2 ON t1.general_journal_id = t2.general_journal_id WHERE t1.is_use = 1 AND t1.is_active = 1`;

      //   -SELECT-RECONCILIATION_BANK   -JOIN-GENERAL_JOURNAL
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.reconciliation_bank = rows;
         res.send(row); return;
      });

    });


  }

}

module.exports = controller;