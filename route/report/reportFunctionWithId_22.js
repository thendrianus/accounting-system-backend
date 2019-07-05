// Report Data Format
//employe t1 INNER JOIN employee_status t2 ON t1.employee_status_id = t2.employee_status_id INNER JOIN employee_job t3 ON t1.employee_job_id = t3.employee_job_id INNER JOIN employee_category t4 ON t1.employee_category_id = t4.employee_category_ide: t1.{
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

        let employee_id = report_data.data.employee_id;
        
        req.getConnection(function (err, conn) {
            //--cmt-print: mysql cannot connect
            if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support'; res.send(row); return; }

            var myfireStr = `SELECT t1.*, DATE_FORMAT(t1.birth_date, "%M %d %Y") AS "birth_date_formated", t2.employee_status, t3.name AS "employee_job", t4.name AS "employee_category" FROM ${CUS_DB}.employee t1 INNER JOIN ${CUS_DB}.employee_status t2 ON t1.employee_status_id = t2.employee_status_id INNER JOIN ${CUS_DB}.employee_job t3 ON t1.employee_job_id = t3.employee_job_id INNER JOIN ${CUS_DB}.employee_category t4 ON t1.employee_category_id = t4.employee_category_id WHERE t1.is_active = 1`;
            
            //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
            var query = conn.query(myfireStr, function (err, rowsAll) {
                
                if (err) {
                    console.log('Failed to select database. make sure your Database is running or contact our IT support');
                }

                var myfireStr = `SELECT t1.*, DATE_FORMAT(t1.birth_date, "%M %d %Y") AS "birth_date_formated", t2.employee_status, t3.name AS "employee_job", t4.name AS "employee_category" FROM ${CUS_DB}.employee t1 INNER JOIN ${CUS_DB}.employee_status t2 ON t1.employee_status_id = t2.employee_status_id INNER JOIN ${CUS_DB}.employee_job t3 ON t1.employee_job_id = t3.employee_job_id INNER JOIN ${CUS_DB}.employee_category t4 ON t1.employee_category_id = t4.employee_category_id WHERE t1.employee_id = ${employee_id} AND t1.is_active = 1`;
            
                //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
                var query = conn.query(myfireStr, function (err, rows) {
                    console.log("rows")
                    console.log(rows)
                    if (err) {
                        console.log('Failed to select database. make sure your Database is running or contact our IT support');
                    }
                    callback({
                        template: report_data.template,
                        data: {
                            companyData: company_data,
                            detail: rowsAll,
                            employee: rows?rows[0]:{},
                            currentDate: moment().format('Do MMMM YYYY')
                        },
                        report_id: report_data.report_id
                    })
                });

            });

        });
    }
}