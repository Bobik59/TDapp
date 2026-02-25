module.exports = {
  plugins: [
    require('postcss-nested'),  // обязательно **перед** Tailwind
    require('tailwindcss'),
    require('autoprefixer'),
  ],
}
