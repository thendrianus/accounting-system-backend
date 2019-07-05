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

        let businesspartner_id = report_data.data.businesspartner_id;

        req.getConnection(function (err, conn) {
            //--cmt-print: mysql cannot connect
            if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support'; res.send(row); return; }

            var myfireStr = `SELECT t1.*, t2.businesspartner_category, t3.businesspartner_group, concat(t4.employee_code, "-", t4.firstname, " ", t4.lastname) as "salesman_employee", concat(t5.employee_code, "-", t5.firstname, " ", t5.lastname) as "collector_employee" FROM ${CUS_DB}.businesspartner t1 INNER JOIN ${CUS_DB}.businesspartner_category t2 ON t1.businesspartner_category_id = t2.businesspartner_category_id INNER JOIN ${CUS_DB}.businesspartner_group t3 ON t1.businesspartner_group_id = t3.businesspartner_group_id INNER JOIN ${CUS_DB}.employee t4 ON t1.salesman_employee_id = t4.employee_id INNER JOIN ${CUS_DB}.employee t5 ON t1.collector_employee_id = t5.employee_id WHERE t1.is_active = 1`;

            //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
            var query = conn.query(myfireStr, function (err, rowsAll) {

                if (err) {
                    console.log('Failed to select database. make sure your Database is running or contact our IT support');
                }

                myfireStr = `SELECT t1.*, t2.businesspartner_category, t3.businesspartner_group, concat(t4.employee_code, "-", t4.firstname, " ", t4.lastname) as "salesman_employee", concat(t5.employee_code, "-", t5.firstname, " ", t5.lastname) as "collector_employee" FROM ${CUS_DB}.businesspartner t1 INNER JOIN ${CUS_DB}.businesspartner_category t2 ON t1.businesspartner_category_id = t2.businesspartner_category_id INNER JOIN ${CUS_DB}.businesspartner_group t3 ON t1.businesspartner_group_id = t3.businesspartner_group_id INNER JOIN ${CUS_DB}.employee t4 ON t1.salesman_employee_id = t4.employee_id INNER JOIN ${CUS_DB}.employee t5 ON t1.collector_employee_id = t5.employee_id WHERE t1.is_active = 1 AND t1.businesspartner_id = ${businesspartner_id}`;
                console.log(myfireStr)
                //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
                var query = conn.query(myfireStr, function (err, rows) {
                    console.log("rows1")
                    console.log(rows)
                    if (err) {
                        console.log(err)
                        console.log('Failed to select database. make sure your Database is running or contact our IT support');
                    }

                    myfireStr = `SELECT * FROM ${CUS_DB}.businesspartner_address WHERE businesspartner_id = ${businesspartner_id}`;
                    console.log(myfireStr)
                    //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
                    var query = conn.query(myfireStr, function (err, rows_address) {
                        console.log("rows2")
                        console.log(rows_address)
                        if (err) {
                            console.log('Failed to select database. make sure your Database is running or contact our IT support');
                        }

                        myfireStr = `SELECT * FROM ${CUS_DB}.businesspartner_contact WHERE businesspartner_id = ${businesspartner_id}`;
                        console.log(myfireStr)
                        //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
                        var query = conn.query(myfireStr, function (err, rows_contact) {
                            console.log("rows3")
                            console.log(rows_contact)
                            if (err) {
                                console.log('Failed to select database. make sure your Database is running or contact our IT support');
                            }
                            callback({
                                template: report_data.template,
                                data: {
                                    companyData: company_data,
                                    detail: rowsAll,
                                    businesspartner_contact: rows_contact,
                                    businesspartner_address: rows_address,
                                    businesspartner: rows ? rows[0] : {},
                                    currentDate: moment().format('Do MMMM YYYY')
                                },
                                report_id: report_data.report_id
                            })
                        });

                    });

                });

            });

        });
    }
}