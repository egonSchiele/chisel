import settings from "../../settings.js";

describe("login", () => {
  it("works", () => {
    cy.visit("http://localhost:80/login.html");
    cy.contains("h2", "Sign in");
    cy.get("input[name=email]").type(settings.testuser.email);

    // {enter} causes the form to submit
    cy.get("input[name=password]").type(`${settings.testuser.password}{enter}`);

    // our auth cookie should be present
    cy.getCookie("userid").should("exist");
    cy.getCookie("token").should("exist");

    // UI should reflect this user being logged in
    cy.contains("h3", "No books");
  });
});
