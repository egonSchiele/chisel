/** @type {import('tailwindcss').Config} */
module.exports = {
  //  darkMode: "class",
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

        background: "#fdfce8",
        // Too bright
        //background: "#fffdeb",
        dmbackground: "#1e453e",

        text: "#1e453e",
        dmtext: "#d2d9d8",
        dmtextsecondary: "#1e453e",

        button: "#0c1612",
        dmbutton: "#0c1612",
        dmbuttonsecondary: "#e4deae",

        buttontext: "#d2d9d8",
        dmbuttontext: "#d2d9d8",
        dmbuttontextsecondary: "#000",
        // Not enough contrast with background:
        //dmbutton: "#182c25",
        buttonhover: "#F5EC8D",
        dmbuttonhover: "#F5EC8D",
        dmbuttonhoversecondary: "#F5EC8D",

        buttonhovertext: "#0c1612",
        dmbuttonhovertext: "#0c1612",
        dmbuttonhovertextsecondary: "#0c1612",

        //dmbuttonhover: "#598669",
        sidebar: "#e5e3d3",
        dmsidebar: "#182c25",

        "panel-background": "#fdfce8",
        "dmpanel-background": "#455b55",

        "panel-background-hover": "#DBDAD2",
        "dmpanel-background-hover": "#576b66",

        dmlistitem1: "#455b55",
        dmlistitem2: "#303f3b",

        dmsettings: "#e4deae",
        dmsettingspanel: "#b7bf96",

        dmchaptercard: "#2d695e",
        dmchaptercardhover: "#357a6e",
      },
      spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "2rem",
        lg: "3rem",
        xl: "4rem",
      },
      width: {
        chapter: "222px",
        history: "800px",
        historysmall: "760px",
      },
      height: {
        chapter: "147px",
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
