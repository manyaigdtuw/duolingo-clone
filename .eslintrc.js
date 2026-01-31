/* eslint-env node */
module.exports = {
  root: true,
  extends: ["eslint:recommended", "next/core-web-vitals", "prettier"],
  rules: {
    "no-undef": "off", // Next.js handles globals like Promise
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "internal", ["parent", "sibling"]],
        pathGroups: [
          {
            pattern: "react",
            group: "external",
            position: "before",
          },
        ],
        pathGroupsExcludedImportTypes: ["react"],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
  },
};
