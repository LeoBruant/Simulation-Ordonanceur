const colors = require('./node_modules/tailwindcss/colors')

module.exports = {
    purge: [],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                amber: colors.amber,
                blueGray: colors.blueGray,
                coolGray: colors.coolGray,
                cyan: colors.cyan,
                emerald: colors.emerald,
                fuchsia: colors.fuchsia,
                lime: colors.lime,
                orange: colors.orange,
                rose: colors.rose,
                sky: colors.sky,
                teal: colors.teal,
                trueGray: colors.trueGray,
                violet: colors.violet,
                warmGray: colors.warmGray
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
