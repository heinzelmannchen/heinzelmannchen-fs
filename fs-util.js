var Q = require('q'),
    fs = require('fs'),
    nodeFs = require('node-fs'),
    readOptions = {
        encoding: 'utf-8'
    },
    me = module.exports;

me.readFileOrReturnData = function(fileOrObject, theReadOptions) {
    var q = Q.defer();
    readOptions = theReadOptions ||  readOptions;

    if (typeof fileOrObject === 'object') {
        q.resolve(fileOrObject);
    }

    Q.nfcall(fs.readFile, fileOrObject, readOptions)
        .then(function(result) {
            q.resolve(result);
        })
        .fail(function(error) {
            q.reject(error);
        });

    return q.promise;
};

me.enurePathExists = function(path, createMissingFolders) {
    var q = Q.defer();

    me.pathExists(path)
        .then(function onPathExistenceChecked(exists) {
            if (exists) {
                q.resolve();
            } else if (createMissingFolders) {
                Q.fcall(nodeFs.mkdir, path, 0755, true)
                    .then(function() {
                        q.resolve();
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
        .catch(function(error) {
            q.resolve(false);
        });

    return q.promise;
};

me.createFile = function(pathName, content) {
    var q = Q.defer();

    Q.nfcall(fs.writeFile, pathName, content)
        .then(function() {
            q.resolve();
        })
        .catch(function(error) {
            q.reject(error);
        });

    return q.promise;
};
