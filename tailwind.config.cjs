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
      // palette: https://www.color-hex.com/color-palette/9376
      colors: {
        hover: "#325531",
        main: "#658864",
        highlight: "#F5EC8D",
        highlight2: "#A1E69C",
        darkest: "#1A1A1A",
        lightest: "#F5F5F5",
        background: "#1A1A1A",
        text: "#F5F5F5",

        dmbackground: "#1e453e",
        dmtext: "#d2d9d8",

        dmbutton: "#0c1612",
        dmbuttontext: "#d2d9d8",
        // Not enough contrast with background:
        //dmbutton: "#182c25",
        dmbuttonhover: "#F5EC8D",
        dmbuttonhovertext: "#0c1612",

        //dmbuttonhover: "#598669",
        dmsidebar: "#182c25",

        "dmpanel-background": "#455b55",
        "dmpanel-background-hover": "#576b66",
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
