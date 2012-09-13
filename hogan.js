'use strict';
var fs = require('fs'),
    path = require('path'),
    hogan = require('hogan.js'),
    templateCache = {},
    partials = {},
    layout;

function normalisePath(name, extension){
    var currentExtension = path.extname(name);
    if(!currentExtension && currentExtension !== '.' + extension){
        name += '.' + extension;
    }
    return name;
}

function compileTemplate(name, options, fn){
    var fullPath = normalisePath(name, options.settings['view engine']),
        tmpl = templateCache[fullPath],
        err, result;

    if(!tmpl || !options.cache){
        fs.readFile(fullPath, 'utf8', function(err, str){
            if (err) return fn(err);
            try {
                tmpl = templateCache[fullPath] = hogan.compile(str, options);
            } catch (e) {
                err = e;
            }
            fn(err, tmpl);
        });
    }else{
        fn(err, tmpl);
    }
}

function renderTemplate(name, options, fn){
    var locals = options._locals();

    compileTemplate(name, options, function(err, tmpl){
        if (err) return fn(err);
        var result;
        try {
            result = tmpl.render(options, partials);
        } catch (e) {
            err = e;
        }

        if(layout && options.layout !== false && options.settings['use layout'] !== false){
            options['yield'] = result;
            result = layout.render(options, partials);
        }

        fn(err, result);
    });
}

function cachePartials(base, ext){
    var partialsDir = path.join(base, 'partials'),
        files = fs.readdirSync(partialsDir);

		console.log(files);

    files.forEach(function(file){
        var str = fs.readFileSync(path.join(partialsDir, file), 'utf8');
        
        partials[path.basename(file, '.' + ext)] = hogan.compile(str);
    });
}

function cacheLayout(base, ext){
    var layoutPath = path.join(base, 'layout.' + ext),
        str;

    if(path.existsSync(layoutPath)){
        str = fs.readFileSync(layoutPath, 'utf8');
        layout = hogan.compile(str);
    }
}

module.exports = renderTemplate;
module.exports.configure = function(app){
    var viewDir = app.set('views'),
        extension = app.set('view engine');

    cachePartials(viewDir, extension);
    cacheLayout(viewDir, extension);
};
