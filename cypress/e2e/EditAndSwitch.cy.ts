// @ts-nocheck
import settings from "../../settings.js";

const title = "first chapter";
const text = "some important text";

describe("edit and switch", () => {
  it("if you edit a chapter, move to another chapter, and then go back, your edits should show (issue #7)", () => {
    cy.login();

    cy.newBook();

    cy.selectBook();

    cy.contains("h3", "No chapters");

    cy.newChapter();
    cy.newChapter();

    cy.selectFirstChapter();

    cy.get("div[data-selector='text-editor-title']").type(`${title}{enter}`);
    cy.get(".ql-editor").last().type(`${text}{enter}`);

    cy.autoSave();

    // go to the other chapter
    cy.selectLastChapter();

    // go back
    cy.selectFirstChapter();

    // your edits should show
    cy.contains("div[data-selector='text-editor-title']", title);
    cy.contains(".ql-editor", text);

    cy.deleteFirstChapter();
    cy.deleteChapter();
    cy.deleteBook();

    // finally, delete the book so we're back to a clean slate
  });
});
