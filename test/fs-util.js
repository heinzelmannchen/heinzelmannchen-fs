var chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    should = chai.Should(),
    mochaAsPromised = require('mocha-as-promised')(),
    fsUtil = require('../fs-util'),
    mockFs = require('mock-fs');

describe('lib/fs-util', function() {
    describe('#readFileOrReturnData', function() {
        beforeEach(function() {
            mockFs({
                'foo': {
                    'bar.tpl': 'hello Edi',
                    'no.one': {
                        mode: '000'
                    }
                }
            });
        });

        it('should read "hello Edi"', function() {
            return fsUtil.readFileOrReturnData('foo/bar.tpl').should.become('hello Edi');
        });

        it('should throw an error if file doesn\'t exist', function() {
            return fsUtil.readFileOrReturnData('not/existing.tpl').should.be.rejected;
        });

        it('should fail if no permission', function() {
            return fsUtil.readFileOrReturnData('foo/no.one').should.be.rejected;
        });

        it('should return the object if not a file and typeof object', function() {
            return fsUtil.readFileOrReturnData({
                foo: 'bar'
            }).should.eventually.have.property('foo');
        });
    });

    describe('#createFile', function() {
        beforeEach(function() {
            mockFs({
                'foo': {}
            });
        });

        it('should create a file', function() {
            return fsUtil.createFile('foo/newFile.x', 'content')
                .then(function() {
                    return fsUtil.readFileOrReturnData('foo/newFile.x');
                }).should.become('content');
        });

        it('should file if path doesn\'t exist', function() {
            return fsUtil.createFile('foo/bar/newFile.x', 'content').should.be.rejected;
        });
    });
    describe('#unlink', function() {
        beforeEach(function() {
            mockFs({
                'foo/bar/test/file.x': {}
            });
        });
        it('should remove the file', function() {
            return fsUtil.removeFile('foo/bar/test/file.x')
                .then(function() {
                    return fsUtil.readFileOrReturnData('foo/newFile.x');
                }).should.be.rejected;
        });
    });

    describe('#pathExists', function() {
        beforeEach(function() {
            mockFs({
                'foo/bar/test/file.x': {}
            });
        });

        it('should return true if paths exists', function() {
            return fsUtil.pathExists('foo/bar/test').should.become(true);
        });

        it('should return false if path doesn\'t exst', function() {
            return fsUtil.pathExists('foo/secret/bar').should.become(false);
        });
    });
});
