var Q = require('q'),
    fs = require('fs'),
    nodeFs = require('node-fs'),
    readOptions = {
        encoding: 'utf-8'
    },
    me = module.exports;

me.readFileOrReturnData = function(fileOrObject, theReadOptions) {
    var q;

    if (typeof fileOrObject === 'object') {
        q = Q.defer();
        q.resolve(fileOrObject);
        return q.promise;
    } else {
        readOptions = theReadOptions ||  readOptions;
        return Q.nfcall(fs.readFile, fileOrObject, readOptions);
    }
};

me.ensurePathExists = function(path, createMissingFolders) {
    var q = Q.defer();

    me.pathExists(path)
        .then(function onPathExistenceChecked(exists) {
            if (exists) {
                q.resolve();
            } else if (createMissingFolders) {
                nodeFs.mkdir(path, 0755, true,
                    function(error) {
                        if (error) {
                            q.reject(error);
                        } else {
                            q.resolve();
                        }
                    });
            } else {
                q.reject(new Error('path doesn\'t exist'));
            }
        });

    return q.promise;
};

me.pathExists = function(path) {
    var q = Q.defer();

    Q.nfcall(fs.stat, path)
        .then(function() {
            q.resolve(true);
        })
        .fail(function(error) {
            q.resolve(false);
        });

    return q.promise;
};

me.createFile = function(pathName, content, options) {
    var q = Q.defer(),
            write = function() {
                Q.nfcall(fs.writeFile, pathName, content)
                .then(function() {
                    q.resolve();
                })
                .catch(function(error) {
                    q.reject(error);
                });
            };
    options = options || {};

    if (!options.force){
        me.pathExists(pathName)
            .then(function(exists){
                if (!exists) { write(); }
                else { q.reject(new Error('file ' + pathName + 'already exists, use force to override')); }
            });
    } else {
        write();
    }

    return q.promise;
};

me.removeFile = function(pathName) {
    return Q.nfcall(fs.unlink, pathName);
};

function onFail(q) {
    return function(error) {
        q.reject(error);
    };
}
