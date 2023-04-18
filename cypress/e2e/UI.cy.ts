// @ts-nocheck
import settings from "../../settings.js";

describe("UI", () => {
  it("various UI tests", () => {
    cy.login();

    cy.newBook();

    cy.get("a[data-selector='booklist-list-item-link']").click();

    cy.contains("h3", "Chapters");

    cy.newChapter();

    cy.get("a[data-selector='chapterlist-list-item-link']").click();

    // various UI elements show up
    cy.contains("span", "Saved");

    // show sidebar
    cy.get("button[data-selector='sidebar-button']").click();
    cy.contains("h3", "Suggestions");

    // hide sidebar
    cy.get("button[data-selector='sidebar-button']").click();
    cy.contains("h3", "Suggestions").should("not.exist");

    // show prompts
    cy.get("button[data-selector='prompts-button']").click();
    cy.contains("h3", "Prompts");

    // esc hides ui
    cy.get("body").type("{esc}");
    cy.contains("h3", "Suggestions").should("not.exist");
    cy.contains("h3", "Prompts").should("not.exist");
    cy.contains("h3", "Chapters").should("not.exist");
    cy.contains("h3", "Books").should("not.exist");

    // esc again shows ui
    cy.get("body").type("{esc}");
    cy.contains("h3", "Suggestions");
    cy.contains("h3", "Prompts");
    cy.contains("h3", "Chapters");
    cy.contains("h3", "Books");

    cy.get("body").type("{command+shift+p}");
    /*     cy.contains("input[data-selector='launcher-search-input']");
     */ cy.contains("ul", "New Chapter");
    cy.get("body").type("{command+shift+p}");

    cy.deleteChapter();
    cy.deleteBook();

    // finally, delete the book so we're back to a clean slate
  });
});
