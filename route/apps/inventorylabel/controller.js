var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  inventorylabel_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var row = { success: true, data: { inventorylabel: [] }, label: 'Berhasil' };

      var myfireStr = `SELECT * FROM ${CUS_DB}.inventory_label WHERE is_use = 1 AND is_active = 1`;

      //   -SELECT-INVENTORY_LABEL
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.inventorylabel = rows;
         res.send(row); return;
      });

    });

  }
}

module.exports = controller;