// @ts-nocheck
import settings from "../../settings.js";

const title = "a brand new title";
const text = "some text";

describe("delete book", () => {
  it("if you delete a chapter, the editor state is cleared", () => {
    cy.login();

    cy.contains("h3", "Chapters").should("not.exist");

    cy.newBook();

    cy.selectBook();

    cy.newChapter();
    cy.selectChapter();

    cy.get("div[data-selector='text-editor-title']").type(`${title}{enter}`);
    cy.get("div[data-lexical-editor=true]").last().type(`${text}{enter}`);
    cy.get("div[data-lexical-editor=true]").last().type(`{command+s}`);

    cy.deleteChapter();
    cy.contains("div", title).should("not.exist");

    cy.deleteBook();
  });

  it("if you delete a book, the editor state is cleared", () => {
    cy.login();

    cy.contains("h3", "Chapters").should("not.exist");

    cy.newBook();

    cy.selectBook();

    cy.newChapter();
    cy.selectChapter();

    cy.get("div[data-selector='text-editor-title']").type(`${title}{enter}`);
    cy.get("div[data-lexical-editor=true]").last().type(`${text}{enter}`);
    cy.get("div[data-lexical-editor=true]").last().type(`{command+s}`);

    cy.deleteBook();
    cy.contains("div", title).should("not.exist");
  });
});
