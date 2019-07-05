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
        const employee_sure_name = req.body.employee_sure_name;
        const company_data = globalCompanyList[company_id];

        let purchase_id = report_data.data.purchase_id;

        if(!purchase_id){
            callback(false, "No Id detected")
            return;
        }

        req.getConnection(function (err, conn) {
            //--cmt-print: mysql cannot connect
            if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support'; res.send(row); return; }
            
            var myfireStr = `
                SELECT 
                    t1.*,
                    DATE_FORMAT(t1.transaction_date, "%d %M %y") as "transaction_date_formated",
                    t2.name AS "businesspartner",
                    t3.name AS "branch",
                    t4.warehouse,
                    t5.name AS "purchase_category",
                    t6.name AS "purchase_status",
                    t7.name AS "transaction_payment",
                    t8.name AS "tax"
                FROM
                    ${CUS_DB}.purchase t1
                INNER JOIN ${CUS_DB}.businesspartner t2 ON t1.businesspartner_id = t2.businesspartner_id
                INNER JOIN ${CUS_DB}.branch t3 ON t1.branch_id = t3.branch_id
                INNER JOIN ${CUS_DB}.warehouse t4 ON t1.warehouse_id = t4.warehouse_id
                INNER JOIN ${CUS_DB}.purchase_category t5 ON t1.purchase_category_id = t5.purchase_category_id
                INNER JOIN ${CUS_DB}.purchase_status t6 ON t1.purchase_status_id = t6.purchase_status_id
                INNER JOIN ${CUS_DB}.transaction_payment t7 ON t1.transaction_payment_id = t7.transaction_payment_id
                INNER JOIN ${CUS_DB}.tax t8 ON t1.tax_id = t8.tax_id
                WHERE t1.purchase_id = ${purchase_id}
            `;
            console.log(myfireStr)
            //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
            var query = conn.query(myfireStr, function (err, rows) {
                if (err) {
                    console.log('Failed to select database. make sure your Database is running or contact our IT support');
                }
                var myfireStr = `
                    SELECT
                        t1.*,
                        t2.name as "inventory",
                        t2.inventory_code,
                        t3.warehouse,
                        t4.name AS "tax"
                    FROM
                    ${CUS_DB}.purchase_detail t1
                    INNER JOIN ${CUS_DB}.inventory t2 ON t1.inventory_id = t2.inventory_id
                    INNER JOIN ${CUS_DB}.warehouse t3 ON t1.warehouse_id = t3.warehouse_id
                    INNER JOIN ${CUS_DB}.tax t4 ON t1.tax_id = t4.tax_id
                    WHERE t1.purchase_id = ${purchase_id}                    
                `;

                console.log(myfireStr)
                //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
                var query = conn.query(myfireStr, function (err, rowsDetail) {
                    if (err) {
                        console.log('Failed to select database. make sure your Database is running or contact our IT support');
                    }
                    console.log({
                        template: report_data.template,
                        data: {
                            companyData: company_data,
                            detail: rowsDetail,
                            purchase: rows?rows[0]:[],
                            currentDate: moment().format('Do MMMM YYYY')
                        },
                        report_id: report_data.report_id 
                    })
                    callback({
                        template: report_data.template,
                        data: {
                            companyData: company_data,
                            employee_sure_name: employee_sure_name,
                            detail: rowsDetail,
                            purchase: rows?rows[0]:[],
                            currentDate: moment().format('Do MMMM YYYY')
                        },
                        report_id: report_data.report_id
                    })
                });
            });

        });
    }
}