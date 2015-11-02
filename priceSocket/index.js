var logging = require('../logging');
var net = require('net');
var url = require('url');
var eventEmitter;


var isInitialized = false;
var logger = logging.createLogger('priceSocket');
var socket_query = '';
var client, price_feed_data, my_host, my_port, qoutes, timeout, mockchange;

var pullNewPricesAll = function(){
  if(!isInitialized){
    logger.error("cannot pull prices before placing the configuration/initialize()");
    return false;
  }

  socket_query = "QUOTES-"+qoutes;  


  var diff_prices = {};
  var current_price_arr = {};
  var older_price_arr = {};  

  client = net.connect({port: my_port, host: my_host},
  function(){      
      logger.info('connected to prices ip/port: '+my_host+':'+my_port);      
      requestPrices();
  });


  client.on('data', function(data){    
    if(data != "end\r\n" && data != ''){
        price_feed_data += data; 
        logger.debug("price data recieved="+price_feed_data);  
    } 
});

client.on('error', function(e){
    logger.error('Error on reading from port...'+e);
    console.log('Error on reading from port...'+e);
});

client.on('end', function(){
//  
    eventEmitter.emit('printPrices', price_feed_data)    
    price_feed_data = '';
    logger.debug('socket ended...');
});

}

var requestPrices = function sendSocketRequest(){
    //console.log('requesting update on price feeds');
    logger.info('requesting update on price feeds');
    client.write("W"+socket_query+"\nQUIT\n");
    client.end();
    logger.debug("Command sent "+"W"+socket_query+"\nQUIT\n");
    setTimeout( pullNewPricesAll, 3000); //call request prices each 15 seconds
}


var initializeObj = function(config, eventObj){
   if(isInitialized){
     logger.info("pricesocket object already isInitialized...");
     return;
   }

   if(!config || !config.pricesocket){
      logger.error('invalid socket configuration');
      return;
   }

   socket_config = config.pricesocket;

   my_host       = socket_config.host;
   my_port       = socket_config.port;
   timeout       = socket_config.timeout;
   qoutes        = socket_config.qoutes
   mockchange    = true; //config.isDevEnv();

   eventEmitter  = eventObj;  
   isInitialized = true;   
}



module.exports.initialize = initializeObj;
module.exports.pullPrices = function(){
  pullNewPricesAll();
};