// @ts-nocheck
import settings from "../../settings.js";

const title = "a brand new title";
const text = "some text";
const text2 = "another brilliant change";
const historyPanel = "div[data-selector='history-panel']";

describe("fullscreen", () => {
  it("lets you enter and exit full screen mode", () => {
    cy.login();

    cy.newBook();

    cy.selectBook();

    cy.newChapter();

    cy.selectChapter();

    cy.toggleSidebar();
    // also show book and chapter lists
    cy.get("button[data-selector='open-lists-button']").click();

    cy.contains("span", "Minimize").should("not.exist");

    // go full screen
    cy.get("button[data-selector='maximize-button']").click();
    cy.contains("span", "Minimize");
    cy.contains("span", "Maximize").should("not.exist");
    cy.contains("h3", "Chapters").should("not.exist");

    // go back
    cy.get("button[data-selector='minimize-button']").click();
    cy.contains("span", "Minimize").should("not.exist");
    cy.contains("span", "Maximize");
    cy.contains("h3", "Chapters");

    // go full screen
    cy.get("button[data-selector='maximize-button']").click();
    cy.contains("span", "Minimize");
    cy.contains("span", "Maximize").should("not.exist");
    cy.contains("h3", "Chapters").should("not.exist");

    // go back
    cy.get("button[data-selector='close-sidebar-button']").click();
    cy.contains("span", "Minimize").should("not.exist");
    cy.contains("span", "Maximize");
    cy.contains("h3", "Chapters");

    cy.deleteChapter();
    cy.deleteBook();

    // finally, delete the book so we're back to a clean slate
  });
});
