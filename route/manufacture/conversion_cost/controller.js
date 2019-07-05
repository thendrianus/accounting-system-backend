var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  conversion_costselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { conversion_cost: [] }, label: 'Berhasil' };

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

      var myfireStr = `SELECT t1.*, t2.account, t2.account_code, CONVERT(t1.conversion_cost_id, char(50)) AS "value", CONCAT(t1.conversion_cost_code, " - ", t1.conversion_cost) AS "label" FROM ${CUS_DB}.conversion_cost t1 INNER JOIN ${CUS_DB}.account t2 ON t1.account_id = t2.account_id WHERE ${strwhere} t1.is_active = 1`;

      //   -SELECT-CONVERSION_COST   -JOIN-ACCOUNT
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.conversion_cost = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-INSERT
  conversion_cost_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { conversion_cost_id: '', branch_id: '', conversion_cost_code: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('conversion_cost', '');
    req.assert('cost', '');
    req.assert('uom', '');
    req.assert('currency_id', '');
    req.assert('account_id', '');
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
        special_code_id: "CONVERSION_COST",
        table: "conversion_cost",
        column_id: "conversion_cost_id",
        column_code: "conversion_cost_code",
      }

      var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

      //   -SELECT-SPECIAL_CODE   -SELECT-CONVERSION_COST
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        if (rows[0]['code']) {

          row.data.conversion_cost_code = rows[0]['code'];
          var data = {
            conversion_cost: req.body.conversion_cost,
            conversion_cost_code: rows[0]['code'],
            cost: req.body.cost,
            uom: req.body.uom,
            currency_id: req.body.currency_id,
            account_id: req.body.account_id,
            description: req.body.description,
            create_by: req.body.create_by,
            update_by: req.body.update_by,
            create_datetime: tsservice.mysqlDate(),
            update_datetime: tsservice.mysqlDate(),
            is_use: '1',
            is_active: '1'
          };

          tsservice.insertData(data, function (value) {
            //   -INSERT-CONVERSION_COST
            var query = conn.query(`INSERT INTO ${CUS_DB}.conversion_cost` + value, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                 res.send(row); return;
              }
              row.data.conversion_cost_id = rows.insertId;
               res.send(row); return;

            });
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
  conversion_cost_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('conversion_cost_id', 'Conversion Cost is required');
    req.assert('conversion_cost_code', 'Conversion Cost Code / No is required');
    req.assert('conversion_cost', 'Conversion Cost Name is required');
    req.assert('cost', '');
    req.assert('uom', '');
    req.assert('currency_id', '');
    req.assert('account_id', '');
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
      conversion_cost_code: req.body.conversion_cost_code,
      conversion_cost: req.body.conversion_cost,
      cost: req.body.cost,
      uom: req.body.uom,
      currency_id: req.body.currency_id,
      account_id: req.body.account_id,
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
        //   -UPDATE-CONVERSION_COST
        var query = conn.query(`UPDATE ${CUS_DB}.conversion_cost SET ${value} WHERE conversion_cost_id =${req.body.conversion_cost_id} `, function (err, rows) {

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