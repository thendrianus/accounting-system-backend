var tsservice = require('./../../tsservice');
var async = require('async');
var add_purchase_link = require('./add_purchase_link');
var select_purchase_code = require('./select_purchase_code');
var purchase_receive_qty = require('../purchase_receive/controller').purchase_receive_qty;

module.exports = function (req, res, next) {
  const CUS_DB = req.body.company_db;
  var row = { success: true, data: { purchase_id: '', purchase_code: '', inventoryledger_link_id: '', general_journal_id: '' }, label: 'Data entered successfully' };

  // validation
  // req.assert('purchase_id','Purchase Id is required');
  // req.assert('purchase_code','Purchase Code/Id is required');
  req.assert('isreturn', 'Isreturn is required');
  req.assert('currency_id', 'Currency data is required');
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
  req.assert('detail_landed_cost', 'Detail Landed Cost is required');
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
  req.assert('landed_cost_account_id', 'Grand Total is required');
  req.assert('discount_account_id', 'Grand Total is required');
  req.assert('total_account_id', 'Grand Total is required');
  req.assert('downpayment_account_id', 'Grand Total is required');
  req.assert('payable_account_id', 'Grand Total is required');
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

  var inventoryledger_link_id = 0;
  var purchase_code = '';
  var general_journal_id = 0;
  var purchase_id = 0;


  req.getConnection(function (err, conn) {

    //--cmt-print: mysql cannot connect
    if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support'; res.send(row); return; }
    conn.beginTransaction(function (err) {
      select_purchase_code(conn, req, row).then(function (result) { // 1. SELECT PURCHASE CODE
        if (result) {
          purchase_code = result;
        }
        add_purchase(conn).then(function (result) { // 4. INSERT PURCHASE

          purchase_id = result;
          add_purchase_status_log(conn).then(function (result) { // 5. INSERT PURCHASE STATUS LOG

            add_purchase_detail(conn).then(function (result) { // 6. INSERT PURCHASE DETAIL

              row.data.purchase_code = purchase_code;
              row.data.purchase_id = purchase_id;
 
              if(req.body.purchase_link_id){
                purchase_receive_qty(CUS_DB, req.body.purchase_link_id, conn, row).then(function (result) {
                          
                  conn.commit(function (err) {
                    res.send(row); return;
                  });
                  
                }).catch(error => {
                  conn.rollback(function () {
                    console.log('false purchase_receive_qty');
                    res.send(error); return;
                  });
                });
              }else{
                conn.commit(function (err) {
                  res.send(row); return;
                });
              }

            }).catch(error => { // 6 END
              conn.rollback(function () {
                console.log('false add_purchase_detail');
                res.send(row); return;
              });
            });

          }).catch(error => { // 5 END
            conn.rollback(function () {
              console.log('false add_purchase_status_log');
              res.send(row); return;
            });
          });

        }).catch(error => { // 4 END
          conn.rollback(function () {
            console.log('false add_purchase');
            res.send(row); return;
          });
        });

      }).catch(error => { // 1 END
        conn.rollback(function (err) {
          console.log('false select_purchase_code');
          res.send(err); return;
        });
      });
    });

  });

  function add_purchase(conn) {

    return new Promise(function (resolve, reject) {

      var data = {
        purchase_code: purchase_code,
        isreturn: req.body.isreturn,
        currency_id: req.body.currency_id,
        rate: req.body.rate,
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
        landed_cost_account_id: req.body.landed_cost_account_id,
        discount_account_id: req.body.discount_account_id,
        total_account_id: req.body.total_account_id,
        downpayment_account_id: req.body.downpayment_account_id,
        payable_account_id: req.body.payable_account_id,
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
          //   -INSERT-PURCHASE
          var query = conn.query(`INSERT INTO ${CUS_DB}.purchase` + value, function (err, rows) {
  
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

  function add_purchase_detail(conn) {
    return new Promise(function (resolve, reject) {
      var querystr = "";

      async.forEach(req.body.purchase_detail, function (item, callback) {

        if (item.is_active == 1) {
          if (querystr != "") {
            querystr += ', ';
          }
          querystr += '("' + purchase_id + '", "' + item.inventory_id + '", "' + item.warehouse_id + '", "' + item.row_label + '", "' + item.row_order + '", "' + item.row_status + '", "' + item.inventory_hpp + '", "' + item.ordered + '", "' + item.orderedeqv + '", "' + item.delivered + '", "' + item.deliveredeqv + '", "' + item.price + '", "' + item.landed_cost + '", "' + item.discount_persent + '", "' + item.discount_amount + '", "' + item.uom_order + '", "' + item.uom_label + '", "' + item.isdelivery + '", "' + item.tax_id + '", "' + item.tax + '", "' + item.delivery_schedule + '", "' + item.delivery_note + '", "' + item.inventory_label + '", "' + item.description + '", "' + 0 + '",  "' + item.isfix_asset + '", "' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '", 1, 1)';
        }
        callback();

      }, function (err) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Server failed prosess data. try again or contact our IT support';
          reject(false);
        }

        if (querystr != "") {

          var myfireStr = `INSERT INTO ${CUS_DB}.purchase_detail( purchase_id, inventory_id, warehouse_id, row_label, row_order, row_status, inventory_hpp, ordered, orderedeqv, delivered, deliveredeqv, price, landed_cost, discount_persent, discount_amount, uom_order, uom_label, isdelivery, tax_id, tax, delivery_schedule, delivery_note, inventory_label, description, ledgerprocess, isfix_asset, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + querystr;

          //   -INSERT-PURCHASE_DETAIL
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

  function add_purchase_status_log(conn) {

    return new Promise(function (resolve, reject) {

      var data = {
        employee_id: req.body.create_by,
        purchase_id: purchase_id,
        purchase_status_id: req.body.create_by,
        create_datetime: tsservice.mysqlDate(req.body.create_datetime),
        is_use: '1', is_active: '1'
      };

      tsservice.insertData(data, function (value) {
        //   -INSERT-PURCHASE_STATUS_LOG
        var query = conn.query(`INSERT INTO ${CUS_DB}.purchase_status_log` + value, function (err, rows) {

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