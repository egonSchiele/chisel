describe("homepage", () => {
  it("loads", () => {
    cy.visit("http://localhost:80/");
    cy.contains("h1", "Chisel editor");
  });
});
