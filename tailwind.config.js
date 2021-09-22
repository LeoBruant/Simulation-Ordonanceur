const colors = require('./node_modules/tailwindcss/colors')

module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
        colors: {
            rose: colors.rose,
            fuchsia: colors.fuchsia,
            indigo: colors.indigo,
            teal: colors.teal,
            lime: colors.lime,
            orange: colors.orange,
            cyan: colors.cyan,
            sky: colors.sky,
        },
    },
  },
  variants: {
    extend: {
        backgroundColor: ['group-focus', 'active'],
        borderColor: ['group-focus'],
        boxShadow: ['group-focus'],
        opacity: ['group-focus'],
        textColor: ['group-focus', 'active'],
        textDecoration: ['group-focus'],
    },
  },
  plugins: [
      require('@tailwindcss/forms'),
      require('@tailwindcss/typography'),
      require('@tailwindcss/aspect-ratio'),
  ],
}
