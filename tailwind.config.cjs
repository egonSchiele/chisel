/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/*.html",
    "./src/*.(tsx|ts|jsx|js)",
    "./src/**/*.(tsx|ts|jsx|js)",
  ],
  theme: {
    extend: {
      fontFamily: {
        georgia:
          "Superclarendon, 'Bookman Old Style', 'URW Bookman', 'URW Bookman L', 'Georgia Pro', Georgia, serif",
        didot:
          "Didot, 'Bodoni MT', 'Noto Serif Display', 'URW Palladio L', P052, Sylfaen, serif",
        merriweather: "Merriweather, serif",
      },
      colors: {
        hover: "#325531",
        main: "#658864",
        highlight: "#F5EC8D",
        highlight2: "#A1E69C",
        darkest: "#1A1A1A",
        lightest: "#F5F5F5",
        background: "#1A1A1A",
        text: "#F5F5F5",

        dmbackground: "#171F2D",
        dmtext: "rgb(148 163 184)",
      },
      spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "2rem",
        lg: "3rem",
        xl: "4rem",
      },
      /*   padding: {
        xs: "0.5rem",
        sm: "1rem",
        md: "2rem",
        lg: "3rem",
        xl: "4rem",
      }, */
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
