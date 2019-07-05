var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  generalledger_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { generalledger: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.*, t2.account , t2.account_category_type_id , t5.account_category_type , t3.reference_code, t4.type_code FROM ${CUS_DB}.generalledger t1 INNER JOIN ${CUS_DB}.account t2 ON t1.account_id = t2.account_id INNER JOIN ${CUS_DB}.general_journal t3 ON t1.general_journal_id = t3.general_journal_id INNER JOIN ${CUS_DB}.general_journal_type t4 ON t3.general_journal_type_id = t4.general_journal_type_id INNER JOIN ${CUS_DB}.account_category_type t5 ON t2.account_category_type_id = t5.account_category_type_id WHERE t1.is_active =1 AND t1.is_use =1`;
      //   -SELECT-GENERALLEDGER   -JOIN-ACCOUNT-GENERAL_JOURNAL   -JOIN-GENERAL_JOURNAL_TYPE
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.generalledger = rows;
         res.send(row); return;
      });

    });

  }
}

module.exports = controller;