var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  report_template_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { report_template: '' }, label: 'Data selected successfully', error: "" };
    // validation
    req.assert('report_id', '');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var row = { success: true, data: { report_template: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, t2.report, CONVERT(t1.report_template_id, char(50)) AS "value", t1.name as "label" FROM ${CUS_DB}.report_template t1 INNER JOIN ${CUS_DB}.report t2 ON t1.report_id = t2.report_id WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.report_id="${req.body.report_id}" ORDER BY t1.isDefault DESC`;

      //   -SELECT-REPORT_TEMPLATE   -JOIN-REPORT
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.report_template = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-SELECT
  report_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { report: [] }, label: 'Data selected successfully' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `
        SELECT 
          *, 
          CONVERT(report_id, char(50)) AS "value", 
          report as "label", 
          report AS "app_nav_detail_title", 
          description AS "app_nav_detail_subtitle" 
        FROM ${CUS_DB}.report
        WHERE 
          is_active = 1 AND 
          is_use = 1 
        ORDER BY report_id`;

      //   -SELECT-REPORT
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.report = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  report_templates_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { report_template_id: '', report_template_code: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('name', 'Name is required');
    req.assert('report_id', '');
    req.assert('report_template', '');
    req.assert('description', '');
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
      report_template_code: '',
      name: req.body.name,
      report_id: req.body.report_id,
      report_template: req.body.report_template,
      description: req.body.description,
      create_by: req.body.create_by,
      update_by: req.body.update_by,
      create_datetime: tsservice.mysqlDate(),
      update_datetime: tsservice.mysqlDate(),
      is_active: '1',
      is_use: '1',
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var codeData = {
        special_code_id: "REPORTT",
        table: "report_template",
        column_id: "report_template_id",
        column_code: "report_template_code",
      }

      var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

      //   -SELECT-SPECIAL_CODE   -SELECT-REPORT_TEMPLATE
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        if (rows[0]['code']) {

          row.data.report_template_code = rows[0]['code'];
          data.report_template_code = rows[0]['code'];

          tsservice.insertData(data, function (value) {
            //   -INSERT-REPORT_TEMPLATE
            var query = conn.query(`INSERT INTO ${CUS_DB}.report_template` + value, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                 res.send(row); return;
              }
              row.data.report_template_id = rows.insertId;
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
  report_templates_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('report_template_id', '');
    req.assert('report_id', '');
    req.assert('report_template', '');
    req.assert('description', '');
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
      report_template: req.body.report_template,
      description: req.body.description,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(),
      is_use: req.body.is_use,
      is_active: req.body.is_active,
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-REPORT_TEMPLATE
        var query = conn.query(`UPDATE ${CUS_DB}.report_template SET ${value} WHERE report_template_id =${req.body.report_template_id} `, function (err, rows) {

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