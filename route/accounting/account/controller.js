var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  accountselect_post: function (req, res, next) {
    // SELECT ACCOUNT ACCORDING TO THE CATEGORY
    const CUS_DB = req.body.company_db;

    var row = { success: true, data: { account: [], category: [] }, label: 'Berhasil' };

    req.assert('is_use', 'Used data is required');
    req.assert('account_category_id', 'Used data is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    req.getConnection(function (err, conn) {


      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      //   -SELECT-ACCOUNT_CATEGORY

      conn.query(`SELECT account_category.*, concat(account_category_code,'. ',account_category) as "label", '[]' as "accounts", 0 as "disabled", 1 as "removeable" FROM ${CUS_DB}.account_category WHERE is_use = 1 AND is_active = 1`, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        row.data.category = rows;

        var strwhere = "";
        if (req.body.is_use == '1') {
          strwhere += "t1.is_use = 1 AND t1.is_header = 0 AND ";
        }

        if (req.body.account_category_id == 1) { // ASSET CATEGORY
          strwhere += " t2.account_category_id = 1 AND ";
        } else if (req.body.account_category_id == 2) { //LIABILITY CATEGORY
          strwhere += " t2.account_category_id = 2 AND ";
        } else if (req.body.account_category_id == 3) { // EQUITY CATEGORY
          strwhere += " t2.account_category_id = 3 AND ";
        } else if (req.body.account_category_id == 4) { // INCOME CATEGORY
          strwhere += " t2.account_category_id = 4 AND t2.account_category_id = 7 AND ";
        } else if (req.body.account_category_id == 5) { // COST OF SALE CATEGORY
          strwhere += " t2.account_category_id = 5 AND ";
        } else if (req.body.account_category_id == 6) { // EXPENSE CATEGORY
          strwhere += " t2.account_category_id = 1 AND t2.account_category_id = 8 AND ";
        }

        var myfireStr = `SELECT t1.*, t2.*,t3.account_bank_id, convert(t1.account_id, char(50)) as "value", concat(t1.account_category_type_id,"-",t1.account_code," - ",t1.account) as "label" FROM ${CUS_DB}.account t1 INNER JOIN ${CUS_DB}.account_category_type t2 ON t1.account_category_type_id = t2.account_category_type_id LEFT JOIN (SELECT * FROM ${CUS_DB}.account_bank GROUP BY account_id) t3 ON t1.account_id = t3.account_id WHERE ${strwhere} t1.is_active = 1 AND t1.is_temporary <> 1 ORDER BY concat(t2.account_category_id,t1.account_code)`;

        //   -SELECT-ACCOUNT   -JOIN-ACCOUNT_CATEGORY_TYPE
        var query = conn.query(myfireStr, function (err, rows) {
          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }

          row.data.account = rows;
           res.send(row); return;
        });

      });

    });

  },

  //   REST-UPDATE
  account_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('account_id', 'Account is required');
    req.assert('account_code', 'Account Code/No is required');
    req.assert('account', 'Account is required');
    req.assert('account_category_type_id', 'Account Category Type is required');
    req.assert('currency_id', 'Currency data is required');
    req.assert('is_header', 'Header? is required');
    req.assert('description', 'Description is required');
    req.assert('account_category_id', 'Account Category Id is required');
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
      account_code: req.body.account_code,
      account: req.body.account,
      account_category_type_id: req.body.account_category_type_id,
      currency_id: req.body.currency_id,
      is_header: req.body.is_header,
      description: req.body.description,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(req.body.update_datetime),
      is_use: req.body.is_use,
      is_active: req.body.is_active
    };

    req.getConnection(function (err, conn) {


      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-ACCOUNT
        var query = conn.query(`UPDATE ${CUS_DB}.account SET ${value} WHERE account_id = ${req.body.account_id} `, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
           res.send(row); return;

        });
      })

    });

  },

  //   REST-SELECT
  accountcategorytype_get: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { type: [], category: [] }, label: 'Berhasil' };

    req.getConnection(function (err, conn) {


      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT *, "[]" as "type" FROM ${CUS_DB}.account_category WHERE is_use = 1 AND is_active = 1`;
      //   -SELECT-ACCOUNT_CATEGORY
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        row.data.category = rows;

        var myfireStr = `SELECT * FROM ${CUS_DB}.account_category_type WHERE is_use = 1 AND is_active = 1`;
        //   -SELECT-ACCOUNT_CATEGORY_TYPE
        var query = conn.query(myfireStr, function (err, rows) {
          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.type = rows;
           res.send(row); return;
        });

      });

    });

  },

  //   REST-SELECT
  accountbanks_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    req.assert('account_id', 'Account is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var row = { success: true, data: { bank: [] }, label: 'Data entered successfully' };

    req.getConnection(function (err, conn) {


      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.account_bank WHERE account_id = "${req.body.account_id}" LIMIT 1`;
      //   -SELECT-ACCOUNT_BANK
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.bank = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  accountbank_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: { lastId: '', account_bank_code: '' }, label: 'Data entered successfully' };
    // validation
    req.assert('account_id', 'Account is required');
    req.assert('bank_name', 'Bank Name is required');
    req.assert('account_name', 'Account Name is required');
    req.assert('account_number', 'Account Number is required');
    req.assert('bank_branch', 'Bank Branch is required');
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


    req.getConnection(function (err, conn) {


      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var codeData = {
        special_code_id: "ARTICLE",
        table: "article",
        column_id: "article_id",
        column_code: "article_code",
      }

      var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

      //   -SELECT-SPECIAL_CODE   -SELECT-ARTICLE
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        if (rows[0]['code']) {
          row.data.account_bank_code = rows[0]['code'];

          var data = {
            account_bank_code: row.data.account_bank_code,
            account_id: req.body.account_id,
            bank_name: req.body.bank_name,
            account_name: req.body.account_name,
            account_number: req.body.account_number,
            bank_branch: req.body.bank_branch,
            description: req.body.description,
            create_by: req.body.create_by,
            create_datetime: tsservice.mysqlDate(req.body.create_datetime),
            update_by: req.body.create_by,
            update_datetime: tsservice.mysqlDate(req.body.create_datetime),
            is_use: '1',
            is_active: '1'
          };

          tsservice.insertData(data, function (value) {
            //   -INSERT-ACCOUNT_BANK
            var query = conn.query(`INSERT INTO ${CUS_DB}.account_bank` + value, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                 res.send(row); return;
              }

              row.data.lastId = rows.insertId;
               res.send(row); return;

            });
          })

        } else {
          row.success = false; console.log(err);
          row.label = 'Failed to select important code. Please contact our IT support';
           res.send(row); return;
        }

      });


    });

  },

  //   REST-UPDATE
  accountbank_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;
    var row = { success: true, data: {}, label: 'Data updated successfully' };
    // validation
    req.assert('account_bank_id', 'Account Bank Id is required');
    req.assert('account_id', 'Account is required');
    req.assert('bank_name', 'Bank Name is required');
    req.assert('account_name', 'Account Name is required');
    req.assert('account_number', 'Account Number is required');
    req.assert('bank_branch', 'Bank Branch is required');
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
      account_id: req.body.account_id,
      bank_name: req.body.bank_name,
      account_name: req.body.account_name,
      account_number: req.body.account_number,
      bank_branch: req.body.bank_branch,
      description: req.body.description,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(req.body.update_datetime),
      is_use: req.body.is_use,
      is_active: req.body.is_active
    };

    req.getConnection(function (err, conn) {


      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-ACCOUNT_BANK
        var query = conn.query(`UPDATE ${CUS_DB}.account_bank SET ${value} WHERE account_bank_id = ${req.body.account_bank_id} `, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
           res.send(row); return;

        });
      })

    });

  }

}


module.exports = controller;