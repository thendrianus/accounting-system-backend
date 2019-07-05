

var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  pageSearch_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var row = { success: true, data: { page: [] }, label: 'Berhasil' };

      var myfireStr = `SELECT t1.*, t2.name as "template" FROM ${CUS_DB}.page t1 INNER JOIN ${CUS_DB}.template t2 ON t1.template_id = t2.template_id WHERE t1.is_use = 1 AND t1.is_active = 1`;

      //   -SELECT-PAGE   -JOIN-TEMPLATE
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.page = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-SELECT
  pagedetails_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { page: [] }, label: 'Data selected successfully' };
    // validation
    req.assert('page_id', 'Page Id is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }


    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.page_detail WHERE is_use = 1 AND is_active = 1 AND page_id = "${req.body.template_id}" ORDER BY page_detail_id `;

      //   -SELECT-PAGE_DETAIL
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
  pageCategory_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { category: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.page_category WHERE is_use = 1 AND is_active = 1`;

      //   -SELECT-PAGE_CATEGORY
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

  //   REST-INSERT
  page_post: function (req, res, next) {

    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { lastId: '', page_code: '' }, label: 'Data entered successfully' };
    // validation
    req.assert('page_category_id', 'Page Cotegory Id is required');
    req.assert('template_id', 'Template Id is required');
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
        special_code_id: "PAGE",
        table: "page",
        column_id: "page_id",
        column_code: "page_code",
      }

      var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

      //   -SELECT-SPECIAL_CODE   -SELECT-PAGE
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        if (rows[0]['code']) {

          row.data.page_code = rows[0]['code'];

          var data = {
            page_code: rows[0]['code'],
            name: req.body.name,
            page_category_id: req.body.page_category_id,
            template_id: req.body.template_id,
            description: req.body.description,
            create_by: req.body.create_by,
            create_datetime: tsservice.mysqlDate(req.body.create_datetime),
            update_by: req.body.create_by,
            update_datetime: tsservice.mysqlDate(req.body.create_datetime),
            is_use: '1',
            is_active: '1'
          };

          tsservice.insertData(data, function (value) {
            //   -INSERT-PAGE
            var query = conn.query(`INSERT INTO ${CUS_DB}.page` + value, function (err, rows) {

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
  page_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('page_id', 'Page Id is required');
    req.assert('page_category_id', 'Page Cotegory Id is required');
    req.assert('template_id', 'Template Id is required');
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
      page_category_id: req.body.page_category_id,
      template_id: req.body.template_id,
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
        //   -UPDATE-PAGE
        var query = conn.query(`UPDATE ${CUS_DB}.page SET ${value} WHERE page_id =${req.body.page_id} `, function (err, rows) {

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
  pagewidgetdetails_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { widget: [] }, label: 'Data entered successfully' };
    // validation
    req.assert('widget_id', 'Widget Id is required');
    req.assert('page_id', 'Page Id is required');
    req.assert('template_detail_id', 'Template Detail id is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }


    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, t2.template_detail_id, t3.detail, "" as "image", "" as "oldimage" FROM ${CUS_DB}.widget_detail t1 INNER JOIN (SELECT * FROM ${CUS_DB}.template_detail WHERE template_detail_id = "${req.body.template_detail_id}" AND is_use = 1 AND is_active = 1) t2 ON t1.widget_id = t2.widget_id LEFT JOIN (SELECT * FROM ${CUS_DB}.page_detail WHERE page_id = "${req.body.page_id}" AND template_detail_id = "${req.body.template_detail_id}" AND is_use = 1 AND is_active = 1) t3 ON t1.widget_detail_id = t3.widget_detail_id WHERE t1.widget_id = "${req.body.widget_id}" AND t1.is_use = 1 AND t1.is_active = 1`;

      //   -SELECT-WIDGET_DETAIL   -JOIN-TEMPLATE_DETAIL   -JOIN-PAGE_DETAIL
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.widget = rows;
         res.send(row); return;

      });

    });


  },

  //   REST-UPDATE
  pagewidgetdetails_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('page_id', 'Page Id is required');
    req.assert('widgetDetails', 'Widget Details is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }


    var data = [];

    // fs.copy('uploads/9383046bc696c044087a3419695c0722', 'public/assets/9383046bc696c044087a3419695c0722', err => {
    // if (err) return console.error(err)
    //     console.log('Picture Upload success!');
    // });

    for (var i = 0; i < req.body.widgetDetails.length; i++) {

      if (req.body.widgetDetails[i].widget_detail_category_id == 'image') {

        if (req.body.widgetDetails[i].oldimage && req.body.widgetDetails[i].oldimage !== 'no-photo.png') {
          //latter change to move
          fs.move('uploads/' + req.body.widgetDetails[i].detail, 'public/assets/widget/' + req.body.widgetDetails[i].detail, err => {
            if (err) return console.error(err)
            console.log('Picture Upload success!');
          });

          if (req.body.widgetDetails[i].oldimage != 'new') {
            //move oldimage to trash folder 
            fs.move('public/assets/widget/' + req.body.widgetDetails[i].oldimage, 'public/assets/trash/' + req.body.widgetDetails[i].oldimage, err => {
              if (err) return console.error(err)
              console.log('Picture Upload success!');
            });
          }

        }
      }

      data.push([
        req.body.page_id,
        req.body.widgetDetails[i].widget_detail_id,
        req.body.widgetDetails[i].template_detail_id,
        req.body.widgetDetails[i].detail,
        1,
        1
      ]);
    }


    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {

        if (err) { throw err; }

        var myfireStr = `DELETE FROM ${CUS_DB}.page_detail WHERE page_id = "${req.body.page_id}" AND template_detail_id = "${req.body.widgetDetails[0].template_detail_id}"`;

        //   -DELETE-PAGE_DETAIL
        var query = conn.query(myfireStr, function (err, rows) {
          if (err) {
            // return next("Mysql error, check your query");
            row.success = false; console.log(err);
            row.label = 'Failed to delete table in database. make sure your Database is running or contact our IT support';

            conn.rollback(function () {
               res.send(row); return;
            });
          }

          var myfireStr = no_mysql_query;
          //   -INSERT-PAGE_DETAIL
          var query = conn.query(`INSERT INTO ${CUS_DB}.page_detail (page_id, widget_detail_id, template_detail_id, detail, is_use , is_active ) VALUES ? `, [data], function (err, rows) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';

              conn.rollback(function () {
                 res.send(row); return;
              });

            }
            conn.commit(function (err) {
              if (err) {
                conn.rollback(function () {
                   res.send(row); return;
                });
              }
               res.send(row); return;
              // connection.release();
            });

          });

        });

      });
      //  
    });

  }

}

module.exports = controller