var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  taxselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { tax: [] }, label: 'Berhasil' };

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
        strwhere = "t1.is_use = 1 AND";
      }
      var myfireStr = `SELECT t1.*, CONVERT(t1.tax_id, char(50)) AS "value", t1.name AS "text", t1.name AS "label", t2.account as "in_account", t3.account as "out_account" FROM ${CUS_DB}.tax t1 INNER JOIN ${CUS_DB}.account t2 ON t1.in_account_id = t2.account_id INNER JOIN ${CUS_DB}.account t3 ON t1.out_account_id = t3.account_id WHERE ${strwhere} t1.is_active = 1`;

      //   -SELECT-TAX   -JOIN-ACCOUNT
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.tax = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  tax_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { tax_id: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('name', 'Name is required');
    req.assert('in_account_id', '');
    req.assert('out_account_id', '');
    req.assert('percentage', '');
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
      name: req.body.name,
      in_account_id: req.body.in_account_id,
      out_account_id: req.body.out_account_id,
      percentage: req.body.percentage,
      create_by: req.body.create_by,
      update_by: req.body.update_by,
      create_datetime: tsservice.mysqlDate(),
      update_datetime: tsservice.mysqlDate(),
      is_active: '1',
      is_use: '1',
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.insertData(data, function (value) {
        //   -INSERT-TAX
        var query = conn.query(`INSERT INTO ${CUS_DB}.tax` + value, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.tax_id = rows.insertId;
           res.send(row); return;

        });
      });

    });

  },

  //   REST-UPDATE
  tax_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('tax_id', '');
    req.assert('name', 'Name is required');
    req.assert('in_account_id', '');
    req.assert('out_account_id', '');
    req.assert('percentage', '');
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
      name: req.body.name,
      in_account_id: req.body.in_account_id,
      out_account_id: req.body.out_account_id,
      percentage: req.body.percentage,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(),
      is_use: req.body.is_use,
      is_active: req.body.is_active,
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-TAX
        var query = conn.query(`UPDATE ${CUS_DB}.tax SET ${value} WHERE tax_id =${req.body.tax_id} `, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }

           res.send(row); return;

        });
      });

    });

  },
}

module.exports = controller;
