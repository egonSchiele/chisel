// @ts-nocheck
import settings from "../../settings.js";

describe("chapters", () => {
  it("lets you add, rename, and delete a chapter", () => {
    cy.login();


    cy.newBook();

    cy.get("a[data-selector='booklist-list-item-link']").click();

    cy.contains("h3", "No chapters");

    cy.newChapter();

    cy.renameChapter();
    cy.deleteChapter();
    cy.deleteBook();

    // finally, delete the book so we're back to a clean slate
  });
});
