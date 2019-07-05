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

        let inventory_id = report_data.data.inventory_id;

        req.getConnection(function (err, conn) {
            //--cmt-print: mysql cannot connect
            if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support'; res.send(row); return; }

            var myfireStr = `
                SELECT 
                    t1.*, 
                    t2.inventory_group,
                    t3.category_detail,
                    t4.name as "inventory_category",
                    t5.name as "purchase_tax",
                    t6.name as "sell_tax",
                    t7.account as "purchase_account",
                    t8.account as "sell_account",
                    t9.account as "hpp_account"
                FROM ${CUS_DB}.inventory t1 
                    INNER JOIN ${CUS_DB}.inventory_group t2 ON t1.inventory_group_id = t2.inventory_group_id 
                    INNER JOIN 	${CUS_DB}.inventory_detail_category t3 ON t1.inventory_detail_category_id = t3.inventory_detail_category_id 
                    INNER JOIN 	${CUS_DB}.inventory_category t4 ON t1.inventory_category_id = t4.inventory_category_id 
                    INNER JOIN 	${CUS_DB}.tax t5 ON t1.purchase_tax_id = t5.tax_id 
                    INNER JOIN 	${CUS_DB}.tax t6 ON t1.sell_tax_id = t6.tax_id 
                    INNER JOIN 	${CUS_DB}.account t7 ON t1.purchase_account_id = t7.account_id 
                    INNER JOIN 	${CUS_DB}.account t8 ON t1.sell_account_id = t8.account_id 
                    INNER JOIN 	${CUS_DB}.account t9 ON t1.hpp_account_id = t9.account_id 
                WHERE t1.is_active = 1`;

            //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
            var query = conn.query(myfireStr, function (err, rowsAll) {
                console.log("rowsAll.length")
                console.log(rowsAll.length)
                if (err) {
                    console.log('Failed to select database. make sure your Database is running or contact our IT support');
                }

                myfireStr = `
                SELECT 
                    t1.*, 
                    t2.inventory_group,
                    t3.category_detail,
                    t4.name as "inventory_category",
                    t5.name as "purchase_tax",
                    t6.name as "sell_tax",
                    t7.account as "purchase_account",
                    t8.account as "sell_account",
                    t9.account as "hpp_account",
                    t10.brand
                FROM ${CUS_DB}.inventory t1 
                    INNER JOIN ${CUS_DB}.inventory_group t2 ON t1.inventory_group_id = t2.inventory_group_id 
                    INNER JOIN 	${CUS_DB}.inventory_detail_category t3 ON t1.inventory_detail_category_id = t3.inventory_detail_category_id 
                    INNER JOIN 	${CUS_DB}.inventory_category t4 ON t1.inventory_category_id = t4.inventory_category_id 
                    INNER JOIN 	${CUS_DB}.tax t5 ON t1.purchase_tax_id = t5.tax_id 
                    INNER JOIN 	${CUS_DB}.tax t6 ON t1.sell_tax_id = t6.tax_id 
                    INNER JOIN 	${CUS_DB}.account t7 ON t1.purchase_account_id = t7.account_id 
                    INNER JOIN 	${CUS_DB}.account t8 ON t1.sell_account_id = t8.account_id 
                    INNER JOIN 	${CUS_DB}.account t9 ON t1.hpp_account_id = t9.account_id 
                    INNER JOIN 	${CUS_DB}.brand t10 ON t1.brand_id = t10.brand_id 
                WHERE t1.is_active = 1 AND t1.inventory_id = ${inventory_id}`;
                console.log(myfireStr)
                //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
                var query = conn.query(myfireStr, function (err, rows) {
                    console.log("rows1")
                    console.log(rows)
                    if (err) {
                        console.log(err)
                        console.log('Failed to select database. make sure your Database is running or contact our IT support');
                    }

                    myfireStr = `SELECT * FROM ${CUS_DB}.inventory_price WHERE inventory_id = ${inventory_id}`; // price
                    console.log(myfireStr)
                    //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
                    var query = conn.query(myfireStr, function (err, rows_price) {
                        console.log("rows2")
                        console.log(rows_price)
                        if (err) {
                            console.log('Failed to select database. make sure your Database is running or contact our IT support');
                        }

                        myfireStr = `SELECT t1.*, t2.businesspartner_code, t2.name FROM ${CUS_DB}.inventory_supplier t1 INNER JOIN inventory_supplier t2 ON t1.inventory_supplier_id = t2.inventory_supplier_id WHERE t1.inventory_id = ${inventory_id}`; //Supplier
                        console.log(myfireStr)
                        //   -SELECT-POS_DETAIL   -JOIN-INVENTORY
                        var query = conn.query(myfireStr, function (err, rows_supplier) {
                            console.log("rows3")
                            console.log(rows_supplier)
                            if (err) {
                                console.log('Failed to select database. make sure your Database is running or contact our IT support');
                            }
                            callback({
                                template: report_data.template,
                                data: {
                                    companyData: company_data,
                                    detail: rowsAll,
                                    inventory_price: rows_price ? rows_price : {},
                                    inventory_supplier: rows_supplier ? rows_supplier : {},
                                    inventory: rows ? rows[0] : {},
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