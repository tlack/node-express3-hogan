var controllers = {
	index: require('./controllers/index')
}

exports.boot = function(app) {
	app.get('/', controllers.index);
}

