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
        // const CUS_DB = req.body.company_db;
        const company_id = req.body.company_id;
        const company_data = globalCompanyList[company_id];

        let company_id = report_data.data.company_id;
        if(!company_id){
            callback(false, "No Id detected")
            return;
        }
        
        req.getConnection(function (err, conn) {
            //--cmt-print: mysql cannot connect
            if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support'; res.send(row); return; }

            var myfireStr = `SELECT *, ( SELECT CONCAT("{username:'", username ,"', password:'", account_password ,"'}") FROM bizystem.employee_account WHERE company_id = company_id LIMIT 1 ) as employee_account FROM company WHERE company_id = ${company_id}`;
            
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
                        detail: [],
                        company: rows[0],
                        currentDate: moment().format('Do MMMM YYYY')
                    },
                    report_id: report_data.report_id
                })
            });

        });
    }
}