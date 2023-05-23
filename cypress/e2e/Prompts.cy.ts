// @ts-nocheck
import settings from "../../settings.js";

const title = "a brand new title";
const text = "once upon a time,";
const text2 = "another brilliant change";
const historyPanel = "div[data-selector='history-panel']";

const promptLabel = "NewPrompt!";
const promptText = "This is a new prompt!";

describe("prompts", () => {
  it("should fetch ai text for a prompt", () => {
    cy.viewport(1980, 1080);

    cy.login();

    cy.newBook();

    cy.selectBook();

    cy.newChapter();

    cy.selectChapter();

    cy.toggleRightSidebar();

    cy.showSuggestions();
    cy.get(`div[data-selector='ai-suggestion-panel']`).should("not.exist");

    cy.get(".ql-editor").last().type(`${text}{enter}`);

    cy.togglePrompts();
    cy.intercept({
      method: "POST",
      url: "/api/suggestions",
    }).as("postSuggestions");

    cy.get("li[data-selector='prompt-Expand-button']").click();

    cy.wait("@postSuggestions", { timeout: 15000 });

    cy.get(`div[data-selector='ai-suggestion-panel']`).should("exist");
    cy.get(`div[data-selector='ai-suggestion-panel']`).first().click();

    cy.get("#diff-view").contains("once upon a"); //.invoke("text");
    /*       .then((t) => {
        expect(t.length).to.be.greaterThan(text.length);
      });
 */
    cy.autoSave();

    // go back, the new suggestion should be there
    cy.visit("http://localhost:80/");

    cy.selectBook();
    cy.selectChapter();

    cy.get(`div[data-selector='ai-suggestion-panel']`).should("exist");

    cy.get(`div[data-selector='ai-suggestion-panel']`).should("exist");

    // delete it
    cy.get(`svg[data-selector='delete-ai-suggestion-panel']`).click();

    cy.get(`div[data-selector='ai-suggestion-panel']`).should("not.exist");
    cy.autoSave();
    // go back, the new suggestion should not be there anymore
    cy.visit("http://localhost:80/");

    cy.selectBook();
    cy.selectChapter();

    cy.get(`div[data-selector='ai-suggestion-panel']`).should("not.exist");

    cy.deleteChapter();
    cy.deleteBook();

    // finally, delete the book so we're back to a clean slate
  });
});
