// @ts-nocheck
import settings from "../../settings.js";

const title = "a brand new title";
const text = "first\nsecond\nthird";

describe("blocks", () => {
  it("tests various block functionality", () => {
    cy.login();

    cy.contains("h3", "Chapters").should("not.exist");

    cy.newBook();

    cy.selectBook();
    cy.newChapter();

    cy.selectChapter();

    // You can fold a block
    cy.get("div[data-selector='texteditor-0']").last().type(text);
    cy.get("div[data-selector='close-0']").click();
    cy.get("div[data-selector='texteditor-0']").should("not.exist");
    cy.get("p[data-selector='text-preview-0']").contains(text.split("\n")[0]);

    cy.autoSave();

    // The block stays folded
    cy.visit("http://localhost:80/");
    cy.selectBook();
    cy.selectChapter();
    cy.get("div[data-selector='texteditor-0']").should("not.exist");
    cy.get("p[data-selector='text-preview-0']").contains(text.split("\n")[0]);


    cy.deleteChapter();
    cy.deleteBook();

    // finally, delete the book so we're back to a clean slate
  });
});