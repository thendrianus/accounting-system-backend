var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  getGiroinOptions_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { bankAccount: [], giroinBusinesspartner: [], giroinDepartment: [], project: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, t2.* FROM ${CUS_DB}.account_bank t1 INNER JOIN ${CUS_DB}.account t2 ON t1.account_id = t2.account_id WHERE t1.is_use = 1 AND t1.is_active = 1 AND t2.is_use AND t2.is_active`;
      //   -SELECT-ACCOUNT_BANK   -JOIN-ACCOUNT
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.bankAccount = rows;

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

  },

  //   REST-INSERT
  giroin_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '', giroin_code: '', general_journal_id: '' }, label: 'Data entered successfully' };
    // validation
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('efective_begin', 'Transaction Date is required');
    req.assert('efective_end', 'Transaction Date is required');
    req.assert('account_id', 'Generalledger Period Id is required');
    req.assert('status_id', 'Generalledger Period Id is required');
    req.assert('giro_no', 'Deparment Id is required');
    req.assert('nominal', 'Deparment Id is required');
    req.assert('giro_from', 'Deparment Id is required');
    req.assert('giro_bank', 'Deparment Id is required');
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

    var giroin_code = "";
    var general_journal_id = "";
    var generalledger_id = "";

    var data = {
      general_journal_code: '',
      reference_code: '',
      general_journal_type_id: '12', //important code
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
          special_code_id: "GIROIN",
          table: "giroin",
          column_id: "giroin_id",
          column_code: "giroin_code",
        }

        var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code", (SELECT generalledger_period_id FROM ${CUS_DB}.generalledger_period WHERE is_use = 1 AND is_active = 1 ORDER BY update_datetime DESC LIMIT 1) as "generalledger_period_id", (SELECT account_id FROM ${CUS_DB}.account_linked WHERE is_use = 1 AND is_active = 1 AND account_link_id = 14 LIMIT 1) as "account_id" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`; // --account_link_id 14
        //   -SELECT-SPECIAL_CODE   -SELECT-GIROIN
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }

          if (rows[0]['code'] && rows[0]['generalledger_period_id'] && rows[0]['account_id']) {

            giroin_code = rows[0]['code'];
            data.reference_code = giroin_code;
            data.generalledger_period_id = rows[0]['generalledger_period_id'];

            var data2 = {
              general_journal_id: "",
              account_id: rows[0]['account_id'],
              debit: 0,
              credit: req.body.nominal,
              create_by: req.body.create_by,
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
                      conn.rollback(function () {
                         res.send(row); return;
                      });
                    }
                    general_journal_id = rows.insertId;
                    data2.general_journal_id = general_journal_id;

                    if (req.body.status_id == 2) {
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
                          data2.debit = req.body.nominal;
                          data2.credit = 0;
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

                              continues(req, giroin_code, general_journal_id, conn);

                            });
                          });

                        });
                      });
                    } else {
                      continues(req, giroin_code, general_journal_id, conn);
                    }

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
            conn.rollback(function () {
               res.send(row); return;
            });
          }

        });

      });

    });

    function continues(req, giroin_code, general_journal_id, conn) {

      const CUS_DB = req.body.company_db;

      var data = {
        giroin_code: giroin_code,
        general_journal_id: general_journal_id,
        account_id: req.body.account_id,
        status_id: req.body.status_id,
        efective_begin: tsservice.mysqlDate(req.body.efective_begin),
        efective_end: tsservice.mysqlDate(req.body.efective_end),
        giro_no: req.body.giro_no,
        nominal: req.body.nominal,
        giro_from: req.body.giro_from,
        giro_bank: req.body.giro_bank,
        project_id: req.body.project_id,
        description: req.body.description,
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
          //   -INSERT-GIROIN
          var query = conn.query(`INSERT INTO ${CUS_DB}.giroin` + value, function (err, rows) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
              conn.rollback(function () {
                 res.send(row); return;
              });
            }
            row.data.lastId = rows.insertId;
            row.data.giroin_code = giroin_code;
            row.data.general_journal_id = general_journal_id;
            conn.commit(function (err) {
               res.send(row); return;
            });

          });
        });

      });

    }

  },

  //   REST-UPDATE
  giroin_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('giroin_id', 'Journal Id is required');
    req.assert('giroin_code', 'Journal Code/No is required');
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('efective_begin', 'Transaction Date is required');
    req.assert('efective_end', 'Transaction Date is required');
    req.assert('account_id', 'Generalledger Period Id is required');
    req.assert('general_journal_id', 'Generalledger Link is required');
    req.assert('status_id', 'Generalledger Period Id is required');
    req.assert('old_status_id', 'Generalledger Period Id is required');
    req.assert('giro_no', 'Deparment Id is required');
    req.assert('nominal', 'Deparment Id is required');
    req.assert('giro_from', 'Deparment Id is required');
    req.assert('giro_bank', 'Deparment Id is required');
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

    // update data table giroin
    var data = {
      giroin_code: req.body.giroin_code,
      general_journal_id: req.body.general_journal_id,
      account_id: req.body.account_id,
      status_id: req.body.status_id,
      efective_begin: tsservice.mysqlDate(req.body.efective_begin),
      efective_end: tsservice.mysqlDate(req.body.efective_end),
      giro_no: req.body.giro_no,
      nominal: req.body.nominal,
      giro_from: req.body.giro_from,
      giro_bank: req.body.giro_bank,
      project_id: req.body.project_id,
      description: req.body.description,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(req.body.update_datetime),
      is_use: req.body.is_use,
      is_active: req.body.is_active
    };

    // update general ledger link
    var data2 = {
      reference_code: req.body.giroin_code,
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

        var myfireStr = `SELECT account_id FROM ${CUS_DB}.account_linked WHERE is_use = 1 AND is_active = 1 AND account_link_id = 14 LIMIT 1`; // --account_link_id 14
        //   -SELECT-ACCOUNT_LINKED
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }

          if (rows[0]['account_id']) {

            var data3 = {
              general_journal_id: "",
              account_id: rows[0]['account_id'],
              debit: 0,
              credit: req.body.nominal,
              create_by: req.body.create_by,
              create_datetime: tsservice.mysqlDate(req.body.create_datetime),
              update_by: req.body.create_by,
              update_datetime: tsservice.mysqlDate(req.body.create_datetime),
              is_use: '1', is_active: '1'
            };

            if (req.body.status_id == 2 && req.body.old_status_id != 2) {
              tsservice.insertData(data3, function (value) {
                //   -INSERT-GENERALLEDGER
                var query = conn.query(`INSERT INTO ${CUS_DB}.general_journal` + value, function (err, rows) {

                  if (err) {
                    row.success = false; console.log(err);
                    row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                    conn.rollback(function () {
                       res.send(row); return;
                    });
                  }
                  data3.debit = req.body.nominal;
                  data3.credit = 0;
                  data3.account_id = req.body.account_id;

                  tsservice.insertData(data3, function (value) {
                    //   -INSERT-GENERALLEDGER
                    var query = conn.query(`INSERT INTO ${CUS_DB}.general_journal` + value, function (err, rows) {

                      if (err) {
                        row.success = false; console.log(err);
                        row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                        conn.rollback(function () {
                           res.send(row); return;
                        });
                      }

                      continues(req, conn);

                    });
                  });

                });
              });
            } else {
              continues(req, conn);
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

    function continues(req, conn) {

      const CUS_DB = req.body.company_db;
      
      tsservice.updateData(data, function (value) {
        //   -UPDATE-GIROIN
        var query = conn.query(`UPDATE ${CUS_DB}.giroin SET ${value} WHERE giroin_id =${req.body.giroin_id} `, function (err, rows) {

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

    }

  },

  //   REST-SELECT
  giroinSearch_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { giroin: [] }, label: 'Data selected successfully' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, t1.status_id as "old_status_id" , t2.generalledger_period_id, t2.transaction_date FROM ${CUS_DB}.giroin t1 INNER JOIN ${CUS_DB}.general_journal t2 ON t1.general_journal_id = t2.general_journal_id WHERE t1.is_use = 1 AND t1.is_active = 1`;

      //   -SELECT-GIROIN   -JOIN-GENERAL_JOURNAL
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.giroin = rows;
         res.send(row); return;
      });

    });

  }
}

module.exports = controller;