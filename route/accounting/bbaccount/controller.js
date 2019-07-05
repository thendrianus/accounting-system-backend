var tsservice = require('./../../tsservice');

const controller = {

  //   REST-SELECT	
  bbaccount_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { BbaccountList: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect 
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT COALESCE(SUM(t1.credit), 0) AS "credit", COALESCE(SUM(t1.debit), 0) AS "debit", COALESCE(SUM(t1.debit) - SUM(t1.credit), 0) AS "ballance", GREATEST(COALESCE(SUM(t1.debit) - SUM(t1.credit), 0), COALESCE(SUM(t1.debit) - SUM(t1.credit) * -1, 0)) AS "ballance_plus", t2.account_id, t2.currency_id, t2.plus, t2.minus, CONCAT(t2.account_category_type_id, "-", t2.account_code) AS "account_code", t2.account, t2.general_journal_id AS "general_journal_id", "" AS "create_by", "" AS "create_datetime", 1 AS "is_active", 1 AS "is_use" FROM (SELECT g.* FROM ${CUS_DB}.generalledger g INNER JOIN ${CUS_DB}.general_journal gj ON gj.general_journal_id = g.general_journal_id WHERE gj.general_journal_type_id > 1 && gj.general_journal_type_id < 7 AND g.account_id <> 1) t1 RIGHT JOIN (SELECT a.*, act.plus, act.minus FROM ${CUS_DB}.account a INNER JOIN ${CUS_DB}.account_category_type act ON a.account_category_type_id = act.account_category_type_id WHERE a.is_active = 1 AND a.is_use = 1 AND a.is_header = 0 AND a.account_id <> 1) t2 ON t1.account_id = t2.account_id GROUP BY t2.account_id`;
      //   -SELECT-GENERALLEDGER   -JOIN-ACCOUNT   -JOIN-ACCOUNT_LINKED   
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        row.data.BbaccountList = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-INSERT
  bbaccount_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data entered successfully' };
    // validation
    req.assert('general_journal_id', 'Generalledger Link is required');
    req.assert('account_id', 'Account is required');
    req.assert('debit', 'Debit is required');
    req.assert('credit', 'Credit is required');
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
      general_journal_id: req.body.general_journal_id,
      account_id: req.body.account_id,
      debit: req.body.debit,
      credit: req.body.credit,
      create_by: req.body.create_by,
      create_datetime: tsservice.mysqlDate(req.body.create_datetime),
      update_by: req.body.create_by,
      update_datetime: tsservice.mysqlDate(req.body.create_datetime),
      is_use: '1', is_active: '1'
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      //   -INSERT-GENERALLEDGER
      conn.beginTransaction(function (err) {

        tsservice.insertData(data, function (value) {
          //   -INSERT-GENERALLEDGER
          var query = conn.query(`INSERT INTO ${CUS_DB}.generalledger` + value, function (err, rows) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
              conn.rollback(function () {
                 res.send(row); return;
              });
            }else{
              conn.commit(function (err) {
                 res.send(row); return;
              });
            }

          });
        })

      });

    });

  }

}

module.exports = controller;
