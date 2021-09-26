const colors = require('./node_modules/tailwindcss/colors')

module.exports = {
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
            }
        }
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('@tailwindcss/aspect-ratio')
    ]
}
