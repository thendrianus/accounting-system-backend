
var tsservice = require('./../../tsservice');
var async = require('async');

const controller = {
  //   REST-SELECT
  componentgenerate_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    req.assert('app_component_id', '');
    req.assert('language', '');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var language = req.body.language;

    var row = { success: true, data: { brand: [] }, label: 'Generate Success', lang: '', lang2: '' };

    req.getConnection(function (err, conn) {


      var whereString = "";
      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      if (req.body.app_component_id != 0) {
        whereString = ' AND t1.app_component_id = "' + req.body.app_component_id + '"';
      }

      var t1value = 't1.ts_value1';
      if (language == 'id') {
        t1value = 't1.ts_value1';
      } else if (language == 'en') {
        t1value = 't1.ts_value';
      }

      var myfireStr = `SELECT t1.app_component_id, concat(t2.code,"_",t1.ts_label) as "ts_label", ${t1value} as "ts_value" FROM ${CUS_DB}.app_component_attribute t1 INNER JOIN bizystem.app_attribute_category t2 ON t1.app_attribute_category_id = t2.app_attribute_category_id WHERE t1.is_use = 1 AND t1.is_active = 1 ` + whereString;

      //   -SELECT-APP_COMPONENT_ATTRIBUTE   -JOIN-APP_ATTRIBUTE_CATEGORY
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        itemData = {};

        if (rows.length > 0) {
          async.forEach(rows, function (item, callback) {

            if (itemData.hasOwnProperty(item.app_component_id)) {
              itemData[item.app_component_id]['app_component_id'] = item.app_component_id
              itemData[item.app_component_id][item.ts_label] = item.ts_value
            } else {
              itemData[item.app_component_id] = {};
              itemData[item.app_component_id]['app_component_id'] = item.app_component_id
              itemData[item.app_component_id][item.ts_label] = item.ts_value
            }

            callback();

          }, function (err) {
            if (err) {
              row.success = false; console.log(err);
              row.label = 'Server failed prosess data. try again or contact our IT support';
               res.send(row); return;
            }

            var querystr = "";
            async.forEach(itemData, function (item, callback) {

              if (querystr != "") {
                querystr += ', ';
              }
              querystr += '( "' + item.app_component_id + '", ' + JSON.stringify(JSON.stringify(item)) + ', "' + language + '" , 1, now())';

              callback();

            }, function (err) {
              if (err) {
                row.success = false; console.log(err);
                row.label = 'Server failed prosess data. try again or contact our IT support';
                 res.send(row); return;
              }

              if (querystr != "") {
                whereString = '';
                if (req.body.app_component_id != 0) {
                  whereString = ' AND app_component_id = "' + req.body.app_component_id + '"';
                }

                var myfireStr = `DELETE FROM ${CUS_DB}.app_component_gen WHERE app_language = "${language}" ` + whereString;

                //   -DELETE-APP_COMPONENT_GEN
                var query = conn.query(myfireStr, function (err, rows) {

                  if (err) {
                    row.success = false; console.log(err);
                    row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                     res.send(row); return;
                  }

                  var myfireStr = `INSERT INTO ${CUS_DB}.app_component_gen( app_component_id, app_generated, app_language, create_by, create_datetime) VALUES ` + querystr;

                  //   -INSERT-APP_COMPONENT_GEN
                  var query = conn.query(myfireStr, function (err, rows) {

                    if (err) {
                      row.success = false; console.log(err);
                      row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                       res.send(row); return;
                    }
                    row.lang = itemData;
                    row.lang2 = rows;
                     res.send(row); return;

                  });

                });

              } else {
                row.lang = itemData;
                row.lang2 = rows;
                 res.send(row); return;
              }

            });

          });
        } else {
           res.send(row); return;
        }


      });

    });

  },

  //   REST-SELECT
  componentgenerate_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { att: [] }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('app_component_id', '');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.app_component_attribute WHERE is_active = 1 AND is_use = 1 AND app_component_id = '${req.body.app_component_id}'`;

      //   -SELECT-APP_COMPONENT_ATTRIBUTE
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.att = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-SELECT
  componentgenerated_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { componentgenerated: [] }, label: 'Berhasil' };

    //   req.assert('group','group data is required'); 
    //   req.assert('lang','lang data is required');  

    //   var err = req.validationErrors();
    //   if(err){
    //       row.success = false; console.log(err);
    //       row.label = "Check please make sure your data fit the createria." + err;
    //       res.send(row); return;
    //       
    //   }

    req.body.group = 'asdf'
    req.body.lang = req.params.id

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var querystr = '';
      if (req.body.group == 'asdf') {

        var querystr = `SELECT t2.*, t2.app_component_id AS "key", 1 AS "app_permission_group_id" FROM ${CUS_DB}.app_component_gen t2 WHERE t2.app_language = "${req.body.lang}"`;

      } else {
        var querystr = `SELECT t2.*, t2.app_component_id AS "key", t1.app_permission_group_id FROM ${CUS_DB}.app_permission_component t1 INNER JOIN ${CUS_DB}.app_component_gen t2 ON t1.app_component_id = t2.app_component_id WHERE t1.app_permission_group_id = (SELECT app_permission_group_id FROM bizystem.employee_account WHERE employee_account_id = "${req.body.group}") AND t2.app_language = "${req.body.lang}" AND t1.is_use = 1 AND t1.is_active = 1`;
      }

      var myfireStr = querystr;

      //   -SELECT-APP_COMPONENT_GEN   -JOIN-APP_COMPONENT   -JOIN-APP_MODULE
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        itemData = {};
        var app_permission_group_id = '';
        if (rows.length > 0 || req.body.group == 'asdf') {
          async.forEach(rows, function (item, callback) {

            if (itemData.hasOwnProperty(item.key)) {
              itemData[item.key] = JSON.parse(item.app_generated);
            } else {
              itemData[item.key] = {};
              itemData[item.key] = JSON.parse(item.app_generated);
            }
            app_permission_group_id = item.app_permission_group_id;
            callback();

          }, function (err) {
            var langField = "ts_value";
            if (req.body.lang == "en") {
              langField = "ts_value";
            } else if (req.body.lang == "id") {
              langField = "ts_value1";
            }

            if (req.body.group == 'asdf') {
              var qry = `
                SELECT 
                  * 
                FROM 
                  (
                    SELECT 
                      a.app_nav_detail_id, 
                      a.app_nav_id, 
                      b.${langField} AS "app_nav_detail_title", 
                      c.${langField} AS "app_nav_detail_subtitle", 
                      a.app_nav_detail_url,
                      a.icon_class, 
                      a.color_class, 
                      a.url_app_component_id, 
                      a.nav_order 
                    FROM bizystem.app_nav_detail a 
                      INNER JOIN ${CUS_DB}.app_component_attribute b ON a.app_nav_detail_title = b.app_component_attribute_id
                      INNER JOIN ${CUS_DB}.app_component_attribute c ON a.app_nav_detail_subtitle = c.app_component_attribute_id 
                    WHERE 
                      a.is_active = 1 AND 
                      a.is_use = 1
                  ) t1 
                  INNER JOIN (
                              SELECT 
                                a.app_nav_order, 
                                a.app_nav_id, 
                                a.app_nav_category, 
                                b.${langField} AS "app_nav_title", 
                                c.${langField} AS "app_nav_subtitle", 
                                a.app_nav_url, 
                                a.nav_icon_class, 
                                a.url_nav_app_component_id 
                              FROM bizystem.app_nav a 
                                INNER JOIN ${CUS_DB}.app_component_attribute b ON a.app_nav_title = b.app_component_attribute_id 
                                INNER JOIN ${CUS_DB}.app_component_attribute c ON a.app_nav_subtitle = c.app_component_attribute_id 
                              WHERE 
                                a.is_active = 1 AND 
                                a.is_use = 1
                              ) t2 ON t1.app_nav_id = t2.app_nav_id 
                ORDER BY 
                  t2.app_nav_id, 
                  t2.app_nav_order, 
                  t1.nav_order`;
            } else {
              var qry = `
                        SELECT 
                          * 
                        FROM (
                              SELECT 
                                a.app_nav_detail_id, 
                                a.app_nav_id, 
                                b.${langField} AS "app_nav_detail_title", 
                                c.${langField} AS "app_nav_detail_subtitle", 
                                a.app_nav_detail_url,
                                a.icon_class, 
                                a.color_class, 
                                a.url_app_component_id, 
                                a.nav_order 
                              FROM bizystem.app_nav_detail a 
                                INNER JOIN ${CUS_DB}.app_component_attribute b ON a.app_nav_detail_title = b.app_component_attribute_id 
                                INNER JOIN ${CUS_DB}.app_component_attribute c ON a.app_nav_detail_subtitle = c.app_component_attribute_id 
                                INNER JOIN ${CUS_DB}.app_permission_component d ON d.app_component_id = a.url_app_component_id 
                              WHERE 
                                a.is_active = 1 AND 
                                a.is_use = 1 AND 
                                d.app_permission_group_id = ${app_permission_group_id} AND 
                                d.is_active = 1
                              ) t1 
                          INNER JOIN (
                                      SELECT 
                                        a.app_nav_order, 
                                        a.app_nav_id, 
                                        a.app_nav_category, 
                                        b.${langField} AS "app_nav_title", 
                                        c.${langField} AS "app_nav_subtitle", 
                                        a.app_nav_url, 
                                        a.nav_icon_class, 
                                        a.url_nav_app_component_id 
                                      FROM bizystem.app_nav a 
                                        INNER JOIN ${CUS_DB}.app_component_attribute b ON a.app_nav_title = b.app_component_attribute_id 
                                        INNER JOIN ${CUS_DB}.app_component_attribute c ON a.app_nav_subtitle = c.app_component_attribute_id 
                                        INNER JOIN ${CUS_DB}.app_permission_component d ON d.app_component_id = a.url_nav_app_component_id 
                                      WHERE 
                                        a.is_active = 1 AND 
                                        a.is_use = 1 AND 
                                        d.app_permission_group_id = ${app_permission_group_id} AND 
                                        d.is_active = 1 
                                      ORDER BY 
                                        a.app_nav_order
                                      ) t2 ON t1.app_nav_id = t2.app_nav_id 
                          ORDER BY 
                            t2.app_nav_id, 
                            t2.app_nav_order, 
                            t1.nav_order`;
            }

            var myfireStr = qry;
            
            var query = conn.query(myfireStr, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
                 res.send(row); return;
              }

              var app_nav = {};

              if (rows.length > 0) {
                async.forEach(rows, function (item, callback) {

                  if (app_nav.hasOwnProperty(item.app_nav_id + "@")) {
                    app_nav[item.app_nav_id + "@"]['data'].push(item);
                  } else {
                    app_nav[item.app_nav_id + "@"] = { item: item, data: [] };
                    app_nav[item.app_nav_id + "@"]['data'].push(item);
                  }

                  callback();

                }, function (err) {
                  var app_nav_category = {};
                  // console.log(app_nav);
                  async.forEach(app_nav, function (item, callback) {

                    if (app_nav_category.hasOwnProperty(item['item']['app_nav_category'])) {
                      app_nav_category[item['item']['app_nav_category']].push(item);
                    } else {
                      app_nav_category[item['item']['app_nav_category']] = [];
                      app_nav_category[item['item']['app_nav_category']].push(item);
                    }

                    callback();

                  }, function (err) {

                    itemData['app_nav'] = {};
                    itemData['app_nav'] = app_nav_category;

                    row.data.componentgenerated = JSON.stringify(itemData);

                    res.send(row.data.componentgenerated);

                  });

                });
              } else {
                 res.send(row); return;
              }

            });

          });
        } else {

           res.send(row); return;
        }

      });

    });

  },

  //   REST-SELECT
  component_gen_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { att: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT *, CONVERT(app_component_id, char(50)) AS "value", concat(app_component_id,"-",component_label) AS "label" FROM bizystem.app_component WHERE is_active = 1 AND is_use = 1`;

      //   -SELECT-APP_COMPONENT
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        row.data.att = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-INSERT
  component_gen_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('app_attribute_category_id', '');
    req.assert('app_component_id', '');
    req.assert('ts_label', '');
    req.assert('ts_value', '');
    req.assert('ts_value1', 'Description is required');
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
      app_attribute_category_id: req.body.app_attribute_category_id,
      app_component_id: req.body.app_component_id,
      ts_label: req.body.ts_label,
      ts_value: req.body.ts_value,
      ts_value1: req.body.ts_value1,
      create_by: req.body.create_by,
      update_by: req.body.update_by,
      create_datetime: tsservice.mysqlDate(),
      update_datetime: tsservice.mysqlDate(),
      is_use: '1',
      is_active: '1',
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.insertData(data, function (value) {
        //   -INSERT-APP_COMPONENT_ATTRIBUTE
        var query = conn.query(`INSERT INTO ${CUS_DB}.app_component_attribute` + value, function (err, rows) {

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
  component_gen_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { app_component_attribute_id: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('app_attribute_category_id', '');
    req.assert('app_component_attribute_id', '');
    req.assert('ts_label', '');
    req.assert('ts_value', '');
    req.assert('ts_value1', 'Description is required');
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
      ts_label: req.body.ts_label,
      app_attribute_category_id: req.body.app_attribute_category_id,
      ts_value: req.body.ts_value,
      ts_value1: req.body.ts_value1,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(),
      is_use: req.body.is_use,
      is_active: req.body.is_active,
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-APP_COMPONENT_ATTRIBUTE
        var query = conn.query(`UPDATE ${CUS_DB}.app_component_attribute SET ${value} WHERE app_component_attribute_id =${req.body.app_component_attribute_id} `, function (err, rows) {

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