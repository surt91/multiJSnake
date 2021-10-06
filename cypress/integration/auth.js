describe('Auth Test', () => {
    it('Registration, Login, Logout', () => {
        cy.visit('http://localhost:8080');
        cy.get("button").should("contain", "Register").contains("Register").click();
        cy.get("input[id=email]").type("cypress@example.com");
        cy.get("input[id=username]").type("cypress");
        cy.get("input[id=password]").type("supersecret");
        cy.get("button[type=submit]").click();

        cy.get("button").should("contain", "Logout").contains("Logout").click();

        cy.get("button").should("contain", "Login").contains("Login").click();
        cy.get("input[id=username]").type("cypress");
        cy.get("input[id=password]").type("supersecret");
        cy.get("button[type=submit]").click();

        cy.get("button").should("contain", "Logout").contains("Logout").click();
    });

    it('Registration fails', () => {
        cy.visit('http://localhost:8080');
        cy.get("button").contains("Register").click();
        cy.get("input[id=email]").type("failexample.com");
        cy.get("input[id=username]").type("fail");
        cy.get("input[id=password]").type("supersecret");
        cy.get("button[type=submit]").click();
        cy.get("form").contains("Enter a valid email").should("exist");
        cy.get("input[id=email]").clear().type("fail@example.com");
        cy.get("button[type=submit]").click();
        cy.get("h2").contains("Register").should("not.exist");

        cy.get("button").contains("Logout").click();
        cy.get("button").contains("Register").click();
        cy.get("input[id=email]").type("fail@example.com");
        cy.get("input[id=username]").type("cypress2");
        cy.get("input[id=password]").type("othersecret");
        cy.get("button[type=submit]").click();
        cy.get("form").contains("Email is already registered!").should("exist");
        cy.get("input[id=email]").clear().type("other@example.com");
        cy.get("input[id=username]").clear().type("fail");
        cy.get("button[type=submit]").click();
        cy.get("form").contains("Username is already taken!").should("exist");
        cy.get("input[id=username]").clear().type("good");
        cy.get("input[id=password]").clear().type("short");
        cy.get("button[type=submit]").click();
        cy.get("form").contains("Password should be of minimum 8 characters length").should("exist");
    });
})