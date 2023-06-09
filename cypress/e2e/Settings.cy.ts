// @ts-nocheck
import settings from "../../settings.js";

const title = "a brand new title";
const text = "some text";
const text2 = "another brilliant change";
const historyPanel = "div[data-selector='history-panel']";

const promptLabel = "NewPrompt!";
const promptText = "This is a new prompt!";

describe("settings", () => {
  it("adds a new prompt using settings", () => {
    cy.login();

    cy.newBook();

    cy.selectBook();

    cy.newChapter();

    cy.selectChapter();

    cy.toggleRightSidebar();
    cy.togglePrompts();
    cy.showSettings();

    cy.get("input[data-selector='prompt-Expand-label']").type(
      `{selectAll}{backspace}${promptLabel}`
    );
    cy.get(`textarea[data-selector='prompt-${promptLabel}-text']`).type(
      `{selectAll}{backspace}${promptText}`
    );

    // save!
    cy.manuallySave();
    cy.wait(2000);
    // now the new prompt should be there
    cy.visit("http://localhost:80/");

    cy.selectBook();
    cy.selectChapter();

    cy.get(`input[data-selector='prompt-${promptLabel}-label']`).should(
      "have.value",
      promptLabel
    );

    // delete it
    cy.get(
      `button[data-selector='prompt-${promptLabel}-delete-button']`
    ).click();

    cy.get(`input[data-selector='prompt-${promptLabel}-label']`).should(
      "not.exist"
    );

    // add the expand prompt back
    cy.get("button[data-selector='sidebar-new-prompt-button']").click();

    cy.get("input[data-selector='prompt-NewPrompt-label']").type(
      "{selectAll}{backspace}Expand"
    );
    cy.get("textarea[data-selector='prompt-Expand-text']").type(
      "Write another paragraph for this text:"
    );

    // save!
    cy.manuallySave();

    // the prompt we just added should be there
    cy.visit("http://localhost:80/");

    cy.selectBook();
    cy.selectChapter();

    cy.get(`input[data-selector='prompt-${promptLabel}-label']`).should(
      "not.exist"
    );

    cy.get("input[data-selector='prompt-Expand-label']").should(
      "have.value",
      "Expand"
    );
    //cy.openLists();

    cy.deleteChapter();
    cy.deleteBook();

    // finally, delete the book so we're back to a clean slate
  });
});
