// @ts-nocheck
import settings from "../../settings.js";

const title = "first chapter";
const text = "some important text";

describe("edit and switch", () => {
  it("if you edit a chapter, move to another chapter, and then go back, your edits should show (issue #7)", () => {
    cy.login();

    cy.contains("h3", "Chapters").should("not.exist");

    cy.newBook();

    cy.get("a[data-selector='booklist-list-item-link']").click();

    cy.contains("h3", "Chapters");

    cy.newChapter();
    cy.newChapter();

    cy.get(
      "button[data-selector='chapter-menu-list-item-menu-button']",
    ).click();

    cy.contains("div", "Grid mode");

    cy.get(
      "div[data-selector='chapter-menu-list-item-button-Grid mode']",
    ).click();

    cy.contains("h1", "Grid Mode");
    cy.contains(".handle", "New chapter");
    cy.get("button[data-selector='back-button']").click();

    cy.deleteFirstChapter();
    cy.deleteChapter();
    cy.deleteBook();

    // finally, delete the book so we're back to a clean slate
  });
});
