var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  warehouseselect_post: function (req, res, next) {

    const CUS_DB = req.body.company_db;

    var row = { success: true, data: { warehouse: [], category: [] }, label: 'Berhasil' };

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
      if (req.body.is_use == "1") {
        strwhere = "t1.is_use = 1 AND";
      }
      var myfireStr = `SELECT t1.*, t2.warehouse_category, convert(warehouse_id, char(50)) as "value", warehouse as "label" FROM ${CUS_DB}.warehouse t1 INNER JOIN ${CUS_DB}.warehouse_category t2 ON t1.warehouse_category_id = t2.warehouse_category_id WHERE ${strwhere} t1.is_active = 1 ORDER BY t1.warehouse_id`;

      //   -SELECT-WAREHOUSE   -JOIN-WAREHOUSE-CATEGORY
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.warehouse = rows;
        var myfireStr = `SELECT *, convert(warehouse_category_id, char(50)) as "value", warehouse_category as "label" FROM ${CUS_DB}.warehouse_category WHERE is_use = 1 AND is_active = 1 AND warehouse_category_id <> 1 ORDER BY warehouse_category_id`;

        //   -SELECT-WAREHOUSE_CATEGORY
        var query = conn.query(myfireStr, function (err, rows) {
          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.category = rows;
           res.send(row); return;
        });

      });

    });

  },

  //   REST-INSERT
  warehouse_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { warehouse_id: '', warehouse_code: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('warehouse', '');
    req.assert('warehouse_category_id', '');
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

      var codeData = {
        special_code_id: "WAREHOUSE",
        table: "warehouse",
        column_id: "warehouse_id",
        column_code: "warehouse_code",
      }

      var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

      //   -SELECT-SPECIAL_CODE   -SELECT-WAREHOUSE
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        if (rows[0]['code']) {

          row.data.warehouse_code = rows[0]['code'];

          var data = {
            warehouse_code: rows[0]['code'],
            warehouse: req.body.warehouse,
            warehouse_category_id: req.body.warehouse_category_id,
            description: req.body.description,
            create_by: req.body.create_by,
            update_by: req.body.update_by,
            create_datetime: tsservice.mysqlDate(),
            update_datetime: tsservice.mysqlDate(),
            is_active: '1',
            is_use: '1',
          };

          //   -INSERT-WAREHOUSE
          var query = conn.query(`INSERT INTO ${CUS_DB}.warehouse SET ? `, data, function (err, rows) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
               res.send(row); return;
            }
            row.data.warehouse_id = rows.insertId;
             res.send(row); return;

          });

        } else {
          row.success = false; console.log(err);
          row.label = 'Failed to select important code. Please contact our IT support';
           res.send(row); return;
        }

      });

    });

  },

  //   REST-UPDATE
  warehouse_put: function (req, res, next) {

    const CUS_DB = req.body.company_db;

    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('warehouse_id', '');
    req.assert('warehouse', '');
    req.assert('warehouse_category_id', '');
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
      warehouse: req.body.warehouse,
      warehouse_category_id: req.body.warehouse_category_id,
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
        //   -UPDATE-WAREHOUSE
        var query = conn.query(`UPDATE ${CUS_DB}.warehouse SET ${value} WHERE warehouse_id =${req.body.warehouse_id} `, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.lastId = rows.insertId;
           res.send(row); return;

        });
      });

    });

  }
}

module.exports = controller;