var tsservice = require('./../../tsservice');
var fs = require('fs');

const controller = {
  //   REST-SELECT
  employeeselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { employee: [] }, label: 'Berhasil' };

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

      var myfireStr = `SELECT t1.*, t2.name AS "job_name", convert(t1.employee_id, CHAR(50)) AS "value", concat(t1.employee_code, "-", t1.firstname, " ", t1.lastname) AS "label", date_format(t1.birth_date, "%e %b %Y") AS "birth_date_label", if(t1.is_use = 1, "Yes", "No") AS "is_use_label" FROM ${CUS_DB}.employee t1 INNER JOIN ${CUS_DB}.employee_job t2 ON t1.employee_job_id = t2.employee_job_id WHERE ${strwhere} t1.is_active = 1 AND t1.employee_job_id != 1`;

      //   -SELECT-EMPLOYEE-EMPLOYEE_JOB
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.employee = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-SELECT
  employeeselect_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { employee: [] }, label: 'Berhasil' };

    req.assert('action', 'Used data is required');

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
      if (req.body.action == 'salesman') {
        strwhere += " t1.is_sales = 1 AND "; //sini 
      } else if (req.body.action == 'purchasesman') {
        strwhere += " t1.is_purchasesman = 1 AND "; //sini
      } else if (req.body.action == 'debtcollector') {
        strwhere += " t1.is_debt_collector = 1 AND "; //sini
      }

      var myfireStr = `SELECT t1.*, t2.name AS "job_name", convert(t1.employee_id, CHAR(50)) AS "value", concat(t1.employee_code, "-", t1.firstname, " ", t1.lastname) AS "label", date_format(t1.birth_date, "%e %b %Y") AS "birth_date_label", if(t1.is_use = 1, "Yes", "No") AS "is_use_label" FROM ${CUS_DB}.employee t1 INNER JOIN ${CUS_DB}.employee_job t2 ON t1.employee_job_id = t2.employee_job_id WHERE ${strwhere} t1.is_active = 1 AND t1.employee_job_id != 1`;

      //   -SELECT-EMPLOYEE-EMPLOYEE_JOB
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.employee = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  employee_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '', employee_code: '' }, label: 'Data entered successfully' };
    // validation

    req.assert('employee_category_id', 'Employee Category Id is required');
    req.assert('title', 'Title is required');
    req.assert('firstname', 'Firstname is required');
    req.assert('lastname', 'Lastname is required');
    req.assert('address', 'Address is required');
    req.assert('phone_number', 'Phone Number is required');
    req.assert('birth_place', 'Birth Place is required');
    req.assert('birth_date', 'Birth Date is required');
    // req.assert('picture','Picture is required');
    req.assert('email', 'Email is required');
    req.assert('employee_status_id', 'Employee Status Id is required');
    req.assert('employee_job_id', 'Employee Job Id is required');
    req.assert('is_sales', 'Used data is required');
    req.assert('is_purchasesman', 'Used data is required');
    req.assert('is_debt_collector', 'Used data is required');
    req.assert('sales_desc', 'Used data is required');
    req.assert('purchasesman_desc', 'Used data is required');
    req.assert('debt_collector_desc', 'Used data is required');
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

    var employee_code = req.body.employee_code.trim();

    if (employee_code == "") {

      req.getConnection(function (err, conn) {


        //--cmt-print: mysql cannot connect
        if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

        var codeData = {
          special_code_id: "EMPLOYEE",
          table: "employee",
          column_id: "employee_id",
          column_code: "employee_code",
        }

        var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

        //   -SELECT-SPECIAL_CODE   -SELECT-EMPLOYEE
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }

          if (rows[0]['code']) {

            row.data.employee_code = rows[0]['code'];
            employee_code = rows[0]['code'];
            continues(req, employee_code, fs);

          } else {
            row.success = false; console.log(err);
            row.label = 'Failed to select important code. Please contact our IT support';
             res.send(row); return;
          }

        });

      });

    } else {

      //check does inventory code exist
      req.getConnection(function (err, conn) {


        //--cmt-print: mysql cannot connect
        if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

        var myfireStr = `SELECT * FROM ${CUS_DB}.employee WHERE employee_code = "${employee_code}" LIMIT 1`;

        //   -SELECT-EMPLOYEE
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }

          if (rows.length > 0) {
            row.success = false; console.log(err);
            row.error = "2";
            row.label = "Employee Code Already Exist, Used by " + rows[0].firstname + " " + rows[0].lastname;
             res.send(row); return;
            
          } else {
            continues(req, employee_code, fs);
          }

        });

      });

    }

    function continues(req, employee_code, fs) {

      const CUS_DB = req.body.company_db;
      
      if (req.body.picture && req.body.picture !== 'no-photo.png') {
        fs.move('uploads/' + req.body.picture, 'public/assets/employee/' + req.body.picture, err => {
          if (err) return console.error(err)
          console.log('Picture Upload success!');
        });
      }

      var data = {
        employee_category_id: req.body.employee_category_id,
        employee_code: employee_code,
        title: req.body.title,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        address: req.body.address,
        phone_number: req.body.phone_number,
        birth_place: req.body.birth_place,
        birth_date: tsservice.mysqlDate(req.body.birth_dateParse),
        picture: req.body.picture ? req.body.picture : 'no-photo.png',
        email: req.body.email,
        employee_status_id: req.body.employee_status_id,
        employee_job_id: req.body.employee_job_id,
        is_sales: req.body.is_sales,
        is_purchasesman: req.body.is_purchasesman,
        is_debt_collector: req.body.is_debt_collector,
        sales_desc: req.body.sales_desc,
        purchasesman_desc: req.body.purchasesman_desc,
        debt_collector_desc: req.body.debt_collector_desc,
        description: req.body.description,
        create_by: req.body.create_by,
        create_datetime: tsservice.mysqlDate(req.body.create_datetime),
        update_by: req.body.create_by,
        update_datetime: tsservice.mysqlDate(req.body.create_datetime),
        is_use: '1', is_active: '1'
      };

      req.getConnection(function (err, conn) {


        //--cmt-print: mysql cannot connect
        if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

        tsservice.insertData(data, function (value) {
          //   -INSERT-EMPLOYEE
          var query = conn.query(`INSERT INTO ${CUS_DB}.employee` + value, function (err, rows) {

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

    }

  },

  //   REST-UPDATE
  employee_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('employee_category_id', 'Employee Category Id is required');
    req.assert('employee_code', 'Employee Code/No is required');
    req.assert('title', 'Title is required');
    req.assert('firstname', 'Firstname is required');
    req.assert('lastname', 'Lastname is required');
    req.assert('address', 'Address is required');
    req.assert('phone_number', 'Phone Number is required');
    req.assert('birth_place', 'Birth Place is required');
    req.assert('birth_date', 'Birth Date is required');
    // req.assert('picture','Picture is required');
    req.assert('email', 'Email is required');
    req.assert('employee_status_id', 'Employee Status Id is required');
    req.assert('employee_job_id', 'Employee Job Id is required');
    req.assert('is_sales', 'Used data is required');
    req.assert('is_purchasesman', 'Used data is required');
    req.assert('is_debt_collector', 'Used data is required');
    req.assert('sales_desc', 'Used data is required');
    req.assert('purchasesman_desc', 'Used data is required');
    req.assert('debt_collector_desc', 'Used data is required');
    req.assert('description', 'Description is required');
    req.assert('create_by', 'Created by is required');
    req.assert('create_datetime', 'Create date and time is required');
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

    if (req.body.picture && req.body.picture !== 'no-photo.png') {
      fs.readFile('public/assets/employee/' + req.body.picture, function read(err, data) {

        if (err) {
          // console.error(err)
          fs.move('uploads/' + req.body.picture, 'public/assets/employee/' + req.body.picture, err => {
            if (err) return console.error(err)
            console.log('Picture Upload success!');
          });
        }

      });
    }

    var data = {
      employee_category_id: req.body.employee_category_id,
      title: req.body.title,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      address: req.body.address,
      phone_number: req.body.phone_number,
      birth_place: req.body.birth_place,
      birth_date: tsservice.mysqlDate(req.body.birth_dateParse),
      picture: req.body.picture,
      email: req.body.email,
      employee_status_id: req.body.employee_status_id,
      employee_job_id: req.body.employee_job_id,
      is_sales: req.body.is_sales,
      is_purchasesman: req.body.is_purchasesman,
      is_debt_collector: req.body.is_debt_collector,
      sales_desc: req.body.sales_desc,
      purchasesman_desc: req.body.purchasesman_desc,
      debt_collector_desc: req.body.debt_collector_desc,
      description: req.body.description,
      create_by: req.body.create_by,
      create_datetime: tsservice.mysqlDate(req.body.create_datetime),
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(req.body.update_datetime),
      is_use: req.body.is_use,
      is_active: req.body.is_active
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-EMPLOYEE
        var query = conn.query(`UPDATE ${CUS_DB}.employee SET ${value} WHERE employee_id =${req.body.employee_id} `, function (err, rows) {

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
  employeeListAll_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { employee: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT *, convert(employee_id, char(50)) as "value", concat(employee_code, "-", firstname, " ", lastname) as "label" FROM ${CUS_DB}.employee`;

      //   -SELECT-EMPLOYEE
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.employee = rows;
         res.send(row); return;
      });

    });

  }
}

module.exports = controller;