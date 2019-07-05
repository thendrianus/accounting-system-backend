var tsservice = require('./../../tsservice');

module.exports = function (req, res, next) {
  const CUS_DB = req.body.company_db;
  var row = { success: true, data: { lastId: '' }, label: 'Data entered successfully' };
  // validation
  req.assert('account_code', 'Account Code/No is required');
  req.assert('account', 'Account is required');
  req.assert('account_category_type_id', 'Account Category Type is required');
  req.assert('currency_id', 'Currency data is required');
  req.assert('is_header', 'Header? is required');
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

  var general_journal_id = "";

  req.getConnection(function (err, conn) {

    if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

    conn.beginTransaction(function (err) {

      var myfireStr = `SELECT generalledger_period_id FROM ${CUS_DB}.generalledger_period WHERE generalledger_status_id = 1 AND is_active =1 AND is_use =1 limit 1`;

      //   -SELECT-GENERALLEDGER_PERIOD
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
          conn.rollback(function () {
             res.send(row); return;
          });
        }

        if (rows[0]['generalledger_period_id']) {

          var data = {
            general_journal_code: '',
            reference_code: '',
            general_journal_type_id: '2', //important code
            description: 'beginning balance account',
            create_by: req.body.create_by,
            generalledger_period_id: rows[0]['generalledger_period_id'],
            transaction_date: tsservice.mysqlDate(),
            create_datetime: tsservice.mysqlDate(req.body.create_datetime),
            update_by: req.body.create_by,
            update_datetime: tsservice.mysqlDate(req.body.create_datetime),
            is_use: '1',
            is_active: '1'
          };


          data.reference_code = req.body.account_code;

          var codeData = {
            special_code_id: "JOURNAL",
            table: "general_journal",
            column_id: "general_journal_id",
            column_code: "general_journal_code",
          }

          var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

          var query = conn.query(myfireStr, function (err, rows) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
              conn.rollback(function () {
                 res.send(row); return;
              });
            }

            if (rows[0]['code']) {
              data.general_journal_code = rows[0]['code'];

              tsservice.insertData(data, function (value) {
                //   -INSERT-GENERAL_JOURNAL
                var query = conn.query(`INSERT INTO ${CUS_DB}.general_journal` + value, function (err, rows) {

                  if (err) {
                    row.success = false; console.log(err);
                    row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                    conn.rollback(function () {
                       res.send(row); return;
                    });
                  }
                  general_journal_id = rows.insertId;
                  continues(req, general_journal_id, conn);

                });
              })

            } else {
              row.success = false; console.log(err);
              row.label = 'Failed to select important code. Please contact our IT support';
              conn.rollback(function () {
                 res.send(row); return;
              });
            }

          });

        } else {
          row.success = false; console.log(err);
          row.label = 'Failed to select important code. Please contact our IT support';
          conn.rollback(function () {
             res.send(row); return;
          });
        }

      });

    });

  });

  function continues(req, general_journal_id, conn) {

    const CUS_DB = req.body.company_db;

    var data = {
      account_code: req.body.account_code,
      account: req.body.account,
      account_category_type_id: req.body.account_category_type_id,
      currency_id: req.body.currency_id,
      is_header: req.body.is_header,
      description: req.body.description,
      general_journal_id: general_journal_id,
      create_by: req.body.create_by,
      create_datetime: tsservice.mysqlDate(req.body.create_datetime),
      update_by: req.body.create_by,
      update_datetime: tsservice.mysqlDate(req.body.create_datetime),
      is_use: 1,
      is_active: 1
    };

    if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

    tsservice.insertData(data, function (value) {
      //   -INSERT-ACCOUNT
      var query = conn.query(`INSERT INTO ${CUS_DB}.account` + value, function (err, rows) {
        
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
          conn.rollback(function () {
             res.send(row); return;
          });
        }
        row.data.lastId = rows.insertId;

        conn.commit(function (err) {
           res.send(row); return;
        });

      });
    })

  }

}