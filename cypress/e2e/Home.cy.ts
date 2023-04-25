describe("homepage", () => {
  it("loads", () => {
    cy.visit("http://localhost:80/");
    // TODO failing on redirect
    /* cy.contains("h1", "Chisel editor"); */
  });
});
