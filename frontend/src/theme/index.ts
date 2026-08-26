import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"
import { themeTokens } from "./tokens"

const config = defineConfig({
  theme: {
    tokens: {
      colors: themeTokens.colors,
      fonts: themeTokens.fonts,
      radii: themeTokens.radii,
    },
    semanticTokens: {
      colors: {
        bg: {
          canvas: {
            value: { _light: "#f8fafc", _dark: "{colors.graphite.950}" },
          },
          surface: {
            value: { _light: "#ffffff", _dark: "{colors.graphite.900}" },
          },
          elevated: {
            value: { _light: "#ffffff", _dark: "{colors.graphite.850}" },
          },
          subtle: {
            value: { _light: "#f1f5f9", _dark: "{colors.graphite.800}" },
          },
        },
        fg: {
          default: {
            value: { _light: "#0f172a", _dark: "{colors.graphite.50}" },
          },
          muted: {
            value: { _light: "#64748b", _dark: "{colors.graphite.400}" },
          },
          secondary: {
            value: { _light: "#334155", _dark: "{colors.graphite.300}" },
          },
        },
        border: {
          subtle: {
            value: { _light: "#e2e8f0", _dark: "{colors.graphite.700}" },
          },
          strong: {
            value: { _light: "#cbd5e1", _dark: "{colors.graphite.600}" },
          },
        },
        accent: {
          primary: {
            value: { _light: "{colors.brand.600}", _dark: "{colors.brand.500}" },
          },
          cyan: {
            value: { _light: "{colors.cyan.600}", _dark: "{colors.cyan.500}" },
          },
        },
      },
    },
  },
  globalCss: {
    "html, body": {
      background: "bg.canvas",
      color: "fg.default",
      fontFamily: "body",
      minHeight: "100vh",
    },
    "*": {
      borderColor: "border.subtle",
    },
  },
})

export const system = createSystem(defaultConfig, config)
