import globals from "globals"

import { config as baseConfig } from "./base.js"

export const nestJsConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: globals.node,
    },
  },
]
