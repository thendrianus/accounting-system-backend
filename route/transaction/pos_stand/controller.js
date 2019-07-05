var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  pos_standselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { pos_stand: [] }, label: 'Berhasil' };

    req.assert('is_use', 'Used data is required');

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

      var myfireStr = `SELECT t1.*, t2.name FROM ${CUS_DB}.pos_stand t1 INNER JOIN ${CUS_DB}.branch t2 ON t1.branch_id = t2.branch_id WHERE ${strwhere} t1.is_active = 1 ORDER BY t1.pos_stand_id`;

      //   -SELECT-POS_STAND   -JOIN-BRANCH
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.pos_stand = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  pos_stand_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { pos_stand_id: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('pos_stand', '');
    req.assert('branch_id', 'Branch No / Id is required');
    req.assert('positions', '');
    req.assert('description', 'Description is required');
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
      pos_stand: req.body.pos_stand,
      branch_id: req.body.branch_id,
      positions: req.body.positions,
      description: req.body.description,
      create_by: req.body.create_by,
      update_by: req.body.update_by,
      create_datetime: tsservice.mysqlDate(),
      update_datetime: tsservice.mysqlDate(),
      is_use: '1',
      is_active: '1'
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.insertData(data, function (value) {
        //   -INSERT-POS_STAND
        var query = conn.query(`INSERT INTO ${CUS_DB}.pos_stand` + value, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.pos_stand_id = rows.insertId;
           res.send(row); return;

        });
      });

    });

  },

  //   REST-UPDATE
  pos_stand_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('pos_stand_id', '');
    req.assert('pos_stand', '');
    req.assert('branch_id', 'Branch No / Id is required');
    req.assert('positions', '');
    req.assert('description', 'Description is required');
    req.assert('update_by', 'Updated By is required');
    req.assert('update_datetime', 'Update Date and time is required');
    req.assert('is_use', 'Used data is required');
    req.assert('is_active', 'Active data is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var data = {
      pos_stand: req.body.pos_stand,
      branch_id: req.body.branch_id,
      positions: req.body.positions,
      description: req.body.description,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(),
      is_use: req.body.is_use,
      is_active: req.body.is_active,
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-POS_STAND
        var query = conn.query(`UPDATE ${CUS_DB}.pos_stand SET ${value} WHERE pos_stand_id =${req.body.pos_stand_id} `, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.lastId = rows.insertId;
           res.send(row); return;

        });
      });

    });

  }
}

module.exports = controller;