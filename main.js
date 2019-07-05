
var express = require('express');
var express = require('express'),
  path = require('path'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  multer = require('multer'),
  apps = express(),
  expressValidator = require('express-validator');

var jwt = require('jwt-simple');
var secret = 'xxx';

if (process.versions['electron']) {

  const { app, BrowserWindow, Menu, protocol, ipcMain } = require('electron');
  const log = require('electron-log');
  const { autoUpdater } = require("electron-updater");

  let template = []
  if (process.platform === 'darwin') {
    // OS X
    const name = app.getName();
    template.unshift({
      label: name,
      submenu: [
        {
          label: 'About ' + name,
          role: 'about'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click() { app.quit(); }
        },
      ]
    })
  }

  let win;

  function sendStatusToWindow(text) {
    // log.log(text);
    win.webContents.send('message', text);
  }
  function createDefaultWindow() {
    win = new BrowserWindow({ width: 1000, height: 600 });
    // win.setFullScreen(true);
    // win.setFullScreenable(true)
    win.setMenu(null);
    // win.webContents.openDevTools();
    win.on('closed', () => {
      win = null;
    });
    win.loadURL(`file://${__dirname}/dist/index.html`);
    win.webContents.openDevTools()
    return win;
  }
  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
  })
  autoUpdater.on('update-available', (ev, info) => {
    sendStatusToWindow('Update available.');
  })
  autoUpdater.on('update-not-available', (ev, info) => {
    sendStatusToWindow('Update not available.');
  })
  autoUpdater.on('error', (ev, err) => {
    sendStatusToWindow('Error in auto-updater.');
  })
  autoUpdater.on('download-progress', (ev, progressObj) => {
    sendStatusToWindow('Download progress...');
  })
  autoUpdater.on('update-downloaded', (ev, info) => {
    sendStatusToWindow('Update downloaded; will install in 5 seconds');
  });
  app.on('ready', function () {

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    createDefaultWindow();

  });

  app.on('activate', () => {
    if (win === null) {
      createWindow()
    }
  })

  app.on('window-all-closed', () => {
    app.quit();
  });

  autoUpdater.on('update-downloaded', (ev, info) => {
    setTimeout(function () {
      autoUpdater.quitAndInstall();
    }, 5000)
  })

  app.on('ready', function () {
    autoUpdater.checkForUpdates();
  });

}

apps.set('views', './views');
apps.set('view engine', 'ejs');

apps.use(express.static(path.join(__dirname, 'public')));
apps.use(bodyParser.urlencoded({ extended: true })); //support x-www-form-urlencoded
apps.use(bodyParser.json());
apps.use(expressValidator());

var connection = require('express-myconnection'),
  mysql = require('mysql');
  dbOptions = {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: '',
    multipleStatements: true,
    debug: false //set true if you wanna see debug logger
  };

apps.use(
  cors(),
  connection(mysql, dbOptions, 'request')
);

var connection = mysql.createConnection(dbOptions);
 
connection.connect();

global.globalCompanyList = {}
 
connection.query('SELECT * FROM company', function (error, results, fields) {
  if (error) throw error;
  results.map(e=>{
    globalCompanyList[e.company_id] = e
  })
});
 
connection.end();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

var upload = multer({
  storage: storage
});

var options = {};

options.host = '127.0.0.1';

apps.get('/', function (req, res) {
  res.send('Welcome');
});

// set the view engine to ejs
apps.set('view engine', 'ejs');

var router = express.Router();

router.use(function (req, res, next) {
  console.log(req.method, req.url);

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  if (req.headers.authorization) {

    var decoded = jwt.decode(req.headers.authorization, secret);

    if (decoded) {
      
      req.body.company_db = `cus_bizystem_${decoded.company_id}`;
      req.body.company_id = decoded.company_id;
      req.body.employee_sure_name = decoded.employee_sure_name;

    } else {
      console.log('Authentification Failed')
      var row = { success: true, data: { account: [], category: [] }, label: 'Berhasil' };
      row.success = false;
      row.label = "Authentification Failed";
      res.send(row); return;

    }

  } else {
    
    if (
      req.url !== '/apps/login' && req.url !== '/authorization' && 
      req.url.substring(0,19) !== '/report/generate/ts' && 
      req.url.substring(0,14) !== '/report/sample' && 
      req.url.substring(0,19) !== '/report/printsample' && 
      req.url.substring(0,12) !== '/report/sign'
    ) {
      
      console.log('Authentification Not Supplied')
      var row = { success: true, data: { account: [], category: [] }, label: 'Berhasil' };
      row.success = false;
      row.label = "Authentification Not Supplied";
      res.send(row); return;

    }

  }

  // let currentVersion = "Beta 0.1";
  // if(req.headers.version !== currentVersion){
  //   console.log('Version do not match')
  //   var row = { success: true, data: {account: [], category: []}, label: 'Berhasil' };
  //   row.success = false;
  //   row.label = "Version do not match";
  //   res.send(row); return;
  //   
  // }

  next();

});
// var type = upload.single('avatar');

var file = router.route('/file');
file.post(upload.any(), function (req, res, next) {

  res.json(req.files.map(file => {
    //  console.log(JSON.stringify(file));
    let ext = path.extname(file.originalname);

    return {
      originalName: file.originalname,
      filename: file.filename
    }
  }));
  // req.file is the `avatar` file 
  // req.body will hold the text fields, if there were any 
});

var authorization = router.route('/authorization');
authorization.post(function (req, res, next) {

  try {

    var decoded = jwt.decode(req.headers.authorization, secret);

    req.getConnection(function (err, conn) {

      var myfireStr = `SELECT t1.*, t2.company_code, t2.company, t2.tax_number, t2.company_image, t2.register_number, t2.website, t2.ledgerfirst_month, t2.ledgerlast_month, t2.ledgeryear, t2.isledgeraudit, t2.description as 'company_description' FROM bizystem.employee_account t1 INNER JOIN bizystem.company t2 ON t1.company_id = t2.company_id WHERE t1.is_active = 1 AND t1.is_use = 1 AND t1.employee_account_id= "${decoded.employee_account_id}"`;

      //   -SELECT-COMPANY   -JOIN-BRANCH
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          var row = { login: false, setToken: false, token: 'token', lang: '', lang2: '' };
          res.send(row); return;
        }
        if (rows.length > 0) {
          delete rows[0].account_password;
          var row = { login: true, setToken: false, data: rows[0], token: 'token', lang: '', lang2: '' };
          res.send(row); return;
        } else {
          var row = { login: false, setToken: false, token: 'token', lang: '', lang2: '' };
          res.send(row); return;
        }

      });

      var myfireStr = `SELECT * FROM cus_bizystem_3.account`;

      //   -SELECT-COMPANY   -JOIN-BRANCH
      var query = conn.query(myfireStr, function (err, rows) {

        if (err) {
          row.success = false; console.log(err);
          var row = { login: false, setToken: false, token: 'token', lang: '', lang2: '' };
          res.send(row); return;
        }
        if (rows.length > 0) {
          rows.forEach((e, i)=>{
            console.log(`(${i+1}, 'BAJ${i+1}', '${e.account_code}', 2, 1, '${new Date()}', 'beginning balance Temporary ${e.account}', 1, 1, '${new Date()}', '${new Date()}', 1, 1),`)  
          })
        }

      });

    });

  } catch (err) {
    var row = { login: false, setToken: false, token: 'token', lang: '', lang2: '' };
    res.send(row); return;
  }

})

const routes = require('./route')

router.use('/accounting', routes.accounting)
router.use('/apps', routes.apps)
router.use('/company', routes.company)
router.use('/hrd', routes.hrd)
router.use('/inventory', routes.inventory)
router.use('/manufacture', routes.manufacture)
router.use('/transaction', routes.transaction)
router.use('/website', routes.website)
router.use('/report', routes.report)

//now we need to appsly our router here
apps.use('/api', router);

//start Server
var server = apps.listen(50000, function () {

  console.log("Listening to port %s", server.address().port);

});
