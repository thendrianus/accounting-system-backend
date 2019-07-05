
const controller = {
  //   REST-SELECT
  purchasecategory_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { purchase_category: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.purchase_category WHERE is_use = 1 AND is_active = 1 ORDER BY purchase_category_id`;

      //   -SELECT-PURCHASE_CATEGORY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.purchase_category = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-SELECT
  purchasepayment_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { transaction_payment: [], defaultAccount: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.transaction_payment WHERE is_use = 1 AND is_active = 1 ORDER BY transaction_payment_id`;

      //   -SELECT-TRANSACTION_PAYMENT
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.transaction_payment = rows;
        var landed_cost_account_id = `(SELECT account_id FROM ${CUS_DB}.account_linked WHERE account_link_id = 10 AND is_active =1 AND is_use =1 ) as "landed_cost_account_id"`; // --account_link_id 10
        var downpayment_account_id = `(SELECT account_id FROM ${CUS_DB}.account_linked WHERE account_link_id = 11 AND is_active =1 AND is_use =1 ) as "downpayment_account_id"`; // --account_link_id 11 
        var payable_account_id = `(SELECT account_id FROM ${CUS_DB}.account_linked WHERE account_link_id = 12 AND is_active =1 AND is_use =1 ) as "payable_account_id"`; // --account_link_id 12

        var myfireStr = `SELECT ${downpayment_account_id}, ${landed_cost_account_id}, ${payable_account_id}`;

        var query = conn.query(myfireStr, function (err, rows) {
          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.defaultAccount = rows;
           res.send(row); return;
        });

      });

    });

  },

  //   REST-SELECT
  purchasesselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { purchases: [] }, label: 'Berhasil' };

    req.assert('is_use', 'Used data is required');
    req.assert('action', 'Used data is required');
    req.assert('isreturn', 'Used data is required');

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

      strwhere += ` t1.isreturn = ${req.body.isreturn?1:0} AND `;

      var myfireStr = `SELECT t1.*, t1.purchase_code as "code", t1.purchase_status_id as "oripurchase_status_id", t1.sub_total as "orisub_total", t1.tax as "oritax", t1.grand_total as "origrand_total", t1.downpayment as "oridownpayment", t1.landed_cost as "orilanded_cost", t1.payable as "oripayable", DATE_FORMAT(t1.transaction_date, "%d %M %Y") as "transaction_date_show" , "[]" as "purchase_detail",t2.businesspartner_code, t2.name as "businesspartner_name", t3.name "purchase_status_name", t4.name as "branch_name",t5.name "transaction_payment_name" , concat(t6.firstname, " ", t6.lastname) as "employee_name", t1.isreturn FROM ${CUS_DB}.purchase t1 INNER JOIN ${CUS_DB}.businesspartner t2 ON t1.businesspartner_id = t2.businesspartner_id INNER JOIN ${CUS_DB}.purchase_status t3 ON t1.purchase_status_id = t3.purchase_status_id INNER JOIN ${CUS_DB}.branch t4 ON t1.branch_id = t4.branch_id INNER JOIN ${CUS_DB}.transaction_payment t5 ON t1.transaction_payment_id = t5.transaction_payment_id INNER JOIN ${CUS_DB}.employee t6 ON t1.create_by = t6.employee_id WHERE ${strwhere} t1.is_active = 1 ORDER BY t1.purchase_id DESC`;
      console.log(myfireStr)
      //   -SELECT-PURCHASE   -JOIN-BUSINESSPARTNER   -JOIN-PURCHASE_STATUS   -JOIN-BRANCH   -JOIN-TRANSACTION_PAYMENT   -JOIN-EMPLOYEE
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.purchases = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-SELECT
  purchasesDetail_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { purchase_detail: [] }, label: 'Data selected successfully' };
    // validation
    req.assert('purchase_id', 'Purchase Id is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var queryOption = "";

    queryOption = "AND t1.purchase_id = '" + req.body.purchase_id + "'";

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }
      //change ori price with hpp

      var myfireStr = `SELECT t1.*, t2.*, t2.selling_price as "oriprice", 0 as "min_price" FROM ${CUS_DB}.purchase_detail t1 INNER JOIN ${CUS_DB}.inventory t2 ON t1.inventory_id = t2.inventory_id WHERE t1.is_use = 1 AND t1.is_active = 1 ${queryOption}`;

      //   -SELECT-PURCHASE_DETAIL   -JOIN-INVENTORY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.purchase_detail = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-SELECT
  purchasesstatus_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { status: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.purchase_status WHERE is_use = 1 AND is_active = 1 ORDER BY purchase_status_id ASC`;

      //   -SELECT-PURCHASE_STATUS
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.status = rows;
         res.send(row); return;
      });

    });

  }
}

module.exports = controller;