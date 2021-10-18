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

    it("is autopilot moving", () => {
        cy.visit('/');
        cy.request('POST', '/api/close/cypress-ai');

        // FIXME this is very hard to test due to timing and the screenshots fluctuating time
        cy.visit('/?id=cypress-ai');
        // wait until initialization
        cy.get("#currentScores").find('tr').should('have.length', 1);
        cy.get("button").contains("Add AI").click();
        cy.get("#currentScores").find('tr').should('have.length', 2);

        cy.get('canvas').compareSnapshot('canvas-ai-initial', 0.0);

        cy.get("#aiChooser").type("Act");
        cy.contains("Actor-Critic").click();
        cy.get("button").contains("Add AI").click();
        cy.get("#currentScores").find('tr').should('have.length', 3);

        cy.get("#aiChooser").click();
        cy.contains("Deep Q").click();
        cy.get("button").contains("Add AI").click();
        cy.get("#currentScores").find('tr').should('have.length', 4);

        cy.get('canvas').compareSnapshot('canvas-ai2-initial', 0.0);

        cy.get("button").contains("Unpause").click();
        cy.wait(200);
        cy.get('canvas').compareSnapshot('canvas-ai-step', 0.0);
    })
})
