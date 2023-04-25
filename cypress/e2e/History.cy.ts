// @ts-nocheck
import settings from "../../settings.js";

const title = "a brand new title";
const text = "some text";
const text2 = "another brilliant change";
const historyPanel = "div[data-selector='history-panel']";

describe("history", () => {
  it("adds to history on save", () => {
    cy.login();

    cy.newBook();

    cy.get("a[data-selector='booklist-list-item-link']").click();

    cy.contains("h3", "Chapters");

    cy.newChapter();

    cy.selectChapter();

    cy.toggleSidebar();
    cy.showHistory();

    // no history yet
    cy.contains(historyPanel).should("not.exist");

    // first sav
    cy.get(".ql-editor").last().type(`${text}{enter}`);
    cy.wait(2000);
    cy.manuallySave();
    // TODO fix
    cy.contains(historyPanel, "some tex");
    cy.get(historyPanel).should("have.length", 1);

    // second save
    cy.get(".ql-editor").last().type(`${text2}{enter}`);
    cy.manuallySave();
    cy.contains(historyPanel, text2);
    cy.get(historyPanel).should("have.length", 2);

    // clicking history restores it
    cy.contains(".ql-editor", text2);
    cy.get(historyPanel).last().click();
    cy.contains(".ql-editor", text2).should("not.exist");
    cy.contains(".ql-editor", text);

    // restoring history doesn't add to history
    cy.get(historyPanel).should("have.length", 2);

    cy.get("body").type("{esc}"); // close the history panel
    cy.get("body").type("{esc}"); // open chapter + book lists
    cy.deleteChapter();
    cy.deleteBook();

    // finally, delete the book so we're back to a clean slate
  });
});
