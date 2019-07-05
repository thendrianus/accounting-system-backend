var tsservice = require('./../../tsservice');

const controller = {
  //   REST-SELECT
  employeebyjob_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { employeeselect: [] }, label: 'Data selected successfully' };
    // validation
    req.assert('employee_job_id', 'Employee Job Id is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var queryOption = "";
    if (req.body.employee_job_id != "alljob") {
      queryOption = "AND employee_job_id = '" + req.body.employee_job_id + "'";
    }

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      //EMPLOYEE JOB ID NOT = 1, BECAUSE 1 IS JOB ID FOR ADMINISTRATOR
      var myfireStr = `SELECT * FROM ${CUS_DB}.employee WHERE is_use = 1 AND is_active = 1 AND employee_job_id <> 1 ${queryOption}`;

      //   -SELECT-EMPLOYEE
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.employeeselect = rows;
         res.send(row); return;
      });

    });

  }
}

module.exports = controller;