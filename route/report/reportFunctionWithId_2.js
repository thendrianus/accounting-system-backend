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

        let pos_session_id = report_data.data.pos_session_id;

        if(!pos_session_id){
            callback(false, "No Id detected")
            return;
        }

        req.getConnection(function (err, conn) {
            //--cmt-print: mysql cannot connect
            if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support'; res.send(row); return; }

            var myfireStr = `
                SELECT 
                    t2.pos_code, 
                    t2.pos_session_id, 
                    DATE_FORMAT(t2.transaction_date, "%d %M %y") as "transaction_date", 
                    t1.inventory_id, 
                    t1.ordered, 
                    t1.price, 
                    t1.discount_amount, 
                    t1.discount_persent, 
                    t3.name as "inventory_name", 
                    t2.discount_amount AS "pos_discount_amount", 
                    t2.discount_persent AS "pos_discount_persent"
                FROM ${CUS_DB}.pos_detail t1 
                    INNER JOIN ${CUS_DB}.pos t2 on t1.pos_id = t2.pos_id 
                    INNER JOIN ${CUS_DB}.inventory t3 on t1.inventory_id = t3.inventory_id 
                WHERE 
                    t2.pos_session_id = ${pos_session_id} AND 
                    t1.is_active = 1 AND 
                    t2.is_active = 1 
                ORDER BY 
                    t2.pos_code, 
                    t1.pos_detail_id`;
                    console.log(myfireStr)
            //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
            var query = conn.query(myfireStr, function (err, rows) {
                if(rows){
                    console.log("good1")
                }
                if (err) {
                    console.log('Failed to select database. make sure your Database is running or contact our IT support');
                }
                var myfireStr = `
                    SELECT 
                        SUM( t1.ordered ) as "totalQuantity" 
                    FROM ${CUS_DB}.pos_detail t1 
                        INNER JOIN ${CUS_DB}.pos t2 on t1.pos_id = t2.pos_id 
                    WHERE 
                        t2.pos_session_id = ${pos_session_id} AND 
                        t1.is_active = 1 AND 
                        t2.is_active = 1 
                    ORDER BY 
                        t2.transaction_date`;

                console.log(myfireStr)
                //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
                var query = conn.query(myfireStr, function (err, totalQuantity) {
                    if(totalQuantity){
                        console.log("good2")
                    }
                    if (err) {
                        console.log('Failed to select database. make sure your Database is running or contact our IT support');
                    }
                    var myfireStr = `
                        SELECT 
                            SUM( grand_total ) as "total" 
                        FROM ${CUS_DB}.pos 
                        WHERE 
                            pos_session_id = ${pos_session_id} AND 
                            is_active = 1 AND 
                            is_active = 1 
                        ORDER BY 
                            transaction_date`;

                    console.log(myfireStr)
                    //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
                    var query = conn.query(myfireStr, function (err, sumTotal) {
                        if(sumTotal){
                            console.log("good3")
                        }
                        if (err) {
                            console.log('Failed to select database. make sure your Database is running or contact our IT support');
                        }
                        callback({
                            template: report_data.template,
                            data: {
                                companyData: company_data,
                                detail: rows,
                                total: sumTotal[0]['total'],
                                totalQuantity: totalQuantity[0]['totalQuantity'],
                                currentDate: moment().format('Do MMMM YYYY')
                            },
                            report_id: report_data.report_id
                        })
                    });
                });
            });

        });
    }
}