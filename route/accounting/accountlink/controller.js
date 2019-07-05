var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  accountlink_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { accountlink: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT t1.account_link_id, t1.account_link_order, concat(t1.account_link," (",t1.account_link_id,")") AS "account_link", IFNULL(t2.is_active, 1) AS "is_active", convert(t2.account_id, char(50)) as "account_id", convert(t2.account_id, char(50)) as "oriaccount_id", t2.account_linked_id FROM ${CUS_DB}.account_link t1 LEFT JOIN ${CUS_DB}.account_linked t2 ON t1.account_link_id = t2.account_link_id WHERE t1.is_use = 1 AND t1.is_active = 1 ORDER BY t1.account_link_order`;
      //   -SELECT-ACCOUNT_LINK   -JOIN-ACCOUNT_LINKED
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        row.data.accountlink = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-INSERT
  accountlink_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data entered successfully' };
    // validation
    req.assert('account_link_id', 'Account Link Id is required');
    req.assert('account_id', 'Account Id is required');
    req.assert('create_by', 'Created by is required');
    req.assert('create_datetime', 'Create date and time is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var data = {
      account_link_id: req.body.account_link_id,
      account_id: req.body.account_id,
      create_by: req.body.create_by,
      create_datetime: tsservice.mysqlDate(req.body.create_datetime),
      update_by: req.body.create_by,
      update_datetime: tsservice.mysqlDate(req.body.create_datetime),
      is_use: '1', is_active: '1'
    };

    req.getConnection(function (err, conn) {


      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      conn.beginTransaction(function (err) {
        var myfireStr = `UPDATE ${CUS_DB}.account_linked SET is_active = 0 WHERE account_link_id = "${req.body.account_link_id}"`;
        //   -UPDATE-ACCOUNT_LINKED
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
            conn.rollback(function () {
               res.send(row); return;
            });
          }

          tsservice.insertData(data, function (value) {
            //   -INSERT-ACCOUNT_LINKED
            var query = conn.query(`INSERT INTO ${CUS_DB}.account_linked` + value, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                conn.rollback(function () {
                   res.send(row); return;
                });
              }

              conn.commit(function (err) {
                 res.send(row); return;
              });

            });
          })

        });

      });
    });

  }
}

module.exports = controller;