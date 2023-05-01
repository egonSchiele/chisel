// @ts-nocheck
import settings from "../../settings.js";


const name = "asterix";
const description = "the gaul";

describe("characters", () => {
  it("lets you add characters", () => {
    cy.login();

    cy.newBook();

    cy.selectBook();
    cy.get("label").contains("Synopsis");
    cy.get("button[data-selector='add-character-button']").click();
    cy.get("input[data-selector='character--name']").type(name)
    cy.get(`textarea[data-selector='character-${name}-description']`).type(description)
    cy.autoSave();

    cy.visit("http://localhost:80/");
    cy.selectBook();
    cy.get(`input[data-selector='character-${name}-name']`).should('have.value', name);
    cy.get(`textarea[data-selector='character-${name}-description']`).should('have.value', description);
    cy.deleteBook();
  });
});
