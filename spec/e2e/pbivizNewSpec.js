"use strict";

var fs = require('fs-extra');
var path = require('path');
var wrench = require('wrench');
var _ = require('lodash');

var FileSystem = require('../helpers/FileSystem.js');

const tempPath = FileSystem.getTempPath();
const templatePath = FileSystem.getTemplatePath();
const startPath = process.cwd();

describe("E2E - pbiviz new", function () {

    beforeEach(function () {
        FileSystem.resetTempDirectory();
        process.chdir(tempPath);
    });

    afterEach(function () {
        process.chdir(startPath);
    });

    afterAll(function () {
        process.chdir(startPath);
        FileSystem.deleteTempDirectory();
    });

    it("Should generate new visual with default template", function () {
        let visualName = 'visualname';
        let template = 'default';
        let visualPath = path.join(tempPath, visualName);

        FileSystem.runPbiviz('new', visualName);

        //check base dir
        let stat = fs.statSync(visualPath);
        expect(stat.isDirectory()).toBe(true);

        //check contents
        let expectedFiles = wrench.readdirSyncRecursive(path.join(templatePath, 'visuals', template));
        expectedFiles.concat(wrench.readdirSyncRecursive(path.join(templatePath, 'visuals', '_global')));
        expectedFiles.push('pbiviz.json');
        let visualFiles = wrench.readdirSyncRecursive(visualPath);
        let fileDiff = _.difference(expectedFiles, visualFiles);
        expect(fileDiff.length).toBe(0);

        //check pbiviz.json config file
        let visualConfig = fs.readJsonSync(path.join(visualPath, 'pbiviz.json')).visual;
        expect(visualConfig.name).toBe(visualName);
        expect(visualConfig.displayName).toBe(visualName);
        expect(visualConfig.guid).toBeDefined();
        expect(visualConfig.guid.substr(0, 7)).toBe('PBI_CV_');
    });

    it("Should generate new visual using specified template", function () {
        let visualName = 'visualname';
        let template = 'table';
        let visualPath = path.join(tempPath, visualName);

        FileSystem.runPbiviz('new', visualName, '--template table');

        //check base dir
        let stat = fs.statSync(visualPath);
        expect(stat.isDirectory()).toBe(true);

        //check contents
        let expectedFiles = wrench.readdirSyncRecursive(path.join(templatePath, 'visuals', template));
        expectedFiles.concat(wrench.readdirSyncRecursive(path.join(templatePath, 'visuals', '_global')));
        expectedFiles.push('pbiviz.json');
        let visualFiles = wrench.readdirSyncRecursive(visualPath);
        let fileDiff = _.difference(expectedFiles, visualFiles);
        expect(fileDiff.length).toBe(0);

        //check pbiviz.json config file
        let visualConfig = fs.readJsonSync(path.join(visualPath, 'pbiviz.json')).visual;
        expect(visualConfig.name).toBe(visualName);
        expect(visualConfig.displayName).toBe(visualName);
        expect(visualConfig.guid).toBeDefined();
        expect(visualConfig.guid.substr(0, 7)).toBe('PBI_CV_');
    });    

    it("Should convert multi-word visual name to camelCase", function () {
        let visualDisplayName = 'My Visual Name here';
        let visualName = 'myVisualNameHere';
        FileSystem.runPbiviz('new', visualDisplayName);

        let visualPath = path.join(tempPath, visualName);
        let stat = fs.statSync(visualPath);
        expect(stat.isDirectory()).toBe(true);

        let visualConfig = fs.readJsonSync(path.join(visualPath, 'pbiviz.json')).visual;
        expect(visualConfig.name).toBe(visualName);
        expect(visualConfig.displayName).toBe(visualDisplayName);
    });

    it("Should throw error if the visual already exists", function () {
        let visualName = 'visualname';
        var error;

        FileSystem.runPbiviz('new', visualName);

        try {
            FileSystem.runPbiviz('new', visualName);
        } catch (e) {
            error = e;
        }

        expect(error).toBeDefined();
        expect(error.status).toBe(1);
    });

    it("Should overwrite existing visual with force flag", function () {
        let visualName = 'visualname';
        let stat1, stat2, error;

        FileSystem.runPbiviz('new', visualName);
        stat1 = fs.statSync(path.join(tempPath, visualName));

        FileSystem.runPbiviz('new', visualName, '-f');
        stat2 = fs.statSync(path.join(tempPath, visualName));

        expect(error).not.toBeDefined();
        expect(stat2).toBeDefined();
        expect(stat1.mtime.getTime()).not.toBe(stat2.mtime.getTime());
    });

});