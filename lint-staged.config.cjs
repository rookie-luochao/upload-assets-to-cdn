module.exports = {
  "*.{ts,tsx}": [
    "eslint --fix"
  ],
  "*.(ts|tsx|mjs|js|json|html|md)": [
    "prettier --write"
  ]
}