var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  inventorydetailcategory_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { inventorydetailcategory: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.inventory_detail_category WHERE is_use = 1 AND is_active = 1`;

      //   -SELECT-INVENTORY_DETAIL_CATEGORY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.inventorydetailcategory = rows;
         res.send(row); return;
      });

    });

  }
}

module.exports = controller;