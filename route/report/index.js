const express = require('express')
const router = express.Router()
const uuidv1 = require('uuid/v1');
const RenderPDF = require('chrome-headless-render-pdf');
let reportParseList = {
 
}

let generateReport = (reportData, callback) => {
  // index page 
  let tempId = "ts" + uuidv1()
  reportParseList[tempId] = reportData
  RenderPDF.generateSinglePdf(`http://localhost:50000/api/report/generate/` + tempId, `public/reports/${tempId}.pdf`, { chromeBinary: 'C:\\Users\\HP\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe', paperWidth: 11.69, paperHeight: 8.27 }, )
    .then((data) => {
      delete reportParseList[tempId]
      callback(`${tempId}.pdf`)
    });

}

router.get('/generate/:id', function (req, res) {
  
  if (reportParseList[req.params.id].template) {
    res.render(`report/${reportParseList[req.params.id].template}`, { posts: reportParseList[req.params.id].data });
  }
  
});

router.get('/sample', function (req, res) {
  
  res.render(`report/sample`);

});

router.get('/printsample', function (req, res) {
  
  RenderPDF.generateSinglePdf(`http://localhost:50000/api/report/sample`, `public/reports/sample${uuidv1()}.pdf`, { chromeBinary: 'C:\\Users\\HP\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe', paperWidth: 11.69, paperHeight: 8.27 }, )
  .then((data) => {
    console.log(data)
  });

});

router.post("", function (req, res, next) {

  if(req.body.report_data.report_id){

    // Report Data Format
    // report_data: {
    //   template: this.selectedReportTemplate,
    //   data: this.data, 
    //   report_id: this.report_id
    // }

    const reportData = require(`./reportFunctionWithId_${req.body.report_data.report_id}`)
    reportData.generateReport(req, (back, errorMsg)=>{
      if(back){
        generateReport(back, (fileName) => {
          res.send({ 
            success: true,
            data: fileName
          });
        })
      }else{
        res.send({ 
          success: false,
          data: errorMsg
        });
      }
    })

  }

})
var fs = require('fs');
var path = require('path');
var key = "key.pem";

router.get('/sign/:id', function (req, res) {
  var crypto = require('crypto');
  var toSign = req.params.id;

  fs.readFile(path.join(__dirname, '\\' + key), 'utf-8', function (err, privateKey) {
    var sign = crypto.createSign('SHA1');

    sign.update(toSign);
    var signature = sign.sign({ key: privateKey/*, passphrase: pass */ }, 'base64');

    res.set('Content-Type', 'text/plain');
    res.send(signature);
  });
});

router.post('/sign', function (req, res) {
  var fs = require('fs');
  var key = "override.crt";
  fs.readFile(path.join(__dirname, '\\' + key), function (err, cert) {
    res.send(cert)
  })
})


module.exports = router