// @ts-nocheck
import settings from "../../settings.js";


const text = "some text";

describe("front matter", () => {
  it("lets you edit the synopsis", () => {
    cy.login();

    cy.newBook();

    cy.selectBook();
    cy.get("label").contains("Synopsis");
    cy.get("textarea[id='synopsis']").type(`${text} {enter}`);
    cy.autoSave();

    cy.visit("http://localhost:80/");
    cy.selectBook();
    cy.get("textarea[id='synopsis']").contains(text);
    cy.deleteBook();
  });
});
