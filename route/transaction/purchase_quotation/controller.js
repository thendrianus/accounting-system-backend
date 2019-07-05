var tsservice = require('./../../tsservice');
var async = require('async');
var add_purchase_link = require('../purchase/add_purchase_link');

function select_purchase_quotation_code(conn, req, row) {

  const CUS_DB = req.body.company_db;
  
  return new Promise(function (resolve, reject) {

    if (req.body.purchase_quotation_code == "" && req.body.purchase_status_id != '1') {

      var codeData = {
        special_code_id: "PURCHASE_QUOTATION",
        table: "purchase_quotation",
        column_id: "purchase_quotation_id",
        column_code: "purchase_quotation_code",
      }

      var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

      //   -SELECT-SPECIAL_CODE   -SELECT-PURCHASE_QUOTATION
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
          reject(row);
        }

        if (rows[0]['code']) {

          row.data.purchase_quotation_code = rows[0]['code'];
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
  purchase_quotationsselect_post: function (req, res, next) {

    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { purchase_quotations: [] }, label: 'Berhasil' };

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

      var myfireStr = `SELECT t1.*, t1.purchase_quotation_code as "code", t1.purchase_status_id as "oripurchase_status_id", t1.sub_total as "orisub_total", t1.tax as "oritax", t1.grand_total as "origrand_total", t1.downpayment as "oridownpayment", t1.landed_cost as "orilanded_cost", t1.payable as "oripayable", DATE_FORMAT(t1.transaction_date, "%d %M %Y") as "transaction_date_show" , "[]" as "purchase_quotation_detail",t2.businesspartner_code, t2.name as "businesspartner_name", t3.name "purchase_quotation_status_name", t4.name as "branch_name",t5.name "purchase_quotation_payment_name" , concat(t6.firstname, " ", t6.lastname) as "employee_name" FROM ${CUS_DB}.purchase_quotation t1 INNER JOIN ${CUS_DB}.businesspartner t2 ON t1.businesspartner_id = t2.businesspartner_id INNER JOIN ${CUS_DB}.purchase_status t3 ON t1.purchase_status_id = t3.purchase_status_id INNER JOIN ${CUS_DB}.branch t4 ON t1.branch_id = t4.branch_id INNER JOIN ${CUS_DB}.transaction_payment t5 ON t1.transaction_payment_id = t5.transaction_payment_id INNER JOIN ${CUS_DB}.employee t6 ON t1.create_by = t6.employee_id WHERE ${strwhere} t1.is_active = 1 ORDER BY t1.purchase_quotation_id DESC`;

      //   -SELECT-PURCHASE_QUOTATION   -JOIN-BUSINESSPARTNER   -JOIN-PURCHASE_STATUS   -JOIN-BRANCH   -JOIN-TRANSACTION_PAYMENT   -JOIN-EMPLOYEE
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.purchase_quotations = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  purchase_quotations_post: function (req, res, next) {

    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { purchase_quotation_id: '', purchase_quotation_code: '' }, label: 'Data entered successfully' };

    // validation
    // req.assert('purchase_quotation_id','Purchase Quotation Id is required');
    // req.assert('purchase_quotation_code','Purchase Quotation Code/Id is required');
    req.assert('currency_id', 'Currency data is required');
    req.assert('businesspartner_id', 'Business Partner Order is required');
    req.assert('branch_id', 'Branch is required');
    req.assert('warehouse_id', 'Ware House Id is required');
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('description', 'Description is required');
    req.assert('discount_amount', 'Discount Amount is required');
    req.assert('discount_persent', 'Discount Persent is required');
    req.assert('tax_id', 'Tax Id is required');
    req.assert('landed_cost', 'Landed Cost is required');
    req.assert('detail_landed_cost', 'detail Landed Cost is required');
    req.assert('purchasesman_id', 'Purchaseman is required');
    req.assert('delivery_address', 'Delivery Address is required');
    req.assert('tax', 'Tax is required');
    req.assert('purchase_category_id', 'Purchase Category Id is required');
    req.assert('transaction_payment_id', 'Purchase Payment Id is required');
    req.assert('sub_total', 'Sub Total is required');
    req.assert('discount_date', 'Discount Date is required');
    req.assert('due_date', 'Due Date is required');
    req.assert('early_discount', 'Early Discount is required');
    req.assert('late_charge', 'Late Charge is required');
    req.assert('purchase_link_id', 'Purchase Link Id is required');
    req.assert('isdelivery', 'Is Delivery is required');
    req.assert('delivery_note', 'Delivery Note is required');
    req.assert('delivery_schedule', 'Delivery Schedule is required');
    req.assert('reference_label', 'Reference Label is required');
    req.assert('reference_code', 'Reference Code is required');
    req.assert('purchase_status_id', 'Purchase Status Id is required');
    req.assert('downpayment', 'Down Payment is required');
    req.assert('downpayment_persent', 'Downpayment Persent is required');
    req.assert('payable', 'Payable is required');
    req.assert('grand_total', 'Grand Total is required');
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

    var purchase_quotation_code = '';
    var purchase_quotation_id = 0;

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }
      conn.beginTransaction(function (err) {
        select_purchase_quotation_code(conn, req, row).then(function (result) { // 1. SELECT PURCHASE CODE
          if (result) {
            purchase_quotation_code = result;
          }
          add_purchase_quotation(conn).then(function (result) { // 2. INSERT PURCHASE QUOTATION

            purchase_quotation_id = result;
            add_purchase_quotation_detail(conn).then(function (result) { // 3. INSERT PURCHASE QUOTATION DETAIL 

              row.data.purchase_quotation_code = purchase_quotation_code;
              row.data.purchase_quotation_id = purchase_quotation_id;
              conn.commit(function (err) {
                 res.send(row); return;
              });

            }).catch(error => { // END 3
              conn.rollback(function () {
                console.log('false add_purchase_quotation_detail');
                 res.send(row); return;
              });
            });

          }).catch(error => { // END 2
            conn.rollback(function () {
              console.log('false add_purchase_quotation');
               res.send(row); return;
            });
          });

        }).catch(error => { // END 1
          conn.rollback(function () {
            console.log('false select_purchase_quotation_code');
             res.send(row); return;
          });
        });
      });

    });

    function add_purchase_quotation(conn) {

      return new Promise(function (resolve, reject) {

        var data = {
          purchase_quotation_code: purchase_quotation_code,
          currency_id: req.body.currency_id,
          rate: req.body.rate,
          businesspartner_id: req.body.businesspartner_id,
          branch_id: req.body.branch_id,
          warehouse_id: req.body.warehouse_id,
          transaction_date: req.body.transaction_date,
          description: req.body.description,
          discount_amount: req.body.discount_amount,
          discount_persent: req.body.discount_persent,
          tax_id: req.body.tax_id,
          landed_cost: req.body.landed_cost,
          detail_landed_cost: req.body.detail_landed_cost,
          purchasesman_id: req.body.purchasesman_id,
          delivery_address: req.body.delivery_address,
          tax: req.body.tax,
          purchase_category_id: req.body.purchase_category_id,
          transaction_payment_id: req.body.transaction_payment_id,
          sub_total: req.body.sub_total,
          discount_date: req.body.discount_date,
          due_date: req.body.due_date,
          early_discount: req.body.early_discount,
          late_charge: req.body.late_charge,
          purchase_link_id: req.body.purchase_link_id,
          isdelivery: req.body.isdelivery,
          delivery_note: req.body.delivery_note,
          delivery_schedule: req.body.delivery_schedule,
          reference_label: req.body.reference_label,
          reference_code: req.body.reference_code,
          purchase_status_id: req.body.purchase_status_id,
          downpayment: req.body.downpayment,
          downpayment_persent: req.body.downpayment_persent,
          grand_total: req.body.grand_total,
          payable: req.body.payable,
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
            //   -INSERT-PURCHASE_QUOTATION
            var query = conn.query(`INSERT INTO ${CUS_DB}.purchase_quotation` + value, function (err, rows) {
  
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

    function add_purchase_quotation_detail(conn) {
      return new Promise(function (resolve, reject) {
        var querystr = "";

        async.forEach(req.body.purchase_quotation_detail, function (item, callback) {

          if (item.is_active == 1) {
            if (querystr != "") {
              querystr += ', ';
            }
            querystr += '("' + purchase_quotation_id + '", "' + item.inventory_id + '", "' + item.warehouse_id + '", "' + item.row_label + '", "' + item.row_order + '", "' + item.inventory_hpp + '", "' + item.ordered + '", "' + item.orderedeqv + '", "' + item.delivered + '", "' + item.deliveredeqv + '", "' + item.price + '", "' + item.landed_cost + '", "' + item.discount_persent + '", "' + item.discount_amount + '", "' + item.uom_order + '", "' + item.uom_label + '", "' + item.isdelivery + '", "' + item.tax_id + '", "' + item.tax + '", "' + item.delivery_schedule + '", "' + item.delivery_note + '", "' + item.inventory_label + '", "' + item.description + '","' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '", 1, 1)';
          }
          callback();

        }, function (err) {
          if (err) {
            row.success = false; console.log(err);
            row.label = 'Server failed prosess data. try again or contact our IT support';
            reject(false);
          }

          if (querystr != "") {

            var myfireStr = `INSERT INTO ${CUS_DB}.purchase_quotation_detail( purchase_quotation_id, inventory_id, warehouse_id, row_label, row_order, inventory_hpp, ordered, orderedeqv, delivered, deliveredeqv, price, landed_cost, discount_persent, discount_amount, uom_order, uom_label, isdelivery, tax_id, tax, delivery_schedule, delivery_note, inventory_label, description, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + querystr;

            //   -INSERT-PURCHASE-QUOTATION_DETAIL
            var query = conn.query(myfireStr, function (err, rows) {

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
  purchase_quotations_put: function (req, res, next) {

    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { purchase_quotation_id: '', purchase_quotation_code: '' }, label: 'Data updated successfully' };

    // validation
    req.assert('purchase_quotation_id', 'Purchase Quotation Id is required');
    // req.assert('purchase_quotation_code','Purchase Quotation Code/Id is required');
    req.assert('currency_id', 'Currency data is required');
    req.assert('businesspartner_id', 'Business Partner Order is required');
    req.assert('branch_id', 'Branch is required');
    req.assert('warehouse_id', 'Ware House Id is required');
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('description', 'Description is required');
    req.assert('discount_amount', 'Discount Amount is required');
    req.assert('discount_persent', 'Discount Persent is required');
    req.assert('tax_id', 'Tax Id is required');
    req.assert('landed_cost', 'Landed Cost is required');
    req.assert('detail_landed_cost', 'detail Landed Cost is required');
    req.assert('purchasesman_id', 'Purchaseman is required');
    req.assert('delivery_address', 'Delivery Address is required');
    req.assert('tax', 'Tax is required');
    req.assert('purchase_category_id', 'Purchase Category Id is required');
    req.assert('transaction_payment_id', 'Purchase Payment Id is required');
    req.assert('sub_total', 'Sub Total is required');
    req.assert('discount_date', 'Discount Date is required');
    req.assert('due_date', 'Due Date is required');
    req.assert('early_discount', 'Early Discount is required');
    req.assert('late_charge', 'Late Charge is required');
    req.assert('purchase_link_id', 'Purchase Link Id is required');
    req.assert('isdelivery', 'Is Delivery is required');
    req.assert('delivery_note', 'Delivery Note is required');
    req.assert('delivery_schedule', 'Delivery Schedule is required');
    req.assert('reference_label', 'Reference Label is required');
    req.assert('reference_code', 'Reference Code is required');
    req.assert('purchase_status_id', 'Purchase Status Id is required');
    req.assert('downpayment', 'Down Payment is required');
    req.assert('downpayment_persent', 'Downpayment Persent is required');
    req.assert('grand_total', 'Grand Total is required');
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

    var purchase_quotation_code = req.body.purchase_quotation_code;
    var purchase_quotation_id = req.body.purchase_quotation_id;

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {
        select_purchase_quotation_code(conn, req, row).then(function (result) { // 1. SELECT PURCHASE QUOTATION CODE
          if (result) {
            purchase_quotation_code = result;
            row.data.purchase_quotation_code = result;
          }
          edit_purchase_quotation(conn).then(function (result) { // 2. UPDATE PURCHASE QUOTATION

            edit_purchase_quotation_detail(conn).then(function (result) { // 3. UPDATE PURCHASE QUOTATION DETAIL

              conn.commit(function (err) {
                 res.send(row); return;
              });

            }).catch(error => { // END 3
              conn.rollback(function () {
                console.log('false edit_purchase_quotation_detail');
                 res.send(row); return;
              });
            });

          }).catch(error => { // END 2
            conn.rollback(function () {
              console.log('false edit_purchase_quotation');
               res.send(row); return;
            });
          });

        }).catch(error => { // END 1
          conn.rollback(function () {
            console.log('false edit_purchase_quotation');
             res.send(row); return;
          });
        });

      });

    });

    function edit_purchase_quotation(conn) {

      return new Promise(function (resolve, reject) {

        var data = {
          purchase_quotation_code: purchase_quotation_code,
          currency_id: req.body.currency_id,
          rate: req.body.rate,
          businesspartner_id: req.body.businesspartner_id,
          branch_id: req.body.branch_id,
          warehouse_id: req.body.warehouse_id,
          transaction_date: req.body.transaction_date,
          description: req.body.description,
          discount_amount: req.body.discount_amount,
          discount_persent: req.body.discount_persent,
          tax_id: req.body.tax_id,
          landed_cost: req.body.landed_cost,
          detail_landed_cost: req.body.detail_landed_cost,
          purchasesman_id: req.body.purchasesman_id,
          delivery_address: req.body.delivery_address,
          tax: req.body.tax,
          purchase_category_id: req.body.purchase_category_id,
          transaction_payment_id: req.body.transaction_payment_id,
          sub_total: req.body.sub_total,
          discount_date: req.body.discount_date,
          due_date: req.body.due_date,
          early_discount: req.body.early_discount,
          late_charge: req.body.late_charge,
          // purchase_link_id: req.body.purchase_link_id,
          isdelivery: req.body.isdelivery,
          delivery_note: req.body.delivery_note,
          delivery_schedule: req.body.delivery_schedule,
          reference_label: req.body.reference_label,
          reference_code: req.body.reference_code,
          purchase_status_id: req.body.purchase_status_id,
          downpayment: req.body.downpayment,
          downpayment_persent: req.body.downpayment_persent,
          grand_total: req.body.grand_total,
          payable: req.body.payable,
          transaction_date: tsservice.mysqlDate(req.body.transaction_date),
          update_by: req.body.update_by,
          update_datetime: tsservice.mysqlDate(req.body.update_datetime),
          is_use: req.body.is_use,
          is_active: req.body.is_active
        };

        tsservice.updateData(data, function (value) {
          //   -UPDATE-PURCHASE_QUOTATION
          var query = conn.query(`UPDATE ${CUS_DB}.purchase_quotation SET ${value} WHERE purchase_quotation_id =${req.body.purchase_quotation_id} `, function (err, rows) {

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

    function edit_purchase_quotation_detail(conn) {
      return new Promise(function (resolve, reject) {
        var querystr = "";
        async.forEach(req.body.purchase_quotation_detail, function (item, callback) {

          // IF DETAIL DATA HAVENT SAVE( NEW DATA )
          if (item.purchase_quotation_detail_id == "" && item.is_active == 1) {

            if (querystr != "") {
              querystr += ', ';
            }
            querystr += '("' + req.body.purchase_quotation_id + '", "' + item.inventory_id + '", "' + item.warehouse_id + '", "' + item.row_label + '", "' + item.row_order + '", "' + item.inventory_hpp + '", "' + item.ordered + '", "' + item.orderedeqv + '", "' + item.delivered + '", "' + item.deliveredeqv + '", "' + item.price + '", "' + item.landed_cost + '", "' + item.discount_persent + '", "' + item.discount_amount + '", "' + item.uom_order + '", "' + item.uom_label + '", "' + item.isdelivery + '", "' + item.tax_id + '", "' + item.tax + '", "' + item.delivery_schedule + '", "' + item.delivery_note + '", "' + item.inventory_label + '", "' + item.description + '","' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '", 1, 1)';

          } else {

            var data = {
              inventory_id: item.inventory_id,
              warehouse_id: item.warehouse_id,
              row_label: item.row_label,
              row_order: item.row_order,
              inventory_hpp: item.inventory_hpp,
              ordered: item.ordered,
              orderedeqv: item.orderedeqv,
              delivered: item.delivered,
              deliveredeqv: item.deliveredeqv,
              price: item.price,
              landed_cost: item.landed_cost,
              discount_persent: item.discount_persent,
              discount_amount: item.discount_amount,
              uom_order: item.uom_order,
              uom_label: item.uom_label,
              isdelivery: item.isdelivery,
              tax_id: item.tax_id,
              tax: item.tax,
              delivery_schedule: item.delivery_schedule,
              delivery_note: item.delivery_note,
              inventory_label: item.inventory_label,
              description: item.description,
              update_by: req.body.update_by,
              update_datetime: tsservice.mysqlDate(req.body.update_datetime),
              is_use: req.body.is_use,
              is_active: req.body.is_active
            };

            tsservice.updateData(data, function (value) {
              //   -UPDATE-PURCHASE_QUOTATION_DETAIL
              var query = conn.query(`UPDATE ${CUS_DB}.purchase_quotation_detail SET ${value} WHERE purchase_quotation_detail_id =${item.purchase_quotation_detail_id} `, function (err, rows) {

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

          // IF NEW DATA EXIST
          if (querystr != "") {

            var myfireStr = `INSERT INTO ${CUS_DB}.purchase_quotation_detail( purchase_quotation_id, inventory_id, warehouse_id, row_label, row_order, inventory_hpp, ordered, orderedeqv, delivered, deliveredeqv, price, landed_cost, discount_persent, discount_amount, uom_order, uom_label, isdelivery, tax_id, tax, delivery_schedule, delivery_note, inventory_label, description, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + querystr;

            //   -INSERT-PURCHASE_QUOTATION_DETAIL
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
  purchase_quotationsDetail_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { purchase_quotation_detail: [] }, label: 'Data entered successfully' };
    // validation
    req.assert('purchase_quotation_id', 'Purchase Quotation Id is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var queryOption = "";

    queryOption = "AND t1.purchase_quotation_id = '" + req.body.purchase_quotation_id + "'";

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      //change ori price with hpp
      var myfireStr = `SELECT t1.*, t2.*, t2.selling_price as "oriprice", 0 as "min_price" FROM ${CUS_DB}.purchase_quotation_detail t1 INNER JOIN ${CUS_DB}.inventory t2 ON t1.inventory_id = t2.inventory_id WHERE t1.is_use = 1 AND t1.is_active = 1 ${queryOption}`;

      //   -SELECT-PURCHASE_QUOTATION_DETAIL   -JOIN-INVENTORY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.purchase_quotation_detail = rows;
         res.send(row); return;
      });

    });

  },
}

module.exports = controller;