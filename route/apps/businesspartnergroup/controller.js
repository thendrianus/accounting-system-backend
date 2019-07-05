var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  businesspartnergroupselect_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { businesspartnergroup: [] }, label: 'Berhasil' };

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
        strwhere = "is_use = 1 AND";
      }

      var myfireStr = `SELECT * FROM ${CUS_DB}.businesspartner_group WHERE ${strwhere} is_active = 1`;

      //   -SELECT-BUSINESSPARTNER_GROUP
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.businesspartnergroup = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  businesspartnergroup_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { businesspartner_group_id: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('businesspartner_group', 'Businesspartner Group is required');
    req.assert('description', '');
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
      businesspartner_group: req.body.businesspartner_group,
      description: req.body.description,
      create_by: req.body.create_by,
      update_by: req.body.update_by,
      create_datetime: tsservice.mysqlDate(),
      update_datetime: tsservice.mysqlDate(),
      is_active: '1',
      is_use: '1',
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.insertData(data, function (value) {
        //   -INSERT-BUSINESSPARTNER_GROUP
        var query = conn.query(`INSERT INTO ${CUS_DB}.businesspartner_group` + value, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.businesspartner_group_id = rows.insertId;
           res.send(row); return;

        });
      });

    });

  },

  //   REST-UPDATE
  businesspartnergroup_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('businesspartner_group_id', '');
    req.assert('businesspartner_group', 'Businesspartner Group is required');
    req.assert('description', '');
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
      businesspartner_group: req.body.businesspartner_group,
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
        //   -UPDATE-BUSINESSPARTNER_GROUP
        var query = conn.query(`UPDATE ${CUS_DB}.businesspartner_group SET ${value} WHERE businesspartner_group_id =${req.body.businesspartner_group_id} `, function (err, rows) {

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