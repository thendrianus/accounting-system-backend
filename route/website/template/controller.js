var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  templatecategory_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { category: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.template_category WHERE is_use = 1 AND is_active = 1`;

      //   -SELECT-TEMPLATE_CATEGORY
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


  },

  //   REST-SELECT
  templateSearch_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { template: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.template WHERE is_use = 1 AND is_active = 1`;

      //   -SELECT-TEMPLATE
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.template = rows;
         res.send(row); return;
      });

    });


  },

  //   REST-SELECT
  templatedetails_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { template: [] }, label: 'Data entered successfully' };
    // validation
    req.assert('template_id', 'Template Id is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }


    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.template_detail WHERE is_use = 1 AND is_active = 1 AND template_id = "${req.body.template_id}" ORDER BY positions`;

      //   -SELECT-TEMPALTE_DETAIL
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.template = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-INSERT
  templatedetail_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { lastId: '' }, label: 'Data entered successfully' };
    // validation
    req.assert('template_id', 'Template Id is required');
    req.assert('widget_id', 'Widget Id is required');
    req.assert('description', 'Description is required');
    req.assert('positions', '');
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
      widget_id: req.body.widget_id,
      template_id: req.body.template_id,
      name: req.body.name,
      description: req.body.description,
      positions: req.body.positions,
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
        //   -INSERT-TEMPALTE_DETAIL
        var query = conn.query(`INSERT INTO ${CUS_DB}.template_detail` + value, function (err, rows) {

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
  templatedetail_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('template_detail_id', 'Template Detail id is required');
    req.assert('template_id', 'Template Id is required');
    req.assert('widget_id', 'Widget Id is required');
    req.assert('description', 'Description is required');
    req.assert('positions', '');
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
      template_detail_id: req.body.template_detail_id,
      widget_id: req.body.widget_id,
      template_id: req.body.template_id,
      name: req.body.name,
      description: req.body.description,
      positions: req.body.positions,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(req.body.update_datetime),
      is_use: req.body.is_use,
      is_active: req.body.is_active
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-TEMPLATE_DETAIL
        var query = conn.query(`UPDATE ${CUS_DB}.template_detail SET ${value} WHERE template_detail_id =${req.body.template_detail_id} `, function (err, rows) {

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
  template_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { lastId: '', template_code: '' }, label: 'Data entered successfully' };
    // validation
    req.assert('template_category_id', 'Template Category Id is required');
    req.assert('description', 'Description is required');
    req.assert('filename', '');
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
        special_code_id: "TEMPLATE",
        table: "template",
        column_id: "template_id",
        column_code: "template_code",
      }

      var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

      //   -SELECT-SPECIAL_CODE   -SELECT-TEMPLATE
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        if (rows[0]['code']) {

          row.data.template_code = rows[0]['code'];


          var data = {
            template_id: req.body.name,
            template_code: rows[0]['code'],
            name: req.body.name,
            template_category_id: req.body.template_category_id,
            description: req.body.description,
            filename: req.body.filename,
            create_by: req.body.create_by,
            create_datetime: tsservice.mysqlDate(req.body.create_datetime),
            update_by: req.body.create_by,
            update_datetime: tsservice.mysqlDate(req.body.create_datetime),
            is_use: '1',
            is_active: '1'
          };

          tsservice.insertData(data, function (value) {
            //   -INSERT-TEMPALTE
            var query = conn.query(`INSERT INTO ${CUS_DB}.template` + value, function (err, rows) {

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
  template_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('template_id', 'Template Id is required');
    req.assert('template_category_id', 'Template Category Id is required');
    req.assert('description', 'Description is required');
    req.assert('filename', '');
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
      template_category_id: req.body.template_category_id,
      description: req.body.description,
      filename: req.body.filename,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(req.body.update_datetime),
      is_use: req.body.is_use,
      is_active: req.body.is_active
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-TEMPALTE
        var query = conn.query(`UPDATE ${CUS_DB}.template SET ${value} WHERE template_id =${req.body.template_id} `, function (err, rows) {

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