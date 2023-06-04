import { defineConfig } from "cypress";

export default defineConfig({
  defaultCommandTimeout: 6000,
  blockHosts: ["*.google-analytics.com", "*.plausible.io"],
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    experimentalRunAllSpecs: true,
  },
});
