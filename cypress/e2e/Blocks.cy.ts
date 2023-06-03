// @ts-nocheck
import settings from "../../settings.js";

const title = "a brand new title";
const text = "first\nsecond\nthird";
const text2 = "fourth\nfifth\nsixth";

describe("blocks", () => {
  it("tests various block functionality", () => {
    cy.viewport(1980, 1080);
    cy.login();

    cy.newBook();

    cy.selectBook();
    cy.newChapter();

    cy.selectChapter();

    // You can fold a block
    cy.get("div[data-selector='texteditor-0']").type(text);

    // make a new block
    cy.launcher("new block after current");

    cy.get("div[data-selector='texteditor-1']").type(text2);
    cy.get("div[data-selector='close-0']").click();
    cy.get("div[data-selector='texteditor-0']").should("not.exist");
    cy.get("p[data-selector='text-preview-0']").contains(text.split("\n")[0]);
    cy.get("div[data-selector='texteditor-1']").contains(text2.split("\n")[0]);
    // merge block up
    // cannot test because can't get the ql-editor to stay active
    // when invoking the launcher. argh
    /*     cy.launcher(`merge block up`)

    cy.get("div[data-selector='texteditor-1']").should("not.exist");
    cy.get("div[data-selector='texteditor-0']").contains("first");
    cy.get("div[data-selector='texteditor-0']").contains("second");
    cy.get("div[data-selector='texteditor-0']").contains("fourth");
    cy.get("div[data-selector='texteditor-0']").contains("fifth");

    // make another new block
    cy.launcher("new block after current")
    cy.get("div[data-selector='texteditor-1']").type(text2) */

    cy.autoSave();

    // The block stays folded
    cy.visit("http://localhost:80/");
    cy.selectBook();
    cy.selectChapter();
    cy.get("div[data-selector='texteditor-0']").should("not.exist");
    cy.get("p[data-selector='text-preview-0']").contains(text.split("\n")[0]);
    cy.get("div[data-selector='texteditor-1']").contains("fourth");

    // readonly mode
    cy.get("button[data-selector='readonly-open']").click();

    // closed block is shown
    cy.contains("div[id=readonly]", "first");
    cy.contains("div[id=readonly]", "fourth");
    cy.get("button[data-selector='readonly-close']").click();

    // diff viewer
    cy.get("div[data-selector='open-0']").click();
    cy.launcher("diff with block below");
    cy.contains("div[id='diff-view']", "first");
    cy.get("button[data-selector='diff-view-close']").click();

    cy.deleteChapter();
    cy.deleteBook();

    // finally, delete the book so we're back to a clean slate
  });
});
