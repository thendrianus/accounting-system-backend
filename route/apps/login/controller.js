var tsservice = require('./../../tsservice');
var jwt = require('jwt-simple');
var secret = 'xxx';
const controller = {
  //   REST-SELECT
  login_post: function (req, res, next) {

    req.assert('email', 'Email is required');
    req.assert('account_password', 'Password is required');

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `
      SELECT 
        t1.employee_account_id, 
        t1.company_id, 
        t1.employee_id, 
        t1.profile_picture, 
        t1.username
      FROM 
        bizystem.employee_account t1 
      WHERE 
        t1.is_use = 1 AND 
        t1.is_active = 1 AND 
        t1.username = "${req.body.email}" AND 
        t1.account_password= "${req.body.account_password}" 
      LIMIT 1`;

      //   -SELECT-EMPLOYEE_ACCOUNT   -JOIN-EMPLOYEE
      var query = conn.query(myfireStr, function (err, rows) {
        
        if (err) {
          var row = { login: false, setToken: false, token: 'token' };
           res.send(row); return;
        }

        if (rows.length > 0) {

          var payload = rows[0];

          const CUS_DB = `cus_bizystem_${payload.company_id}`;

          var processToken = (data) => {
            payload = {
              ...payload,
              ...data
            };
            var token = jwt.encode(payload, secret);
            var row = { login: true, setToken: true, token: token, data: rows[0] };
             res.send(row); return;
          }

          var myfireStr = `
            SELECT
              t2.employee_job_id,
              concat( t2.firstname, " ", t2.lastname ) as "employee_sure_name"
            FROM ${CUS_DB}.employee t2 
            WHERE t2.employee_id= "${payload.employee_id}" 
            LIMIT 1
          `;

          //   -SELECT-EMPLOYEE_ACCOUNT   -JOIN-EMPLOYEE
          var query = conn.query(myfireStr, function (err, rows) {
            
            if (err) {
              var row = { login: false, setToken: false, token: 'token' };
                res.send(row); return;
            }

            if (rows.length > 0) {
              processToken(rows[0])
            } else {
              var row = { login: false, setToken: false, token: 'token' };
                res.send(row); return;
            }

          });

        } else {
          var row = { login: false, setToken: false, token: 'token' };
           res.send(row); return;
        }



      });

    });

  },

  login_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { employee_account: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {



      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM bizystem.employee_account WHERE is_active = 1 AND employee_account_category_id = 2`;

      //   -SELECT-ACCOUNT_BANK   -JOIN-ACCOUNT
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
  login_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '', employee_code: '' }, label: 'Admin Account Is Created, Please Login with your account' };
    // validation

    req.assert('title', 'Title is required');
    req.assert('firstname', 'Firstname is required');
    req.assert('lastname', 'Lastname is required');
    req.assert('username', '');
    req.assert('account_password', '');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var data = {
      employee_category_id: 1, //Permanent
      employee_code: 'Admin',
      title: req.body.title,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      address: '-',
      phone_number: 0,
      birth_place: '-',
      birth_date: tsservice.mysqlDate(),
      picture: '',
      email: '-',
      employee_status_id: 1, //Employee
      employee_job_id: 2,  // Admin
      description: '',
      create_by: 1,
      create_datetime: tsservice.mysqlDate(),
      update_by: 1,
      update_datetime: tsservice.mysqlDate(),
      is_use: '1',
      is_use: '1',
      is_active: '1'
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {

        var myfireStr = `SELECT * FROM ${CUS_DB}.employee WHERE employee_job_id = 2`;

        //   -SELECT-EMPLOYEE
        var query = conn.query(myfireStr, function (err, rows) {
          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }

          if (rows.length < 1) {

            tsservice.insertData(data, function (value) {

              //   -INSERT-EMPLOYEE
              var query = conn.query(`INSERT INTO ${CUS_DB}.employee` + value, function (err, rows) {

                if (err) {
                  row.success = false; console.log(err);
                  row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                  conn.rollback(function () {
                     res.send(row); return;
                  });
                }
                row.data.lastId = rows.insertId;

                var myfireStr = `SELECT * FROM ${CUS_DB}.app_permission_group WHERE is_active = 1 AND is_use = 1`;

                //   -SELECT-ACCOUNT_BANK   -JOIN-ACCOUNT
                var query = conn.query(myfireStr, function (err, rows) {
                  if (err) {
                    row.success = false; console.log(err);
                    row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
                    conn.rollback(function () {
                       res.send(row); return;
                    });
                  }

                  if (rows.length > 0) {

                    var data = {
                      employee_account_code: 'Admin',
                      employee_account_category_id: 2,
                      app_permission_group_id: rows[0].app_permission_group_id,
                      employee_id: row.data.lastId,
                      username: req.body.username,
                      account_password: req.body.account_password,
                      profile_picture: '',
                      description: '-',
                      create_by: row.data.lastId,
                      update_by: row.data.lastId,
                      create_datetime: tsservice.mysqlDate(),
                      update_datetime: tsservice.mysqlDate(),
                      is_use: '1',
                      is_active: '1',
                    };

                    tsservice.insertData(data, function (value) {
                      //   -INSERT-EMPLOYEE_ACCOUNT
                      var query = conn.query(`INSERT INTO bizystem.employee_account` + value, function (err, rows) {

                        if (err) {
                          row.success = false; console.log(err);
                          row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                          conn.rollback(function () {
                             res.send(row); return;
                          });
                        }
                        row.data.employee_account_id = rows.insertId;
                        conn.commit(function (err) {
                           res.send(row); return;
                        });

                      });
                    });

                  } else {
                    row.success = false; console.log(err);
                    row.label = 'You dont have permission to create account, please contact our IT support';
                    conn.rollback(function () {
                       res.send(row); return;
                    });
                  }

                });

              });
            });

          } else {
            row.success = false; console.log(err);
            row.label = 'You already have Admin Account in database, please contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }

        });

      });

    });

  }
}

module.exports = controller;
