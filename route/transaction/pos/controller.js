var tsservice = require('./../../tsservice');
var async = require('async');

function select_pos_code(conn, req, row) {

  const CUS_DB = req.body.company_db;
  
  return new Promise(function (resolve, reject) {

    if (req.body.pos_code == "" && req.body.purchase_status_id != '1') {
      var codeData = {
        special_code_id: "POS",
        table: "pos",
        column_id: "pos_id",
        column_code: "pos_code",
      }

      var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

      //   -SELECT-SPECIAL_CODE   -SELECT-POS
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
          reject(row);
        }

        if (rows[0]['code']) {

          row.data.pos_code = rows[0]['code'];

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
  posesselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { poses: [] }, label: 'Berhasil' };

    req.assert('is_use', 'Used data is required');
    req.assert('pos_session_id', 'Used data is required');

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
        var strwhere = "t1.is_use = 1 AND";
      }

      if (req.body.pos_session_id) {
        var strwhere = `t7.pos_session_id = ${req.body.pos_session_id} AND`;
      }

      var myfireStr = `SELECT t1.*, t1.pos_code as "code", t1.sale_status_id as "orisale_status_id", t1.sub_total as "orisub_total", t1.tax as "oritax", t1.grand_total as "origrand_total", t1.downpayment as "oridownpayment", t1.landed_cost as "orilanded_cost", t1.receivable as "orireceivable", DATE_FORMAT(t1.transaction_date, "%d %M %Y") as "transaction_date_show" , "[]" as "pos_detail",t2.businesspartner_code, t2.name as "businesspartner_name", t3.name "pos_status_name", t4.name as "branch_name",t5.name "pos_payment_name" , concat(t6.firstname, " ", t6.lastname) as "employee_name", t7.general_journal_id, t7.inventoryledger_link_id, t7.pos_stand_id FROM ${CUS_DB}.pos t1 INNER JOIN ${CUS_DB}.businesspartner t2 ON t1.businesspartner_id = t2.businesspartner_id INNER JOIN ${CUS_DB}.sale_status t3 ON t1.sale_status_id = t3.sale_status_id INNER JOIN ${CUS_DB}.branch t4 ON t1.branch_id = t4.branch_id INNER JOIN ${CUS_DB}.transaction_payment t5 ON t1.transaction_payment_id = t5.transaction_payment_id INNER JOIN ${CUS_DB}.employee t6 ON t1.create_by = t6.employee_id INNER JOIN ${CUS_DB}.pos_session t7 ON t1.pos_session_id = t7.pos_session_id WHERE ${strwhere} t1.is_active = 1 AND t7.pos_session_status_id <> 3 ORDER BY t1.pos_id DESC`;

      console.log(myfireStr)
      //   -SELECT-POS   -JOIN-BUSINESSPARTNER   -JOIN-SALE_STATUS   -JOIN-BRANCH   -JOIN-TRANSACTION_PAYMENT   -JOIN-EMPLOYEE   -JOIN-POS-SESSION
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.poses = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  poses_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { pos_id: '', pos_code: '' }, label: 'Data entered successfully' };

    // validation
    // req.assert('pos_id','POS Id is required');
    // req.assert('pos_code','POS Code/No is required');
    req.assert('currency_id', 'Currency data is required');
    req.assert('pos_session_id', 'Pos session id data is required');
    req.assert('businesspartner_id', 'Business Partner Order is required');
    req.assert('branch_id', 'Branch is required');
    req.assert('warehouse_id', 'Ware House Id is required');
    req.assert('transaction_date', 'Transaction Date is required');
    req.assert('description', 'Description is required');
    req.assert('discount_amount', 'Discount Amount is required');
    req.assert('discount_persent', 'Discount Persent is required');
    req.assert('tax_id', 'Tax Id is required');
    req.assert('landed_cost', 'Landed Cost is required');
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

    var pos_code = '';
    var pos_id = 0;

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {
        select_pos_code(conn, req, row).then(function (result) { // 1. SELECT POS CODE
          if (result) {
            pos_code = result;
          }
          add_pos(conn).then(function (result) { // 2. INSERT POS

            pos_id = result;
            add_pos_detail(conn).then(function (result) { // 3. INSERT POS DETAIL

              row.data.pos_code = pos_code;
              row.data.pos_id = pos_id;
              conn.commit(function (err) {
                 res.send(row); return;
              });

            }).catch(error => { // 3 END
              conn.rollback(function () {
                console.log('false add_pos_detail');
                 res.send(row); return;
              });
            });

          }).catch(error => { // 2 END
            conn.rollback(function () {
              console.log('false add_pos');
               res.send(row); return;
            });
          });

        }).catch(error => { // 1 END
          conn.rollback(function () {
            console.log('false select_pos_code');
             res.send(row); return;
          });
        });
      });

    });

    function add_pos(conn) {

      return new Promise(function (resolve, reject) {

        var data = {
          pos_code: pos_code,
          pos_session_id: req.body.pos_session_id,
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
          is_use: '1',
          is_active: '1'
        };

        tsservice.insertData(data, function (value) {
          //   -INSERT-POS
          var query = conn.query(`INSERT INTO ${CUS_DB}.pos` + value, function (err, rows) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
              reject(false);
            }

            resolve(rows.insertId);
          });
        });

      });

    }

    function add_pos_detail(conn) {
      return new Promise(function (resolve, reject) {
        var querystr = "";

        async.forEach(req.body.pos_detail, function (item, callback) {

          if (item.is_active == 1) {
            if (querystr != "") {
              querystr += ', ';
            }
            querystr += '("' + pos_id + '", "' + item.inventory_id + '", "' + item.warehouse_id + '", "' + item.row_label + '", "' + item.row_order + '", "' + item.inventory_hpp + '", "' + item.ordered + '", "' + item.orderedeqv + '", "' + item.delivered + '", "' + item.deliveredeqv + '", "' + item.price + '", "' + item.discount_persent + '", "' + item.discount_amount + '", "' + item.uom_order + '", "' + item.uom_label + '", "' + item.isdelivery + '", "' + item.tax_id + '", "' + item.tax + '", "' + item.delivery_schedule + '", "' + item.delivery_note + '", "' + item.description + '","' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '", 1, 1)';
          }
          callback();

        }, function (err) {
          if (err) {
            row.success = false; console.log(err);
            row.label = 'Server failed prosess data. try again or contact our IT support';
            reject(false);
          }

          if (querystr != "") {

            var myfireStr = `INSERT INTO ${CUS_DB}.pos_detail( pos_id, inventory_id, warehouse_id, row_label, row_order, inventory_hpp, ordered, orderedeqv, delivered, deliveredeqv, price, discount_persent, discount_amount, uom_order, uom_label, isdelivery, tax_id, tax, delivery_schedule, delivery_note, description, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + querystr;

            //   -INSERT-POS_DETAIL
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
  poses_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { pos_id: '', pos_code: '' }, label: 'Data updated successfully' };

    // validation
    req.assert('pos_id', 'POS Id is required');
    // req.assert('pos_code','POS Code/No is required');
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

    var pos_code = req.body.pos_code;
    var pos_id = req.body.pos_id;

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {

        select_pos_code(conn, req, row).then(function (result) { // 1. SELECT CODE
          if (result) {
            pos_code = result;
            row.data.pos_code = result;
          }
          edit_pos(conn).then(function (result) { // 3. UPDATE POS

            edit_pos_detail(conn).then(function (result) { // 3. UPDATE POS DETAIL

              conn.commit(function (err) {
                 res.send(row); return;
              });

            }).catch(error => { // 3 END
              conn.rollback(function () {
                console.log('false edit_pos_detail');
                 res.send(row); return;
              });
            });

          }).catch(error => { // 2 END
            conn.rollback(function () {
              console.log('false edit_pos');
               res.send(row); return;
            });
          });

        }).catch(error => { // 1 END
          conn.rollback(function () {
            console.log('false edit_pos');
             res.send(row); return;
          });
        });

      });

    });

    function edit_pos(conn) {

      return new Promise(function (resolve, reject) {

        var data = {
          pos_code: pos_code,
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
          update_by: req.body.update_by,
          update_datetime: tsservice.mysqlDate(req.body.update_datetime),
          is_use: req.body.is_use,
          is_active: req.body.is_active
        };

        tsservice.updateData(data, function (value) {
          //   -UPDATE-POS
          var query = conn.query(`UPDATE ${CUS_DB}.pos SET ${value} WHERE pos_id =${req.body.pos_id} `, function (err, rows) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
              reject(false);
            }
            resolve(true);
          });
        });


      });

    }

    function edit_pos_detail(conn) {
      return new Promise(function (resolve, reject) {
        var querystr = "";
        async.forEach(req.body.pos_detail, function (item, callback) {
          
          let inventory_hpp_query = `SELECT hpp FROM ${CUS_DB}.inventory WHERE inventory_id = ${item.inventory_id}`
          if (item.pos_detail_id == "" && item.is_active == 1) {

            if (querystr != "") {
              querystr += ', ';
            }
            querystr += '("' + req.body.pos_id + '", "' + item.inventory_id + '", "' + item.warehouse_id + '", "' + item.row_label + '", "' + item.row_order + '", "' + item.inventory_hpp + '", "' + item.ordered + '", "' + item.orderedeqv + '", "' + item.delivered + '", "' + item.deliveredeqv + '", "' + item.price + '", "' + item.discount_persent + '", "' + item.discount_amount + '", "' + item.uom_order + '", "' + item.uom_label + '", "' + item.isdelivery + '", "' + item.tax_id + '", "' + item.tax + '", "' + item.delivery_schedule + '", "' + item.delivery_note + '", "' + item.description + '","' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '", 1, 1)';

          } else {

            var data = {
              inventory_id: item.inventory_id,
              warehouse_id: item.warehouse_id,
              row_label: item.row_label,
              row_order: item.row_order,
              inventory_hpp: {
                type: "query",
                value: inventory_hpp_query
              },
              ordered: item.ordered,
              orderedeqv: item.orderedeqv,
              delivered: item.delivered,
              deliveredeqv: item.deliveredeqv,
              price: item.price,
              discount_persent: item.discount_persent,
              discount_amount: item.discount_amount,
              uom_order: item.uom_order,
              uom_label: item.uom_label,
              isdelivery: item.isdelivery,
              tax_id: item.tax_id,
              tax: item.tax,
              delivery_schedule: item.delivery_schedule,
              delivery_note: item.delivery_note,
              description: item.description,
              update_by: req.body.update_by,
              update_datetime: tsservice.mysqlDate(req.body.update_datetime),
              is_use: req.body.is_use,
              is_active: req.body.is_active
            };

            tsservice.updateData(data, function (value) {
              //   -UPDATE-POS_DETAIL
              var query = conn.query(`UPDATE ${CUS_DB}.pos_detail SET ${value} WHERE pos_detail_id =${item.pos_detail_id} `, function (err, rows) {

                if (err) {
                  row.success = false; console.log(err);
                  row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
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

            var myfireStr = `INSERT INTO ${CUS_DB}.pos_detail( pos_id, inventory_id, warehouse_id, row_label, row_order, inventory_hpp, ordered, orderedeqv, delivered, deliveredeqv, price, discount_persent, discount_amount, uom_order, uom_label, isdelivery, tax_id, tax, delivery_schedule, delivery_note, description, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + querystr;

            //   -INSERT-POS_DETAIL
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
  posesDetail_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { pos_detail: [] }, label: 'Data entered successfully' };
    // validation
    req.assert('pos_id', 'POS Id is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var queryOption = "";

    queryOption = "AND t1.pos_id = '" + req.body.pos_id + "'";

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      //change ori price with hpp
      var myfireStr = `SELECT t1.*, t2.*, t2.selling_price as "oriprice", 0 as "min_price" FROM ${CUS_DB}.pos_detail t1 INNER JOIN ${CUS_DB}.inventory t2 ON t1.inventory_id = t2.inventory_id WHERE  t1.is_use = 1 AND t1.is_active = 1 ${queryOption}`;

      console.log(myfireStr)
      //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.pos_detail = rows;
         res.send(row); return;
      });

    });

  }
}

module.exports = controller;