describe('Canvas Test', () => {
    it("visual test of the canvas", () => {
        cy.visit('/');
        cy.request('POST', '/api/close/cypress');

        // FIXME this is very hard to test due to timing and the screenshots fluctuating time
        cy.visit('/?id=cypress');
        // wait until initialization
        cy.get("#currentScores").find('tr').should('have.length', 1);

        cy.get('canvas').compareSnapshot('canvas-inital', 0.0);

        cy.get('#currentScores').click();
        cy.get('canvas').compareSnapshot('canvas-paused-unfocused', 0.0);

        cy.get('canvas').click();
        cy.get('canvas').compareSnapshot('canvas-paused-focused', 0.0);

        cy.get('canvas').trigger('keydown', { code: "KeyW"});
        cy.wait(200);
        cy.get("button").contains("Pause").click();
        cy.get('canvas').compareSnapshot('canvas-up', 0.0);

        cy.get("button").contains("Unpause").click();
        cy.get('canvas').compareSnapshot('canvas-clicked-unpause', 0.0);
        cy.get("button").contains("Pause").click();
        cy.get('canvas').click();
    })

    it("is autopilot moving", {
        defaultCommandTimeout: 20000
    }, () => {
        cy.visit('/');
        cy.request('POST', '/api/close/cypress-ai');

        // FIXME this is very hard to test due to timing and the screenshots fluctuating time
        cy.visit('/?id=cypress-ai');
        // wait until initialization
        cy.get("#currentScores").find('tr').should('have.length', 1);
        cy.get("button").contains("Add Autopilot").should('be.disabled');
        cy.get("#aiChooser").type("Greedy");
        cy.contains("Greedy").click();
        cy.get("button").contains("Add Autopilot").click();
        cy.get("#currentScores").find('tr').should('have.length', 2);

        cy.get('canvas').compareSnapshot('canvas-ai-initial', 0.0);

        cy.get("#aiChooser").type("Act");
        cy.contains("Actor-Critic (n=100)").click();
        cy.get("button").contains("Add Autopilot").click();
        cy.get("#currentScores").find('tr').should('have.length', 3);

        cy.get("#aiChooser").click();
        cy.contains("Deep Q (n=200)").click();
        cy.get("button").contains("Add Autopilot").click();
        cy.get("#currentScores").find('tr').should('have.length', 4);

        cy.get('canvas').compareSnapshot('canvas-ai2-initial', 0.0);

        cy.get("button").contains("Unpause").click();
        cy.wait(200);
        cy.get('canvas').compareSnapshot('canvas-ai-step', 0.0);
    })

    it("is ai moving", {
        defaultCommandTimeout: 20000
    }, () => {
        cy.visit('/ai');

        cy.get('canvas').screenshot('zeroth');
        cy.wait(2000);
        cy.get('canvas').screenshot('first');
        cy.wait(200);
        cy.get('canvas').screenshot('second');

        // https://gambini.me/en/blog/comparing-website-screenshots-with-cypress-and-pixelmatch
        // PNGJS lets me load the picture from disk
        const PNG = require('pngjs').PNG;
        // pixelmatch library will handle comparison
        const pixelmatch = require('pixelmatch');


        cy.readFile(
            './cypress/snapshots/actual/canvas.js/first.png', 'base64'
        ).then(first => {
            cy.readFile(
                './cypress/snapshots/actual/canvas.js/second.png', 'base64'
            ).then(second => {
                // load both pictures
                const img1 = PNG.sync.read(Buffer.from(first, 'base64'));
                const img2 = PNG.sync.read(Buffer.from(second, 'base64'));

                const { width, height } = img1;
                const diff = new PNG({ width, height });

                // calling pixelmatch return how many pixels are different
                const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height);

                // calculating a percent diff
                const diffPercent = (numDiffPixels / (width * height) * 100);

                cy.log(`Found a ${diffPercent.toFixed(2)}% pixel difference`);

                // if more than 2 pixels change (and this should be a 10x10 grid), we can be sure to not have
                // accidentially made screenshots during initialization, where head and food are places, but that
                // something is actually moving
                expect(diffPercent).to.be.above(2);
            });
        });
    })
})
