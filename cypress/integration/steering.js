describe('UI Test', () => {
    it('Pausing/Unpausing', () => {
        cy.visit('http://localhost:8080');
        cy.get("button").contains("Unpause").should("exist");
        cy.get("button").contains("Pause").should("not.exist");
        cy.get("button").contains("Unpause").click();
        cy.get("button").contains("Unpause").should("not.exist");
        cy.get("button").contains("Pause").should("exist");
        cy.get('canvas').trigger('keydown', { code: "KeyP"});
        cy.get("button").contains("Unpause").should("exist");
        cy.get("button").contains("Pause").should("not.exist");
        cy.get("button").contains("Restart").click();
    });

    it("steering does not lead to errors", () => {
        cy.visit('http://localhost:8080');
        cy.wait(100);
        cy.get('canvas').trigger('keydown', { code: "KeyD"});
        cy.wait(300);
        cy.get('canvas').trigger('keydown', { code: "KeyW"});
    })

    it("add AI does not lead to errors", () => {
        cy.visit('http://localhost:8080');
        cy.wait(100);
        cy.get("#currentScores").find('tr').should('have.length', 1);
        cy.get("button").contains("Add AI").click();
        cy.get("#currentScores").find('tr').should('have.length', 2);
    })

    it('New Game, new Size', () => {
        cy.visit('http://localhost:8080');
        cy.get("canvas").invoke('width').should('be.equal', 400);
        cy.get("canvas").invoke('height').should('be.equal', 400);
        cy.contains("Highscores for 20 x 20").should("exist");
        cy.get("input[name=width]").type("{backspace}{backspace}23");
        cy.get("input[name=height]").type("{backspace}{backspace}42");
        cy.get("button").contains("new game").click();
        cy.contains("Highscores for 23 x 42").should("exist");
        cy.get("canvas").invoke('width').should('be.equal', 460);
        cy.get("canvas").invoke('height').should('be.equal', 840);
    });

    it('Rename Player', () => {
        cy.visit('http://localhost:8080');
        cy.get("#playerNameView").contains("Anon 1").should("exist");
        cy.get("#playerNameView").parent().find("button").click();
        cy.get("#playerNameView").parent().find("input").clear().type("Cypress");
        cy.get("#playerNameView").parent().find("button[aria-label='done']").click();
        cy.get("#playerNameView").contains("Cypress").should("exist");
    });
})
