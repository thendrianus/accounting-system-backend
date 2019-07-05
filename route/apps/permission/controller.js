var tsservice = require('./../../tsservice');

const controller = {

  //   REST-SELECT
  app_permission_groupselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { permission: [] }, label: 'Berhasil' };

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
        strwhere = "is_use = 1 AND"
      }
      var myfireStr = `SELECT * FROM ${CUS_DB}.app_permission_group WHERE ${strwhere} is_active = 1`;

      //   -SELECT-BRANCH   -JOIN-COMPANY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.permission = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-SELECT
  app_permission_groupselect_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { permissionDetail: [] }, label: 'Berhasil' };

    req.assert('app_permission_group_id', 'Company is required');
    req.assert('employee_id', 'Company is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var strwhere = "";
    if (req.body.employee_id == '1') {
      strwhere = "AND t1.admin_component = 0"
    }

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, t2.app_permission_component_id, IF(t2.app_permission_component_id, "Yes", "No") as "value", "${req.body.app_permission_group_id}" AS "app_permission_group_id" FROM bizystem.app_component t1 LEFT JOIN (SELECT * FROM ${CUS_DB}.app_permission_component WHERE is_use = 1 AND is_active = 1 AND app_permission_group_id = "${req.body.app_permission_group_id}") t2 ON t1.app_component_id = t2.app_component_id WHERE t1.is_use = 1 AND t1.is_active = 1 ${strwhere} ORDER BY t1.app_component_id`;

      //   -SELECT-APP_COMPONENT   -JOIN-APP_PERMISSION_COMPONENT
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.permissionDetail = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  app_permission_group_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { app_permission_group_id: '', app_permission_group_code: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('app_permission_group', 'Name is required');
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
        special_code_id: "PERMISSION",
        table: "app_permission_group",
        column_id: "app_permission_group_id",
        column_code: "app_permission_group_code",
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

          row.data.app_permission_group_code = rows[0]['code'];

          var data = {
            app_permission_group_code: rows[0]['code'],
            app_permission_group: req.body.app_permission_group,
            description: req.body.description,
            create_by: req.body.create_by,
            update_by: req.body.update_by,
            create_datetime: tsservice.mysqlDate(),
            update_datetime: tsservice.mysqlDate(),
            is_active: '1',
            is_use: '1',
          };

          tsservice.insertData(data, function (value) {
            //   -INSERT-BRANCH
            var query = conn.query(`INSERT INTO ${CUS_DB}.app_permission_group` + value, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                 res.send(row); return;
              }
              row.data.app_permission_group_id = rows.insertId;
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
  app_permission_group_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('app_permission_group_id', 'Branch No / Id is required');
    req.assert('app_permission_group', 'Name is required');
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
      app_permission_group: req.body.app_permission_group,
      description: req.body.description,
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
        var query = conn.query(`UPDATE ${CUS_DB}.app_permission_group SET ${value} WHERE app_permission_group_id = ${req.body.app_permission_group_id} `, function (err, rows) {

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

  //   REST-INSERT
  app_permission_component_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { app_permission_component_id: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('app_component_id', 'Name is required');
    req.assert('app_permission_group_id', 'Description is required');
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
      console.log(!req.body.app_permission_component_id + '&&' + req.body.value + '!=' + 'Yes')
      if (!req.body.app_permission_component_id && req.body.value != 'Yes') {
        var data = {
          app_permission_group_id: req.body.app_permission_group_id,
          app_component_id: req.body.app_component_id,
          create_by: req.body.create_by,
          update_by: req.body.update_by,
          create_datetime: tsservice.mysqlDate(),
          update_datetime: tsservice.mysqlDate(),
          is_active: '1',
          is_use: '1',
        };

        tsservice.insertData(data, function (value) {
          //   -INSERT-BRANCH
          var query = conn.query(`INSERT INTO ${CUS_DB}.app_permission_component` + value, function (err, rows) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
               res.send(row); return;
            }
            row.data.app_permission_component_id = rows.insertId;
             res.send(row); return;

          });
        });
      } else {
        var data = {
          is_active: 0,
        };

        tsservice.updateData(data, function (value) {
          var query = conn.query(`UPDATE ${CUS_DB}.app_permission_component SET ${value} WHERE app_permission_component_id = ${req.body.app_permission_component_id} `, function (err, rows) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
               res.send(row); return;
            }
             res.send(row); return;

          });
        });
      }

    });

  }

}

module.exports = controller;