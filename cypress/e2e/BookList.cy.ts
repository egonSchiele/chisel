// @ts-nocheck
import settings from "../../settings.js";

describe("books", () => {
  it("lets you add, rename, and delete a book", () => {
    cy.login();
    cy.newBook();
    cy.renameBook();
    cy.deleteBook();
  });
});
