var tsservice = require('./../../tsservice');
var async = require('async');
var add_purchase_link = require('../purchase/add_purchase_link');

function select_purchase_request_code(conn, req, row) {
  const CUS_DB = req.body.company_db;
  return new Promise(function (resolve, reject) {

    if (req.body.purchase_request_code == "" && req.body.purchase_status_id != '1') {

      var codeData = {
        special_code_id: "PURCHASE_REQUEST",
        table: "purchase_request",
        column_id: "purchase_request_id",
        column_code: "purchase_request_code",
      }
      var querystr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

      //   -SELECT-SPECIAL_CODE   -SELECT-PURCHASE_REQUEST
      var query = conn.query(querystr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
          reject(row);
        }

        if (rows[0]['code']) {

          row.data.purchase_request_code = rows[0]['code'];
          resolve(rows[0]['code']);

        } else {
          row.success = false; console.log(err);
          row.label = 'Failed to select important code. Please contact our IT support';
          reject(row);
        }

      });
    } else {

      resolve('');

    }

  });

}

const controller = {
  //   REST-SELECT
  purchase_requestsselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { purchase_requests: [] }, label: 'Berhasil' };

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
        strwhere += " t1.is_use = 1 AND ";
      }
      
      if (req.body.action == '1') {
        strwhere += " t1.purchase_status_id = 5 AND ";
      }

      var myfireStr = `SELECT t1.*, t1.purchase_request_code as "code", t1.purchase_status_id as "oripurchase_status_id", DATE_FORMAT(t1.transaction_date, "%d %M %Y") as "transaction_date_show" , "[]" as "purchase_request_detail",t2.businesspartner_code, t2.name as "businesspartner_name", t3.name "purchase_request_status_name", t4.name as "branch_name", concat(t6.firstname, " ", t6.lastname) as "employee_name", "-" as "sale_status_name" FROM ${CUS_DB}.purchase_request t1 INNER JOIN ${CUS_DB}.businesspartner t2 ON t1.businesspartner_id = t2.businesspartner_id INNER JOIN ${CUS_DB}.purchase_status t3 ON t1.purchase_status_id = t3.purchase_status_id INNER JOIN ${CUS_DB}.branch t4 ON t1.branch_id = t4.branch_id INNER JOIN ${CUS_DB}.employee t6 ON t1.create_by = t6.employee_id WHERE ${strwhere} t1.is_active = 1 ORDER BY t1.purchase_request_id DESC`;

      // SELECT-PURCHASE_REQUEST   -JOIN-BUSINESSPARTNER   JOIN-PURCHASE_STATUS   JOIN-BRANCH   JOIN-EMPLOYEE
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.purchase_requests = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  purchase_requests_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { purchase_request_id: '', purchase_request_code: '' }, label: 'Data entered successfully' };

    // validation
    // req.assert('purchase_request_id','Purchase Quotation Id is required');
    // req.assert('purchase_request_code','Purchase Quotation Code/Id is required');
    req.assert('businesspartner_id', 'Business Partner Order is required');
    req.assert('branch_id', 'Branch is required');
    req.assert('warehouse_id', 'Ware House Id is required');
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('description', 'Description is required');
    req.assert('purchase_category_id', 'Purchase Category Id is required');
    req.assert('purchase_link_id', 'Purchase Link Id is required');
    req.assert('purchase_status_id', 'Purchase Status Id is required');
    req.assert('create_by', 'Created by is required');
    req.assert('create_datetime', 'Create date and time is required');
    req.assert('is_use', 'Used data is required');
    req.assert('is_active', 'Active data is required');
    req.assert('oripurchase_status_id', '');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var purchase_request_code = '';
    var purchase_request_id = 0;

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {
        select_purchase_request_code(conn, req, row).then(function (result) { // 1. SELECT PURCHASE REQUEST CODE
          if (result) {
            purchase_request_code = result;
          }
          add_purchase_request(conn).then(function (result) { // 2. INSERT PURCHASE REQUEST

            purchase_request_id = result;
            add_purchase_request_detail(conn).then(function (result) { // 3. INSERT PURCHASE REQUEST DETAIL

              row.data.purchase_request_code = purchase_request_code;
              row.data.purchase_request_id = purchase_request_id;
              conn.commit(function (err) {
                 res.send(row); return;
              });

            }).catch(error => { // END 3
              conn.rollback(function () {
                console.log('false add_purchase_request_detail');
                 res.send(row); return;
              });
            });

          }).catch(error => { // END 2
            conn.rollback(function () {
              console.log('false add_purchase_request');
               res.send(row); return;
            });
          });

        }).catch(error => { // END 1
          conn.rollback(function () {
            console.log('false select_purchase_request_code');
             res.send(row); return;
          });
        });
      });

    });

    function add_purchase_request(conn) {
      const CUS_DB = req.body.company_db;
      return new Promise(function (resolve, reject) {

        var data = {
          purchase_request_code: purchase_request_code,
          businesspartner_id: req.body.businesspartner_id,
          branch_id: req.body.branch_id,
          warehouse_id: req.body.warehouse_id,
          transaction_date: req.body.transaction_date,
          description: req.body.description,
          purchase_category_id: req.body.purchase_category_id,
          purchase_link_id: req.body.purchase_link_id,
          purchase_status_id: req.body.purchase_status_id,
          transaction_date: tsservice.mysqlDate(req.body.transaction_date),
          create_by: req.body.create_by,
          create_datetime: tsservice.mysqlDate(req.body.create_datetime),
          update_by: req.body.create_by,
          update_datetime: tsservice.mysqlDate(req.body.create_datetime),
          is_use: '1', is_active: '1'
        };

        add_purchase_link(conn, req, row).then(function (result) {
        
          data.purchase_link_id = result;
  
          tsservice.insertData(data, function (value) {
            //   -INSERT-PURCHASE_REQUEST
            var query = conn.query(`INSERT INTO ${CUS_DB}.purchase_request` + value, function (err, rows) {
  
              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                reject(false);
              }
  
              resolve(rows.insertId);
            });
          });
  
        }).catch(error => { //CATCH STEP 8
          conn.rollback(function () {
            console.log('false add_generalledger');
            row = error;
            res.send(row); return;
          });
        });

      });

    }

    function add_purchase_request_detail(conn) {
      return new Promise(function (resolve, reject) {
        var querystr = "";

        async.forEach(req.body.purchase_request_detail, function (item, callback) {

          if (item.is_active == 1) {
            if (querystr != "") {
              querystr += ', ';
            }
            querystr += '("' + purchase_request_id + '", "' + item.inventory_id + '", "' + item.warehouse_id + '", "' + item.row_label + '", "' + item.row_order + '",  "' + item.quantity + '", "' + item.quantityeqv + '", "' + item.uom_order + '", "' + item.uom_label + '", "' + item.inventory_label + '", "' + item.description + '","' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '", 1, 1)';
          }
          callback();

        }, function (err) {
          if (err) {
            row.success = false; console.log(err);
            row.label = 'Server failed prosess data. try again or contact our IT support';
            reject(false);
          }

          if (querystr != "") {

            //   -INSERT-PURCHASE_REQUEST_DETAIL
            var query = conn.query(`INSERT INTO ${CUS_DB}.purchase_request_detail( purchase_request_id, inventory_id, warehouse_id, row_label, row_order, quantity, quantityeqv, uom_order, uom_label, inventory_label, description, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + querystr, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                reject(false);
              }
              resolve(true);

            });
          } else {
            resolve(true);
          }

        });

      });

    }

  },

  //   REST-UPDATE
  purchase_requests_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { purchase_request_id: '', purchase_request_code: '' }, label: 'Data updated successfully' };

    // validation
    req.assert('purchase_request_id', 'Purchase Quotation Id is required');
    // req.assert('purchase_request_code','Purchase Quotation Code/Id is required');
    req.assert('businesspartner_id', 'Business Partner Order is required');
    req.assert('branch_id', 'Branch is required');
    req.assert('warehouse_id', 'Ware House Id is required');
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('description', 'Description is required');
    req.assert('purchase_category_id', 'Purchase Category Id is required');
    req.assert('purchase_link_id', 'Purchase Link Id is required');
    req.assert('purchase_status_id', 'Purchase Status Id is required');
    req.assert('update_by', 'Updated By is required');
    req.assert('update_datetime', 'Update Date and time is required');
    req.assert('is_use', 'Used data is required');
    req.assert('is_active', 'Active data is required');
    req.assert('oripurchase_status_id', '');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var purchase_request_code = req.body.purchase_request_code;
    var purchase_request_id = req.body.purchase_request_id;

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {

        select_purchase_request_code(conn, req, row).then(function (result) {
          if (result) {
            purchase_request_code = result;
            row.data.purchase_request_code = result;
          }
          edit_purchase_request(conn).then(function (result) { // 1. UPDATE PURCHASE REQUEST

            edit_purchase_request_detail(conn).then(function (result) { // 2. UPDATE PURCHASE REQUEST DETAIL

              conn.commit(function (err) {
                 res.send(row); return;
              });

            }).catch(error => { // END 2
              conn.rollback(function () {
                console.log('false edit_purchase_request_detail');
                 res.send(row); return;
              });
            });

          }).catch(error => { // END 1
            conn.rollback(function () {
              console.log('false edit_purchase_request');
               res.send(row); return;
            });
          });

        }).catch(error => { // END 1
          conn.rollback(function () {
            console.log('false edit_purchase_request');
             res.send(row); return;
          });
        });

      });

    });

    function edit_purchase_request(conn) {

      return new Promise(function (resolve, reject) {

        var data = {
          purchase_request_code: purchase_request_code,
          businesspartner_id: req.body.businesspartner_id,
          branch_id: req.body.branch_id,
          warehouse_id: req.body.warehouse_id,
          transaction_date: req.body.transaction_date,
          description: req.body.description,
          purchase_category_id: req.body.purchase_category_id,
          // purchase_link_id: req.body.purchase_link_id,
          purchase_status_id: req.body.purchase_status_id,
          transaction_date: tsservice.mysqlDate(req.body.transaction_date),
          update_by: req.body.update_by,
          update_datetime: tsservice.mysqlDate(req.body.update_datetime),
          is_use: req.body.is_use,
          is_active: req.body.is_active
        };

        tsservice.updateData(data, function (value) {
          //   -UPDATE-PURCHASE_REQUEST
          var query = conn.query(`UPDATE ${CUS_DB}.purchase_request SET ${value} WHERE purchase_request_id =${req.body.purchase_request_id} `, function (err, rows) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
              reject(false);
            }
            resolve(true);
          });
        });

      });

    }

    function edit_purchase_request_detail(conn) {
      return new Promise(function (resolve, reject) {
        var querystr = "";
        async.forEach(req.body.purchase_request_detail, function (item, callback) {

          if (item.purchase_request_detail_id == "" && item.is_active == 1) {

            if (querystr != "") {
              querystr += ', ';
            }
            querystr += '("' + req.body.purchase_request_id + '", "' + item.inventory_id + '", "' + item.warehouse_id + '", "' + item.row_label + '", "' + item.row_order + '", "' + item.quantity + '", "' + item.quantityeqv + '", "' + item.uom_order + '", "' + item.uom_label + '", "' + item.inventory_label + '", "' + item.description + '","' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '", 1, 1)';

          } else {

            var data = {
              inventory_id: item.inventory_id,
              warehouse_id: item.warehouse_id,
              row_label: item.row_label,
              row_order: item.row_order,
              quantity: item.quantity,
              quantityeqv: item.quantityeqv,
              uom_order: item.uom_order,
              uom_label: item.uom_label,
              inventory_label: item.inventory_label,
              description: item.description,
              update_by: req.body.update_by,
              update_datetime: tsservice.mysqlDate(req.body.update_datetime),
              is_use: req.body.is_use,
              is_active: req.body.is_active
            };

            tsservice.updateData(data, function (value) {
              //   -UPDATE-PURCHASE_REQUEST_DETAIL
              var query = conn.query(`UPDATE ${CUS_DB}.purchase_request_detail SET ${value} WHERE purchase_request_detail_id =${item.purchase_request_detail_id} `, function (err, rows) {

                if (err) {
                  row.success = false; console.log(err);
                  row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
                  reject(false);
                }

              });
            });

          }

          callback();

        }, function (err) {
          if (err) {
            row.success = false; console.log(err);
            row.label = 'Server failed prosess data. try again or contact our IT support';
            reject(false);
          }

          if (querystr != "") {

            var myfireStr = `INSERT INTO ${CUS_DB}.purchase_request_detail( purchase_request_id, inventory_id, warehouse_id, row_label, row_order, quantity, quantityeqv, uom_order, uom_label, inventory_label, description, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + querystr;

            //   -INSERT-PURCHASE_REQUEST_DETAIL
            var query = conn.query(myfireStr, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
                reject(false);
              }
              resolve(true);

            });
          } else {
            resolve(true);
          }
        });

      });

    }

  },

  //   REST-SELECT
  purchase_requestsDetail_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { purchase_request_detail: [] }, label: 'Data entered successfully' };
    // validation
    req.assert('purchase_request_id', 'Purchase Quotation Id is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var queryOption = "";

    queryOption = "AND t1.purchase_request_id = '" + req.body.purchase_request_id + "'";

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      //change ori price with hpp
      var myfireStr = `SELECT t1.*, t2.*, t2.selling_price as "price", t1.quantity as "ordered", t1.quantityeqv as "orderedeqv" FROM ${CUS_DB}.purchase_request_detail t1 INNER JOIN ${CUS_DB}.inventory t2 ON t1.inventory_id = t2.inventory_id WHERE t1.is_use = 1 AND t1.is_active = 1 ${queryOption}`;

      //   -SELECT-PURCHASE_REQUEST_DETAIL   -JOIN-INVENTORY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.purchase_request_detail = rows;
         res.send(row); return;
      });

    });

  }
}

module.exports = controller;