var chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    should = chai.Should(),
    mochaAsPromised = require('mocha-as-promised')(),
    fsUtil = require('../fs-util'),
    Q = require('q'),
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
                'foo': {},
                'existing.x': 'existing content',
                'existing2.x': 'existing content'
            });
        });

        it('should create a file', function() {
            return fsUtil.createFile('foo/newFile.x', 'content')
                .then(function() {
                    return fsUtil.readFileOrReturnData('foo/newFile.x');
                }).should.become('content');
        });

        it('should fail if path doesn\'t exist', function() {
            return fsUtil.createFile('foo/bar/newFile.x', 'content').should.be.rejected;
        });

        it('should fail if a file with the same name exists and no override option is used', function() {
            return fsUtil.createFile('existing.x', 'content').should.be.rejected;
        });
        
        it('should fail if a file with the same name exists and override is false', function() {
            return fsUtil.createFile('existing.x', 'content', { override: false }).should.be.rejected;
        });

        it('should write if a file with the same name exists and override is used', function () {
            return fsUtil.createFile('existing.x', 'content', { override: true }).should.be.resolved;
        });

        it('should write if file doesn\'t exist and override is used', function () {
            return fsUtil.createFile('newFile.x', 'content', { override: true }).should.be.fulfilled;
        });

        it('should write multiple files with override flags', function (done) {
            var promises = Q.all([
                fsUtil.createFile('newFile1.x', 'content', { override: true }).should.be.fulfilled,
                fsUtil.createFile('newFile2.x', 'content', { override: false }).should.be.fulfilled,
                fsUtil.createFile('newFile3.x', 'content').should.be.fulfilled,
                fsUtil.createFile('existing.x', 'content', { override: false }).should.be.rejected,
                fsUtil.createFile('existing.x', 'content', { override: true }).should.be.fulfilled,
                fsUtil.createFile('existing2.x', 'content', { override: true }).should.be.fulfilled
            ]);
            return promises.should.notify(done);
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
        afterEach(function() {
            mockFs.restore();
        });

        it('should return true if paths exists', function() {
            return fsUtil.pathExists('foo/bar/test').should.become(true);
        });

        it('should return false if path doesn\'t exst', function() {
            return fsUtil.pathExists('foo/secret/bar').should.become(false);
        });
    });
});
