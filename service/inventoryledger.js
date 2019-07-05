module.exports = (callback) =>{

//     SET @work_order_id = (SELECT t2.work_order_id FROM material_release_detail t1 INNER JOIN material_release t2 ORDER BY t1.material_release_detail_id DESC LIMIT 1);

// SET @material_release = (SELECT CONCAT('[',GROUP_CONCAT(CONCAT('{','"inventory_id":"',t1.inventory_id,'",','"quantity":"',t1.quantity,'"}')),']') FROM (SELECT mrd.inventory_id, SUM(mrd.quantity) AS "quantity" FROM material_release_detail mrd INNER JOIN material_release mr ON mrd.material_release_detail_id = mr.material_release_id WHERE mrd.is_active = 1 AND mr.work_order_id = @work_order_id GROUP BY mrd.inventory_id) t1);

// UPDATE work_order wo SET material_release = @material_release WHERE wo.work_order_id = @work_order_id;

}