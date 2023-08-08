import { SCREEN_SCALE, SCREEN_HEIGHT, SCREEN_WIDTH } from '../const/Chip8'

export const drawScreen = (screen: Uint8Array, context: CanvasRenderingContext2D) => {
  context.fillStyle = '#000'
  context.fillRect(0, 0, SCREEN_WIDTH * SCREEN_SCALE, SCREEN_HEIGHT * SCREEN_SCALE)

  for (let y = 0; y < SCREEN_HEIGHT; y++) {
    context.fillStyle = '#fff'
    for (let x = 0; x < SCREEN_WIDTH; x++) {
      const pixelValue = screen[y * SCREEN_WIDTH + x]
      if (pixelValue !== 0) {
        context.fillRect(x * SCREEN_SCALE, y * SCREEN_SCALE, SCREEN_SCALE, SCREEN_SCALE)
      }
    }
  }
}