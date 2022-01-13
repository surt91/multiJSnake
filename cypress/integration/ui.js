describe('UI Test', () => {
    it('Pausing/Unpausing', () => {
        cy.visit('/');
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
        cy.visit('/');
        cy.wait(100);
        cy.get('canvas').trigger('keydown', { code: "KeyD"});
        cy.wait(300);
        cy.get('canvas').trigger('keydown', { code: "KeyW"});
    })

    it("add AI does not lead to errors", () => {
        cy.visit('/');
        cy.wait(100);
        cy.get("#currentScores").find('tr').should('have.length', 1);
        cy.get("button").contains("Add Autopilot").should('be.disabled');
        cy.get("#aiChooser").type("Greedy");
        cy.contains("Greedy").click();
        cy.get("button").contains("Add Autopilot").click();
        cy.get("#currentScores").find('tr').should('have.length', 2);
    })

    it('New Game, new Size', () => {
        cy.visit('/');
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
        cy.visit('/');
        cy.get("#playerNameView").contains("Anon 1").should("exist");
        cy.get("#playerNameView").parent().find("button").click();
        cy.get("#playerNameView").parent().find("input").clear().type("Cypress");
        cy.get("#playerNameView").parent().find("button[aria-label='done']").click();
        cy.get("#playerNameView").contains("Cypress").should("exist");
    });

    it('Touch controls', () => {
        cy.visit('/');

        cy.get("button").contains("Pause").should("not.exist");
        cy.get("canvas").trigger("touchstart", 100, 10, {
            touches: [
                {
                    clientX: 100,
                    clientY: 10,
                },
            ],
        });
        cy.get("canvas").trigger("touchmove", 100, 100, {
            touches: [
                {
                    clientX: 100,
                    clientY: 100,
                },
            ],
        });
        // just test that touch leads to an unpause,
        // instead of checking movement in the right direction
        cy.get("button").contains("Pause").should("exist");
    });

    it('Share ID', () => {
        cy.visit('/');
        cy.get("div[data-test=sharable-link]")
            .find("input")
            .should(($input) => {
                const val = $input.val()
                expect(val).to.include("http://localhost:8080?id=")
            });
        cy.get("div[data-test=sharable-link]").find("input").click().then(()=>{
            cy.window().then((win) => {
                // this fails if the F12 developer tools are open ... for some reason
                win.navigator.clipboard.readText().then((text) => {
                    expect(text).to.contain('http://localhost:8080?id=');
                });
            });
        });
        cy.contains("Copied!").should("exist");

    });
})
