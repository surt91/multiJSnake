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
        cy.get("button").contains("Pause").should('exist');
        cy.get('canvas').click();

        cy.wait(2000);
        cy.get('canvas').compareSnapshot('canvas-game-over', 0.0);

        cy.get('canvas').trigger('keydown', { code: "KeyR"});
        cy.get('canvas').compareSnapshot('canvas-reset', 0.0);
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
})
