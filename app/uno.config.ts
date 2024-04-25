// uno.config.ts
import { defineConfig } from 'unocss'
import presetIcons from '@unocss/preset-icons'
import { presetUno } from 'unocss'
import fs from 'fs'

const icons = Object.fromEntries(fs.readdirSync('./src/lib/icons')
  .map(name => [name.replace(".svg", ""), fs.readFileSync(`./src/lib/icons/${name}`, 'utf-8')]))


export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      collections: {
        custom: icons
      }
    }),
  ]
})
