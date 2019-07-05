var tsservice = require('./../../tsservice');
var async = require('async');

module.exports = function (conn, req, row, general_journal_id) {

  const CUS_DB = req.body.company_db;
  return new Promise(function (resolve, reject) {
    //!!table-account_linked-select

    var myfireStr = `select account_id as "account_id" FROM ${CUS_DB}.account_linked WHERE (account_link_id = 3 OR account_link_id = 2 OR account_link_id = 18) AND is_active = 1 AND is_use = 1 ORDER BY account_link_id`; // --account_link_id 3 // --account_link_id 2

    //   -SELECT-ACCOUNT_LINKED
    var query = conn.query(myfireStr, function (err, rows) {

      if (err) {
        row.success = false; console.log(err);
        row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
        reject(row);
      }

      if (rows.length > 0) {

        var plus_income_account = req.body.total_account_id; //from customer 
        var minus_asset_inventory_account = rows[0]['account_id'];
        var plus_asset_cash_account = rows[1]['account_id']; // sell account if cash 
        var plus_cost_hpp_account = rows[2]['account_id'];

        var plus_asset_downpayment_account = req.body.downpayment_account_id;
        var plus_cost_transportation_account = req.body.landed_cost_account_id;
        var plus_asset_receiveable_account = req.body.receivable_account_id; // terhutang

        var sub_total_value = req.body.orisub_total;
        var tax_value = req.body.oritax;
        var grand_total_value = req.body.origrand_total;
        var downpayment_value = req.body.oridownpayment;
        var discount_amount_value = req.body.discount_amount;
        var landed_cost_value = req.body.orilanded_cost;
        var receivable_value = req.body.orireceivable;

        if (req.body.isreturn == 1) {
          sub_total_value = sub_total_value * -1;
          tax_value = tax_value * -1;
          grand_total_value = grand_total_value * -1;
          downpayment_value = downpayment_value * -1;
          discount_amount_value = req.body.discount_amount * -1;
          landed_cost_value = landed_cost_value * -1;
          receivable_value = receivable_value * -1;
        }

        var glquery = "";
        var rpquery = "";

        function glqueryAddQuery(q) {
          if (glquery != '') {
            glquery += ',';
          }

          glquery += q;

        }

        let insertDataValue = {
          general_journal_id,
          account_id: '',
          debit: 0,
          debiteqv: 0,
          credit: 0,
          crediteqv: 0,
          create_by: req.body.create_by,
          create_datetime: req.body.create_datetime,
          update_by: req.body.create_by,
          update_datetime: req.body.create_datetime,
          is_use: 1,
          is_active: 1
        }

        // if cash or credit 
        if (req.body.transaction_payment_id == 2) {

          //downpayment
          if (downpayment_value) {
            tsservice.insertDataValue({
              ...insertDataValue,
              account_id: plus_asset_downpayment_account,
              debit: downpayment_value,
              debiteqv: downpayment_value,
              credit: 0,
              crediteqv: 0
            }, (data) => {
              console.log(data)
              glqueryAddQuery(data)
            })
          }

          //terhutang
          if (receivable_value) {

            tsservice.insertDataValue({
              ...insertDataValue,
              account_id: plus_asset_receiveable_account,
              debit: 0,
              debiteqv: 0,
              credit: receivable_value,
              crediteqv: receivable_value
            }, (data) => {
              console.log(data)
              glqueryAddQuery(data)
            })

            if (rpquery != '') {
              rpquery += ',';
            }

            var codeData = {
              special_code_id: "RECEIVEPAYABLE",
              table: "receive_payable",
              column_id: "receive_payable_id",
              column_code: "receive_payable_code",
            }

            rpquery += `( ( SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1 ),"${general_journal_id}", 2, "${req.body.businesspartner_id}", "${req.body.sale_code}", "${req.body.due_date}", "${req.body.branch_id}", "Generate From Purchase", 1,"${req.body.create_by}","${req.body.create_datetime}","${req.body.create_by}","${req.body.create_datetime}", 1, 1)`;
          }

        }
        
        //cash
        // grand_total = subtotal + landed cost + tax - discount_ammount
        //grand total

        tsservice.insertDataValue({
          ...insertDataValue,
          account_id: plus_income_account, 
          debit: 0,
          debiteqv: 0,
          credit: grand_total_value,
          crediteqv: grand_total_value
        }, (data) => {
          console.log(data)
          glqueryAddQuery(data)
        })

        tsservice.insertDataValue({
          ...insertDataValue,
          account_id: plus_asset_cash_account,
          debit: sub_total_value,
          debiteqv: sub_total_value,
          credit: 0,
          crediteqv: 0
        }, (data) => {
          console.log(data)
          glqueryAddQuery(data)
        })

        tsservice.insertDataValue({
          ...insertDataValue,
          account_id: minus_asset_inventory_account,
          debit: 0,
          debiteqv: 0,
          // credit: sub_total_value,
          // crediteqv: sub_total_value
          credit: {
            type: "query",
            value: `SELECT SUM(inventory_hpp * ordered) FROM ${CUS_DB}.sale_detail WHERE sale_id = ${req.body.sale_id}`
          },
          crediteqv: {
            type: "query",
            value: `SELECT SUM(inventory_hpp * ordered) FROM ${CUS_DB}.sale_detail WHERE sale_id = ${req.body.sale_id}`
          }
        }, (data) => {
          console.log(data)
          glqueryAddQuery(data)
        })

        //Insert Plus Asset Inventory Account
        tsservice.insertDataValue({
          ...insertDataValue,
          account_id: plus_cost_hpp_account,
          // debit: sub_total_value,
          // debiteqv: sub_total_value,
          debit: {
            type: "query",
            value: `SELECT SUM(inventory_hpp * ordered) FROM ${CUS_DB}.sale_detail WHERE sale_id = ${req.body.sale_id}`
          },
          debiteqv: {
            type: "query",
            value: `SELECT SUM(inventory_hpp * ordered) FROM ${CUS_DB}.sale_detail WHERE sale_id = ${req.body.sale_id}`
          },
          credit: 0,
          crediteqv: 0
        }, (data) => {
          console.log(data)
          glqueryAddQuery(data)
        })

        //landed_cost
        if (landed_cost_value) {
          tsservice.insertDataValue({
            ...insertDataValue,
            account_id: plus_cost_transportation_account,
            debit: landed_cost_value,
            debiteqv: landed_cost_value,
            credit: 0,
            crediteqv: 0
          }, (data) => {
            console.log(data)
            glqueryAddQuery(data)
          })
        }

        //discount .. debit masuk ke biaya discount
        if (discount_amount_value) {
          //credit
          tsservice.insertDataValue({
            ...insertDataValue,
            account_id: discount_account,
            debit: discount_amount_value,
            debiteqv: discount_amount_value,
            credit: 0,
            crediteqv: 0
          }, (data) => {
            console.log(data)
            glqueryAddQuery(data)
          })
        }

        var myfireStr = `SELECT *, 0 as "value" FROM ${CUS_DB}.tax`;
        //   -SELECT-TAX
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
            reject(row);
          }

          var taxes = rows;

          async.forEach(req.body.sale_detail, function (item, callback) {

            if (item.tax && item.tax_id != '' && item.ledgerprocess == 0 && item.is_active == 1) {

              taxes.forEach(function (item2, key, mapObj) {
                if (item2.tax_id == item.tax_id) {
                  taxes[key].value += item.tax;
                }
              });

            }
            callback();

          }, function (err) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Server failed prosess data. try again or contact our IT support';
              reject(row);
            }

            async.forEach(taxes, function (item, callback) {

              if (item.value != 0) {
                if (req.body.isreturn == 1) {
                  item.value = item.value * -1;
                }
                
                tsservice.insertDataValue({
                  ...insertDataValue,
                  account_id: plus_income_account,
                  debit: item.value,
                  debiteqv: item.value,
                  credit: 0,
                  crediteqv: 0
                }, (data) => {
                  console.log(data)
                  glqueryAddQuery(data)
                })

              }
              callback();

            }, function (err) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Server failed prosess data. try again or contact our IT support';
                reject(row);
              }
              var myfireStr = `INSERT INTO ${CUS_DB}.generalledger( general_journal_id, account_id, debit, debiteqv, credit, crediteqv, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + glquery;
              //masalah di sini
              //   -INSERT-GENERALLEDGER
              var query = conn.query(myfireStr, function (err, rows) {

                if (err) {
                  row.success = false; console.log(err);
                  row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                  reject(row);
                }

                if (rpquery != '') {

                  var myfireStr = `INSERT INTO ${CUS_DB}.receive_payable( receive_payable_code, general_journal_id, receive_payable_category_id, businesspartner_id, reference, duedays, branch_id, description, receive_payable_type, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + rpquery;

                  //   -INSERT-RECEIVE_PAYABLE
                  var query = conn.query(myfireStr, function (err, rows) {

                    if (err) {
                      row.success = false; console.log(err);
                      row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                      reject(row);
                    }

                    resolve(true);

                  });
                } else {
                  resolve(true);
                }

              });

            });

          });

        });

      } else {
        row.success = false; console.log(err);
        row.label = 'Failed to select important code. Please contact our IT support';
        reject(row);
      }


    });

  });


}