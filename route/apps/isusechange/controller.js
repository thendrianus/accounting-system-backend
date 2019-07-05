var tsservice = require('./../../tsservice');

const controller = {
  //   REST-UPDATE
  isUseChange_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation

    req.assert('table', 'Table Name is required');
    req.assert('is_use', '');
    req.assert('id', 'Updated By is required');
    req.assert('id_name', 'Update Date and time is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var data = {
      is_use: req.body.is_use,
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-IS_USE
        var query = conn.query(`UPDATE ${CUS_DB}.${req.body.table} SET ${value} WHERE ${req.body.id_name} =${req.body.id} `, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }

           res.send(row); return;

        });
      });


    });

  }
}

module.exports = controller;
