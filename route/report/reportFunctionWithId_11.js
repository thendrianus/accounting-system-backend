// Report Data Format
// report_data: {
//   template: this.selectedReportTemplate,
//   data: this.data,
//   report_id: this.report_id
// }

// pos_detail_list 
const moment = require("moment")

module.exports = {
    generateReport: (req, callback) => {
        let report_data = req.body.report_data
        const CUS_DB = req.body.company_db;
        const company_id = req.body.company_id;
        const company_data = globalCompanyList[company_id];

        let employee_account_id = report_data.data.employee_account_id;
        
        req.getConnection(function (err, conn) {
            //--cmt-print: mysql cannot connect
            if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support'; res.send(row); return; }

            var myfireStr = `SELECT t1.*, t2.company, t3.employee_account_category, t4.app_permission_group, concat(t5.employee_code, "-", t5.firstname, " ", t5.lastname) as "employee" FROM bizystem.employee_account t1 INNER JOIN bizystem.company t2 ON t1.company_id = t2.company_id INNER JOIN ${CUS_DB}.employee_account_category t3 ON t1.employee_account_category_id = t3.employee_account_category_id INNER JOIN ${CUS_DB}.app_permission_group t4 ON t1.app_permission_group_id = t4.app_permission_group_id INNER JOIN ${CUS_DB}.employee t5 ON t1.employee_id = t5.employee_id WHERE t1.is_active = 1 AND t1.company_id = ${company_id}`;
            
            //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
            var query = conn.query(myfireStr, function (err, rowsAll) {
                
                if (err) {
                    console.log('Failed to select database. make sure your Database is running or contact our IT support');
                }

                var myfireStr = `SELECT t1.*, t2.company, t3.employee_account_category, t4.app_permission_group, concat(t5.employee_code, "-", t5.firstname, " ", t5.lastname) as "employee" FROM bizystem.employee_account t1 INNER JOIN bizystem.company t2 ON t1.company_id = t2.company_id INNER JOIN ${CUS_DB}.employee_account_category t3 ON t1.employee_account_category_id = t3.employee_account_category_id INNER JOIN ${CUS_DB}.app_permission_group t4 ON t1.app_permission_group_id = t4.app_permission_group_id INNER JOIN ${CUS_DB}.employee t5 ON t1.employee_id = t5.employee_id WHERE t1.employee_account_id = '${employee_account_id}' AND t1.company_id = ${company_id} AND t1.is_active = 1`;
            
                //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
                var query = conn.query(myfireStr, function (err, rows) {
                    console.log(myfireStr)
                    console.log(rows)
                    console.log("rows")
                    console.log(report_data)
                    if (err) {
                        console.log('Failed to select database. make sure your Database is running or contact our IT support');
                    }
                    callback({
                        template: report_data.template,
                        data: { 
                            companyData: company_data,
                            detail: rowsAll,
                            employee_account: rows?rows[0]:{},
                            currentDate: moment().format('Do MMMM YYYY')
                        },
                        report_id: report_data.report_id
                    })
                });

            });

        });
    }
}