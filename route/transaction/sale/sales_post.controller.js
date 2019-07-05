var tsservice = require('./../../tsservice');
var async = require('async');
var add_sale_link = require('./add_sale_link');
var add_inventoryledger = require('./add_inventoryledger')
var add_generalledger = require('./add_generalledger')
var select_sale_code = require('./select_sale_code')
var sale_delivery_qty = require('../sale_delivery/controller').sale_delivery_qty;

module.exports = function (req, res, next) {
  const CUS_DB = req.body.company_db;
  var row = { success: true, data: { sale_id: '', sale_code: '', inventoryledger_link_id: '', general_journal_id: '' }, label: 'Data entered successfully' };

  // validation
  // req.assert('sale_id','Sale Id is required');
  // req.assert('sale_code','Sale Code is required');
  req.assert('currency_id', 'Currency data is required');
  req.assert('isreturn', 'Isreturn data is required');
  req.assert('businesspartner_id', 'Business Partner Order is required');
  // req.assert('general_journal_id','Generalledger Link is required');
  // req.assert('inventoryledger_link_id','Inventory Ledger Link Id is required');
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
  req.assert('landed_cost_account_id', 'Grand Total is required');
  req.assert('discount_account_id', 'Grand Total is required');
  req.assert('total_account_id', 'Grand Total is required');
  req.assert('downpayment_account_id', 'Grand Total is required');
  req.assert('receivable_account_id', 'Grand Total is required');
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

  var inventoryledger_link_id = 0;
  var sale_code = '';
  var general_journal_id = 0;
  var sale_id = 0;
  var ledgerprocess = 1;

  if (req.body.sale_status_id == 5 && req.body.sale_status_id != req.body.orisale_status_id) {
    ledgerprocess = 1;
  } else {
    ledgerprocess = 0;
  }

  req.getConnection(function (err, conn) {


    //--cmt-print: mysql cannot connect
    if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support'; res.send(row); return; }

    conn.beginTransaction(function (err) {
      select_sale_code(conn, req, row).then(function (result) { //STEP 1 SELECT SALE CODE
        if (result) {
          sale_code = result;
        }

        add_sale(conn).then(function (result) { //STEP 4 INSERT SALE TABLE

          sale_id = result;
          add_sale_status_log(conn).then(function (result) { //STEP 5 INSERT SALE STATUS LOG TABLE

            add_sale_detail(conn).then(function (result) { //STEP 6 INSERT SALE DETAIL TABLE

              row.data.sale_code = sale_code;
              row.data.sale_id = sale_id;

              if(req.body.sale_link_id){
                sale_delivery_qty(CUS_DB, req.body.sale_link_id, conn, row).then(function (result) {
                          
                  conn.commit(function (err) {
                    res.send(row); return;
                  });
                  
                }).catch(error => {
                  conn.rollback(function () {
                    console.log('false sale_delivery_qty');
                    res.send(error); return;
                  });
                });
              }else{
                conn.commit(function (err) {
                  res.send(row); return;
                });
              }

            }).catch(error => { //CATCH STEP 6
              console.log(error)
              conn.rollback(function () {
                console.log('false add_sale_detail');
                res.send(row); return;
              });
            });

          }).catch(error => { //CATCH STEP 5
            conn.rollback(function () {
              console.log('false add_sale_status_log');
              res.send(row); return;
            });
          });

        }).catch(error => { //CATCH STEP 4
          conn.rollback(function () {
            console.log('false add_sale');
            res.send(row); return;
          });
        });

      }).catch(error => { //CATCH STEP 1
        conn.rollback(function () {
          console.log('false select_sale_code');
          res.send(row); return;
        });
      });
    });

  });

  function add_sale(conn) {

    return new Promise(function (resolve, reject) {

      var data = {
        sale_code: sale_code,
        currency_id: req.body.currency_id,
        rate: req.body.rate,
        isreturn: req.body.isreturn,
        businesspartner_id: req.body.businesspartner_id,
        general_journal_id: general_journal_id,
        inventoryledger_link_id: inventoryledger_link_id,
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
        landed_cost_account_id: req.body.landed_cost_account_id,
        discount_account_id: req.body.discount_account_id,
        total_account_id: req.body.total_account_id,
        downpayment_account_id: req.body.downpayment_account_id,
        receivable_account_id: req.body.receivable_account_id,
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
          //   -INSERT-SALE
          var query = conn.query(`INSERT INTO ${CUS_DB}.sale` + value, function (err, rows) {
  
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

  function add_sale_detail(conn) {
    return new Promise(function (resolve, reject) {
      var querystr = "";

      async.forEach(req.body.sale_detail, function (item, callback) {

        if (item.is_active == 1) {
          if (querystr != "") {
            querystr += ', ';
          }
          querystr += '("' + sale_id + '", "' + item.inventory_id + '", "' + item.warehouse_id + '", "' + item.row_label + '", "' + item.row_order + '", "' + item.row_status + '", "' + item.inventory_hpp + '", "' + item.ordered + '", "' + item.orderedeqv + '", "' + item.delivered + '", "' + item.deliveredeqv + '", "' + item.price + '", "' + item.landed_cost + '", "' + item.discount_persent + '", "' + item.discount_amount + '", "' + item.uom_order + '", "' + item.uom_label + '", "' + item.isdelivery + '", "' + item.tax_id + '", "' + item.tax + '", "' + item.delivery_schedule + '", "' + item.delivery_note + '", "' + item.inventory_label + '", "' + item.description + '", "' + ledgerprocess + '","' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '", 1, 1)';
        }
        callback();

      }, function (err) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Server failed prosess data. try again or contact our IT support';
          reject(false);
        }

        if (querystr != "") {

          var myfireStr = `INSERT INTO ${CUS_DB}.sale_detail( sale_id, inventory_id, warehouse_id, row_label, row_order, row_status, inventory_hpp, ordered, orderedeqv, delivered, deliveredeqv, price, landed_cost, discount_persent, discount_amount, uom_order, uom_label, isdelivery, tax_id, tax, delivery_schedule, delivery_note, inventory_label, description, ledgerprocess, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + querystr;

          //   -INSERT-SALE_DETAIL
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

  function add_sale_status_log(conn) {

    return new Promise(function (resolve, reject) {

      var data = {
        employee_id: req.body.create_by,
        sale_id: sale_id,
        sale_status_id: req.body.create_by,
        create_datetime: tsservice.mysqlDate(req.body.create_datetime),
        is_use: '1', is_active: '1'
      };

      tsservice.insertData(data, function (value) {
        //   -INSERT-SALE_STATUS_LOG
        var query = conn.query(`INSERT INTO ${CUS_DB}.sale_status_log` + value, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
            reject(false);
          }
          resolve(true);
        });
      });

    });

  }

}