var tsservice = require('./../../tsservice');
var async = require('async');

const controller = {
  //   REST-SELECT
  product_resultselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { product_result: [] }, label: 'Berhasil' };

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
      var myfireStr = `SELECT t1.*, "[]" as "product_result_detail", t2.warehouse, DATE_FORMAT(t1.release_date, "%d %M %Y") as "release_date_show" FROM ${CUS_DB}.product_result t1 INNER JOIN ${CUS_DB}.warehouse t2 ON t1.warehouse_id = t2.warehouse_id WHERE ${strwhere} t1.is_active = 1`;

      //   -SELECT-PRODUCT_RESULT
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.product_result = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-SELECT
  product_resultselect_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { inventory: [] }, label: 'Berhasil' };

    req.assert('work_order_id', 'work_order_id data is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, t2.inventory_id, t3.name as "inventory", t3.inventory_code, CONVERT(t2.inventory_id, char(50)) AS "value", CONCAT(t3.inventory_code, " - ", t3.name) AS "label", t3.uom1 FROM ${CUS_DB}.work_order_detail t1 INNER JOIN ${CUS_DB}.bom t2 ON t1.bom_id = t2.bom_id INNER JOIN ${CUS_DB}.inventory t3 ON t2.inventory_id = t3.inventory_id WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.work_order_id = ${req.body.work_order_id}`;

      //   -SELECT-WORK_ORDER_DETAIL   -JOIN-INVENTORY   -JOIN-BOM
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.inventory = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-INSERT
  product_result_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { product_result_id: '', branch_id: '', product_result_code: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('release_date', '');
    req.assert('product_result_detail', '');
    req.assert('work_order_id', 'Description is required');
    req.assert('warehouse_id', 'Description is required');
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

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {

        var codeData = {
          special_code_id: "PRODUCT_RESULT",
          table: "product_result",
          column_id: "product_result_id",
          column_code: "product_result_code",
        }

        var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

        //   -SELECT-SPECIAL_CODE   -SELECT-PRODUCT_RESUTL
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }

          if (rows[0]['code']) {

            row.data.product_result_code = rows[0]['code'];

            var data = {
              product_result_code: rows[0]['code'],
              release_date: tsservice.mysqlDate(req.body.release_date),
              work_order_id: req.body.work_order_id,
              warehouse_id: req.body.warehouse_id,
              description: req.body.description,
              create_by: req.body.create_by,
              update_by: req.body.update_by,
              create_datetime: tsservice.mysqlDate(),
              update_datetime: tsservice.mysqlDate(),
              is_use: '1',
              is_active: '1'
            };

            tsservice.insertData(data, function (value) {
              //   -INSERT-PRODUCT_RESULT
              var query = conn.query(`INSERT INTO ${CUS_DB}.product_result` + value, function (err, rows) {

                if (err) {
                  row.success = false; console.log(err);
                  row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                  conn.rollback(function () {
                     res.send(row); return;
                  });
                }
                row.data.product_result_id = rows.insertId;

                var querystr = "";
                async.forEach(req.body.product_result_detail, function (item, callback) {

                  if (item.is_active == 1) {
                    if (querystr != "") {
                      querystr += ', ';
                    }
                    querystr += '("' + row.data.product_result_id + '", "' + item.inventory_id + '", "' + item.quantity + '", "' + item.uom + '", "' + item.description + '","' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '", 1, 1)';
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

                  if (querystr != "") {

                    var myfireStr = `INSERT INTO ${CUS_DB}.product_result_detail( product_result_id, inventory_id, quantity, uom, description, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + querystr;

                    //   -INSERT-PRODUCT_RESULT_DETAIL
                    var query = conn.query(myfireStr, function (err, rows) {

                      if (err) {
                        row.success = false; console.log(err);
                        row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                        conn.rollback(function () {
                           res.send(row); return;
                        });
                      }
                      conn.commit(function (err) {
                         res.send(row); return;
                      });

                    });
                  } else {
                    conn.rollback(function () {
                       res.send(row); return;
                    });
                  }

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
  product_result_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('product_result_id', 'Conversion Inventory is required');
    req.assert('product_result_code', 'Conversion Inventory Code / No is required');
    req.assert('product_result_detail', '');
    req.assert('release_date', '');
    req.assert('work_order_id', 'Description is required');
    req.assert('warehouse_id', 'Description is required');
    req.assert('description', 'Description is required');
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
      product_result_code: req.body.product_result_code,
      release_date: tsservice.mysqlDate(req.body.release_date),
      work_order_id: req.body.work_order_id,
      warehouse_id: req.body.warehouse_id,
      description: req.body.description,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(),
      is_use: req.body.is_use,
      is_active: req.body.is_active,
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-PRODUCT_RESULT
        var query = conn.query(`UPDATE ${CUS_DB}.product_result SET ${value} WHERE product_result_id =${req.body.product_result_id} `, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.lastId = rows.insertId;

          var querystr = "";
          async.forEach(req.body.product_result_detail, function (item, callback) {

            if (item.is_active == 1) {

              var myfireStr = `UPDATE ${CUS_DB}.product_result_detail SET product_result_id = "${req.body.product_result_id}", inventory_id = "${item.inventory_id}", quantity = "${item.quantity}", uom = "${item.uom}", description = "${item.description}", create_by = "${req.body.create_by}", create_datetime = "${req.body.create_datetime}", update_by = "${req.body.update_by}", update_datetime ="${req.body.update_datetime}", is_active = "${req.body.is_active}", is_use = "${req.body.is_use}" WHERE product_result_detail_id = "${item.product_result_detail_id}"`;

              //   -UPDATE-PRODUCT_RESULT_DETAIL
              var query = conn.query(myfireStr, function (err, rows) {

                if (err) {
                  row.success = false; console.log(err);
                  row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
                   res.send(row); return;
                }

              });

            }
            callback();

          }, function (err) {
            if (err) {
              row.success = false; console.log(err);
              row.label = 'Server failed prosess data. try again or contact our IT support';
               res.send(row); return;
            }

             res.send(row); return;

          });
        });
      });

    });

  },

  //   REST-INSERT
  product_result_detail_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { product_result_detail: [] }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('product_result_id', '');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, t2.name as "inventory", t2.*, t3.rate FROM ${CUS_DB}.product_result_detail t1 INNER JOIN ${CUS_DB}.inventory t2 ON t1.inventory_id = t2.inventory_id INNER JOIN ${CUS_DB}.currencies t3 ON t3.currency_id = t2.currency_id WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.product_result_id = "${req.body.product_result_id}"`;

      //   -SELECT-PRODUCT_RESULT_DETAIL   -JOIN-INVENTORY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.product_result_detail = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-SELECT
  product_result_detail_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { product_result_detail: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.* , t2.* , t2.name AS "inventory" FROM ${CUS_DB}.product_result_detail t1 INNER JOIN ${CUS_DB}.inventory t2 ON t1.inventory_id = t2.inventory_id WHERE t1.is_use = 1 AND t1.is_active = 1`;

      //   -SELECT-PRODUCT_RESULT_DETAIL   -JOIN-INVENTORY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.product_result_detail = rows;
         res.send(row); return;

      });

    });

  }
}

module.exports = controller;