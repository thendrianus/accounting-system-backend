var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  articleCategory_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { category: [] }, label: 'Berhasil' };
    req.getConnection(function (err, conn) {


      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.article_category WHERE is_use = 1 AND is_active = 1`;

      //   -SELECT-ARTICLE_CATEGORY
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
  articleSearch_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { articles: [] }, label: 'Data selected successfully' };
    // validation
    req.assert('article_category_id', 'Article category is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }



    req.getConnection(function (err, conn) {


      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.article WHERE article_category_id = "${req.body.article_category_id}" AND is_use = 1 AND is_active = 1`;

      //   -SELECT-ARTICLE
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.articles = rows;
         res.send(row); return;

      });

    });



  },

  //   REST-INSERT
  article_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { lastId: '', article_code: '' }, label: 'Data entered successfully' };
    // validation
    req.assert('article_category_id', 'Article category is required');
    req.assert('article_datetime', '');
    req.assert('app_image', '');
    req.assert('title', '');
    req.assert('subtitle', '');
    req.assert('article', '');
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

    if (req.body.app_image && req.body.app_image !== 'no-photo.png') {
      fs.move('uploads/' + req.body.app_image, 'public/assets/articles/' + req.body.app_image, err => {
        if (err) return console.error(err)
        console.log('Picture Upload success!');
      });
    }

    req.getConnection(function (err, conn) {


      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var codeData = {
        special_code_id: "ARTICLE",
        table: "article",
        column_id: "article_id",
        column_code: "article_code",
      }

      var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

      //   -SELECT-SPECIAL_CODE   -SELECT-ARTICLE
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        if (rows[0]['code']) {

          row.data.article_code = rows[0]['code'];

          var data = {
            article_category_id: req.body.article_category_id,
            article_code: rows[0]['code'],
            article_datetime: tsservice.mysqlDate(req.body.article_datetime),
            app_image: req.body.app_image,
            title: req.body.title,
            subtitle: req.body.subtitle,
            article: req.body.article,
            description: req.body.description,
            create_by: req.body.create_by,
            create_datetime: tsservice.mysqlDate(req.body.create_datetime),
            update_by: req.body.create_by,
            update_datetime: tsservice.mysqlDate(req.body.create_datetime),
            is_use: '1',
            is_active: '1'
          };

          tsservice.insertData(data, function (value) {
            //   -INSERT-ARTICLE
            var query = conn.query(`INSERT INTO ${CUS_DB}.article` + value, function (err, rows) {

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
  article_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('article_id', 'Article Id is required');
    req.assert('article_category_id', 'Article category is required');
    req.assert('article_datetime', '');
    req.assert('app_image', '');
    req.assert('title', '');
    req.assert('subtitle', '');
    req.assert('article', '');
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

    if (req.body.app_image && req.body.app_image !== 'no-photo.png') {
      fs.readFile('public/assets/articles/' + req.body.app_image, function read(err, data) {

        if (err) {
          // console.error(err)
          fs.move('uploads/' + req.body.app_image, 'public/assets/articles/' + req.body.app_image, err => {
            if (err) return console.error(err)
            console.log('Picture Upload success!');
          });
        }

      });
    }

    var data = {
      article_id: req.body.article_id,
      article_category_id: req.body.article_category_id,
      article_datetime: tsservice.mysqlDate(req.body.article_datetime),
      app_image: req.body.app_image ? req.body.app_image : 'no-photo.png',
      title: req.body.title,
      subtitle: req.body.subtitle,
      description: req.body.description,
      article: req.body.article,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(req.body.update_datetime),
      is_use: req.body.is_use,
      is_active: req.body.is_active
    };


    req.getConnection(function (err, conn) {


      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-ARTICLE
        var query = conn.query(`UPDATE ${CUS_DB}.article SET ${value} WHERE article_id =${req.body.article_id} `, function (err, rows) {

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

module.exports = controller;