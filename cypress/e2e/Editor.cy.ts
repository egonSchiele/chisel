// @ts-nocheck
import settings from "../../settings.js";

const title = "a brand new title";
const text = "some text";

describe("editor", () => {
  it("lets you edit and save text", () => {
    cy.login();

    cy.contains("h3", "Chapters").should("not.exist");

    cy.newBook();

    cy.selectBook();
    cy.newChapter();

    cy.selectChapter();
    cy.get("div[data-selector='text-editor-title']").type(`${title}{enter}`);
    cy.get(".ql-editor").last().type(`${text}{enter}`);

    // should auto save
    cy.wait(5000);

    cy.visit("http://localhost:80/");
    cy.get("a[data-selector='booklist-list-item-link']").click();
    cy.get("a[data-selector='chapterlist-list-item-link']").click();

    cy.contains("div[data-selector='text-editor-title']", title);

    cy.contains(".ql-editor", text);

    cy.deleteChapter();
    cy.deleteBook();

    // finally, delete the book so we're back to a clean slate
  });
});

/*

// @ts-nocheck
import settings from "../../settings.js";

describe("chapters", () => {
  it("lets you add, rename, and delete a chapter", () => {
    cy.login();

    cy.contains("h3", "Chapters").should("not.exist");

    cy.newBook();

    cy.get("a[data-selector='booklist-list-item-link']").click();

    cy.contains("h3", "Chapters");

    cy.newChapter();

    cy.renameChapter();
    cy.deleteChapter();
    cy.deleteBook();

    // finally, delete the book so we're back to a clean slate
  });
});
 */
