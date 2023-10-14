/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#794AB8',
        },
      },
    ],
  },
  theme: {
    extend: {
      colors: {
        ['light-background']: '#f8f3ef',
        ['dark-background']: '#241f27',
        highlight: '#413543',
        primary: '#ba8fee',
        background_dark: '#201f22',
      },
      fontFamily: {
        logo: 'Nabla, cursive',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
    require('@tailwindcss/aspect-ratio'),
    require('daisyui'),
    require('tailwindcss-highlights'),
  ],
};
