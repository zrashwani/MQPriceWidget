var config = require('./config/index.js');
var current_conf = config.getCurrent();


var logging = require('./logging');
logging.initialize(current_conf);

var events = require('events');
var eventEmitter = new events.EventEmitter();


var webserver = require('./webserver');
webserver.initialize(current_conf, eventEmitter);

var priceSocket = require('./priceSocket');
priceSocket.initialize(current_conf, eventEmitter);

priceSocket.pullPrices();
webserver.start();