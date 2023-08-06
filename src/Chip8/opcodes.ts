import Chip8 from "."

export default {
  0x0000: (chip8: Chip8) => { // 0x0XXX - Clear screen, return from subroutine, or jump to machine code routine
    const lastNibble = chip8.opcode & 0x00FF
    if (lastNibble === 0xE0) { // 0x00E0 - Clear screen
      chip8.screen.fill(0)
      chip8.pc += 2
    }

    if (lastNibble === 0xEE) { // 0x00EE - Return from subroutine
      chip8.sp--
      chip8.pc = chip8.stack[chip8.sp]
      chip8.pc += 2
    }
  },
  0x1000: (chip8: Chip8) => { // 0x1NNN - Jump to address NNN
    const NNN = chip8.opcode & 0x0FFF
    chip8.pc = NNN
  },
  0x2000: (chip8: Chip8) => { // 0x2NNN - Call subroutine at NNN
    const NNN = chip8.opcode & 0x0FFF
    chip8.stack[chip8.sp] = chip8.pc
    chip8.sp++
    chip8.pc = NNN
  },
  0x3000: (chip8: Chip8) => { // 0x3XKK - Skip next instruction if VX === KK
    const X = (chip8.opcode & 0x0F00) >> 8
    const KK = chip8.opcode & 0x00FF

    if (chip8.V[X] === KK) {
      chip8.pc += 2
    }
    chip8.pc += 2
  },
  0x4000: (chip8: Chip8) => { // 0x4XKK - Skip next instruction if VX !== KK
    const X = (chip8.opcode & 0x0F00) >> 8
    const KK = chip8.opcode & 0x00FF

    if (chip8.V[X] !== KK) {
      chip8.pc += 2
    }
    chip8.pc += 2
  },
  0x5000: (chip8: Chip8) => { // 0x5XY0 - Skip next instruction if VX === VY
    const X = (chip8.opcode & 0x0F00) >> 8
    const Y = (chip8.opcode & 0x00F0) >> 4

    if (chip8.V[X] === chip8.V[Y]) {
      chip8.pc += 2
    }
    chip8.pc += 2
  },
  0x6000: (chip8: Chip8) => { // 0x6XKK - Set VX to KK
    const X = (chip8.opcode & 0x0F00) >> 8
    const KK = chip8.opcode & 0x00FF

    chip8.V[X] = KK
    chip8.pc += 2
  },
  0x7000: (chip8: Chip8) => { // 0x7XKK - Add KK to VX
    const X = (chip8.opcode & 0x0F00) >> 8
    const KK = chip8.opcode & 0x00FF

    chip8.V[X] += KK
    chip8.pc += 2
  },
  0x8000: (chip8: Chip8) => { // 0x8XXX Instructions set
    const X = (chip8.opcode & 0x0F00) >> 8
    const Y = (chip8.opcode & 0x00F0) >> 4
    const lastNibble = chip8.opcode & 0x000F

    if (lastNibble === 0x0) { // 0x8XY0 - Set Vx = Vy
      chip8.V[X] = chip8.V[Y]
      chip8.pc += 2
    }

    if (lastNibble === 0x1) { // 0x8XY1 - Set Vx = Vx OR Vy
      chip8.V[X] = chip8.V[X] | chip8.V[Y]
      chip8.pc += 2
    }

    if (lastNibble === 0x2) { // 0x8XY2 - Set Vx = Vx AND Vy
      chip8.V[X] = chip8.V[X] & chip8.V[Y]
      chip8.pc += 2
    }

    if (lastNibble === 0x3) { // - Set Vx = Vx XOR Vy
      chip8.V[X] = chip8.V[X] ^ chip8.V[Y]
      chip8.pc += 2
    }

    if (lastNibble === 0x4) { // - Set Vx = Vx + Vy, set VF = carry
      const sum = chip8.V[X] + chip8.V[Y]
      chip8.V[X] = sum & 0xFF
      chip8.V[0xF] = sum > 0xFF ? 1 : 0
      chip8.pc += 2
    }

    if (lastNibble === 0x5) { // - Set Vx = Vx - Vy, set VF = NOT borrow
      const X = (chip8.opcode & 0x0F00) >> 8
      const Y = (chip8.opcode & 0x00F0) >> 4
      chip8.V[0xF] = (chip8.V[X] > chip8.V[Y]) ? 1 : 0
      chip8.V[X] -= chip8.V[Y]
      chip8.pc += 2
    }

    if (lastNibble === 0x6) { // - Set Vx = Vx SHR 1
      const X = (chip8.opcode & 0x0F00) >> 8
      chip8.V[0xF] = (chip8.V[X] & 0x1) === 1 ? 1 : 0
      chip8.V[X] >>= 1
      chip8.pc += 2
    }

    if (lastNibble === 0x7) { // - Set Vx = Vy - Vx, set VF = NOT borrow
      const X = (chip8.opcode & 0x0F00) >> 8
      const Y = (chip8.opcode & 0x00F0) >> 4

      chip8.V[0xF] = (chip8.V[Y] > chip8.V[X]) ? 1 : 0
      chip8.V[X] = chip8.V[Y] - chip8.V[X]
      chip8.pc += 2
    }

    if (lastNibble === 0xE) { // - Set Vx = Vx SHL 1
      const X = (chip8.opcode & 0x0F00) >> 8
      chip8.V[0xF] = (chip8.V[X] & 0x80) === 0x80 ? 1 : 0
      chip8.V[X] <<= 1
      chip8.pc += 2
    }
  },
  0x9000: (chip8: Chip8) => { // 9xy0 - Skip next instruction if Vx != Vy
    const X = (chip8.opcode & 0x0F00) >> 8
    const Y = (chip8.opcode & 0x00F0) >> 4
    if (chip8.V[X] !== chip8.V[Y]) {
      chip8.pc += 2
    }
    chip8.pc += 2
  },
  0xA000: (chip8: Chip8) => { // Annn - Set I = nnn
    const NNN = chip8.opcode & 0x0FFF
    chip8.I = NNN
    chip8.pc += 2
  },
  0xB000: (chip8: Chip8) => { // Bnnn - Jump to location nnn + V0
    const NNN = chip8.opcode & 0x0FFF
    chip8.pc = NNN + chip8.V[0]
  },
  0xC000: (chip8: Chip8) => { // Cxkk - Set Vx = random byte AND kk
    const X = (chip8.opcode & 0x0F00) >> 8
    const KK = (chip8.opcode & 0x00FF)
    const randomByte = Math.floor(Math.random() * 0xFF)
    chip8.V[X] = randomByte & KK
    chip8.pc += 2
  },
  0xD000: (chip8: Chip8) => { // Dxyn - Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision
    const X = (chip8.opcode & 0x0F00) >> 8
    const Y = (chip8.opcode & 0x00F0) >> 4
    const N = chip8.opcode & 0x000F
    const xCoord = chip8.V[X] % 64
    const yCoord = chip8.V[Y] % 32
    chip8.V[0xF] = 0

    for (let row = 0; row < N; row++) {
      const spriteByte = chip8.memory[chip8.I + row]
      for (let col = 0; col < 8; col++) {
        const spritePixel = spriteByte & (0x80 >> col)
        const screenIndex = (yCoord + row) * 64 + (xCoord + col)
        if (spriteByte & spritePixel) {
          if (chip8.screen[screenIndex] === 1) {
            chip8.V[0xF] = 1
          }
          chip8.screen[screenIndex] ^= 1
        }
      }
    }
    chip8.pc += 2
  },
  0xE000: (chip8: Chip8) => { // EXXX Instructions set
    const lastNibble = chip8.opcode & 0x00FF
    if (lastNibble === 0x9E) { // Ex9E - Skip next instruction if key with the value of Vx is pressed
      const X = (chip8.opcode & 0x0F00) >> 8
      if (chip8.keys[chip8.V[X]]) {
        chip8.pc += 2
      }
      chip8.pc += 2
    }

    if (lastNibble === 0xA1) { // ExA1 - Skip next instruction if key with the value of Vx is not pressed
      const X = (chip8.opcode & 0x0F00) >> 8
      if (!chip8.keys[chip8.V[X]]) {
        chip8.pc += 2
      }
      chip8.pc += 2
    }
  },
  0xF000: (chip8: Chip8) => { // FXXX Instructions set
    const op = (chip8.opcode & 0x00FF)
    const X = (chip8.opcode & 0x0F00) >> 8
    if (op === 0x07) { // Fx07 - Set Vx = delay timer value
      chip8.V[X] = chip8.dt
      chip8.pc += 2
    }

    if (op === 0x0A) { // Fx0A - Wait for a key press, store the value of the key in Vx
      let keyPressed = false
      for (let i = 0; i < chip8.keys.length; i++) {
        if (chip8.keys[i]) {
          chip8.V[X] = i
          keyPressed = true
        }
      }
      if (!keyPressed) return
      chip8.pc += 2
    }

    if (op === 0x15) { // Fx15 - Set delay timer = Vx
      chip8.dt = chip8.V[X]
      chip8.pc += 2
    }

    if (op === 0x18) { // Fx18 - Set sound timer = Vx
      chip8.st = chip8.V[X]
      chip8.pc += 2
    }

    if (op === 0x1E) { // Fx1E - Set I = I + Vx
      chip8.I += chip8.V[X]
      chip8.pc += 2
    }

    if (op === 0x29) { // Fx29 - Set I = location of sprite for digit Vx
      chip8.I = chip8.V[X] * 5
      chip8.pc += 2
    }

    if (op === 0x33) { // Fx33 - Store BCD representation of Vx in memory locations I, I+1, and I+2
      chip8.memory[chip8.I] = Math.floor(chip8.V[X] / 100)
      chip8.memory[chip8.I + 1] = Math.floor(chip8.V[X] / 10) % 10
      chip8.memory[chip8.I + 2] = Math.floor(chip8.V[X] / 1) % 10
      chip8.pc += 2
    }

    if (op === 0x55) { // Fx55 - Store registers V0 through Vx in memory starting at location I
      for (let i = 0; i <= X; i++) {
        chip8.memory[chip8.I + i] = chip8.V[i]
      }
      chip8.pc += 2
    }

    if (op === 0x65) { // Fx65 - Read registers V0 through Vx from memory starting at location I
      for (let i = 0; i <= X; i++) {
        chip8.V[i] = chip8.memory[chip8.I + i]
      }
      chip8.pc += 2
    }
  }
}