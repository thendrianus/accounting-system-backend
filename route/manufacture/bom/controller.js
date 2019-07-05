var tsservice = require('./../../tsservice');
var async = require('async');

const controller = {
	//   REST-SELECT
	bomselect_post: function (req, res, next) {
		const CUS_DB = req.body.company_db;


		var row = { success: true, data: { bom: [] }, label: 'Berhasil' };

		req.assert('is_use', 'Used data is required');

		var err = req.validationErrors();
		if (err) {
			row.success = false; console.log(err);
			row.label = "Check please make sure your data fit the createria." + err;
			res.send(row); return;
			
		}

		req.getConnection(function (err, conn) {


			//--cmt-print: mysql cannot connect
			if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

			var strwhere = "";
			if (req.body.is_use == '1') {
				var strwhere = "is_use = 1 AND";
			}
			var myfireStr = `SELECT *,CONVERT(bom_id, char(50)) AS "value", CONCAT(bom_code, " - ", bom) AS "label", "[]" as "bom_inventory", "[]" as "bom_cost" FROM ${CUS_DB}.bom WHERE ${strwhere} is_active = 1`;

			//   -SELECT-BOM
			var query = conn.query(myfireStr, function (err, rows) {
				if (err) {
					row.success = false; console.log(err);
					row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
					 res.send(row); return;
				}
				row.data.bom = rows;
				 res.send(row); return;

			});

		});

	},

	//   REST-INSERT
	bom_post: function (req, res, next) {
		const CUS_DB = req.body.company_db;


		var row = { success: true, data: { bom_id: '', bom_code: '' }, label: 'Data entered successfully', error: "" };
		// validation

		req.assert('bom_inventory', '');
		req.assert('bom', '');
		req.assert('quantity', '');
		req.assert('uom', '');
		req.assert('min_quantity', '');
		req.assert('inventory_id', '');
		req.assert('total_cost', '');
		req.assert('description', 'Description is required');
		req.assert('create_by', 'Created by is required');
		req.assert('create_datetime', 'Create date and time is required');
		req.assert('is_use', 'Used data is required');
		req.assert('is_active', 'Active data is required');

		var err = req.validationErrors();
		if (err) {
			row.success = false; console.log(err);
			row.label = "Check please make sure your data fit the createria." + err;
			res.send(row); return;
			
		}

		req.getConnection(function (err, conn) {


			//--cmt-print: mysql cannot connect
			if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

			var codeData = {
				special_code_id: "BOM",
				table: "bom",
				column_id: "bom_id",
				column_code: "bom_code",
			}

			var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

			//   -SELECT-SPECIAL_CODE   -SELECT-BOM
			var query = conn.query(myfireStr, function (err, rows) {

				if (err) {
					row.success = false; console.log(err);
					row.label = 'Failed to select database. make sure your Database is running or contact our IT support';

				}

				if (rows[0]['code']) {

					row.data.bom_code = rows[0]['code'];
					var data = {
						bom_code: rows[0]['code'],
						bom: req.body.bom,
						quantity: req.body.quantity,
						uom: req.body.uom,
						min_quantity: req.body.min_quantity,
						inventory_id: req.body.inventory_id,
						total_cost: req.body.total_cost,
						description: req.body.description,
						create_by: req.body.create_by,
						update_by: req.body.update_by,
						create_datetime: tsservice.mysqlDate(),
						update_datetime: tsservice.mysqlDate(),
						is_use: '1',
						is_active: '1'
					};

					tsservice.insertData(data, function (value) {
						//   -INSERT-BOM
						var query = conn.query(`INSERT INTO ${CUS_DB}.bom` + value, function (err, rows) {

							if (err) {
								row.success = false; console.log(err);
								row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
								 res.send(row); return;
							}
							row.data.bom_id = rows.insertId;


							bom_inventory(conn).then(function (result) {

								bom_cost(conn).then(function (result) {

									 res.send(row); return;

								}).catch(error => {
									console.log('false bom_cost');
									 res.send(row); return;
								});

							}).catch(error => {
								console.log('false bom_inventory');
								 res.send(row); return;
							});

						});
					});

				} else {
					row.success = false; console.log(err);
					row.label = 'Failed to select important code. Please contact our IT support';
					 res.send(row); return;
				}

			});

		});

		function bom_inventory(conn) {

			return new Promise(function (resolve, reject) {

				var querystr = "";
				async.forEach(req.body.bom_inventory, function (item, callback) {

					if (item.is_active == 1) {
						if (querystr != "") {
							querystr += ', ';
						}
						querystr += '("' + row.data.bom_id + '", "' + item.standard_inventory_detail_id + '", "' + item.quantity + '", "' + item.uom + '", "' + item.cost + '", "' + item.description + '","' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '",1 , 1)';
					}
					callback();

				}, function (err) {
					if (err) {
						row.success = false; console.log(err);
						row.label = 'Server failed prosess data. try again or contact our IT support';
						reject(1);
					}

					if (querystr != "") {

						var myfireStr = `INSERT INTO ${CUS_DB}.bom_inventory( bom_id, standard_inventory_detail_id, quantity, uom, cost, description, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + querystr;

						//   -INSERT-BOM_INVENTORY
						var query = conn.query(myfireStr, function (err, rows) {

							if (err) {
								row.success = false; console.log(err);
								row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
								reject(1);
							}
							resolve(1);

						});
					} else {
						resolve(1);
					}

				});

			});

		}

		function bom_cost(conn) {

			return new Promise(function (resolve, reject) {

				var querystr = "";

				async.forEach(req.body.bom_cost, function (item, callback) {

					if (item.is_active == 1) {
						if (querystr != "") {
							querystr += ', ';
						}
						querystr += '("' + row.data.bom_id + '", "' + item.standard_cost_detail_id + '", "' + item.quantity + '", "' + item.uom + '", "' + item.cost + '", "' + item.description + '","' + req.body.create_by + '","' + req.body.create_datetime + '","' + req.body.create_by + '","' + req.body.create_datetime + '", 1, 1)';
					}
					callback();

				}, function (err) {
					if (err) {
						row.success = false; console.log(err);
						row.label = 'Server failed prosess data. try again or contact our IT support';
						reject(1);
					}

					if (querystr != "") {
						var myfireStr = `INSERT INTO ${CUS_DB}.bom_cost( bom_id, standard_cost_detail_id, quantity, uom, cost, description, create_by, create_datetime, update_by, update_datetime, is_use , is_active ) VALUES ` + querystr;

						//   -INSERT-BOM_COST
						var query = conn.query(myfireStr, function (err, rows) {

							if (err) {
								row.success = false; console.log(err);
								row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
								reject(1);
							}
							resolve(1);

						});
					} else {
						resolve(1);
					}

				});

			});

		}

	},

	//   REST-UPDATE
	bom_put: function (req, res, next) {
		const CUS_DB = req.body.company_db;


		var row = { success: true, data: { bom_id: '' }, label: 'Data updated successfully' };
		// validation
		req.assert('bom_id', 'Conversion Inventory is required');
		req.assert('bom_inventory', '');
		req.assert('bom', '');
		req.assert('quantity', '');
		req.assert('uom', '');
		req.assert('min_quantity', '');
		req.assert('inventory_id', '');
		req.assert('total_cost', '');
		req.assert('description', 'Description is required');
		req.assert('update_by', 'Updated By is required');
		req.assert('update_datetime', 'Update Date and time is required');
		req.assert('is_use', 'Used data is required');
		req.assert('is_active', 'Active data is required');

		var err = req.validationErrors();
		if (err) {
			row.success = false; console.log(err);
			row.label = "Check please make sure your data fit the createria." + err;
			res.send(row); return;
			
		}

		var data = {
			bom: req.body.bom,
			quantity: req.body.quantity,
			uom: req.body.uom,
			min_quantity: req.body.min_quantity,
			inventory_id: req.body.inventory_id,
			total_cost: req.body.total_cost,
			description: req.body.description,
			update_by: req.body.update_by,
			update_datetime: tsservice.mysqlDate(),
			is_use: req.body.is_use,
			is_active: req.body.is_active,
		};

		req.getConnection(function (err, conn) {


			//--cmt-print: mysql cannot connect
			if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

			conn.beginTransaction(function (err) {

				tsservice.updateData(data, function (value) {
					//   -UPDATE-BOM
					var query = conn.query(`UPDATE ${CUS_DB}.bom SET ${value} WHERE bom_id =${req.body.bom_id} `, function (err, rows) {

						if (err) {
							row.success = false; console.log(err);
							row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
							conn.rollback(function () {
								 res.send(row); return;
							});
						}
						row.data.lastId = rows.insertId;


						bom_inventory(conn).then(function (result) {

							bom_cost(conn).then(function (result) {

								conn.commit(function (err) {
									 res.send(row); return;
								});

							}).catch(error => {
								console.log('false bom_cost');
								conn.rollback(function () {
									 res.send(row); return;
								});
							});

						}).catch(error => {
							console.log('false bom_inventory');
							conn.rollback(function () {
								 res.send(row); return;
							});
						});

					});
				});

			});

		});

		function bom_inventory(conn) {

			return new Promise(function (resolve, reject) {

				var querystr = "";
				async.forEach(req.body.bom_inventory, function (item, callback) {

					if (item.is_active == 1 && item.bom_inventory_id != '') {

						var myfireStr = `UPDATE ${CUS_DB}.bom_inventory SET bom_id = "${req.body.bom_id}", standard_inventory_detail_id = "${item.standard_inventory_detail_id}", quantity = "${item.quantity}", uom = "${item.uom}", cost = "${item.cost}", description = "${item.description}", create_by = "${req.body.create_by}", create_datetime = "${req.body.create_datetime}", update_by = "${req.body.update_by}", update_datetime ="${req.body.update_datetime}", is_active = "${req.body.is_active}", is_use = "${req.body.is_use}" WHERE bom_inventory_id = "${item.bom_inventory_id}"`;

						//   -UPDATE-BOM_INVENTORY
						var query = conn.query(myfireStr, function (err, rows) {

							if (err) {
								row.success = false; console.log(err);
								row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
								reject(1);
							}

						});

					} else if (item.is_active == 1 && item.bom_inventory_id == '') {
						var data = {
							bom_id: req.body.bom_id,
							standard_inventory_detail_id: item.standard_inventory_detail_id,
							quantity: item.quantity,
							uom: item.uom,
							cost: item.cost,
							description: item.description,
							create_by: req.body.create_by,
							update_by: req.body.create_by,
							create_datetime: tsservice.mysqlDate(),
							update_datetime: tsservice.mysqlDate(),
							is_use: '1',
							is_active: '1'
						};

						tsservice.insertData(data, function (value) {
							//   -INSERT-BOM_INVENTORY
							var query = conn.query(`INSERT INTO ${CUS_DB}.bom_inventory` + value, function (err, rows) {

								if (err) {
									row.success = false; console.log(err);
									row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
									reject(1);
								}

							});
						});

					}
					callback();

				}, function (err) {
					if (err) {
						row.success = false; console.log(err); row.label = 'Failed To Update Database'; console.log('ERROR', err)
					};

					resolve(1);

				});

			});

		}

		function bom_cost(conn) {

			return new Promise(function (resolve, reject) {

				var querystr = "";
				async.forEach(req.body.bom_cost, function (item, callback) {

					if (item.is_active == 1 && item.bom_inventory_id != '') {

						var myfireStr = `UPDATE ${CUS_DB}.bom_cost SET bom_id = "${req.body.bom_id}", standard_cost_detail_id = "${item.standard_cost_detail_id}", quantity = "${item.quantity}", uom = "${item.uom}", cost = "${item.cost}", description = "${item.description}", create_by = "${req.body.create_by}", create_datetime = "${req.body.create_datetime}", update_by = "${req.body.update_by}", update_datetime ="${req.body.update_datetime}", is_active = "${req.body.is_active}", is_use = "${req.body.is_use}" WHERE bom_cost_id = "${item.bom_cost_id}"`;

						//   -UPDATE-BOM_COST
						var query = conn.query(myfireStr, function (err, rows) {

							if (err) {
								row.success = false; console.log(err);
								row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
								reject(1);
							}

						});

					} else if (item.is_active == 1 && item.bom_cost_id == '') {
						var data = {
							bom_id: req.body.bom_id,
							standard_cost_detail_id: item.standard_cost_detail_id,
							quantity: item.quantity,
							uom: item.uom,
							cost: item.cost,
							description: item.description,
							create_by: req.body.create_by,
							update_by: req.body.create_by,
							create_datetime: tsservice.mysqlDate(),
							update_datetime: tsservice.mysqlDate(),
							is_use: '1',
							is_active: '1'
						};

						tsservice.insertData(data, function (value) {
							//   -INSERT-BOM_COST
							var query = conn.query(`INSERT INTO ${CUS_DB}.bom_cost` + value, function (err, rows) {

								if (err) {
									row.success = false; console.log(err);
									row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
									reject(1);
								}
								resolve(1);

							});
						});

					}
					callback();

				}, function (err) {
					if (err) {
						row.success = false; console.log(err); row.label = 'Failed To Update Database'; console.log('ERROR', err)
					};

					resolve(1);

				});

			});

		}

	},

	//   REST-SELECT
	bom_inventory_post: function (req, res, next) {
		const CUS_DB = req.body.company_db;


		var row = { success: true, data: { bom_inventory: [] }, label: 'Data entered successfully', error: "" };
		// validation
		req.assert('bom_id', '');

		var err = req.validationErrors();
		if (err) {
			row.success = false; console.log(err);
			row.label = "Check please make sure your data fit the createria." + err;
			res.send(row); return;
			
		}

		req.getConnection(function (err, conn) {


			//--cmt-print: mysql cannot connect
			if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

			var myfireStr = `SELECT t1.* , t3.name AS "inventory", t3.inventory_code FROM ${CUS_DB}.bom_inventory t1 INNER JOIN ${CUS_DB}.standard_inventory_detail t2 ON t1.standard_inventory_detail_id = t2.standard_inventory_detail_id INNER JOIN ${CUS_DB}.inventory t3 ON t2.inventory_id = t3.inventory_id WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.bom_id = "${req.body.bom_id}"`;

			//   -SELECT-BOM_INVENTORY   -JOIN-STANDARD-INVENTORY_DETAIL   -JOIN-INVENTORY
			var query = conn.query(myfireStr, function (err, rows) {
				if (err) {
					row.success = false; console.log(err);
					row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
					 res.send(row); return;
				}
				row.data.bom_inventory = rows;
				 res.send(row); return;

			});

		});

	},

	//   REST-SEELCT
	bom_cost_post: function (req, res, next) {
		const CUS_DB = req.body.company_db;


		var row = { success: true, data: { bom_cost: [] }, label: 'Data entered successfully', error: "" };
		// validation
		req.assert('bom_id', '');

		var err = req.validationErrors();
		if (err) {
			row.success = false; console.log(err);
			row.label = "Check please make sure your data fit the createria." + err;
			res.send(row); return;
			
		}

		req.getConnection(function (err, conn) {


			//--cmt-print: mysql cannot connect
			if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

			var myfireStr = `SELECT t1.*, t3.conversion_cost, t3.conversion_cost_code FROM ${CUS_DB}.bom_cost t1 INNER JOIN ${CUS_DB}.standard_cost_detail t2 ON t1.standard_cost_detail_id = t2.standard_cost_detail_id INNER JOIN ${CUS_DB}.conversion_cost t3 ON t2.conversion_cost_id = t3.conversion_cost_id WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.bom_id = "${req.body.bom_id}"`;

			//   -SELECT-BOM_COST   -JOIN-STANDARD-COST-DETAIL   -JOIN-CONVERSION_COST
			var query = conn.query(myfireStr, function (err, rows) {
				if (err) {
					row.success = false; console.log(err);
					row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
					 res.send(row); return;
				}
				row.data.bom_cost = rows;
				 res.send(row); return;

			});

		});

	}
}

module.exports = controller;