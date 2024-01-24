/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pagebackground: 'var(--color-pagebackground)',
        cardbackground: 'var(--color-cardbackground)',
        answerunselected: 'var(--color-answerunselected)',
        answerselected: 'var(--color-answerselected)',
      }
    },
  },
  plugins: [],
};
