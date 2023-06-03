// @ts-nocheck
import settings from "../../settings.js";

describe("login", () => {
  it("works", () => {
    cy.login();
    // UI should reflect this user being logged in
    cy.contains("h3", "No books");
  });
});
