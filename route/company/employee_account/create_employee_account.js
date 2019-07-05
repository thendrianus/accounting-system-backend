var tsservice = require('./../../tsservice');

module.exports = (body, row, CUS_DB, conn, callback) => {
  
  var codeData = {
    special_code_id: "EMPACCOUNT",
    table: "employee_account",
    column_id: "employee_account_id",
    column_code: "employee_account_code",
  }

  var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM bizystem.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

  //   -SELECT-SPECIAL_CODE   -SELECT-EMPLOYEE_ACCOUNT
  var query = conn.query(myfireStr, function (err, rows) {
    
    if (err) {
      row.success = false; console.log(err);
      row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
      callback(row);
    }

    if (rows[0]['code']) {
      
      if (body.profile_picture && body.profile_picture !== 'no-photo.png') {
        fs.move('uploads/' + body.profile_picture, 'public/assets/employee/' + body.profile_picture, err => {
          if (err) return console.error(err)
          console.log('Picture Upload success!');
        });
      }
      
      row.data.employee_account_code = rows[0]['code'];
      var data = {
        employee_account_code: rows[0]['code'],
        employee_account_category_id: 3,
        employee_id: body.employee_id,
        company_id: row.data.company_id,
        username: body.username,
        account_password: body.account_password,
        app_permission_group_id: body.app_permission_group_id,
        description: body.description,
        profile_picture: body.profile_picture ? body.profile_picture : 'no-photo.png',
        create_by: body.create_by,
        update_by: body.update_by,
        create_datetime: tsservice.mysqlDate(),
        update_datetime: tsservice.mysqlDate(),
        is_use: '1',
        is_active: '1',
      };
      
      tsservice.insertData(data, function (value) {
        //   -INSERT-EMPLOYEE_ACCOUNT
        var query = conn.query(`INSERT INTO bizystem.employee_account` + value, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
            callback(row);
          }
          row.data.employee_account_id = rows.insertId;
          callback(row);

        });
      });

    } else {
      row.success = false; console.log(err);
      row.label = 'Failed to select important code. Please contact our IT support';
      callback(row);
    }

  });

}