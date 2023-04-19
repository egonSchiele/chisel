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

    cy.get("a[data-selector='chapterlist-list-item-link']").first().click();

    cy.get("div[data-selector='text-editor-title']").type(`${title}{enter}`);
    cy.get("div[data-lexical-editor=true]").last().type(`${text}{enter}`);

    // should auto save
    cy.wait(5000);

    // go to the other chapter
    cy.get("a[data-selector='chapterlist-list-item-link']").last().click();

    // go back
    cy.get("a[data-selector='chapterlist-list-item-link']").first().click();

    // your edits should show
    cy.contains("div[data-selector='text-editor-title']", title);
    cy.contains("div[data-lexical-editor=true]", text);

    cy.deleteFirstChapter();
    cy.deleteChapter();
    cy.deleteBook();

    // finally, delete the book so we're back to a clean slate
  });
});
