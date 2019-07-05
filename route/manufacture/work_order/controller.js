var tsservice = require('./../../tsservice');
var async = require('async');

const controller = {
  //   REST-SELECT
  work_orderselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { work_order: [] }, label: 'Berhasil' };

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

      var myfireStr = `SELECT t1.*, "[]" as "work_order_detail", DATE_FORMAT(t1.start_date, "%d %M %Y") as "start_date_show", DATE_FORMAT(t1.expected_date, "%d %M %Y") as "expected_date_show",CONVERT(t1.work_order_id, char(50)) AS "value", CONCAT(t1.work_order_code, " - ", t2.firstname, " ", t2.lastname) AS "label" FROM ${CUS_DB}.work_order t1 INNER JOIN ${CUS_DB}.employee t2 ON t2.employee_id = t1.pic WHERE ${strwhere} t1.is_active = 1`;

      //   -SELECT-WORK_ORDER
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.work_order = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-INSERT
  work_order_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { work_order_id: '', branch_id: '', work_order_code: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('start_date', '');
    req.assert('expected_date', '');
    req.assert('pic', '');
    req.assert('department_id', '');
    req.assert('work_order_detail', '');
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
          special_code_id: "WORKORDER",
          table: "work_order",
          column_id: "work_order_id",
          column_code: "work_order_code",
        }

        var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

        //   -SELECT-SPECIAL_CODE   -SELECT-WORK_ORDER
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';

          }

          if (rows[0]['code']) {

            row.data.work_order_code = rows[0]['code'];
            var data = {
              work_order_code: rows[0]['code'],
              start_date: tsservice.mysqlDate(req.body.start_date),
              expected_date: tsservice.mysqlDate(req.body.expected_date),
              pic: req.body.pic,
              department_id: req.body.department_id,
              description: req.body.description,
              create_by: req.body.create_by,
              update_by: req.body.update_by,
              create_datetime: tsservice.mysqlDate(),
              update_datetime: tsservice.mysqlDate(),
              is_use: '1',
              is_active: '1'
            };

            tsservice.insertData(data, function (value) {
              //   -INSERT-WORK_ORDER
              var query = conn.query(`INSERT INTO ${CUS_DB}.work_order` + value, function (err, rows) {

                if (err) {
                  row.success = false; console.log(err);
                  row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                  conn.rollback(function () {
                     res.send(row); return;
                  });
                }
                row.data.work_order_id = rows.insertId;

                var querystr = "";
                async.forEach(req.body.work_order_detail, function (item, callback) {

                  if (item.is_active == 1) {
                    if (querystr != "") {
                      querystr += ', ';
                    }
                    querystr += '("' + row.data.work_order_id + '", "' + item.bom_id + '", "' + item.quantity + '", "' + item.status + '", "' + item.description + '","' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '", 1, 1)';
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

                    var myfireStr = `INSERT INTO ${CUS_DB}.work_order_detail( work_order_id, bom_id, quantity, status, description, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + querystr;

                    //   -INSERT-WORK_ORDER_DETAIL
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
  work_order_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('work_order_id', 'Conversion Cost is required');
    req.assert('work_order_code', 'Conversion Cost Code / No is required');
    req.assert('work_order_detail', '');
    req.assert('start_date', '');
    req.assert('expected_date', '');
    req.assert('pic', '');
    req.assert('department_id', '');
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
      work_order_code: req.body.work_order_code,
      start_date: tsservice.mysqlDate(req.body.start_date),
      expected_date: tsservice.mysqlDate(req.body.expected_date),
      pic: req.body.pic,
      department_id: req.body.department_id,
      description: req.body.description,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(),
      is_use: req.body.is_use,
      is_active: req.body.is_active,
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {

        tsservice.updateData(data, function (value) {
          //   -UPDATE-WORK_ORDER
          var query = conn.query(`UPDATE ${CUS_DB}.work_order SET ${value} WHERE work_order_id =${req.body.work_order_id} `, function (err, rows) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
              conn.rollback(function () {
                 res.send(row); return;
              });
            }
            row.data.lastId = rows.insertId;

            var querystr = "";

            async.forEach(req.body.work_order_detail, function (item, callback) {

              if (item.is_active == 1) {

                var myfireStr = `UPDATE ${CUS_DB}.work_order_detail SET work_order_id = "${req.body.work_order_id}", bom_id = "${item.bom_id}", quantity = "${item.quantity}", status = "${item.status}", description = "${item.description}", create_by = "${req.body.create_by}", create_datetime = "${req.body.create_datetime}", update_by = "${req.body.update_by}", update_datetime ="${req.body.update_datetime}", is_active = "${req.body.is_active}", is_use = "${req.body.is_use}" WHERE work_order_detail_id = "${item.work_order_detail_id}"`;

                //   -UPDATE-WORK_ORDER_DETAIL
                var query = conn.query(myfireStr, function (err, rows) {

                  if (err) {
                    row.success = false; console.log(err);
                    row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
                    conn.rollback(function () {
                       res.send(row); return;
                    });
                  }

                });

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

              conn.commit(function (err) {
                 res.send(row); return;
              });

            });
          });
        });

      });

    });

  },

  //   REST-SELECT
  work_order_detail_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { work_order_detail: [] }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('work_order_id', '');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, t2.bom, t2.bom_code, t2.bom FROM ${CUS_DB}.work_order_detail t1 INNER JOIN ${CUS_DB}.bom t2 ON t1.bom_id = t2.bom_id WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.work_order_id = "${req.body.work_order_id}"`;

      //   -SELECT-BOM
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.work_order_detail = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-SELECT
  work_order_detail_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { work_order_detail: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, t2.bom_code, t2.bom FROM ${CUS_DB}.work_order_detail t1 INNER JOIN ${CUS_DB}.bom t2 ON t1.bom_id = t2.bom_id WHERE t1.is_use = 1 AND t1.is_active = 1`;

      //   -SELECT-WORK_ORDER_DETAIL   -JOIN-BOM
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.work_order_detail = rows;
         res.send(row); return;

      });

    });

  }
}

module.exports = controller;