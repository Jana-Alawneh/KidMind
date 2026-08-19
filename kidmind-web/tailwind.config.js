/** @type {import('tailwindcss').Config} */

export default {

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {

    extend: {

      colors: {

        primary: "#7C6CFF",
        "primary-light": "#F2EEFF",

        background: "#F8F8FC",

        card: "#FFFFFF",

        border: "#ECECF5",

        text: "#2B2E4A",

        subtitle: "#8E91A8",

        success: "#64D2A3",

        warning: "#F6C06D",

        info: "#76B9FF",

      },

      fontFamily: {

        poppins: ["Poppins", "sans-serif"],

      },

      borderRadius: {

        card: "24px",

        button: "18px",

        input: "18px",

      },

      boxShadow: {

        card: "0 10px 40px rgba(124,108,255,.08)",

        hover: "0 18px 45px rgba(124,108,255,.14)",

        glass: "0 8px 32px rgba(31,38,135,.08)",

      },

      transitionTimingFunction: {

        smooth: "cubic-bezier(.4,0,.2,1)",

      },

    },

  },

  plugins: [],

};