// @ts-nocheck
import settings from "../../settings.js";

describe("compost heap", () => {
  it("has a compost heap, with no menu", () => {
    cy.login();

    cy.get("p[data-selector='booklist-compost-list-item']").contains("Compost Heap")
    cy.get("button[data-selector='booklist-list-item-menu-button']").should("not.exist")    
  });
});