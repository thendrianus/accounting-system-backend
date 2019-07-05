var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  language_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = {};
    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT app_language FROM bizystem.app WHERE is_use = 1 AND is_active = 1 LIMIT 1`;
      //   -SELECT-LANGUAGE
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        if (rows[0]['language']) {

          row = rows[0]['language'];
           res.send(row); return;

        } else {
          row.success = false; console.log(err);
          row.label = 'Failed to select important code. Please contact our IT support';
           res.send(row); return;
        }

      });

    });

  }

}

module.exports = controller;