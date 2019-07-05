var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  navigation_get: function (req, res, next) {

    const CUS_DB = req.body.company_db;

    var row = { success: true, data: { category: [], navigation: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.navigation WHERE is_use = 1 AND is_active = 1`;

      //   -SELECT-NAVIGATION
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          return next("Mysql error, check your query");
        }

        row.data.navigation = rows;

        var myfireStr = `SELECT *, "[]" as "navigation" FROM ${CUS_DB}.navigation_category`;

        //   -SELECT-NAVIGATION_CATEGORY
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
  navigation_post: function (req, res, next) {

    const CUS_DB = req.body.company_db;

    var row = { success: true, data: {}, label: 'Data entered successfully' };
    // validation

    req.assert('positions', '');
    req.assert('language_id', '');
    req.assert('url', 'A valid email is required');
    req.assert('description', 'Enter a password 6 - 20').len(0, 50);
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
      url: req.body.url,
      positions: req.body.positions,
      language_id: req.body.language_id,
      navigation_category_id: req.body.navigation_category_id,
      navigation: '[]',
      description: req.body.description,
      status: '1',
      create_datetime: tsservice.mysqlDate(),
      update_datetime: tsservice.mysqlDate(),
      is_use: '1', is_active: '1'
    };


    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.insertData(data, function (value) {
        //   -INSERT-NAVIGATION
        var query = conn.query(`INSERT INTO ${CUS_DB}.navigation` + value, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
           res.send(row); return;

        });
      });

    });

  },

  //   REST-UPDATE
  navigation_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    // var user_id = req.params.user_id;
    var row = { success: true, data: { category: [], navigation: [] }, label: 'Data updated successfully' };

    //validation

    req.assert('navigation_id', '');
    req.assert('positions', '');
    req.assert('language_id', '');
    req.assert('url', 'A valid email is required');
    req.assert('description', 'Enter a password 6 - 20').len(0, 50);
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

    req.body.navigation.forEach(function (element, index) {
      if (element.is_active == 0) {
        req.body.navigation.splice(index, 1);
      } else {
        element.navigation.forEach(function (element2, index2) {
          if (element2.is_active == 0) {
            element.navigation.splice(index2, 1);
          }
        });
      }
    });

    //get data
    var data = {
      name: req.body.name,
      url: req.body.url,
      positions: req.body.positions,
      language_id: req.body.language_id,
      navigation: JSON.stringify(req.body.navigation),
      description: req.body.description,
      status: req.body.status,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(req.body.update_datetime),
      is_use: req.body.is_use,
      is_active: req.body.is_active
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-NAVIGATION
        var query = conn.query(`UPDATE ${CUS_DB}.navigation SET ${value} WHERE navigation_id =${req.body.navigation_id} `, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }

           res.send(row); return;

        });
      });

    });

  }
}

module.exports = controller;
