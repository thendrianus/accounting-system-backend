var tsservice = require('./../../tsservice');
var async = require('async');
const controller = {
  //   REST-SELECT
  getFix_assetOptions_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { warehouseList: [], branchList: [], fix_asset_groupList: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.warehouse WHERE is_use = 1 AND is_active = 1`;
      //   -SELECT-WAREHOUSE
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.warehouseList = rows;

        var myfireStr = `SELECT * FROM ${CUS_DB}.branch WHERE is_use = 1 AND is_active = 1`;
        //   -SELECT-BRANCH
        var query = conn.query(myfireStr, function (err, rows) {
          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.branchList = rows;

          var myfireStr = `SELECT * FROM ${CUS_DB}.fix_asset_group WHERE is_use = 1 AND is_active = 1`;
          //   -SELECT-FIX_ASSET_GROUP
          var query = conn.query(myfireStr, function (err, rows) {
            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
               res.send(row); return;
            }
            row.data.fix_asset_groupList = rows;

             res.send(row); return;

          });

        });

      });

    });

  },

  //   REST-INSERT 
  fix_asset_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '', fix_asset_code: '' }, label: 'Data entered successfully' };
    // validation
    req.assert('fix_asset_group_id', 'Generalledger Period Id is required');
    req.assert('inventory_id', 'Generalledger Period Id is required');
    req.assert('warehouse_id', 'Generalledger Period Id is required');
    req.assert('branch_id', 'Generalledger Period Id is required');
    req.assert('label', 'Deparment Id is required');
    req.assert('buying_date', 'Deparment Id is required');
    req.assert('price', 'Deparment Id is required');
    req.assert('currency_id', 'Deparment Id is required');
    req.assert('residue', 'Deparment Id is required');
    req.assert('rate', 'Deparment Id is required');
    req.assert('life_time', 'Deparment Id is required');
    req.assert('depreciation_method_id', 'Deparment Id is required');
    req.assert('description', 'Description is required');
    req.assert('status_id', 'Description is required');
    req.assert('create_by', 'Created by is required');
    req.assert('create_datetime', 'Create date and time is required');
    req.assert('is_use', 'Used data is required');
    req.assert('is_active', 'Active data is required');
    req.assert('account_id', 'Active data is required');
    req.assert('depreciation_id', 'Active data is required');
    req.assert('acumulated_id', 'Active data is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var fix_asset_code = "";
    var general_journal_id = "";
    var generalledger_period_id = "";

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {

        var data1 = {
          general_journal_code: '',
          reference_code: '',
          general_journal_type_id: '14', //important code
          description: 'Generated',
          generalledger_period_id: '',
          transaction_date: tsservice.mysqlDate(req.body.update_datetime),
          create_by: req.body.update_by,
          create_datetime: tsservice.mysqlDate(req.body.update_datetime),
          update_by: req.body.update_by,
          update_datetime: tsservice.mysqlDate(req.body.update_datetime),
          is_use: '1', is_active: '1'
        };

        var codeData = {
          special_code_id: "FIXASSET",
          table: "fix_asset",
          column_id: "fix_asset_id",
          column_code: "fix_asset_code",
        }

        var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code", (SELECT generalledger_period_id FROM ${CUS_DB}.generalledger_period WHERE is_use = 1 AND is_active = 1 ORDER BY update_datetime DESC LIMIT 1) as "generalledger_period_id" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;
        //   -SELECT-SPECIAL_CODE   -SELECT-FIX_ASSET
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }

          if (rows[0]['code'] && rows[0]['generalledger_period_id']) {

            fix_asset_code = rows[0]['code'];
            generalledger_period_id = rows[0]['generalledger_period_id'];
            data1.reference_code = fix_asset_code;
            data1.generalledger_period_id = rows[0]['generalledger_period_id'];

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
                data1.general_journal_code = rows[0]['code'];
                tsservice.insertData(data1, function (value) {
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

                    var myfireStr = `SELECT * FROM ${CUS_DB}.generalledger_period WHERE is_use = 1 AND is_active = 1 AND (generalledger_status_id = 1 OR generalledger_status_id = 3) ORDER BY generalledger_period_id ASC`;
                    //   -SELECT-GENERALLEDGER_PERIOD
                    var query = conn.query(myfireStr, function (err, rows) {

                      if (err) {
                        row.success = false; console.log(err);
                        row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
                        conn.rollback(function () {
                           res.send(row); return;
                        });
                      }

                      var generalledgerPeriodList = rows;

                      var nominalDepreciation = 0;

                      if (req.body.depreciation_method_id == 1) {
                        //PENYUSUTAN = (NILAI PEROLEHAN - NILAI RESIDU) / UMUR EKONOMIS DLM BENTUK BULAN
                        nominalDepreciation = (req.body.price - req.body.residue) / req.body.life_time;

                      } else {
                        nominalDepreciation = ((200 / 100) / req.body.life_time) * req.body.price - req.body.residue;
                      }

                      var querystr = "";

                      async.forEach(generalledgerPeriodList, function (item, callback) {

                        if (querystr != "") {
                          querystr += ', ';
                        }

                        if (req.body.isreturn == 1) {
                          item.ordered = item.ordered * -1;
                          item.orderedeqv = item.orderedeqv * -1;
                        }

                        //DEPRESIOTION == DEBIT
                        querystr += '(1, "' + general_journal_id + '", "' + item.generalledger_period_id + '", 0, "' + req.body.depreciation_id + '", ' + nominalDepreciation + ', 0, 0, 0, "FIX ASSET", "' + req.body.update_by + '", "' + tsservice.mysqlDate(req.body.update_datetime) + '", "' + req.body.update_by + '", "' + tsservice.mysqlDate(req.body.update_datetime) + '", 1 , 1)';

                        //ACCUMULATION == CREDIT
                        querystr += ',(1, "' + general_journal_id + '", "' + item.generalledger_period_id + '", 0, "' + req.body.acumulated_id + '", 0, 0, ' + nominalDepreciation + ', 0, "FIX ASSET", "' + req.body.update_by + '", "' + tsservice.mysqlDate(req.body.update_datetime) + '", "' + req.body.update_by + '", "' + tsservice.mysqlDate(req.body.update_datetime) + '", 1 , 1)';

                        callback();

                      }, function (err) {

                        if (err) {
                          row.success = false; console.log(err);
                          row.label = 'Server failed prosess data. try again or contact our IT support';
                          conn.rollback(function () {
                             res.send(row); return;
                          });
                        }

                        if (querystr != "") {
                          var myfireStr = `INSERT INTO ${CUS_DB}.generalledger_pending( pending_category_id, general_journal_id, generalledger_period_id, status_id, account_id, debit, debiteqv, credit, crediteqv, description, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + querystr;

                          //   -INSERT-GENERALLEDGER_PENDING
                          var query = conn.query(myfireStr, function (err, rows) {

                            if (err) {
                              row.success = false; console.log(err);
                              row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
                              conn.rollback(function () {
                                 res.send(row); return;
                              });
                            }
                            continues(req, fix_asset_code, general_journal_id, conn);

                          });
                        }

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
            row.success = false; console.log(err);
            row.label = 'Failed to select important code. Please contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }

        });

      });

    });


    function continues(req, fix_asset_code, general_journal_id, conn) {

      const CUS_DB = req.body.company_db;
      
      var data = {
        fix_asset_code: fix_asset_code,
        depreciation_method_id: req.body.depreciation_method_id,
        // inventory_id: req.body.inventory_id,
        label: req.body.label,
        fix_asset_group_id: req.body.fix_asset_group_id,
        general_journal_id: general_journal_id,
        // buying_date: req.body.buying_date,
        // price: req.body.price,
        // currency_id: req.body.currency_id,
        residue: req.body.residue,
        rate: req.body.rate,
        life_time: req.body.life_time,
        warehouse_id: req.body.warehouse_id,
        branch_id: req.body.branch_id,
        description: req.body.description,
        status_id: 1,
        update_by: req.body.update_by,
        update_datetime: tsservice.mysqlDate(req.body.update_datetime),
        is_use: '1', is_active: '1'
      };

      tsservice.updateData(data, function (value) {
        //   -UPDATE-FIX_ASSET
        var query = conn.query(`UPDATE ${CUS_DB}.fix_asset SET ${value} WHERE fix_asset_id =${req.body.fix_asset_id} `, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }

          row.data.fix_asset_code = fix_asset_code;
          conn.commit(function (err) {
             res.send(row); return;
          });

        });
      });

    }

  },

  //   REST-SELECT
  fix_assetSearch_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { fix_asset: [] }, label: 'Data selected successfully' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, t2.name as"inventory_name" FROM ${CUS_DB}.fix_asset t1 INNER JOIN ${CUS_DB}.inventory t2 ON t1.inventory_id = t2.inventory_id WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.status_id = 1`;
      //   -SELECT-FIX_ASSET   -JOIN-INVENTORY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.fix_asset = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-SELECT
  fix_assetSearch2_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { fix_asset: [] }, label: 'Data selected successfully' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = 'SELECT t1.*, t2.name as"inventory_name" FROM ${CUS_DB}.fix_asset t1 INNER JOIN ${CUS_DB}.inventory t2 ON t1.inventory_id = t2.inventory_id WHERE  t1.is_use = 1 AND t1.is_active = 1 AND t1.status_id = 0';
      //   -SELECT-FIX_ASSET   -JOIN-INVENTORY
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.fix_asset = rows;
         res.send(row); return;
      });

    });

  }
}

module.exports = controller;