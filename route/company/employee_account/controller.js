var tsservice = require('./../../tsservice');
var create_employee_account = require('./create_employee_account');

const controller = {
  //   REST-SELECT
  employee_accountselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;

    var row = { success: true, data: { employee_account: [] }, label: 'Berhasil' };

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

      var myfireStr = `SELECT t1.employee_account_id, t1.employee_account_code, t1.employee_account_category_id, t1.app_permission_group_id, t1.employee_id, t1.username, t1.profile_picture, t1.description, t1.create_by, t1.update_by, t1.create_datetime, t1.update_datetime, t1.is_use, t1.is_active, t2.employee_code, t2.employee_category_id, t2.title, t2.firstname, t2.lastname, "" as "oldimage", "" AS "new_password", 0 AS "is_change_password" FROM bizystem.employee_account t1 INNER JOIN ${CUS_DB}.employee t2 ON t1.employee_id = t2.employee_id WHERE ${strwhere} t1.is_active = 1 AND t2.is_active = 1 AND t1.employee_id <> 1 ORDER BY t1.employee_account_id`;

      //   -SELECT-EMPLOYEE_ACCOUNT   -JOIN-EMPLOYEE
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.employee_account = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  employee_account_post: function (req, res, next) {
    const CUS_DB = req.body.company_db; 

    var row = { success: true, data: { employee_account_id: '', employee_account_code: '', company_id: req.body.company_id }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('employee_id', '');
    req.assert('username', '');
    req.assert('account_password', '');
    // req.assert('profile_picture','');
    req.assert('app_permission_group_id', '');
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

      var myfireStr = `SELECT * FROM bizystem.employee_account WHERE is_use = 1 AND is_active = 1 AND username ="${req.body.username}"`;

      //   -SELECT-EMPLOYEE_ACCOUNT
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        if (rows.length < 1) {

          create_employee_account(req.body, row, CUS_DB, conn, (rowParse)=>{
            res.send(rowParse);
          })

        } else {
          row.success = false; console.log(err);
          row.label = "double employee_account";
           res.send(row); return;
        }

      });



    });

  },

  //   REST-UPDATE
  employee_account_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('employee_account_id', '');
    req.assert('employee_id', '');
    req.assert('username', '');
    req.assert('account_password', '');
    // req.assert('profile_picture','');
    req.assert('app_permission_group_id', '');
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

    if (req.body.profile_picture && req.body.profile_picture !== 'no-photo.png') {
      fs.readFile('public/assets/employee/' + req.body.profile_picture, function read(err, data) {

        if (err) {
          // console.error(err)
          fs.move('uploads/' + req.body.profile_picture, 'public/assets/employee/' + req.body.profile_picture, err => {
            if (err) return console.error(err)
            console.log('Picture Upload success!');
          });
        }

      });
    }

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT employee_account_id FROM bizystem.employee_account WHERE is_use = 1 AND is_active = 1 AND employee_account_id = "${req.body.employee_account_id}" AND account_password= "${req.body.account_password}" LIMIT 1`;

      //   -SELECT-EMPLOYEE_ACCOUNT
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        if (rows.length > 0) {
          continues(req, conn);
        } else {
          row.success = false;
          row.label = "Your account_password is wrong!!!";
           res.send(row); return;
        }

      });

    });

    function continues(req, conn) {

      const CUS_DB = req.body.company_db;
      
      var data = {
        employee_id: req.body.employee_id,
        username: req.body.username,
        account_password: req.body.account_password,
        app_permission_group_id: req.body.app_permission_group_id,
        description: req.body.description,
        update_by: req.body.update_by,
        update_datetime: tsservice.mysqlDate(),
        is_use: req.body.is_use,
        is_active: req.body.is_active,
      };

      if (req.body.profile_picture) {
        data.profile_picture = req.body.profile_picture;
      }

      if (req.body.new_password != "") {
        data.account_password = req.body.new_password;
      }

      req.getConnection(function (err, conn) {


        //--cmt-print: mysql cannot connect
        if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

        tsservice.updateData(data, function (value) {
          //   -UPDATE-EMPLOYEE_ACCOUNT
          var query = conn.query(`UPDATE bizystem.employee_account SET ${value} WHERE employee_account_id =${req.body.employee_account_id} `, function (err, rows) {

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
}

module.exports = controller;