import { extendTheme } from "@chakra-ui/react"
import { colors , radii , shadows , space } from "./tokens" 
import { fonts , fontSizes ,lineHeights , letterSpacings, fontWeights } from "./typography"
import { styles } from "./styles"
import { Button } from "./components/button"
import { Input } from "./components/input"
import { Badge } from "./components/badge"
import { Modal } from "./components/modal"
import { Card } from "./components/card"

export const theme=extendTheme({
    colors,
    radii,
    shadows,
    space,
    fonts,
     fontSizes,
     fontWeights,
     lineHeights,
     letterSpacings,
     styles,
     components:{
        Button,
        Input,
        Badge,
        Modal,
        Card,
     },
})


export default theme