
const controller = {
  //   REST-SELECT
  salecategory_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { sale_category: [], sale_return_category: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.sale_category WHERE is_use = 1 AND is_active = 1 ORDER BY sale_category_id `;

      //   -SELECT-SALE_CATEGORY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        row.data.sale_category = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-SELECT
  salepayment_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { transaction_payment: [] }, label: 'Berhasil' };

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

        var landed_cost_account_id = `(SELECT account_id FROM ${CUS_DB}.account_linked WHERE account_link_id = 5 AND is_active =1 AND is_use =1 ) as "landed_cost_account_id"`; // --account_link_id 5
        var discount_account_id = `(SELECT account_id FROM ${CUS_DB}.account_linked WHERE account_link_id = 24 AND is_active =1 AND is_use =1 ) as "discount_account_id"`; // --account_link_id 24
        var total_account_id = `(SELECT account_id FROM ${CUS_DB}.account_linked WHERE account_link_id = 4 AND is_active =1 AND is_use =1 ) as "total_account_id"`; // --account_link_id 4
        var downpayment_account_id = `(SELECT account_id FROM ${CUS_DB}.account_linked WHERE account_link_id = 7 AND is_active =1 AND is_use =1 ) as "downpayment_account"`; // --account_link_id 7
        var receivable_account_id = `(SELECT account_id FROM ${CUS_DB}.account_linked WHERE account_link_id = 12 AND is_active =1 AND is_use =1 ) as "receivable_account_id"`; // --account_link_id 12

        var myfireStr = `SELECT ${discount_account_id}, ${total_account_id}, ${downpayment_account_id}, ${landed_cost_account_id}, ${receivable_account_id}`;

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
  salesselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { sales: [] }, label: 'Berhasil' };

    req.assert('is_use', 'Used data is required');
    req.assert('action', 'Used data is required');

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

      if (req.body.action == '1') {
        var strwhere = "t1.sale_status_id = 5 AND";
      }

      var myfireStr = `SELECT t1.*, t1.sale_code as "code", t1.sale_status_id as "orisale_status_id", t1.sub_total as "orisub_total", t1.tax as "oritax", t1.grand_total as "origrand_total", t1.downpayment as "oridownpayment", t1.landed_cost as "orilanded_cost", t1.receivable as "orireceivable", DATE_FORMAT(t1.transaction_date, "%d %M %Y") as "transaction_date_show" ,"[]" as "sale_detail",t2.businesspartner_code, t2.name as "businesspartner_name", t3.name "sale_status_name", t4.name as "branch_name",t5.name "transaction_payment_name" , concat(t6.firstname, " ", t6.lastname) as "employee_name" FROM ${CUS_DB}.sale t1 INNER JOIN ${CUS_DB}.businesspartner t2 ON t1.businesspartner_id = t2.businesspartner_id INNER JOIN ${CUS_DB}.sale_status t3 ON t1.sale_status_id = t3.sale_status_id INNER JOIN ${CUS_DB}.branch t4 ON t1.branch_id = t4.branch_id INNER JOIN ${CUS_DB}.transaction_payment t5 ON t1.transaction_payment_id = t5.transaction_payment_id INNER JOIN ${CUS_DB}.employee t6 ON t1.create_by = t6.employee_id WHERE ${strwhere} t1.is_active = 1 ORDER BY t1.sale_id DESC`;

      //   -SELECT-SALE   -JOIN-BUSINESSPARTNER   -JOIN-SALE_STATUS   -JOIN-BRANCH   -JOIN-TRANSACTION_PAYMENT   -JOIN-EMPLOYEE
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.sales = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-SELECT
  salesDetail_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { sale_detail: [] }, label: 'Data selected successfully' };
    // validation
    req.assert('sale_id', 'Sale Id is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var queryOption = "";

    queryOption = "AND t1.sale_id = '" + req.body.sale_id + "'";

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      //change ori price with hpp
      var myfireStr = `SELECT t1.*, t2.*, t2.selling_price as "oriprice", 0 as "min_price" FROM ${CUS_DB}.sale_detail t1 INNER JOIN ${CUS_DB}.inventory t2 ON t1.inventory_id = t2.inventory_id WHERE t1.is_use = 1 AND t1.is_active = 1 ${queryOption}`;

      //   -SELECT-SALE_DETAIL   -JOIN-INVENTORY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.sale_detail = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-SELECT
  salesstatus_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { status: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.sale_status WHERE is_use = 1 AND is_active = 1 ORDER BY sale_status_id ASC`;

      //   -SELECT-SALE_STATUS
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