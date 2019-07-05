
var tsservice = require('./../../tsservice');

const controller = {
  //   REST-INSERT
  fix_asset_group_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '', fix_asset_group_code: '' }, label: 'Data entered successfully' };
    // validation
    req.assert('account_id', 'Generalledger Period Id is required');
    req.assert('depreciation_id', 'Generalledger Period Id is required');
    req.assert('acumulated_id', 'Generalledger Period Id is required');
    req.assert('name', 'Deparment Id is required');
    req.assert('depreciation_method_id', 'Deparment Id is required');
    req.assert('max_years', 'Deparment Id is required');
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

    var fix_asset_group_code = "";

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var codeData = {
        special_code_id: "FIXGROUP",
        table: "fix_asset_group",
        column_id: "fix_asset_group_id",
        column_code: "fix_asset_group_code",
      }

      var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;
      //   -SELECT-SPECIAL_CODE   -SELECT-FIX_ASSET_GROUP
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        if (rows[0]['code']) {

          fix_asset_group_code = rows[0]['code'];

          var data = {
            fix_asset_group_code: fix_asset_group_code,
            account_id: req.body.account_id,
            depreciation_id: req.body.depreciation_id,
            acumulated_id: req.body.acumulated_id,
            name: req.body.name,
            depreciation_method_id: req.body.depreciation_method_id,
            max_years: req.body.max_years,
            description: req.body.description,
            create_by: req.body.create_by,
            create_datetime: tsservice.mysqlDate(req.body.create_datetime),
            update_by: req.body.create_by,
            update_datetime: tsservice.mysqlDate(req.body.create_datetime),
            is_use: '1', is_active: '1'
          };

          tsservice.insertData(data, function (value) {
            //   -INSERT-FIX_ASSET_GROUP
            var query = conn.query(`INSERT INTO ${CUS_DB}.fix_asset_group` + value, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                 res.send(row); return;
              }
              row.data.lastId = rows.insertId;
              row.data.fix_asset_group_code = fix_asset_group_code;
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
  fix_asset_group_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('fix_asset_group_id', 'Journal Id is required');
    req.assert('fix_asset_group_code', 'Journal Code/No is required');
    req.assert('account_id', 'Generalledger Period Id is required');
    req.assert('depreciation_id', 'Generalledger Period Id is required');
    req.assert('acumulated_id', 'Generalledger Period Id is required');
    req.assert('name', 'Deparment Id is required');
    req.assert('depreciation_method_id', 'Deparment Id is required');
    req.assert('max_years', 'Deparment Id is required');
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

    // update data table fix_asset_group
    var data = {
      fix_asset_group_code: req.body.fix_asset_group_code,
      account_id: req.body.account_id,
      depreciation_id: req.body.depreciation_id,
      acumulated_id: req.body.acumulated_id,
      name: req.body.name,
      depreciation_method_id: req.body.depreciation_method_id,
      max_years: req.body.max_years,
      description: req.body.description,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(req.body.update_datetime),
      is_use: req.body.is_use,
      is_active: req.body.is_active
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-FIX_ASSET_GROUP
        var query = conn.query(`UPDATE ${CUS_DB}.fix_asset_group SET ${value} WHERE fix_asset_group_id =${req.body.fix_asset_group_id} `, function (err, rows) {

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

  //   REST-SELECT
  fix_asset_groupSearch_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { fix_asset_group: [] }, label: 'Data selected successfully' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.* FROM ${CUS_DB}.fix_asset_group t1 WHERE t1.is_use = 1 AND t1.is_active = 1`;
      //   -SELECT-FIX_ASSET_GROUP
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.fix_asset_group = rows;
         res.send(row); return;
      });

    });

  }
}

module.exports = controller;
