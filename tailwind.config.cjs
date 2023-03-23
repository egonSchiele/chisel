/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/*.(tsx|ts|jsx|js)", "./src/**/*.(tsx|ts|jsx|js)"],
  theme: {
    extend: {
      fontFamily: {
        georgia: "Georgia",
      },
      colors: {
        hover: "#325531",
        main: "#658864",
        background: "#B7B78A",
        highlight: "#F5EC8D",
        highlight2: "#A1E69C",
      },
      margin: {
        xs: "0.5rem",
        sm: "1rem",
        md: "2rem",
        lg: "3rem",
        xl: "4rem",
      },
      padding: {
        xs: "0.5rem",
        sm: "1rem",
        md: "2rem",
        lg: "3rem",
        xl: "4rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
