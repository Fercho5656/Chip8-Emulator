import './style.css'
import { SCREEN_SCALE, SCREEN_HEIGHT, SCREEN_WIDTH } from './const/Chip8'
import { keyboardMap } from './const/keyboardMap'
import { drawScreen } from './utils/drawScreen'
import Chip8 from './Chip8'
import readFile from './utils/readFile'

const chip8 = new Chip8()

document.addEventListener('keydown', (event: KeyboardEvent) => {
  const key = keyboardMap[event.key as keyof typeof keyboardMap]
  if (key !== undefined) {
    chip8.keys[key] = 1
  }
})

document.addEventListener('keyup', (event: KeyboardEvent) => {
  const key = keyboardMap[event.key as keyof typeof keyboardMap]
  if (key !== undefined) {
    chip8.keys[key] = 0
  }
})

const canvas = document.querySelector('#chip8Screen') as HTMLCanvasElement
const context = canvas.getContext('2d') as CanvasRenderingContext2D
canvas.width = SCREEN_WIDTH * SCREEN_SCALE
canvas.height = SCREEN_HEIGHT * SCREEN_SCALE

chip8.init()
const rom = await readFile('Keypad Test [Hap, 2006]')
chip8.loadRom(rom)

setInterval(() => {
  chip8.cycle()
  drawScreen(chip8.screen, context)
}, 0)
