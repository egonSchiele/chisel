import settings from "../../settings.js";

describe("books", () => {
  it("lets you add a book", () => {
    cy.intercept({
      method: "GET",
      url: "/books",
    }).as("getBooks");
    cy.visit("http://localhost:80/login.html");
    cy.contains("h2", "Sign in");
    cy.get("input[name=email]").type(settings.testuser.email);

    // {enter} causes the form to submit
    cy.get("input[name=password]").type(`${settings.testuser.password}{enter}`);

    // our auth cookie should be present
    cy.getCookie("userid").should("exist");
    cy.getCookie("token").should("exist");

    // UI should reflect this user being logged in
    cy.contains("h3", "Books");

    // Click the New button to add a new book
    cy.get("button[data-label=New]")
      .click()
      .then(() => {
        cy.wait("@getBooks");
        cy.get("p[data-selector='booklist-list-item']").contains("Untitled");
        cy.get(
          "button[data-selector='booklist-list-item-menu-button']",
        ).click();
        cy.contains("div", "Delete");
        cy.get("div[data-selector='booklist-list-item-button-Delete']")
          .click()
          .then(() => {
            cy.get("p[data-selector='booklist-list-item']").should("not.exist");
          });
      });
  });
});
