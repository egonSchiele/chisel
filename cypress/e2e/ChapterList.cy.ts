import settings from "../../settings.js";

describe("chapters", () => {
  it("lets you add, rename, and delete a chapter", () => {
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
    cy.contains("h3", "Chapters").should("not.exist");

    cy.intercept({
      method: "POST",
      url: "/newBook",
    }).as("postNewBook");

    // Click the New button to add a new book
    cy.get("button[data-label=New]").click();

    cy.wait(5000);

    cy.visit("http://localhost:80/");

    cy.get("p[data-selector='booklist-list-item']").contains("Untitled");
    cy.get("a[data-selector='booklist-list-item-link']").click();

    cy.contains("h3", "Chapters");

    cy.get("div[data-selector='chapterlist-list']").within(() => {
      cy.get("button[data-label=New]").click();
    });

    cy.wait(5000);

    cy.get("p[data-selector='chapterlist-list-item']").contains("New chapter");
    cy.get("button[data-selector='chapterlist-list-item-menu-button']").click();

    cy.contains("div", "Rename");
    cy.get("div[data-selector='chapterlist-list-item-button-Rename']").click();
    cy.get("input[name='Rename Chapter']").type("test chapter");
    cy.get("button[data-selector='popup-ok-button']").click();

    //cy.wait(5000);

    //cy.visit("http://localhost:80/");
    cy.get("p[data-selector='chapterlist-list-item']").contains("test chapter");

    cy.get("button[data-selector='chapterlist-list-item-menu-button']").click();
    cy.contains("div", "Delete");
    cy.get("div[data-selector='chapterlist-list-item-button-Delete']").click();
    cy.wait(5000);
    cy.get("p[data-selector='chapterlist-list-item']").should("not.exist");

    // finally, delete the book so we're back to a clean slate
    cy.get("button[data-selector='booklist-list-item-menu-button']").click();
    cy.contains("div", "Delete");
    cy.get("div[data-selector='booklist-list-item-button-Delete']")
      .click()
      .then(() => {
        cy.wait("@getBooks").then((interception) => {
          console.log(interception.response.body);
        });
        cy.get("p[data-selector='booklist-list-item']").should("not.exist");
      });
  });
});
