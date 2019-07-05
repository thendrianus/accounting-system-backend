var tsservice = require('./../../tsservice');
var fs = require('fs');

const controller = {
  //   REST-SELECT
  inventorySearch_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { inventory: [] }, label: 'Data selected successfully', error: "" };
    // validation
    req.assert('inventory_category_id', 'Inventory Category Id is required');
    req.assert('is_use', 'Used data is required');
    req.assert('is_action', 'Used data is required');

    var err = req.validationErrors();
    if (err) {
      row.success = errors;
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
       res.send(row); return;
      
    }

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var strwhere = "";
      if (req.body.is_use == '1') {
        strwhere += " t1.is_use = 1 AND ";
      }

      if (req.body.is_action == '1') {
        //issale
        strwhere += " t1.issale = 1 AND ";
      } else if (req.body.is_action == '2') {
        //ispurchase
        strwhere += " t1.ispurchase = 1 AND ";
      } else if (req.body.is_action == '3') {
        //isfix_asset
        strwhere += " t1.isfix_asset = 1 AND ";
      }

      var myfireStr = `
        SELECT 
          t1.*, 
          t1.selling_price as "price", 
          t2.brand, 
          t4.inventory_group, 
          "true" as auto_inventory_code, 
          "" as oldimage, 
          "true" as if_auto_inventory_code, 
          t1.name as "inventory", 
          CONVERT(t1.inventory_id, char(50)) AS "value", 
          CONCAT(t1.inventory_code, " - ", t1.name) AS "label", 
          t5.rate, 
          t1.stock AS "stock" 
        FROM ${CUS_DB}.inventory t1 
          INNER JOIN ${CUS_DB}.brand t2 ON t1.brand_id = t2.brand_id 
          INNER JOIN ${CUS_DB}.inventory_detail_category t3 ON t1.inventory_detail_category_id = t3.inventory_detail_category_id 
          INNER JOIN ${CUS_DB}.inventory_group t4 ON t1.inventory_group_id = t4.inventory_group_id 
          INNER JOIN ${CUS_DB}.currencies t5 ON t1.currency_id = t5.currency_id 
        WHERE 
          t1.inventory_category_id = "${req.body.inventory_category_id}" AND 
          ${strwhere} 
          t1.is_active = 1 
        ORDER BY 
          t1.create_datetime 
        DESC`;

      console.log(myfireStr)
      //   -SELECT-INVENTORY   -JOIN-BRAND   -JOIN-INVENTORY_DETAIL_CATEGORY   -JOIN-INVENTORY_GROUP
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.inventory = rows;
         res.send(row); return;

      });

    });

  },

  //   REST-INSERT
  inventory_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;

    var row = { success: true, data: { lastId: '', inventory_code: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('name', 'Name is required');
    req.assert('description', 'Description is required');
    req.assert('brand_id', '');
    req.assert('inventory_group_id', '');
    req.assert('currency_id', '');
    req.assert('buying_price', '');
    req.assert('selling_price', '');
    req.assert('selling_dsc_amount', '');
    req.assert('selling_dsc_persent', '');
    req.assert('inventory_detail_category_id', '');
    req.assert('inventory_category_id', '');
    req.assert('uom1', '');
    req.assert('label', '');
    req.assert('min_stock', '');
    req.assert('max_stock', '');
    req.assert('purchase_tax_id', '');
    req.assert('sell_tax_id', '');
    req.assert('issale', '');
    req.assert('ispurchase', '');
    req.assert('isfix_asset', '');
    req.assert('purchase_account_id', '');
    req.assert('sell_account_id', '');
    req.assert('hpp_account_id', '');
    req.assert('is_use', 'Used data is required');
    req.assert('is_active', 'Active data is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
       res.send(row); return;
      
    }

    var inventory_code = req.body.inventory_code.trim();
    if (inventory_code == "") {
      //generate code

      var codeData = {
        special_code_id: "INVENTORY",
        table: "inventory",
        column_id: "inventory_id",
        column_code: "inventory_code",
      }

      if (req.body.inventory_category_id == '1') {
        codeData.special_code_id = "INVENTORY";
      } else if (req.body.inventory_category_id == '2') {
        codeData.special_code_id = "FIXASSET";
      } else {
        row.success = false; console.log(err);
        row.error = "3";
        row.label = "Category not inventory or asset";
         res.send(row); return;
        
      }

      req.getConnection(function (err, conn) {


        //--cmt-print: mysql cannot connect
        if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

        var myfireStr = `SELECT concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), (SELECT count(t2.${codeData.column_id}) + 1 + t1.start_number FROM ${CUS_DB}.${codeData.table} t2 WHERE t2.${codeData.column_code} LIKE concat(t1.special_code, DATE_FORMAT(now(), t1.date_format), "%"))) AS "code" FROM ${CUS_DB}.special_code t1 WHERE t1.is_use = 1 AND t1.is_active = 1 AND t1.special_code_id = "${codeData.special_code_id}" LIMIT 1`;

        //   -SELECT-SPECIAL-CODE   -SELECT-INVENTORY
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }

          if (rows[0]['code']) {

            row.data.inventory_code = rows[0]['code'];
            inventory_code = rows[0]['code'];
            continues(req, inventory_code, fs);

          } else {
            row.success = false; console.log(err);
            row.label = 'Failed to select important code. Please contact our IT support';
             res.send(row); return;
          }

        });

      });

    } else {

      //check does inventory code exist
      req.getConnection(function (err, conn) {


        //--cmt-print: mysql cannot connect
        if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

        var myfireStr = `SELECT * FROM ${CUS_DB}.inventory WHERE inventory_code = "${inventory_code}"`;

        //   -SELECT-INVENTORY
        var query = conn.query(myfireStr, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }

          if (rows.length > 0) {
            row.success = false; console.log(err);
            row.error = "2";
            row.label = "Inventory Code Already Exist";
             res.send(row); return;
            
          } else {
            continues(req, inventory_code, fs);
          }

        });

      });

    }

    function continues(req, inventory_code, fs) {
      const CUS_DB = req.body.company_db;
      
      if (req.body.inventory_image && req.body.inventory_image !== 'no-photo.png') {
        fs.readFile('uploads/' + req.body.inventory_image, function read(err, data) {

          if (err) {
            // console.error(err)
            req.body.inventory_image = "";

          } else {
            fs.move('uploads/' + req.body.inventory_image, 'public/assets/inventory/' + req.body.inventory_image, err => {
              if (err) return console.error(err)
              console.log('Picture Upload success!');
            });
          }

        });
      }


      var data = {
        inventory_code: inventory_code,
        name: req.body.name,
        inventory_image: req.body.inventory_image ? req.body.inventory_image : 'no-photo.png',
        description: req.body.description,
        brand_id: req.body.brand_id,
        inventory_group_id: req.body.inventory_group_id,
        currency_id: req.body.currency_id,
        buying_price: req.body.buying_price,
        selling_price: req.body.selling_price,
        selling_price2: req.body.selling_price,
        selling_price3: req.body.selling_price,
        inventory_hpp: 0,
        selling_dsc_amount: req.body.selling_dsc_amount,
        selling_dsc_persent: req.body.selling_dsc_persent,
        selling_dsc_amount2: req.body.selling_dsc_amount,
        selling_dsc_amount3: req.body.selling_dsc_amount,
        inventory_detail_category_id: req.body.inventory_detail_category_id,
        inventory_category_id: req.body.inventory_category_id,
        uom1: req.body.uom1,
        uom2: '',
        uom3: '',
        uom2equal: 1,
        uom3equal: 1,
        label: req.body.label,
        min_stock: req.body.min_stock,
        max_stock: req.body.max_stock,
        purchase_tax_id: req.body.purchase_tax_id,
        sell_tax_id: req.body.sell_tax_id,
        issale: req.body.issale,
        ispurchase: req.body.ispurchase,
        isfix_asset: req.body.isfix_asset,
        purchase_account_id: req.body.purchase_account_id,
        sell_account_id: req.body.sell_account_id,
        hpp_account_id: req.body.hpp_account_id,
        create_by: req.body.create_by,
        update_by: req.body.update_by,
        create_datetime: tsservice.mysqlDate(),
        update_datetime: tsservice.mysqlDate(),
        is_use: '1',
        is_active: '1',
      };

      if (req.body.uom2) {
        data.uom2 = req.body.uom2;
      }
      if (req.body.uom3) {
        data.uom3 = req.body.uom3;
      }

      if (req.body.uom2equal) {
        data.uom2equal = req.body.uom2equal;
      }
      if (req.body.uom3equal) {
        data.uom3equal = req.body.uom3equal;
      }

      req.getConnection(function (err, conn) {


        //--cmt-print: mysql cannot connect
        if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

        tsservice.insertData(data, function (value) {
          //   -INSERT-INVENTORY
          var query = conn.query(`INSERT INTO ${CUS_DB}.inventory` + value, function (err, rows) {

            if (err) {
              row.success = false; console.log(err);
              row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
               res.send(row); return;
            }
            row.data.lastId = rows.insertId;
             res.send(row); return;

          });
        });

      });

    }

  },

  //   REST-UPDATE
  inventory_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('inventory_id', 'Inventory Id is required');
    req.assert('inventory_code', 'Inventory Code is required');
    req.assert('name', 'Name is required');
    req.assert('description', 'Description is required');
    req.assert('brand_id', '');
    req.assert('inventory_group_id', '');
    req.assert('currency_id', '');
    req.assert('buying_price', '');
    req.assert('selling_price', '');
    req.assert('selling_dsc_persent', '');
    req.assert('selling_dsc_amount', '');
    req.assert('inventory_detail_category_id', '');
    req.assert('inventory_category_id', '');
    req.assert('uom1', '');
    req.assert('label', '');
    req.assert('min_stock', '');
    req.assert('max_stock', '');
    req.assert('purchase_tax_id', '');
    req.assert('sell_tax_id', '');
    req.assert('issale', '');
    req.assert('ispurchase', '');
    req.assert('isfix_asset', '');
    req.assert('purchase_account_id', '');
    req.assert('sell_account_id', '');
    req.assert('hpp_account_id', '');
    req.assert('is_use', 'Used data is required');
    req.assert('is_active', 'Active data is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    if (req.body.inventory_image && req.body.inventory_image !== 'no-photo.png') {
      fs.readFile('public/assets/inventory/' + req.body.inventory_image, function read(err, data) {

        if (err) {
          // console.error(err)
          fs.move('uploads/' + req.body.inventory_image, 'public/assets/inventory/' + req.body.inventory_image, err => {
            if (err) return console.error(err)
            console.log('Picture Upload success!');
          });
        }
      });
    }

    var data = {
      inventory_code: req.body.inventory_code,
      name: req.body.name,
      inventory_image: req.body.inventory_image ? req.body.inventory_image : 'no-photo.png',
      description: req.body.description,
      brand_id: req.body.brand_id,
      inventory_group_id: req.body.inventory_group_id,
      currency_id: req.body.currency_id,
      buying_price: req.body.buying_price,
      selling_price: req.body.selling_price,
      selling_price2: req.body.selling_price,
      selling_price3: req.body.selling_price,
      // inventory_hpp: req.body.selling_dsc_amount,
      selling_dsc_amount: req.body.selling_dsc_amount,
      selling_dsc_amount2: req.body.selling_dsc_amount,
      selling_dsc_amount3: req.body.selling_dsc_amount,
      selling_dsc_persent: req.body.selling_dsc_persent,
      inventory_detail_category_id: req.body.inventory_detail_category_id,
      inventory_category_id: req.body.inventory_category_id,
      uom1: req.body.uom1,
      uom2: '',
      uom3: '',
      uom2equal: 1,
      uom3equal: 1,
      label: req.body.label,
      min_stock: req.body.min_stock,
      max_stock: req.body.max_stock,
      purchase_tax_id: req.body.purchase_tax_id,
      sell_tax_id: req.body.sell_tax_id,
      issale: req.body.issale,
      ispurchase: req.body.ispurchase,
      isfix_asset: req.body.isfix_asset,
      purchase_account_id: req.body.purchase_account_id,
      sell_account_id: req.body.sell_account_id,
      hpp_account_id: req.body.hpp_account_id,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(),
      is_use: req.body.is_use,
      is_active: req.body.is_active,
    };

    if (req.body.uom2) {
      data.uom2 = req.body.uom2;
    }
    if (req.body.uom3) {
      data.uom3 = req.body.uom3;
    }

    if (req.body.uom2equal) {
      data.uom2equal = req.body.uom2equal;
    }
    if (req.body.uom3equal) {
      data.uom3equal = req.body.uom3equal;
    }

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-INVENTORY
        var query = conn.query(`UPDATE ${CUS_DB}.inventory SET ${value} WHERE inventory_id =${req.body.inventory_id} `, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.lastId = rows.insertId;
           res.send(row); return;

        });
      });

    });

  },

  //   REST-SELECT
  inventory_prices_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { inventoryPrices: [] }, label: 'Berhasil' };

    req.assert('inventory_id', 'Inventory is required');
    req.assert('is_use', 'Inventory is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    req.getConnection(function (err, conn) {


      var queryadd = "";

      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      if (req.body.is_use != 0) {
        queryadd = 'AND is_use =' + req.body.is_use;
      }

      var myfireStr = `SELECT * FROM ${CUS_DB}.inventory_price WHERE inventory_id = "${req.body.inventory_id}" AND is_active = 1` + queryadd;

      //SEELCT-INVENTORY_PRICE
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.inventoryPrices = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  inventory_price_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('inventory_id', 'Name is required');
    req.assert('price_name', '');
    req.assert('uom', '');
    req.assert('quantity', '');
    req.assert('price', '');
    req.assert('discount_amount', '');
    req.assert('discount_persent', '');
    req.assert('description', '');
    req.assert('create_by', 'Created by is required');
    req.assert('is_use', 'Used data is required');
    req.assert('is_active', 'Active data is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
       res.send(row); return;
      
    }

    var data = {
      inventory_id: req.body.inventory_id,
      price_name: req.body.price_name,
      uom: req.body.uom,
      quantity: req.body.quantity,
      price: req.body.price,
      discount_amount: req.body.discount_amount,
      discount_persent: req.body.discount_persent,
      description: req.body.description,
      create_by: req.body.create_by,
      update_by: req.body.update_by,
      create_datetime: tsservice.mysqlDate(),
      update_datetime: tsservice.mysqlDate(),
      is_active: '1',
      is_use: '1',
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.insertData(data, function (value) {
        //   -INSERT-INVENTORY_PRICE
        var query = conn.query(`INSERT INTO ${CUS_DB}.inventory_price` + value, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }
          row.data.lastId = rows.insertId;
           res.send(row); return;

        });

      });

    });

  },

  //   REST-UPDATE
  inventory_price_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('inventory_price_id', 'Name is required');
    req.assert('inventory_id', 'Name is required');
    req.assert('price_name', '');
    req.assert('uom', '');
    req.assert('quantity', '');
    req.assert('price', '');
    req.assert('discount_amount', '');
    req.assert('discount_persent', '');
    req.assert('description', '');
    req.assert('update_by', 'Updated By is required');
    req.assert('is_use', 'Used data is required');
    req.assert('is_active', 'Active data is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }


    var data = {
      inventory_id: req.body.inventory_id,
      price_name: req.body.price_name,
      uom: req.body.uom,
      quantity: req.body.quantity,
      price: req.body.price,
      discount_amount: req.body.discount_amount,
      discount_persent: req.body.discount_persent,
      description: req.body.description,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(),
      is_use: req.body.is_use,
      is_active: req.body.is_active,
    };

    req.getConnection(function (err, conn) {


      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      tsservice.updateData(data, function (value) {
        //   -UPDATE-INVENTORY_PRICE
        var query = conn.query(`UPDATE ${CUS_DB}.inventory_price SET ${value} WHERE inventory_price_id =${req.body.inventory_price_id} `, function (err, rows) {

          if (err) {
            row.success = false; console.log(err);
            row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
             res.send(row); return;
          }

           res.send(row); return;

        });
      });

    });

  },

  //   REST-SELECT
  get_inventory_supplier_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { inventorySuppliers: [] }, label: 'Berhasil' };

    req.assert('inventory_id', 'Inventory is required');
    req.assert('is_use', 'Inventory is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    req.getConnection(function (err, conn) {


      var queryadd = "";

      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      if (req.body.is_use != 0) {
        queryadd = 'AND t1.is_use =' + req.body.is_use;
      }

      var myfireStr = `SELECT t1.*, t2.name as "businesspartner" FROM ${CUS_DB}.inventory_supplier t1 INNER JOIN ${CUS_DB}.businesspartner t2 ON t1.businesspartner_id = t2.businesspartner_id WHERE t1.inventory_id = "${req.body.inventory_id}" AND t1.is_active = 1` + queryadd;

      //   -SELECT-INVENTORY_SUPPLIER   -JOIN-BUSINESSPARTNER
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }
        row.data.inventorySuppliers = rows;
         res.send(row); return;
      });

    });

  },

  //   REST-INSERT
  inventory_supplier_post: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data entered successfully', error: "" };
    // validation
    req.assert('inventory_id', 'Name is required');
    req.assert('businesspartner_id', '');
    req.assert('description', '');
    req.assert('create_by', 'Created by is required');
    req.assert('is_use', 'Used data is required');
    req.assert('is_active', 'Active data is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }

    var data = {
      inventory_id: req.body.inventory_id,
      businesspartner_id: req.body.businesspartner_id,
      description: req.body.description,
      create_by: req.body.create_by,
      update_by: req.body.update_by,
      create_datetime: tsservice.mysqlDate(),
      update_datetime: tsservice.mysqlDate(),
      is_active: '1',
      is_use: '1',
    };

    req.getConnection(function (err, conn) {

      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.inventory_supplier WHERE inventory_id = "${req.body.inventory_id}" AND businesspartner_id = '${req.body.businesspartner_id}' AND is_active = 1`;

      //   -SELECT-INVENTORY_SUPPLIER
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
        }

        if (rows[0]) {
          row.success = false; console.log(err);
          row.label = 'Duplicate Supplier';
           res.send(row); return;
        } else {
          tsservice.insertData(data, function (value) {
            //   -INSERT-INVENTORY_SUPPLIER
            var query = conn.query(`INSERT INTO ${CUS_DB}.inventory_supplier` + value, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to insert database. make sure your Database is running or contact our IT support';
                 res.send(row); return;
              }
              row.data.lastId = rows.insertId;
               res.send(row); return;

            });
          });
        }
      });

    });

  },

  //   REST-UPDATE
  inventory_supplier_put: function (req, res, next) {
    const CUS_DB = req.body.company_db;


    var row = { success: true, data: { lastId: '' }, label: 'Data updated successfully' };
    // validation
    req.assert('inventory_supplier_id', 'Name is required');
    req.assert('inventory_id', 'Name is required');
    req.assert('businesspartner_id', '');
    req.assert('description', '');
    req.assert('update_by', 'Updated By is required');
    req.assert('is_use', 'Used data is required');
    req.assert('is_active', 'Active data is required');

    var err = req.validationErrors();
    if (err) {
      row.success = false; console.log(err);
      row.label = "Check please make sure your data fit the createria." + err;
      res.send(row); return;
      
    }


    var data = {
      inventory_id: req.body.inventory_id,
      businesspartner_id: req.body.businesspartner_id,
      description: req.body.description,
      update_by: req.body.update_by,
      update_datetime: tsservice.mysqlDate(),
      is_use: req.body.is_use,
      is_active: req.body.is_active,
    };

    req.getConnection(function (err, conn) {

      //--cmt-print: mysql cannot connect
      if (err) { row.success = false; console.log(err); row.label = 'Cannot connect to database. make sure your Database is running or contact our IT support';  res.send(row); return; }

      var myfireStr = `SELECT * FROM ${CUS_DB}.inventory_supplier WHERE inventory_id = "${req.body.inventory_id}" AND businesspartner_id = '${req.body.businesspartner_id}' AND is_active = 1 AND inventory_supplier_id <> ${req.body.inventory_supplier_id}`;

      //   -SELECT-INVENTORY_SUPPLIER
      var query = conn.query(myfireStr, function (err, rows) {
        if (err) {
          row.success = false; console.log(err);
          row.label = 'Failed to select database. make sure your Database is running or contact our IT support';
           res.send(row); return;
          return
        }

        if (rows.length > 0) {
          row.success = false; console.log(err);
          row.label = 'Duplicate Supplier';
           res.send(row); return;
        } else {
          tsservice.updateData(data, function (value) {
            //   -UPDATE-INVENTORY_SUPPLIER
            var query = conn.query(`UPDATE ${CUS_DB}.inventory_supplier SET ${value} WHERE inventory_supplier_id =${req.body.inventory_supplier_id} `, function (err, rows) {

              if (err) {
                row.success = false; console.log(err);
                row.label = 'Failed to update database. make sure your Database is running or contact our IT support';
                 res.send(row); return;
              }

               res.send(row); return;

            });
          });
        }
      });

    });

  }
}

module.exports = controller;