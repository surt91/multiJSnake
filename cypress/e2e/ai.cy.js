async function ensureChange(name1, name2) {
    // https://gambini.me/en/blog/comparing-website-screenshots-with-cypress-and-pixelmatch
    // PNGJS lets me load the picture from disk
    const PNG = require('pngjs').PNG;
    // pixelmatch library will handle comparison
    const pixelmatch = require('pixelmatch');

    cy.readFile(
        './cypress/snapshots/actual/ai.cy.js/' + name1 + '.png', 'base64'
    ).then(first =>
        cy.readFile(
            './cypress/snapshots/actual/ai.cy.js/' + name2 + '.png', 'base64'
        ).then(second => {
            // load both pictures
            const img1 = PNG.sync.read(Buffer.from(first, 'base64'));
            const img2 = PNG.sync.read(Buffer.from(second, 'base64'));

            const {width, height} = img1;
            const diff = new PNG({width, height});

            // calling pixelmatch return how many pixels are different
            const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height);

            // calculating a percent diff
            const diffPercent = (numDiffPixels / (width * height) * 100);

            cy.log(`Found a ${diffPercent.toFixed(2)}% pixel difference`);

            // if more than 2 pixels change (and this should be a 10x10 grid), we can be sure to not have
            // accidentially made screenshots during initialization, where head and food are places, but that
            // something is actually moving
            expect(diffPercent).to.be.above(2);
        })
    );
}

describe('AI Test', () => {
    it("is ai moving", {
        defaultCommandTimeout: 20000
    }, () => {
        cy.visit("/ai");

        cy.get('#snakeCanvas').screenshot('zeroth');
        cy.wait(2000);
        cy.get('#snakeCanvas').screenshot('first');
        cy.wait(1000);
        cy.get('#snakeCanvas').screenshot('second');

        ensureChange("first", "second");

        cy.get("#aiChooser").click();
        cy.contains("Actor-Critic (n=100)").click();
        cy.get('#snakeCanvas').screenshot('zeroth2');
        cy.wait(2000);
        cy.get('#snakeCanvas').screenshot('third');
        cy.wait(1000);
        cy.get('#snakeCanvas').screenshot('fourth');

        ensureChange("third", "fourth");

        cy.get("#aiChooser").click();
        cy.contains("Global Actor-Critic (n=10000)").click();
    })
})
