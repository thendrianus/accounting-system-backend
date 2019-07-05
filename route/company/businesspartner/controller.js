var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  businesspartnerselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    const businesspartner_category_id = req.body.businesspartner_category_id;

    var row = { success: true, data: { businesspartner: [] }, label: 'Berhasil' };

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

      if (req.body.businesspartner_category_id) {
        var strwhere = `(t1.businesspartner_category_id = ${req.body.businesspartner_category_id} OR t1.businesspartner_category_id = 1) AND`;
      }

      var myfireStr = `SELECT t1.*, CONVERT(t1.businesspartner_id, char(50)) AS "value", CONCAT(t1.businesspartner_code, " - ", t1.NAME) AS "label", t2.businesspartner_category, t3.businesspartner_group, CONCAT(t4.firstname, " ", t4.lastname) AS "salesman_employee", CONCAT(t5.firstname, " ", t5.lastname) AS "collector_employee" FROM ${CUS_DB}.businesspartner t1 INNER JOIN ${CUS_DB}.businesspartner_category t2 ON t1.businesspartner_category_id = t2.businesspartner_category_id INNER JOIN ${CUS_DB}.businesspartner_group t3 ON t1.businesspartner_group_id = t3.businesspartner_group_id INNER JOIN ${CUS_DB}.employee t4 ON t4.employee_id = t1.salesman_employee_id INNER JOIN ${CUS_DB}.employee t5 ON t5.employee_id = t1.collector_employee_id WHERE ${strwhere} t1.is_active = 1`;

      //   -SELECT-BUSINESSPARTNER   -JOIN-BUSINESSPARTNER-CATEGORY   -JOIN-BUSINESSPARTNER_GROUP   -JOIN-EMPLOYEE
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.businesspartner = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  businesspartner_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '', businesspartner_code: '' }, label: 'Data entered successfully' };
    // validation

    req.assert('businesspartner_category_id', 'Business Partner Category Id is required');
    req.assert('description', 'Description is required');
    req.assert('businesspartner_group_id', 'Business Partner Group Id is required');
    req.assert('salesman_employee_id', 'Salesman Employee Id is required');
    req.assert('collector_employee_id', 'Collector Employee Id is required');
    req.assert('discount_date', 'Discount Date is required');
    req.assert('due_date', 'Due Date is required');
    req.assert('early_discount', 'Early Discount is required');
    req.assert('late_charge', 'Late Charge is required');
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

    var codeData = {
      special_code_id: "BUSINESSPARTNER_SUP",
      table: "businesspartner",
      column_id: "businesspartner_id",
      column_code: "businesspartner_code",
    }

    if (req.body.businesspartner_category_id == '1') {
      codeData.special_code_id = "BUSINESSPARTNER";
    } if (req.body.businesspartner_category_id == '2') {
      codeData.special_code_id = "BUSINESSPARTNER_CUS";
    } else {
      codeData.special_code_id = "BUSINESSPARTNER_SUP";
    }

    var businesspartner_code = req.body.businesspartner_code;

    if (!businesspartner_code) {

      req.getConnection(function (err, conn) {


        var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

        //   -SELECT-SPECIAL_CODE   -SELECT-BUSINESSPARTNER
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          if (rows[0]['code']) {

            row.data.businesspartner_code = rows[0]['code'];
            businesspartner_code = rows[0]['code'];
            continues(req, businesspartner_code);

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

        var myfireStr = `SELECT * FROM ${CUS_DB}.employee WHERE businesspartner_code = "${inventory_code}"`;
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
            row.label = "Employee Code Already Exist";
             res.send(row); return;
            
          } else {
            continues(req, businesspartner_code);
          }

        });

      });

    }

    function continues(req, businesspartner_code) {

      const CUS_DB = req.body.company_db;
      
      var data = {
        name: req.body.name,
        businesspartner_code: businesspartner_code,
        businesspartner_category_id: req.body.businesspartner_category_id,
        description: req.body.description,
        businesspartner_group_id: req.body.businesspartner_group_id,
        salesman_employee_id: req.body.salesman_employee_id,
        collector_employee_id: req.body.collector_employee_id,
        discount_date: req.body.discount_date,
        due_date: req.body.due_date,
        early_discount: req.body.early_discount,
        late_charge: req.body.late_charge,
        create_by: req.body.create_by,
        create_datetime: tsservice.mysqlDate(req.body.create_datetime),
        update_by: req.body.create_by,
        update_datetime: tsservice.mysqlDate(req.body.create_datetime),
        is_use: '1',
        is_active: '1'
      };

      req.getConnection(function (err, conn) {


        //--cmt-print: mysql cannot connect
        if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

        tsservice.insertData(data, function (value) {
          //   -INSERT-BUSINESSPARTNER
          var query = conn.query(`INSERT INTO ${CUS_DB}.businesspartner` + value, function (err, rows) {

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
  businesspartner_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('businesspartner_id', 'Business Partner Order is required');
    req.assert('businesspartner_code', 'Business Partner Code / No is required');
    req.assert('businesspartner_category_id', 'Business Partner Category Id is required');
    req.assert('description', 'Description is required');
    req.assert('businesspartner_group_id', 'Business Partner Group Id is required');
    req.assert('salesman_employee_id', 'Salesman Employee Id is required');
    req.assert('collector_employee_id', 'Collector Employee Id is required');
    req.assert('discount_date', 'Discount Date is required');
    req.assert('due_date', 'Due Date is required');
    req.assert('early_discount', 'Early Discount is required');
    req.assert('late_charge', 'Late Charge is required');
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

    var data = {
      businesspartner_code: req.body.businesspartner_code,
      name: req.body.name,
      businesspartner_category_id: req.body.businesspartner_category_id,
      description: req.body.description,
      businesspartner_group_id: req.body.businesspartner_group_id,
      salesman_employee_id: req.body.salesman_employee_id,
      collector_employee_id: req.body.collector_employee_id,
      discount_date: req.body.discount_date,
      due_date: req.body.due_date,
      early_discount: req.body.early_discount,
      late_charge: req.body.late_charge,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(req.body.update_datetime),
      is_use: req.body.is_use,
      is_active: req.body.is_active
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-BUSINESSPARTNER
        var query = conn.query(`UPDATE ${CUS_DB}.businesspartner SET ${value} WHERE businesspartner_id =${req.body.businesspartner_id} `, function (err, rows) {

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
  businesspartneraddresslist_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { address: [] }, label: 'Berhasil' };
    // validation
    req.assert('businesspartner_id', 'Business Partner Order is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.businesspartner_address WHERE is_use = 1 AND is_active = 1 AND businesspartner_id = "${req.body.businesspartner_id}"`;

      //   -SELECT-BUSINESSPARTNER_ADDRESS
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.address = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  businesspartneraddress_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '', businesspartner_address_code: '' }, label: 'Data entered successfully' };
    // validation
    // req.assert('businesspartner_address_id','Business Partner Address Id is required');
    req.assert('businesspartner_id', 'Business Partner Order is required');
    req.assert('businesspartner_category', 'Business Partner Category is required');
    req.assert('address', 'Address is required');
    req.assert('description', 'Description is required');
    req.assert('city', 'City is required');
    req.assert('telp1', 'Telp1 is required');
    req.assert('telp2', 'Telp2 is required');
    req.assert('telp3', 'Telp3 is required');
    req.assert('fax', 'Fax is required');
    req.assert('poscode', 'Poscode is required');
    req.assert('create_by', 'Created by is required');
    req.assert('update_by', 'Updated By is required');
    req.assert('create_datetime', 'Create date and time is required');
    req.assert('update_datetime', 'Update Date and time is required');
    req.assert('is_use', 'Is Use is required');
    req.assert('is_active', 'Is Active is required');

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
        special_code_id: "BPADDRESS",
        table: "businesspartner_address",
        column_id: "businesspartner_address_id",
        column_code: "businesspartner_address_code",
      }

      var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

      //   -SELECT-SPECIAL_CODE   -SELECT-BUSINESSPARTNER_ADDRESS
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        if (rows[0]['code']) {

          row.data.businesspartner_address_code = rows[0]['code'];

          var data = {
            businesspartner_id: req.body.businesspartner_id,
            businesspartner_address_code: rows[0]['code'],
            businesspartner_category: req.body.businesspartner_category,
            name: req.body.name,
            address: req.body.address,
            description: req.body.description,
            city: req.body.city,
            telp1: req.body.telp1,
            telp2: req.body.telp2,
            telp3: req.body.telp3,
            fax: req.body.fax,
            poscode: req.body.poscode,
            create_by: req.body.create_by,
            create_datetime: tsservice.mysqlDate(req.body.create_datetime),
            update_by: req.body.create_by,
            update_datetime: tsservice.mysqlDate(req.body.create_datetime),
            is_use: '1',
            is_active: '1',
          };

          tsservice.insertData(data, function (value) {
            //   -INSERT-BUSINESSPARTNER_ADDRESS
            var query = conn.query(`INSERT INTO ${CUS_DB}.businesspartner_address` + value, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                 res.send(row); return;
              }
              row.data.lastId = rows.insertId;
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
  businesspartneraddress_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('businesspartner_address_id', 'Business Partner Address Id is required');
    req.assert('businesspartner_id', 'Business Partner Order is required');
    req.assert('businesspartner_category', 'Business Partner Category is required');
    req.assert('address', 'Address is required');
    req.assert('description', 'Description is required');
    req.assert('city', 'City is required');
    req.assert('telp1', 'Telp1 is required');
    req.assert('telp2', 'Telp2 is required');
    req.assert('telp3', 'Telp3 is required');
    req.assert('fax', 'Fax is required');
    req.assert('poscode', 'Poscode is required');
    req.assert('create_by', 'Created by is required');
    req.assert('update_by', 'Updated By is required');
    req.assert('create_datetime', 'Create date and time is required');
    req.assert('update_datetime', 'Update Date and time is required');
    req.assert('is_use', 'Is Use is required');
    req.assert('is_active', 'Is Active is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var data = {
      businesspartner_id: req.body.businesspartner_id,
      businesspartner_category: req.body.businesspartner_category,
      name: req.body.name,
      address: req.body.address,
      description: req.body.description,
      city: req.body.city,
      telp1: req.body.telp1,
      telp2: req.body.telp2,
      telp3: req.body.telp3,
      fax: req.body.fax,
      poscode: req.body.poscode,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(req.body.update_datetime),
      is_use: req.body.is_use,
      is_active: req.body.is_active
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-BUSINESSPARTNER_ADDRESS
        var query = conn.query(`UPDATE ${CUS_DB}.businesspartner_address SET ${value} WHERE businesspartner_address_id =${req.body.businesspartner_address_id} `, function (err, rows) {

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
  businesspartnercontactlist_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { contact: [] }, label: 'Data selected successfully' };
    // validation
    req.assert('businesspartner_id', 'Business Partner Order is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.businesspartner_contact WHERE is_use = 1 AND is_active = 1 AND businesspartner_id = "${req.body.businesspartner_id}"`;

      //   -SELECT-BUSINESSPARTNER_CONTACT
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.contact = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  businesspartnercontact_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '', businesspartner_contact_code: '' }, label: 'Data entered successfully' };
    // validation
    // req.assert('businesspartner_contact_code','Business Partner Contact Code / No is required');
    req.assert('businesspartner_id', 'Business Partner Order is required');
    req.assert('positions', 'Position is required');
    req.assert('address', 'Address is required');
    req.assert('telp1', 'Telp1 is required');
    req.assert('telp2', 'Telp2 is required');
    req.assert('email', 'Email is required');
    req.assert('city', 'City is required');
    req.assert('poscode', 'Poscode is required');
    req.assert('description', 'Description is required');
    req.assert('create_by', 'Created by is required');
    req.assert('update_by', 'Updated By is required');
    req.assert('create_datetime', 'Create date and time is required');
    req.assert('update_datetime', 'Update Date and time is required');
    req.assert('is_use', 'Is Use is required');
    req.assert('is_active', 'Is Active is required');

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
        special_code_id: "BPCONTACT",
        table: "businesspartner_contact",
        column_id: "businesspartner_contact_id",
        column_code: "businesspartner_contact_code",
      }

      var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

      //   -SELECT-SPECIAL_CODE   -SELECT-BUSINESSPARTNER_CONTACT
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        if (rows[0]['code']) {

          row.data.businesspartner_contact_code = rows[0]['code'];

          var data = {
            businesspartner_id: req.body.businesspartner_id,
            businesspartner_contact_code: rows[0]['code'],
            name: req.body.name,
            positions: req.body.positions,
            address: req.body.address,
            telp1: req.body.telp1,
            telp2: req.body.telp2,
            email: req.body.email,
            city: req.body.city,
            poscode: req.body.poscode,
            description: req.body.description,
            create_by: req.body.create_by,
            create_datetime: tsservice.mysqlDate(req.body.create_datetime),
            update_by: req.body.create_by,
            update_datetime: tsservice.mysqlDate(req.body.create_datetime),
            is_use: '1',
            is_active: '1',
          };

          tsservice.insertData(data, function (value) {
            //   -INSERT-BUSINESSPARTNER_CONTACT
            var query = conn.query(`INSERT INTO ${CUS_DB}.businesspartner_contact` + value, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                 res.send(row); return;
              }

              row.data.lastId = rows.insertId;
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
  businesspartnercontact_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('businesspartner_contact_id', 'Business Partner Contact Id is required');
    req.assert('businesspartner_id', 'Business Partner Order is required');
    req.assert('positions', 'Position is required');
    req.assert('address', 'Address is required');
    req.assert('telp1', 'Telp1 is required');
    req.assert('telp2', 'Telp2 is required');
    req.assert('email', 'Email is required');
    req.assert('city', 'City is required');
    req.assert('poscode', 'Poscode is required');
    req.assert('description', 'Description is required');
    req.assert('create_by', 'Created by is required');
    req.assert('update_by', 'Updated By is required');
    req.assert('create_datetime', 'Create date and time is required');
    req.assert('update_datetime', 'Update Date and time is required');
    req.assert('is_use', 'Is Use is required');
    req.assert('is_active', 'Is Active is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var data = {
      businesspartner_id: req.body.businesspartner_id,
      name: req.body.name,
      positions: req.body.positions,
      address: req.body.address,
      telp1: req.body.telp1,
      telp2: req.body.telp2,
      email: req.body.email,
      city: req.body.city,
      poscode: req.body.poscode,
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
        //   -UPDATE-BUSINESSPARTNER_CONTACT
        var query = conn.query(`UPDATE ${CUS_DB}.businesspartner_contact SET ${value} WHERE businesspartner_contact_id =${req.body.businesspartner_contact_id} `, function (err, rows) {

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