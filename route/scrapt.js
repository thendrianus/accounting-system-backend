// req.getConnection(function (err, conn) {

//     var myfireStr = `
//     USE cus_bizystem_2;

//     DROP TRIGGER IF EXISTS product_result_detail_after_insert;
    
//     DROP TRIGGER IF EXISTS material_release_detail_after_insert;

//     DROP TRIGGER IF EXISTS setinventoryhpp_run_after_insert;
    
//     CREATE
//     DEFINER = 'root'@'localhost'
//     TRIGGER product_result_detail_after_insert
//     AFTER INSERT
//     ON product_result_detail
//     FOR EACH ROW
//     BEGIN
    
//       SET @work_order_id = (SELECT 
//           t2.work_order_id
//         FROM product_result_detail t1
//           INNER JOIN product_result t2
//         ORDER BY t1.product_result_detail_id DESC LIMIT 1);
    
//       SET @product_result = (SELECT
//           CONCAT('[', GROUP_CONCAT(CONCAT('{', '"inventory_id":"', t1.inventory_id, '",', '"quantity":"', t1.quantity, '"}')), ']')
//         FROM (SELECT
//             prd.inventory_id,
//             SUM(prd.quantity) AS "quantity"
//           FROM product_result_detail prd
//             INNER JOIN product_result pr
//               ON prd.product_result_detail_id = pr.product_result_id
//           WHERE prd.is_active = 1
//           AND pr.work_order_id = @work_order_id
//           GROUP BY prd.inventory_id) t1);
    
//       UPDATE work_order wo
//       SET product_result = @product_result
//       WHERE wo.work_order_id = @work_order_id;
    
//     END;

//     CREATE
//     DEFINER = 'root'@'localhost'
//     TRIGGER material_release_detail_after_insert
//     AFTER INSERT
//     ON material_release_detail
//     FOR EACH ROW
//     BEGIN
    
//       SET @work_order_id = (SELECT
//           t2.work_order_id
//         FROM material_release_detail t1
//           INNER JOIN material_release t2
//         ORDER BY t1.material_release_detail_id DESC LIMIT 1);
    
//       SET @material_release = (SELECT
//           CONCAT('[', GROUP_CONCAT(CONCAT('{', '"inventory_id":"', t1.inventory_id, '",', '"quantity":"', t1.quantity, '"}')), ']')
//         FROM (SELECT
//             mrd.inventory_id,
//             SUM(mrd.quantity) AS "quantity"
//           FROM material_release_detail mrd
//             INNER JOIN material_release mr
//               ON mrd.material_release_detail_id = mr.material_release_id
//           WHERE mrd.is_active = 1
//           AND mr.work_order_id = @work_order_id
//           GROUP BY mrd.inventory_id) t1);
    
//       UPDATE work_order wo
//       SET material_release = @material_release
//       WHERE wo.work_order_id = @work_order_id;
    
//     END;

//     CREATE
//     DEFINER = 'root'@'localhost'
//     TRIGGER setinventoryhpp_run_after_insert
//     AFTER INSERT
//     ON inventoryledger
//     FOR EACH ROW
//     BEGIN
    
//       SET @lastInventoryId = (SELECT
//           i.inventory_id
//         FROM inventoryledger i
//         ORDER BY i.inventoryledger_id DESC LIMIT 1);
    
//       SET @hppType = (SELECT
//           hpp_type
//         FROM inventory
//         WHERE inventory_id = @lastInventoryId);
    
//       SET @hpp = 3;
    
//       IF @hppType = 1 THEN
//         /* Everage*/
//         SET @hpp = (SELECT
//             SUM(i.hpp * i.debit) / SUM(i.debit) AS "average"
//           FROM inventoryledger i
//             INNER JOIN inventoryledger_link il
//               ON i.inventoryledger_link_id = il.inventoryledger_link_id
//           WHERE i.inventory_id = @lastInventoryId
//           AND i.debit <> 0
//           AND il.inventoryledger_link_type_id <> 8);
    
//       ELSEIF @hppType = 2 THEN
//         /* Last In Last Out */
//         SET @sumCredit = (SELECT
//             SUM(credit) AS "sumCredit"
//           FROM inventoryledger i
//             INNER JOIN inventoryledger_link il
//               ON i.inventoryledger_link_id = il.inventoryledger_link_id
//           WHERE i.inventory_id = @lastInventoryId
//           AND i.credit <> 0
//           AND il.inventoryledger_link_type_id <> 8);
//         SET @inventoryledgerId = (SELECT
//             i.inventoryledger_id AS "inventoryledgerId"
//           FROM inventoryledger i
//             INNER JOIN inventoryledger_link il
//               ON i.inventoryledger_link_id = il.inventoryledger_link_id
//           WHERE i.inventory_id = 1
//           AND i.debit <> 0
//           AND il.inventoryledger_link_type_id <> 8
//           AND i.debit_sum >= @sumCredit
//           ORDER BY i.inventoryledger_id DESC LIMIT 1);
//         /* sum(credit) , select sum_debit where sum_debit >= sum(credit) ASC */
//         SET @hpp = (SELECT
//             SUM(i.hpp * i.debit) / SUM(i.debit) AS "sumCredit"
//           FROM inventoryledger i
//             INNER JOIN inventoryledger_link il
//               ON i.inventoryledger_link_id = il.inventoryledger_link_id
//           WHERE i.inventory_id = @lastInventoryId
//           AND i.debit <> 0
//           AND il.inventoryledger_link_type_id <> 8
//           AND i.inventoryledger_id >= @inventoryledgerId);
    
//       ELSEIF @hppType = 3 THEN
//         /* Firt In First Out */
//         SET @sumCredit = (SELECT
//             SUM(credit) AS "sumCredit"
//           FROM inventoryledger i
//             INNER JOIN inventoryledger_link il
//               ON i.inventoryledger_link_id = il.inventoryledger_link_id
//           WHERE i.inventory_id = @lastInventoryId
//           AND i.credit <> 0
//           AND il.inventoryledger_link_type_id <> 8);
//         SET @inventoryledgerId = (SELECT
//             i.inventoryledger_id AS "inventoryledgerId"
//           FROM inventoryledger i
//             INNER JOIN inventoryledger_link il
//               ON i.inventoryledger_link_id = il.inventoryledger_link_id
//           WHERE i.inventory_id = @lastInventoryId
//           AND i.debit <> 0
//           AND il.inventoryledger_link_type_id <> 8
//           AND i.debit_sum >= @sumCredit
//           ORDER BY i.inventoryledger_id DESC LIMIT 1);
//         /* sum(credit) , select sum_debit where sum_debit >= sum(credit) ASC */
//         SET @hpp = (SELECT
//             SUM(i.hpp * i.debit) / SUM(i.debit) AS "sumCredit"
//           FROM inventoryledger i
//             INNER JOIN inventoryledger_link il
//               ON i.inventoryledger_link_id = il.inventoryledger_link_id
//           WHERE i.inventory_id = @lastInventoryId
//           AND i.debit <> 0
//           AND il.inventoryledger_link_type_id <> 8
//           AND i.inventoryledger_id >= @inventoryledgerId);
    
//       END IF;
    
//       SET @expireDate = (SELECT
//           CONCAT('[', GROUP_CONCAT(CONCAT('{', '"date":"', t1.expired_date, '",', '"reminder":"', t1.reminder_expired_date, '",', '"date_show":"', t1.date_show, '",', '"warehouse_id":"', t1.warehouse_id, '",', '"stock":"', t1.stock, '"}')), ']')
//         FROM (SELECT
//             expired_date,
//             reminder_expired_date,
//             warehouse_id,
//             COALESCE(SUM(debit) - SUM(credit), 0) AS "stock",
//             IF(YEAR(expired_date) <> "3014", DATE_FORMAT(expired_date, "%d %M %Y"), "General") AS "date_show"
//           FROM inventoryledger
//           WHERE inventory_id = @lastInventoryId
//           AND warehouse_id <> 1
//           AND expired_date > (DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
//           GROUP BY CONCAT(expired_date, '-', reminder_expired_date, '-', warehouse_id)) t1);
//       SET @stock = (SELECT
//           COALESCE(SUM(debit) - SUM(credit), 0) AS "stock"
//         FROM inventoryledger
//         WHERE is_active = 1
//         AND warehouse_id <> 1
//         AND inventory_id = @lastInventoryId);
//       SET @warehouse_stock = (SELECT
//           CONCAT('[', GROUP_CONCAT(CONCAT('{', '"warehouse_id":"', t1.warehouse_id, '",', '"stock":"', t1.stock, '"}')), ']')
//         FROM (SELECT
//             warehouse_id,
//             COALESCE(SUM(debit) - SUM(credit), 0) AS "stock"
//           FROM inventoryledger
//           WHERE inventory_id = @lastInventoryId
//           AND warehouse_id <> 1
//           GROUP BY warehouse_id) t1);
    
//       UPDATE inventory i
//       SET i.hpp = @hpp,
//           i.expired_dates = @expireDate,
//           stock = @stock,
//           warehouse_stock = @warehouse_stock
//       WHERE i.inventory_id = @lastInventoryId;
    
//     END;

//     `;

//     //   -SELECT-COMPANY   -JOIN-BRANCH
//     var query = conn. query(myfireStr, function (err, rows) {

//       if (err) {
//         console.log(err)
//       }else{
//         console.log(rows)
//       }

//     });

//   });