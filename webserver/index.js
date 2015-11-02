
var logging = require('../logging');

var express = require('express');
var app = express();

app.set('views',__dirname + '/../views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


var eventEmitter;
var current_price_arr = new Array();
var updated_price_arr = new Array();

var initialized = false;
var logger = logging.createLogger('webserver');


function start(){
  if(!this.initialized){
    logger.error("Cannot start web server before initialize/configuration");
    return;
  }
  var web_port = this.port;
  var web_ip = this.ip;
app.get('/', function(req, res){
    res.locals.prices = current_price_arr;
    res.render('index.ejs', {title:'Test prices feed on express.js', prices: current_price_arr});
    res.end();
});

app.get('/update.json', function(req, res){
   res.writeHead(200, {'Content-Type': 'text/event-stream', 'Cache-Control':'no-Cache'});
   logger.debug("Recieved update request, should return: "+JSON.stringify(updated_price_arr));
   res.end('data: '+JSON.stringify(updated_price_arr)+'\n\n');
});

app.use(express.static(__dirname + '/../public'));
var server = app.listen(web_port, web_ip, function(){
    var host = server.address().address;
    var port = server.address().port;
    
    console.log('server running on http://%s:%s', web_ip, web_port); 
    logger.info('server running on http://'+web_ip+':'+web_port);
});

this.eventEmitter.on('printPrices', function(prices_str){
   
   prices_arr = prices_str.split('\n');

   for(i=0; i< prices_arr.length; i++){     
      single_data_row = prices_arr[i].split(' ');      
      status_val = single_data_row[0];

      if( (status_val == 'up' || status_val == 'down') ){
         current_price_arr[single_data_row[1]] = {'p_status': status_val, 'price': single_data_row[2]};    
     }
   }
 
   updated_price_arr = []; //contain normal integer keys to avoid json.stringify problem
   count = 0;
   for(k in current_price_arr){    
        curr_elem = current_price_arr[k];
        updated_price_arr[count] = {"symbol":k,"p_status":curr_elem.p_status, 'price':curr_elem.price};
        count++;
   }
});

}



function mockChange(arr1){
     //mock changed prices for testing purposes
       rand_factor = Math.floor(Math.random()*11);
       if(rand_factor%3==0){
           if(rand_factor%2==0){
             arr1[k].price = parseFloat(arr1[k].price)-Math.random();
           }else{
             arr1[k].price = parseFloat(arr1[k].price)+Math.random();
           }
         arr1[k].price = arr1[k].price.toFixed(4);           
       }
       //end mocking
}


function initialize(config,eventObj){
  if(this.initialized){
    return;
  }

  if(!config || !config.webserver){
     logger.error("Invalid web server configuration");
     return;
  }

  web_config  = config.webserver;
	this.ip     = web_config.ip;
	this.port   = web_config.port;
	this.initialized = true;
  this.eventEmitter = eventObj;
}



module.exports.start = start;
module.exports.initialize = initialize;