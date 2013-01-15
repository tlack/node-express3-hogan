
/**
 * Module dependencies.
 */

var config = require('./config');
var express = require('express');
var http = require('http');
var path = require('path');
var hogan = require('./hogan');
var routes = require('./routes');
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || config.port);
	app.engine('hogan', hogan);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hogan');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

hogan.configure(app);
routes.boot(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
