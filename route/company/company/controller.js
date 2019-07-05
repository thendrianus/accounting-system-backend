var tsservice = require('./../../tsservice');
var async = require('async');
var moment = require('moment');
var fs = require('fs');
var generalledger = require('./company.generalledger');
var create_employee_account = require('../employee_account/create_employee_account');

const controller = {
  //   REST-SELECT
  companyselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { company: [] }, label: 'Berhasil' };

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

      var myfireStr = `SELECT t1.*, "" as oldimage, ( SELECT CONCAT("{username:'", username ,"', password:'", account_password ,"'}") FROM bizystem.employee_account WHERE company_id = t1.company_id LIMIT 1 ) as employee_account, (SELECT branch_id FROM ${CUS_DB}.branch WHERE headquater = 1 LIMIT 1) as branch_id FROM bizystem.company t1 WHERE ${strwhere} t1.is_active = 1 ORDER BY t1.company_id`;

      //   -SELECT-COMPANY   -JOIN-BRANCH
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.company = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-INSERT
  company_post: function (req, res, next) {
    let CUS_DB = req.body.company_db;
    var row = { success: true, data: { company_id: '', branch_id: '', company_code: '', branch_code: '' }, label: 'Data entered successfully', error: "" };

    // validation
    req.assert('company', '');
    req.assert('tax_number', '');
    req.assert('register_number', '');
    req.assert('ledgerfirst_month', '');
    req.assert('ledgerlast_month', '');
    req.assert('ledgeryear', '');
    req.assert('isledgeraudit', '');
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

      conn.beginTransaction(function (err) {

        var codeData = {
          special_code_id: "COMPANY",
          table: "company",
          column_id: "company_id",
          column_code: "company_code",
        }

        var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM bizystem.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

        //   -SELECT-SPECIAL_CODE   -SELECT-COMPANY
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }

          if (rows[0]['code']) {

            row.data.company_code = rows[0]['code'];

            var data = {
              company: req.body.company,
              company_code: rows[0]['code'],
              tax_number: req.body.tax_number,
              company_image: req.body.company_image ? req.body.company_image : 'no-photo.png',
              register_number: req.body.register_number,
              ledgerfirst_month: req.body.ledgerfirst_month,
              ledgerlast_month: req.body.ledgerlast_month,
              ledgeryear: req.body.ledgeryear,
              isledgeraudit: req.body.isledgeraudit,
              description: req.body.description,
              create_by: req.body.create_by,
              update_by: req.body.update_by,
              create_datetime: tsservice.mysqlDate(),
              update_datetime: tsservice.mysqlDate(),
              is_active: '1',
              is_use: '1',
            };

            tsservice.insertData(data, function (value) {
              //   -INSERT-COMPANY
              var query = conn.query(`INSERT INTO bizystem.company` + value, function (err, rows) {

                if (err) {
                  row.success = false; console.log(err);
                  row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                  conn.rollback(function () {
                     res.send(row); return;
                  });
                }
                row.data.company_id = rows.insertId;

                let CUS_DB = `cus_bizystem_${rows.insertId}`;
                req.body.company_db = `cus_bizystem_${rows.insertId}`;

                var myfireStr = require('./newDatabaseQuery').replace(/__company_id__/g, row.data.company_id);

                //   -SELECT-COMPANY   -JOIN-BRANCH
                var query = conn.query(myfireStr, function (err, rows) {

                  if (err) {
                    console.log(err)
                  } else {

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
                        conn.rollback(function () {
                           res.send(row); return;
                        });
                      }

                      if (rows[0]['code']) {

                        row.data.branch_code = rows[0]['code'];

                        var data = {
                          name: req.body.company,
                          branch_code: rows[0]['code'],
                          description: 'Headquater',
                          headquater: 1,
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
                              conn.rollback(function () {
                                 res.send(row); return;
                              });
                            }
                            row.data.branch_id = rows.insertId;
                            let username = req.body.company.toLowerCase().replace(' ', '')
                            let random = Math.random()
                            let create_employee_accountParse = {
                              profile_picture: false,
                              employee_id: 2,
                              company_id: row.data.company_id,
                              username: username,
                              account_password: username + random,
                              app_permission_group_id: 1, // Default super admin ID
                              description: 'System admin',
                              create_by: 1, // 1 mean `system`
                              update_by: 1
                            }

                            generalledger(req, res, conn, row, () => {
                              if (req.body.company_image && req.body.company_image !== 'no-photo.png') {
                                fs.move('uploads/' + req.body.company_image, 'public/assets/company/' + req.body.company_image, err => {
                                  if (err) {
                                    console.log('Picture Upload success!');
                                    row.success = false; console.log(err);
                                    row.label = 'Image Failed!!!';
                                    conn.rollback(function () {
                                       res.send(row); return;
                                    });
                                  } else {
                                    console.log(1)
                                    create_employee_account(create_employee_accountParse, row, CUS_DB, conn, (rowParse) => {
                                      conn.commit(function (err) {
                                        res.send(rowParse);
                                      });
                                    })
                                  }
                                });
                              } else {
                                create_employee_account(create_employee_accountParse, row, CUS_DB, conn, (rowParse) => {
                                  conn.commit(function (err) {
                                    res.send(rowParse);
                                  });
                                })
                              }
                            })

                          });
                        });

                      } else {
                        row.success = false; console.log(err);
                        row.label = 'Failed to select important code. Please contact our IT support';
                        conn.rollback(function () {
                           res.send(row); return;
                        });
                      }

                    });

                  }

                });

              });
            });

          } else {
            row.success = false; console.log(err);
            row.label = 'Failed to select important code. Please contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }

        });

      });

    });

  },

  //   REST-UPDATE
  company_put: function (req, res, next) {

    const CUS_DB = req.body.company_db;

    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('company_id', 'Company is required');
    req.assert('company', '');
    req.assert('tax_number', '');
    req.assert('register_number', '');
    req.assert('description', 'Description is required');
    req.assert('update_by', 'Updated By is required');
    req.assert('update_datetime', 'Update Date and time is required');
    req.assert('is_use', 'Used data is required');
    req.assert('is_active', 'Active data is required');
    req.assert('branch_id', 'Branch No / Id is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var data = {
      company: req.body.company,
      tax_number: req.body.tax_number,
      company_image: req.body.company_image ? req.body.company_image : 'no-photo.png',
      register_number: req.body.register_number,
      description: req.body.description,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(),
      is_use: req.body.is_use,
      is_active: req.body.is_active,
    };

    if (req.body.company_image && req.body.company_image !== 'no-photo.png') {
      fs.readFile('public/assets/company/' + req.body.company_image, function read(err, data) {

        if (err) {
          // console.error(err)
          fs.move('uploads/' + req.body.company_image, 'public/assets/company/' + req.body.company_image, err => {
            if (err) return console.error(err)
            console.log('Picture Upload success!');
          });
        }
      });
    }

    req.getConnection(function (err, conn) {

      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-COMPANY
        var query = conn.query(`UPDATE bizystem.company SET ${value} WHERE company_id =${req.body.company_id} `, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.lastId = rows.insertId;

          var data = {
            name: req.body.company,
            description: req.body.description,
            headquater: 1,
            update_by: req.body.update_by,
            update_datetime: tsservice.mysqlDate(),
            is_use: req.body.is_use,
            is_active: req.body.is_active,
          };

          tsservice.updateData(data, function (value) {
            //   -UPDATE-BRANCH
            var query = conn.query(`UPDATE ${CUS_DB}.branch SET ${value} WHERE branch_id =${req.body.branch_id} `, function (err, rows) {

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
      });

    });

  }
}

module.exports = controller;