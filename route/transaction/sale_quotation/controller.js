var tsservice = require('./../../tsservice');
var async = require('async');
var add_sale_link = require('../sale/add_sale_link');

function select_sale_quotation_code(conn, req, row) {
  const CUS_DB = req.body.company_db;
  return new Promise(function (resolve, reject) {

    if (req.body.sale_quotation_code == "" && req.body.sale_status_id != '1') {

      var codeData = {
        special_code_id: "SALE_QUOTATION",
        table: "sale_quotation",
        column_id: "sale_quotation_id",
        column_code: "sale_quotation_code",
      }

      var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

      //   -SELECT-SPECIAL_CODE   -SELECT-SALE_QUOTATION
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
          reject(row);
        }

        if (rows[0]['code']) {

          row.data.sale_quotation_code = rows[0]['code'];
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
  sale_quotationsselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { sale_quotations: [] }, label: 'Berhasil' };

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
        strwhere += " t1.sale_status_id = 5 AND ";
      }

      var myfireStr = `SELECT t1.*, t1.sale_quotation_code as "code", t1.sale_status_id as "orisale_status_id", t1.sub_total as "orisub_total", t1.tax as "oritax", t1.grand_total as "origrand_total", t1.downpayment as "oridownpayment", t1.landed_cost as "orilanded_cost", t1.receivable as "orireceivable", DATE_FORMAT(t1.transaction_date, "%d %M %Y") as "transaction_date_show", "[]" as "sale_quotation_detail",t2.businesspartner_code, t2.name as "businesspartner_name", t3.name "sale_status_name", t4.name as "branch_name",t5.name "sale_quotation_payment_name" , concat(t6.firstname, " ", t6.lastname) as "employee_name" FROM ${CUS_DB}.sale_quotation t1 INNER JOIN ${CUS_DB}.businesspartner t2 ON t1.businesspartner_id = t2.businesspartner_id INNER JOIN ${CUS_DB}.sale_status t3 ON t1.sale_status_id = t3.sale_status_id INNER JOIN ${CUS_DB}.branch t4 ON t1.branch_id = t4.branch_id INNER JOIN ${CUS_DB}.transaction_payment t5 ON t1.transaction_payment_id = t5.transaction_payment_id INNER JOIN ${CUS_DB}.employee t6 ON t1.create_by = t6.employee_id WHERE ${strwhere} t1.is_active = 1 ORDER BY t1.sale_quotation_id DESC`;

      //   -SELECT-SALE_QUOTATION   -JOIN-BUSINESSPARTNER   -JOIN-SALE_STATUS   -JOIN-BRANCH   -JOIN-TRANSACTION_PAYMENT   -JOIN-EMPLOYEE
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.sale_quotations = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  sale_quotations_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { sale_quotation_id: '', sale_quotation_code: '' }, label: 'Data entered successfully' };

    // validation
    // req.assert('sale_quotation_id','Sale Quotation Id is required');
    // req.assert('sale_quotation_code','Sale Quotation Code / Id is required');
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
    req.assert('salesman_id', 'Salesman Id is required');
    req.assert('delivery_address', 'Delivery Address is required');
    req.assert('tax', 'Tax is required');
    req.assert('sale_category_id', 'Sale Category Id is required');
    req.assert('transaction_payment_id', 'Sale Payment Id is required');
    req.assert('sub_total', 'Sub Total is required');
    req.assert('discount_date', 'Discount Date is required');
    req.assert('due_date', 'Due Date is required');
    req.assert('early_discount', 'Early Discount is required');
    req.assert('late_charge', 'Late Charge is required');
    req.assert('sale_link_id', 'Sale Link Id is required');
    req.assert('isdelivery', 'Is Delivery is required');
    req.assert('delivery_note', 'Delivery Note is required');
    req.assert('delivery_schedule', 'Delivery Schedule is required');
    req.assert('reference_label', 'Reference Label is required');
    req.assert('reference_code', 'Reference Code is required');
    req.assert('sale_status_id', 'Sale Status Id is required');
    req.assert('downpayment', 'Down Payment is required');
    req.assert('downpayment_persent', 'Downpayment Persent is required');
    req.assert('receivable', 'Receivable is required');
    req.assert('grand_total', 'Grand Total is required');
    req.assert('create_by', 'Created by is required');
    req.assert('create_datetime', 'Create date and time is required');
    req.assert('is_use', 'Used data is required');
    req.assert('is_active', 'Active data is required');
    req.assert('orisale_status_id', '');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
       res.send(row); return;
      
    }

    var sale_quotation_code = '';
    var sale_quotation_id = 0;

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {
        select_sale_quotation_code(conn, req, row).then(function (result) { // 1. SELECT SALE QUOTATION CODE

          if (result) {
            sale_quotation_code = result;
          }
          add_sale_quotation(conn).then(function (result) { // 2. INSERT SALE QUOTATION

            sale_quotation_id = result;
            add_sale_quotation_detail(conn).then(function (result) { // 3. INSERT SALE QUOTATION DETAIL

              row.data.sale_quotation_code = sale_quotation_code;
              row.data.sale_quotation_id = sale_quotation_id;
              conn.commit(function (err) {
                 res.send(row); return;
              });

            }).catch(error => { // 3 END
              conn.rollback(function () {
                console.log('false add_sale_quotation_detail');
                 res.send(row); return;
              });
            });

          }).catch(error => { // 2 END
            conn.rollback(function () {
              console.log('false add_sale_quotation');
               res.send(row); return;
            });
          });

        }).catch(error => { // 1 END
          conn.rollback(function () {
            console.log('false select_sale_quotation_code');
             res.send(row); return;
          });
        });
      });

    });

    function add_sale_quotation(conn) {

      return new Promise(function (resolve, reject) {

        var data = {
          sale_quotation_code: sale_quotation_code,
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
          salesman_id: req.body.salesman_id,
          delivery_address: req.body.delivery_address,
          tax: req.body.tax,
          sale_category_id: req.body.sale_category_id,
          transaction_payment_id: req.body.transaction_payment_id,
          sub_total: req.body.sub_total,
          discount_date: req.body.discount_date,
          due_date: req.body.due_date,
          early_discount: req.body.early_discount,
          late_charge: req.body.late_charge,
          sale_link_id: req.body.sale_link_id,
          isdelivery: req.body.isdelivery,
          delivery_note: req.body.delivery_note,
          delivery_schedule: req.body.delivery_schedule,
          reference_label: req.body.reference_label,
          reference_code: req.body.reference_code,
          sale_status_id: req.body.sale_status_id,
          downpayment: req.body.downpayment,
          downpayment_persent: req.body.downpayment_persent,
          grand_total: req.body.grand_total,
          receivable: req.body.receivable,
          transaction_date: tsservice.mysqlDate(req.body.transaction_date),
          create_by: req.body.create_by,
          create_datetime: tsservice.mysqlDate(req.body.create_datetime),
          update_by: req.body.create_by,
          update_datetime: tsservice.mysqlDate(req.body.create_datetime),
          is_use: '1', is_active: '1'
        };

        add_sale_link(conn, req, row).then(function (result) {
        
          data.sale_link_id = result;
  
          tsservice.insertData(data, function (value) {
            //   -INSERT-SALE_QUOTATION
            var query = conn.query(`INSERT INTO ${CUS_DB}.sale_quotation` + value, function (err, rows) {
  
              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                reject(false);
              }
  
              resolve(rows.insertId);
            });
          });
  
        }).catch(error => { //CATCH STEP 8
          console.log(error)
          conn.rollback(function () {
            console.log('false add_generalledger');
            row = error;
            res.send(row); return;
          });
        });

      });

    }

    function add_sale_quotation_detail(conn) {
      return new Promise(function (resolve, reject) {
        var querystr = "";

        async.forEach(req.body.sale_quotation_detail, function (item, callback) {

          if (item.is_active == 1) {
            if (querystr != "") {
              querystr += ', ';
            }
            querystr += '("' + sale_quotation_id + '", "' + item.inventory_id + '", "' + item.warehouse_id + '", "' + item.row_label + '", "' + item.row_order + '", "' + item.inventory_hpp + '", "' + item.ordered + '", "' + item.orderedeqv + '", "' + item.delivered + '", "' + item.deliveredeqv + '", "' + item.price + '", "' + item.landed_cost + '", "' + item.discount_persent + '", "' + item.discount_amount + '", "' + item.uom_order + '", "' + item.uom_label + '", "' + item.isdelivery + '", "' + item.tax_id + '", "' + item.tax + '", "' + item.delivery_schedule + '", "' + item.delivery_note + '", "' + item.inventory_label + '", "' + item.description + '","' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '", 1, 1)';
          }
          callback();

        }, function (err) {
          if (err) {
            row.success = false; console.log(err);
            row.label = 'Server failed prosess data. try again or contact our IT support';
            reject(false);
          }

          if (querystr != "") {

            var myfireStr = `INSERT INTO ${CUS_DB}.sale_quotation_detail( sale_quotation_id, inventory_id, warehouse_id, row_label, row_order, inventory_hpp, ordered, orderedeqv, delivered, deliveredeqv, price, landed_cost, discount_persent, discount_amount, uom_order, uom_label, isdelivery, tax_id, tax, delivery_schedule, delivery_note, inventory_label, description, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + querystr;

            //   -INSERT-SALE_QUOTATION_DETAIL
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
  sale_quotations_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { sale_quotation_id: '', sale_quotation_code: '' }, label: 'Data updated successfully' };

    // validation
    req.assert('sale_quotation_id', 'Sale Quotation Id is required');
    // req.assert('sale_quotation_code','Sale Quotation Code / Id is required');
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
    req.assert('salesman_id', 'Salesman Id is required');
    req.assert('delivery_address', 'Delivery Address is required');
    req.assert('tax', 'Tax is required');
    req.assert('sale_category_id', 'Sale Category Id is required');
    req.assert('transaction_payment_id', 'Sale Payment Id is required');
    req.assert('sub_total', 'Sub Total is required');
    req.assert('discount_date', 'Discount Date is required');
    req.assert('due_date', 'Due Date is required');
    req.assert('early_discount', 'Early Discount is required');
    req.assert('late_charge', 'Late Charge is required');
    // req.assert('sale_link_id', 'Sale Link Id is required');
    req.assert('isdelivery', 'Is Delivery is required');
    req.assert('delivery_note', 'Delivery Note is required');
    req.assert('delivery_schedule', 'Delivery Schedule is required');
    req.assert('reference_label', 'Reference Label is required');
    req.assert('reference_code', 'Reference Code is required');
    req.assert('sale_status_id', 'Sale Status Id is required');
    req.assert('downpayment', 'Down Payment is required');
    req.assert('downpayment_persent', 'Downpayment Persent is required');
    req.assert('grand_total', 'Grand Total is required');
    req.assert('update_by', 'Updated By is required');
    req.assert('update_datetime', 'Update Date and time is required');
    req.assert('is_use', 'Used data is required');
    req.assert('is_active', 'Active data is required');
    req.assert('orisale_status_id', '');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var sale_quotation_code = req.body.sale_quotation_code;
    var sale_quotation_id = req.body.sale_quotation_id;

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {
        select_sale_quotation_code(conn, req, row).then(function (result) { // 1. SELECT SALE QUOTATION
          if (result) {
            sale_quotation_code = result;
            row.data.sale_quotation_code = result;
          }
          edit_sale_quotation(conn).then(function (result) { // 2. UPDATE SALE QUOTATION

            edit_sale_quotation_detail(conn).then(function (result) { // 3. UPDATE SALE QUOTATION DETAIL

              conn.commit(function (err) {
                 res.send(row); return;
              });

            }).catch(error => { // 3 END
              conn.rollback(function () {
                console.log('false edit_sale_quotation_detail');
                 res.send(row); return;
              });
            });

          }).catch(error => { // 2 END
            conn.rollback(function () {
              console.log('false edit_sale_quotation');
               res.send(row); return;
            });
          });

        }).catch(error => { // 1 END
          conn.rollback(function () {
            console.log('false select_sale_quotation_code');
             res.send(row); return;
          });
        });

      });

    });

    function edit_sale_quotation(conn) {

      return new Promise(function (resolve, reject) {

        var data = {
          sale_quotation_code: sale_quotation_code,
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
          salesman_id: req.body.salesman_id,
          delivery_address: req.body.delivery_address,
          tax: req.body.tax,
          sale_category_id: req.body.sale_category_id,
          transaction_payment_id: req.body.transaction_payment_id,
          sub_total: req.body.sub_total,
          discount_date: req.body.discount_date,
          due_date: req.body.due_date,
          early_discount: req.body.early_discount,
          late_charge: req.body.late_charge,
          // sale_link_id: req.body.sale_link_id,
          isdelivery: req.body.isdelivery,
          delivery_note: req.body.delivery_note,
          delivery_schedule: req.body.delivery_schedule,
          reference_label: req.body.reference_label,
          reference_code: req.body.reference_code,
          sale_status_id: req.body.sale_status_id,
          downpayment: req.body.downpayment,
          downpayment_persent: req.body.downpayment_persent,
          grand_total: req.body.grand_total,
          receivable: req.body.receivable,
          transaction_date: tsservice.mysqlDate(req.body.transaction_date),
          update_by: req.body.update_by,
          update_datetime: tsservice.mysqlDate(req.body.update_datetime),
          is_use: req.body.is_use,
          is_active: req.body.is_active
        };

        tsservice.updateData(data, function (value) {
          //   -UPDATE-SALE_QUOTATION
          var query = conn.query(`UPDATE ${CUS_DB}.sale_quotation SET ${value} WHERE sale_quotation_id =${req.body.sale_quotation_id} `, function (err, rows) {

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

    function edit_sale_quotation_detail(conn) {
      return new Promise(function (resolve, reject) {
        var querystr = "";
        async.forEach(req.body.sale_quotation_detail, function (item, callback) {

          if (item.sale_quotation_detail_id == "" && item.is_active == 1) {

            if (querystr != "") {
              querystr += ', ';
            }
            querystr += '("' + req.body.sale_quotation_id + '", "' + item.inventory_id + '", "' + item.warehouse_id + '", "' + item.row_label + '", "' + item.row_order + '", "' + item.inventory_hpp + '", "' + item.ordered + '", "' + item.orderedeqv + '", "' + item.delivered + '", "' + item.deliveredeqv + '", "' + item.price + '", "' + item.landed_cost + '", "' + item.discount_persent + '", "' + item.discount_amount + '", "' + item.uom_order + '", "' + item.uom_label + '", "' + item.isdelivery + '", "' + item.tax_id + '", "' + item.tax + '", "' + item.delivery_schedule + '", "' + item.delivery_note + '", "' + item.inventory_label + '", "' + item.description + '","' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '", 1, 1)';

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
              //UDPATE-SALE_QUOTATION
              var query = conn.query(`UPDATE ${CUS_DB}.sale_quotation_detail SET ${value} WHERE sale_quotation_detail_id =${item.sale_quotation_detail_id} `, function (err, rows) {

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

            var myfireStr = `INSERT INTO ${CUS_DB}.sale_quotation_detail( sale_quotation_id, inventory_id, warehouse_id, row_label, row_order, inventory_hpp, ordered, orderedeqv, delivered, deliveredeqv, price, landed_cost, discount_persent, discount_amount, uom_order, uom_label, isdelivery, tax_id, tax, delivery_schedule, delivery_note, inventory_label, description, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + querystr;

            //   -INSERT-SALE_QUOTATION_DETAIL
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

  //   REST-SELECT
  sale_quotationsDetail_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { sale_quotation_detail: [] }, label: 'Data selected successfully' };
    // validation
    req.assert('sale_quotation_id', 'Sale Quotation Id is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var queryOption = "";

    queryOption = "AND t1.sale_quotation_id = '" + req.body.sale_quotation_id + "'";

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      //change ori price with hpp
      var myfireStr = `SELECT t1.*, t2.*, t2.selling_price as "oriprice", 0 as "min_price" FROM ${CUS_DB}.sale_quotation_detail t1 INNER JOIN ${CUS_DB}.inventory t2 ON t1.inventory_id = t2.inventory_id WHERE t1.is_use = 1 AND t1.is_active = 1 ${queryOption}`;

      //   -SELECT-SALE_QUOTATION_DETAIL   -JOIN-INVENTORY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.sale_quotation_detail = rows;
         res.send(row); return;
      });

    });

  }
}

module.exports = controller;