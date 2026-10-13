// The AI page counts its steps in the `data-steps` attribute of the canvas. A model is working if this
// counter keeps increasing. Screenshot comparisons are not reliable here: weak models often run in a
// tight loop, so two screenshots taken a fixed time apart may show (almost) the same picture.
function steps($canvas) {
    return Number($canvas.attr('data-steps') ?? 0);
}

function ensureMoving() {
    cy.get('#snakeCanvas').then($canvas => {
        const before = steps($canvas);
        // retried until the timeout, so this also waits for the model to load
        cy.get('#snakeCanvas').should($c => expect(steps($c)).to.be.above(before + 10));
    });
}

function chooseAi(label) {
    cy.get("#aiChooser").click();
    cy.contains(label).click();
}

describe('AI Test', () => {
    it("is ai moving", {
        defaultCommandTimeout: 20000
    }, () => {
        cy.visit("/ai");
        ensureMoving();

        chooseAi("Actor-Critic (n=100)");
        ensureMoving();

        chooseAi("Global Actor-Critic (n=10000)");
        ensureMoving();
    })
})
