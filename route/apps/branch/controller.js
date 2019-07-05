var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT 
  branches_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { branch: [] }, label: 'Data selected successfully' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var strwhere = "";
      if (req.body.is_use == '1') {
        strwhere = "t1.is_use = 1 AND"
      }

      var myfireStr = `SELECT t1.* FROM ${CUS_DB}.branch t1 WHERE t1.is_use = 1 AND t1.is_active = 1 ORDER BY t1.branch_id`;

      //   -SELECT-BRANCH   -JOIN-COMPANY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.branch = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-SELECT
  branchselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { branch: [] }, label: 'Berhasil' };

    req.assert('is_use', 'Company is required');

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
        strwhere = "t1.is_use = 1 AND"
      }

      var myfireStr = `SELECT t1.* FROM ${CUS_DB}.branch t1 WHERE ${strwhere} t1.is_active = 1 ORDER BY t1.branch_id`;

      //   -SELECT-BRANCH
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.branch = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  branch_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { branch_id: '', branch_code: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('name', 'Name is required');
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
        special_code_id: "BRANCH",
        table: "branch",
        column_id: "branch_id",
        column_code: "branch_code",
      }

      var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

      //   -SELECT-SPECIAL_CODE   -SELECT-BRANCH
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        if (rows[0]['code']) {

          row.data.branch_code = rows[0]['code'];

          var data = {
            branch_code: rows[0]['code'],
            name: req.body.name,
            description: req.body.description,
            headquater: 0,
            create_by: req.body.create_by,
            update_by: req.body.update_by,
            create_datetime: tsservice.mysqlDate(),
            update_datetime: tsservice.mysqlDate(),
            is_active: '1',
            is_use: '1',
          };

          tsservice.insertData(data, function (value) {
            //   -INSERT-BRANCH
            var query = conn.query(`INSERT INTO ${CUS_DB}.branch` + value, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                 res.send(row); return;
              }
              row.data.branch_id = rows.insertId;
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
  branch_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('branch_id', 'Branch No / Id is required');
    req.assert('name', 'Name is required');
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
      name: req.body.name,
      description: req.body.description,
      headquater: 0,
      is_use: req.body.is_use,
      is_active: req.body.is_active,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate()
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-BRANCH
        var query = conn.query(`UPDATE ${CUS_DB}.branch SET ${value} WHERE branch_id =${req.body.branch_id} `, function (err, rows) {

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