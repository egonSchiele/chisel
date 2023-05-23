// @ts-nocheck
import settings from "../../settings.js";

const title = "a brand new title";
const text = "some text";

describe("editor", () => {
  it("lets you edit and save text", () => {
    cy.login();

    cy.newBook();

    cy.selectBook();
    cy.newChapter();

    cy.selectChapter();
    cy.get("div[data-selector='text-editor-title']").type(`${title}{enter}`);

    // Retest autosave twice. The first time, the created_at timestamp will be updated on the server
    // and the new timestamp will be passed to the client. If it gets success fully updated,
    // the second autosave will work. If it doesn't, the second autosave will fail.
    cy.get(".ql-editor").last().type(`some `);
    cy.autoSave();
    cy.get(".ql-editor").last().type(`text {enter}`);
    cy.autoSave();

    cy.visit("http://localhost:80/");
    cy.selectBook();

    cy.selectChapter();

    cy.contains("div[data-selector='text-editor-title']", title);

    cy.contains(".ql-editor", text);

    cy.deleteChapter();
    cy.deleteBook();

    // finally, delete the book so we're back to a clean slate
  });
});
