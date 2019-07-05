var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  currencyselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { currency: [] }, label: 'Data selected successfully' };

    req.assert('is_use', 'Active data is required');

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
        strwhere = "is_use = 1 AND";
      }

      var myfireStr = `SELECT *, convert(currency_id, char(50)) as "value", currencies as "label" FROM ${CUS_DB}.currencies WHERE ${strwhere} is_active = 1 ORDER BY currency_order`;

      //   -SELECT-CURRENCY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.currency = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  currency_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('currencies', '');
    req.assert('currency_id', '');
    req.assert('rate', '');
    req.assert('symbol', '');
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

    var data = {
      currencies: req.body.currencies,
      currency_id: req.body.currency_id,
      rate: req.body.rate,
      symbol: req.body.symbol,
      description: req.body.description,
      create_by: req.body.create_by,
      update_by: req.body.update_by,
      create_datetime: tsservice.mysqlDate(),
      update_datetime: tsservice.mysqlDate(),
      is_use: '1',
      is_active: '1',
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.insertData(data, function (value) {
        //   -INSERT-CURRENCY
        var query = conn.query(`INSERT INTO ${CUS_DB}.currencies` + value, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.lastId = rows.insertId;
           res.send(row); return;

        });
      });

    });

  },

  //   REST-UPDATE
  currency_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { currency_order: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('currency_id', '');
    req.assert('currency_order', '');
    req.assert('currencies', '');
    req.assert('rate', '');
    req.assert('symbol', '');
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
      currencies: req.body.currencies,
      currency_id: req.body.currency_id,
      rate: req.body.rate,
      symbol: req.body.symbol,
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
        //   -UPDATE-CURRENCY
        var query = conn.query(`UPDATE ${CUS_DB}.currencies SET ${value} WHERE currency_order =${req.body.currency_order} `, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.currency_order = rows.insertId;
           res.send(row); return;

        });
      });

    });

  }
}

module.exports = controller;