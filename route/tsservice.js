
var async = require('async');
var moment = require('moment');

module.exports = {
    insertData:function(data, back) { 
        var field = "(";
        var value = "(";

        async.forEachOf(data,function (item, key ,callback) {
            
            if(field != "("){
                field += ',';
                value += ',';
            }

            // key = 'aa';

            field += key;
            value += Number(item)?item: "'"+item+"'";
            
            callback();

        }, function (err) {

            field += ')';
            value += ')';

            return back(field + ' VALUES' + value); 

        });
    },
    insertDataValue:function(data, back) { 
        var value = "(";

        async.forEachOf(data,function (item, key ,callback) {
            
            if(value != "("){
                value += ',';
            }

            if(item){
                if(Number(item)){
                    value += item
                }else if(item.type == "query"){
                    value += " ("+item.value+") "
                }else{
                    value += "'"+item+"'"
                }
            }else{
                value += "'"+item+"'"
            }
            
            callback();

        }, function (err) {

            value += ')';

            return back(value); 

        });
    },
    updateData:function(data, back) {
        
        var value = "";
        console.log(data);
        async.forEachOf(data,function (item, key ,callback) {
            
            if(value != ""){
                value += ',';
            }
            
            value += ""+key+"=";

            if(item){                
                if(Number(item)){
                    value += item
                }else if(item.type == "query"){
                    value += " ("+item.value+") "
                }else{
                    value += "'"+item+"'"
                }
            }else{
                value += "'"+item+"'"
            }            
            
            callback();

        }, function (err) {
            // console.log(value);
            return back(value);

        });
    },
    mysqlDate: function(date){
        date = date || new Date();
        return moment(new Date(date)).format("YYYY-MM-DD HH:mm:ss");
    }
}
