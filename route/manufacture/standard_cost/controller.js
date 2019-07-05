var tsservice = require('./../../tsservice');
var async = require('async');

const controller = {
  //   REST-SELECT
  standard_costselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { standard_cost: [] }, label: 'Berhasil' };

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
        var strwhere = "is_use = 1 AND";
      }

      var myfireStr = `SELECT *, "[]" as "standard_cost_detail", DATE_FORMAT(effective_date, "%d %M %Y") as "effective_date_show" FROM ${CUS_DB}.standard_cost WHERE ${strwhere} is_active = 1`;

      //   -SELECT-STANDARD_COST
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.standard_cost = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-INSERT
  standard_cost_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { standard_cost_id: '', branch_id: '', standard_cost_code: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('effective_date', '');
    req.assert('standard_cost_detail', '');
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
          special_code_id: "STANDARD_COST",
          table: "standard_cost",
          column_id: "standard_cost_id",
          column_code: "standard_cost_code",
        }

        var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

        //   -SELECT-SPECIAL_CODE   -SELECT-STANDARD_COST
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }

          if (rows[0]['code']) {

            row.data.standard_cost_code = rows[0]['code'];
            var data = {
              standard_cost_code: rows[0]['code'],
              effective_date: tsservice.mysqlDate(req.body.effective_date),
              description: req.body.description,
              create_by: req.body.create_by,
              update_by: req.body.update_by,
              create_datetime: tsservice.mysqlDate(),
              update_datetime: tsservice.mysqlDate(),
              is_use: '1',
              is_active: '1'
            };

            tsservice.insertData(data, function (value) {
              //   -INSERT-STANDARD_COST
              var query = conn.query(`INSERT INTO ${CUS_DB}.standard_cost` + value, function (err, rows) {

                if (err) {
                  row.success = false; console.log(err);
                  row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                  conn.rollback(function () {
                     res.send(row); return;
                  });
                }
                row.data.standard_cost_id = rows.insertId;

                var querystr = "";
                async.forEach(req.body.standard_cost_detail, function (item, callback) {

                  if (item.is_active == 1) {
                    if (querystr != "") {
                      querystr += ', ';
                    }
                    querystr += '("' + row.data.standard_cost_id + '", "' + item.conversion_cost_id + '", "' + item.new_cost + '", "' + item.uom + '",  "' + item.currency_id + '", "' + item.description + '","' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '", 1, 1)';
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

                    var myfireStr = `INSERT INTO ${CUS_DB}.standard_cost_detail( standard_cost_id, conversion_cost_id, new_cost, uom, currency_id, description, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + querystr;

                    //   -INSERT-STANDARD_COST_DETAIL
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
  standard_cost_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('standard_cost_id', 'Conversion Cost is required');
    req.assert('standard_cost_code', 'Conversion Cost Code / No is required');
    req.assert('standard_cost_detail', '');
    req.assert('effective_date', '');
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
      standard_cost_code: req.body.standard_cost_code,
      effective_date: tsservice.mysqlDate(req.body.effective_date),
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
        //   -UPDATE-STANDARD_COST
        var query = conn.query(`UPDATE ${CUS_DB}.standard_cost SET ${value} WHERE standard_cost_id =${req.body.standard_cost_id} `, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.lastId = rows.insertId;

          var querystr = "";
          async.forEach(req.body.standard_cost_detail, function (item, callback) {

            if (item.is_active == 1) {

              var myfireStr = `UPDATE ${CUS_DB}.standard_cost_detail SET standard_cost_id = "${req.body.standard_cost_id}", conversion_cost_id = "${item.conversion_cost_id}", new_cost = "${item.new_cost}", uom = "${item.uom}", currency_id = "${item.currency_id}", description = "${item.description}", create_by = "${req.body.create_by}", create_datetime = "${req.body.create_datetime}", update_by = "${req.body.update_by}", update_datetime ="${req.body.update_datetime}", is_active = "${req.body.is_active}", is_use = "${req.body.is_use}" WHERE standard_cost_detail_id = "${item.standard_cost_detail_id}"`;

              //   -UPDATE-STANDARD_COST_DETAIL
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

  //   REST-SELECT
  standard_cost_detail_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { standard_cost_detail: [] }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('standard_cost_id', '');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, t2.conversion_cost, t2.conversion_cost_code, t2.conversion_cost, CONVERT(t1.standard_cost_detail_id, char(50)) AS "value", CONCAT(t2.conversion_cost_code, " - ", t2.conversion_cost) AS "label" FROM ${CUS_DB}.standard_cost_detail t1 INNER JOIN ${CUS_DB}.conversion_cost t2 ON t1.conversion_cost_id = t2.conversion_cost_id WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.standard_cost_id = "${req.body.standard_cost_id}"`;

      //   -SELECT-STANDARD_COST_DETAIL   -JOIN-CONVERSION_COST
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.standard_cost_detail = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-SELECT
  standard_cost_detail_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { standard_cost_detail: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, t2.conversion_cost_code, t2.conversion_cost, CONVERT(t1.standard_cost_detail_id, char(50)) AS "value", CONCAT(t2.conversion_cost_code, " - ", t2.conversion_cost) AS "label" FROM ${CUS_DB}.standard_cost_detail t1 INNER JOIN ${CUS_DB}.conversion_cost t2 ON t1.conversion_cost_id = t2.conversion_cost_id WHERE t1.is_use = 1 AND t1.is_active = 1`;

      //   -SELECT-STANDARD_COST_DETAIL   -JOIN-CONVERSION_COST
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.standard_cost_detail = rows;
         res.send(row); return;

      });

    });

  }
}

module.exports = controller;