/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

/**
 * @type {Cypress.PluginConfig}
 */
const { configureVisualRegression } = require('cypress-visual-regression/dist/plugin');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

module.exports = (on, config) => {
    configureVisualRegression(on);
    require('@cypress/code-coverage/task')(on, config);
    on('task', {
        compareImages({ img1Base64, img2Base64 }) {
            const img1 = PNG.sync.read(Buffer.from(img1Base64, 'base64'));
            const img2 = PNG.sync.read(Buffer.from(img2Base64, 'base64'));
            const { width, height } = img1;
            const diff = new PNG({ width, height });
            const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height);
            return (numDiffPixels / (width * height)) * 100;
        }
    });
    return config
};