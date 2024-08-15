module.exports = {
  arrowParens: "always",
  proseWrap: 'never',
  trailingComma: "es5",
  singleQuote: true,
  importOrder: [
    "^@?\\w",
    "^@/(.*)$",
    "^[./]"
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: [
    "@trivago/prettier-plugin-sort-imports"
  ]
}