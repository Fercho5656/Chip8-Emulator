import { describe, it, assert, expect, beforeEach, vi } from 'vitest'
import Chip8 from '../Chip8'

describe('Test opcodes', () => {
  const chip8 = new Chip8()

  beforeEach(() => {
    chip8.init()
  })

  it('0x00E0 - Should clear screen', () => {
    chip8.screen.fill(1)
    chip8.memory[chip8.pc] = 0x00
    chip8.memory[chip8.pc + 1] = 0xE0
    chip8.cycle()
    const expectedPC = 0x200 + 2

    assert(chip8.screen.every((pixel) => pixel === 0))
    expect(chip8.pc).toBe(expectedPC)
  })

  it('0x00EE - Should return from subroutine', () => {
    chip8.memory[chip8.pc] = 0x00
    chip8.memory[chip8.pc + 1] = 0xEE
    chip8.stack[chip8.sp] = 0x400
    ++chip8.sp
    chip8.cycle()
    const expectedPC = 0x400 + 2

    expect(chip8.pc).toBe(expectedPC)
    expect(chip8.sp).toBe(0)
  })

  it('0x1NNN - Should jump to address NNN', () => {
    const opcode = 0x1ABC
    const NNN = opcode & 0x0FFF
    chip8.memory[chip8.pc] = 0x10 | (NNN & 0xF00) >> 8
    chip8.memory[chip8.pc + 1] = NNN & 0x0FF
    chip8.cycle()
    const expectedPC = NNN

    expect(chip8.pc).toBe(expectedPC)
  })

  it('0x2NNN - Should call subroutine at NNN', () => {
    const opcode = 0x2ABC
    const NNN = opcode & 0x0FFF
    const actualSP = chip8.sp
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0x20 | (NNN & 0xF00) >> 8
    chip8.memory[chip8.pc + 1] = NNN & 0x0FF
    chip8.stack[chip8.sp] = chip8.pc
    chip8.cycle()

    const expectedSP = actualSP + 1

    expect(expectedSP).toBe(chip8.sp)
    expect(chip8.pc).toBe(NNN)
    expect(chip8.stack[actualSP]).toBe(actualPC)
  })

  it('0x3XKK - Should skip next instruction if VX === KK', () => {
    const opcode = 0x3ABC
    const X = (opcode & 0x0F00) >> 8
    const KK = opcode & 0x00FF
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0x30 | X
    chip8.memory[chip8.pc + 1] = KK
    chip8.V[X] = KK
    chip8.cycle()

    const expectedPC = actualPC + 4
    expect(chip8.pc).toBe(expectedPC)
  })

  it('0x3XKK - Should not skip next instruction if VX !== KK', () => {
    const opcode = 0x3ABC
    const X = (opcode & 0x0F00) >> 8
    const KK = opcode & 0x00FF
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0x30 | X
    chip8.memory[chip8.pc + 1] = KK
    chip8.V[X] = KK + 1
    chip8.cycle()

    const expectedPC = actualPC + 2
    expect(chip8.pc).toBe(expectedPC)
  })

  it('0x4XKK - Should skip next instruction if VX !== KK', () => {
    const opcode = 0x4ABC
    const X = (opcode & 0x0F00) >> 8
    const KK = opcode & 0x00FF
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0x40 | X
    chip8.memory[chip8.pc + 1] = KK
    chip8.V[X] = KK + 1
    chip8.cycle()

    const expectedPC = actualPC + 4
    expect(chip8.pc).toBe(expectedPC)
  })

  it('0x4XKK - Should not skip next instruction if VX === KK', () => {
    const opcode = 0x4ABC
    const X = (opcode & 0x0F00) >> 8
    const KK = opcode & 0x00FF
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0x40 | X
    chip8.memory[chip8.pc + 1] = KK
    chip8.V[X] = KK
    chip8.cycle()

    const expectedPC = actualPC + 2
    expect(chip8.pc).toBe(expectedPC)
  })

  it('0x5XY0 - Should skip next instruction if VX === VY', () => {
    const opcode = 0x5AB0
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0x50 | X
    chip8.memory[chip8.pc + 1] = Y << 4
    chip8.V[X] = 1
    chip8.V[Y] = 1
    chip8.cycle()

    const expectedPC = actualPC + 4
    expect(chip8.pc).toBe(expectedPC)
  })

  it('0x5XY0 - Should not skip next instruction if VX !== VY', () => {
    const opcode = 0x5AB0
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0x50 | X
    chip8.memory[chip8.pc + 1] = Y << 4
    chip8.V[X] = 1
    chip8.V[Y] = 2
    chip8.cycle()

    const expectedPC = actualPC + 2
    expect(chip8.pc).toBe(expectedPC)
  })

  it('0x6XKK - Should set VX to KK', () => {
    const opcode = 0x6ABC
    const X = (opcode & 0x0F00) >> 8
    const KK = opcode & 0x00FF
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0x60 | X
    chip8.memory[chip8.pc + 1] = KK
    chip8.cycle()

    expect(chip8.V[X]).toBe(KK)
    expect(chip8.pc).toBe(actualPC + 2)
  })

  it('0x7XKK - Should add KK to VX', () => {
    const opcode = 0x7ABC
    const X = (opcode & 0x0F00) >> 8
    const KK = opcode & 0x00FF
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0x70 | X
    chip8.memory[chip8.pc + 1] = KK
    chip8.V[X] = 0x1
    chip8.cycle()

    expect(chip8.V[X]).toBe(0x1 + KK)
    expect(chip8.pc).toBe(actualPC + 2)
  })

  it('0x8XY0 - Should set VY to VX', () => {
    const opcode = 0x8AB0
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0x80 | X
    chip8.memory[chip8.pc + 1] = Y << 4 | 0x0 // 0xY0
    chip8.V[X] = 0x0
    chip8.V[Y] = 0x1
    chip8.cycle()

    expect(chip8.V[X]).toBe(0x1)
    expect(chip8.pc).toBe(actualPC + 2)
  })

  it('0x8XY1 - Should Set Vx = Vx OR Vy', () => {
    const opcode = 0x8AB1
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4
    const actualPc = chip8.pc
    chip8.memory[chip8.pc] = 0x80 | X
    chip8.memory[chip8.pc + 1] = Y << 4 | 0x1 // 0xY1
    chip8.V[X] = 0x0
    chip8.V[Y] = 0x1
    const actualVX = chip8.V[X]
    chip8.cycle()

    expect(chip8.V[X]).toBe(actualVX | chip8.V[Y])
    expect(chip8.pc).toBe(actualPc + 2)
  })

  it('0x8XY2 - Should Set Vx = VX AND VY', () => {
    const opcode = 0x8AB2
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4
    const actualPc = chip8.pc
    chip8.memory[chip8.pc] = 0x80 | X
    chip8.memory[chip8.pc + 1] = Y << 4 | 0x2 // 0xY2
    chip8.V[X] = 0x0
    chip8.V[Y] = 0x1
    const actualVX = chip8.V[X]
    chip8.cycle()

    expect(chip8.V[X]).toBe(actualVX & chip8.V[Y])
    expect(chip8.pc).toBe(actualPc + 2)
  })

  it('0x8XY3 - Should set VX = VX XOR VY', () => {
    const opcode = 0x8AB3
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4
    const actualPc = chip8.pc
    chip8.memory[chip8.pc] = 0x80 | X
    chip8.memory[chip8.pc + 1] = Y << 4 | 0x3 // 0xY3
    chip8.V[X] = 0x0
    chip8.V[Y] = 0x1
    const actualVX = chip8.V[X]
    chip8.cycle()

    expect(chip8.V[X]).toBe(actualVX ^ chip8.V[Y])
    expect(chip8.pc).toBe(actualPc + 2)
  })

  it('0x8XY4 - Should set VX = VX + VY and set VF = 1 if carry', () => {
    const opcode = 0x8AB4
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4
    const actualPc = chip8.pc
    chip8.memory[chip8.pc] = 0x80 | X
    chip8.memory[chip8.pc + 1] = Y << 4 | 0x4 // 0xY4
    chip8.V[X] = 0xFF
    chip8.V[Y] = 0xFF
    const actualVX = chip8.V[X]
    chip8.cycle()

    expect(chip8.V[X]).toBe((actualVX + chip8.V[Y]) & 0xFF)
    expect(chip8.V[0xF]).toBe(1)
    expect(chip8.pc).toBe(actualPc + 2)
  })

  it('0x8XY4 - Should set VX = VX + VY and set VF = 0 if not carry', () => {
    const opcode = 0x8AB4
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4
    const actualPc = chip8.pc
    chip8.memory[chip8.pc] = 0x80 | X
    chip8.memory[chip8.pc + 1] = Y << 4 | 0x4 // 0xY4
    chip8.V[X] = 0x01
    chip8.V[Y] = 0x01
    const actualVX = chip8.V[X]
    chip8.cycle()

    expect(chip8.V[X]).toBe((actualVX + chip8.V[Y]) & 0xFF)
    expect(chip8.V[0xF]).toBe(0)
    expect(chip8.pc).toBe(actualPc + 2)
  })

  it('0x8XY5 - Should set VF = 1 if Vx > Vy, then set Vx = Vx - Vy, ', () => {
    const opcode = 0x8AB5
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4
    const actualPc = chip8.pc
    chip8.memory[chip8.pc] = 0x80 | X
    chip8.memory[chip8.pc + 1] = Y << 4 | 0x5 // 0xY5
    chip8.V[X] = 0x02
    chip8.V[Y] = 0x01
    const actualVX = chip8.V[X]
    chip8.cycle()

    expect(chip8.V[X]).toBe(actualVX - chip8.V[Y])
    expect(chip8.V[0xF]).toBe(1)
    expect(chip8.pc).toBe(actualPc + 2)
  })

  it('0x8XY5 - Should set VF = 0 if Vx <= Vy, then set Vx = Vx - Vy, ', () => {
    const opcode = 0x8AB5
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4
    const actualPc = chip8.pc
    chip8.memory[chip8.pc] = 0x80 | X
    chip8.memory[chip8.pc + 1] = Y << 4 | 0x5 // 0xY5
    chip8.V[X] = 0x01
    chip8.V[Y] = 0x02
    const actualVX = chip8.V[X]
    chip8.cycle()

    expect(chip8.V[X]).toBe((actualVX - chip8.V[Y]) & 0xFF) // 0xFF because of overflow
    expect(chip8.V[0xF]).toBe(0)
    expect(chip8.pc).toBe(actualPc + 2)
  })

  it('0x8XY6 - If the least-significant bit of Vx is 1, then VF is set to 1, otherwise 0. Then Vx is divided by 2', () => {
    const opcode = 0x8AB6
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4
    const actualPc = chip8.pc
    chip8.memory[chip8.pc] = 0x80 | X
    chip8.memory[chip8.pc + 1] = Y << 4 | 0x6 // 0xY6
    chip8.V[X] = 0x01
    const actualVX = chip8.V[X]
    chip8.cycle()

    expect(chip8.V[0xF]).toBe(1)
    expect(chip8.V[X]).toBe(actualVX >> 1)
    expect(chip8.pc).toBe(actualPc + 2)
  })

  it('0x8XY6 - If the least-significant bit of Vx is not 1, then VF is set to 0, otherwise 1. Then Vx is divided by 2', () => {
    const opcode = 0x8AB6
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4
    const actualPc = chip8.pc
    chip8.memory[chip8.pc] = 0x80 | X
    chip8.memory[chip8.pc + 1] = Y << 4 | 0x6 // 0xY6
    chip8.V[X] = 0x0E
    const actualVX = chip8.V[X]
    chip8.cycle()

    expect(chip8.V[0xF]).toBe(0)
    expect(chip8.V[X]).toBe(actualVX >> 1)
    expect(chip8.pc).toBe(actualPc + 2)
  })

  it('0x8XY7 - If Vy > Vx, then VF is set to 1, otherwise 0. Then Vx is subtracted from Vy, and the results stored in Vx', () => {
    const opcode = 0x8AB7
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4
    const actualPc = chip8.pc
    chip8.memory[chip8.pc] = 0x80 | X
    chip8.memory[chip8.pc + 1] = Y << 4 | 0x7 // 0xY7
    chip8.V[X] = 0x01
    chip8.V[Y] = 0x02
    const actualVX = chip8.V[X]
    chip8.cycle()

    expect(chip8.V[X]).toBe((chip8.V[Y] - actualVX) & 0xFF) // 0xFF because of overflow
    expect(chip8.V[0xF]).toBe(1)
    expect(chip8.pc).toBe(actualPc + 2)
  })

  it('0x8XY7 - If Vy > Vx, then VF is set to 1, otherwise 0. Then Vx is subtracted from Vy, and the results stored in Vx', () => {
    const opcode = 0x8AB7
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4
    const actualPc = chip8.pc
    chip8.memory[chip8.pc] = 0x80 | X
    chip8.memory[chip8.pc + 1] = Y << 4 | 0x7 // 0xY7
    chip8.V[X] = 0x02
    chip8.V[Y] = 0x01
    const actualVX = chip8.V[X]
    chip8.cycle()

    expect(chip8.V[X]).toBe((chip8.V[Y] - actualVX) & 0xFF) // 0xFF because of overflow
    expect(chip8.V[0xF]).toBe(0)
    expect(chip8.pc).toBe(actualPc + 2)
  })

  it('0x8XYE - If the most-significant bit of Vx is 1, then VF is set to 1, otherwise to 0. Then Vx is multiplied by 2', () => {
    const opcode = 0x8ABE
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4
    const actualPc = chip8.pc
    chip8.memory[chip8.pc] = 0x80 | X
    chip8.memory[chip8.pc + 1] = Y << 4 | 0xE // 0xYE
    chip8.V[X] = 0xA0
    const actualVX = chip8.V[X]
    chip8.cycle()

    expect(chip8.V[0xF]).toBe(1)
    expect(chip8.V[X]).toBe((actualVX << 1) & 0xFF) // 0xFF because of overflow
    expect(chip8.pc).toBe(actualPc + 2)
  })

  it('0x8XYE - If the most-significant bit of Vx is not 1, then VF is set to 0, otherwise to 1. Then Vx is multiplied by 2', () => {
    const opcode = 0x8ABE
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4
    const actualPc = chip8.pc
    chip8.memory[chip8.pc] = 0x80 | X
    chip8.memory[chip8.pc + 1] = Y << 4 | 0xE // 0xYE
    chip8.V[X] = 0x70
    const actualVX = chip8.V[X]
    chip8.cycle()

    expect(chip8.V[0xF]).toBe(0)
    expect(chip8.V[X]).toBe((actualVX << 1) & 0xFF) // 0xFF because of overflow
    expect(chip8.pc).toBe(actualPc + 2)
  })

  it('0x9XY0 - Should skip next instruction if VX !== VY', () => {
    const opcode = 0x9AB0
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4

    chip8.memory[chip8.pc] = 0x90 | X
    chip8.memory[chip8.pc + 1] = Y << 4 | 0x0 // 0xY0
    chip8.V[X] = 0x0
    chip8.V[Y] = 0x1
    const actualPC = chip8.pc
    chip8.cycle()

    expect(chip8.pc).toBe(actualPC + 4)
  })
  it('0x9XY0 - Should not skip next instruction if VX === VY', () => {
    const opcode = 0x9AB0
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4

    chip8.memory[chip8.pc] = 0x90 | X
    chip8.memory[chip8.pc + 1] = Y << 4 | 0x0 // 0xY0
    chip8.V[X] = 0x1
    chip8.V[Y] = 0x1
    const actualPC = chip8.pc
    chip8.cycle()

    expect(chip8.pc).toBe(actualPC + 2)
  })

  it('0xANNN - Should set I to NNN', () => {
    const opcode = 0xAABC
    const NNN = opcode & 0x0FFF
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0xA0 | (NNN & 0xF00) >> 8
    chip8.memory[chip8.pc + 1] = NNN & 0x0FF
    chip8.cycle()

    expect(chip8.I).toBe(NNN)
    expect(chip8.pc).toBe(actualPC + 2)
  })

  it('0xBNNN - Should jump to address NNN + V0', () => {
    const opcode = 0xBABC
    const NNN = opcode & 0x0FFF
    chip8.memory[chip8.pc] = 0xB0 | (NNN & 0xF00) >> 8
    chip8.memory[chip8.pc + 1] = NNN & 0x0FF
    chip8.V[0] = 0xF
    chip8.cycle()

    expect(chip8.pc).toBe((NNN + chip8.V[0]) & 0xFFF) // 0xFFF because of overflow
  })

  it('0xCXKK - Should set VX to random number AND KK', () => {
    const originalRandom = Math.random
    const mocked_random = vi.fn(() => 0.1)
    Math.random = mocked_random
    const opcode = 0xCABC
    const X = (opcode & 0x0F00) >> 8
    const KK = opcode & 0x00FF
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0xC0 | X
    chip8.memory[chip8.pc + 1] = KK
    chip8.cycle()

    expect(chip8.V[X]).toBe((Math.random() * 0xFF) & KK)
    expect(chip8.pc).toBe(actualPC + 2)
    Math.random = originalRandom
  })

  it('0xDXYN - Should display n-byte sprite starting at memory location I at (Vx, Vy), then set VF = collision', () => {
    const opcode = 0xDAB3
    const X = (opcode & 0x0F00) >> 8
    const Y = (opcode & 0x00F0) >> 4
    const N = opcode & 0x000F
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0xD0 | X
    chip8.memory[chip8.pc + 1] = Y << 4 | N
    chip8.I = 0x215 
    chip8.V[X] = 0x0
    chip8.V[Y] = 0x0
    // sprite data
    chip8.memory[chip8.I] = 0x3C      // 00111100 ->   xxxx
    chip8.memory[chip8.I + 1] = 0xC3  // 11000011 -> xx    xx
    chip8.memory[chip8.I + 2] = 0xFF  // 11111111 -> xxxxxxxx
    chip8.cycle()

    expect(chip8.V[0xF]).toBe(0)
    expect(chip8.pc).toBe(actualPC + 2)
    // Add test to check if sprite is displayed correctly
  })

  it('0xEX9E - Should skip next instruction if key with the value of VX is pressed', () => {
    const opcode = 0xE09E
    const X = (opcode & 0x0F00) >> 8
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0xE0 | X
    chip8.memory[chip8.pc + 1] = 0x9E
    chip8.V[X] = 0x1
    chip8.keys[chip8.V[X]] = 0x1
    chip8.cycle()

    expect(chip8.pc).toBe(actualPC + 4)
  })
  it('0xEX9E - Should not skip next instruction if key with the value of VX is pressed', () => {
    const opcode = 0xE09E
    const X = (opcode & 0x0F00) >> 8
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0xE0 | X
    chip8.memory[chip8.pc + 1] = 0x9E
    chip8.V[X] = 0x1
    chip8.keys[chip8.V[X]] = 0x0
    chip8.cycle()

    expect(chip8.pc).toBe(actualPC + 2)
  })

  it('0xEXA1 - Should skip next instruction if key with the value of VX is not pressed', () => {
    const opcode = 0xE0A1
    const X = (opcode & 0x0F00) >> 8
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0xE0 | X
    chip8.memory[chip8.pc + 1] = 0xA1
    chip8.V[X] = 0x1
    chip8.keys[chip8.V[X]] = 0x0
    chip8.cycle()

    expect(chip8.pc).toBe(actualPC + 4)
  })
  it('0xEXA1 - Should not skip next instruction if key with the value of VX is not pressed', () => {
    const opcode = 0xE0A1
    const X = (opcode & 0x0F00) >> 8
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0xE0 | X
    chip8.memory[chip8.pc + 1] = 0xA1
    chip8.V[X] = 0x1
    chip8.keys[chip8.V[X]] = 0x1
    chip8.cycle()

    expect(chip8.pc).toBe(actualPC + 2)
  })

  it('0xFX07 - Should set VX to value of delay timer', () => {
    const opcode = 0xF007
    const X = (opcode & 0x0F00) >> 8
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0xF0 | X
    chip8.memory[chip8.pc + 1] = 0x07
    chip8.dt = 0xF
    chip8.cycle()

    expect(chip8.V[X]).toBe((chip8.dt + 0x1) & 0xFF)
    expect(chip8.pc).toBe(actualPC + 2)
  })

  it('0xFX0A - If a key is pressed, store key value in VX and go to next instruction', () => {
    const opcode = 0xF00A
    const X = (opcode & 0x0F00) >> 8
    const actualPC = chip8.pc
    chip8.memory[chip8.pc] = 0xF0 | X
    chip8.memory[chip8.pc + 1] = 0x0A
    chip8.keys[0x1] = 0x01
    chip8.cycle()

    expect(chip8.V[X]).toBeTruthy()
    expect(chip8.pc).toBe(actualPC + 2)
  })

  it('0xFX0A - If a key is not pressed, PC should remain the same', () => {
    const opcode = 0xF00A
    const X = (opcode & 0x0F00) >> 8
    const actualPC = chip8.pc
    const actualVX = chip8.V[X]
    chip8.memory[chip8.pc] = 0xF0 | X
    chip8.memory[chip8.pc + 1] = 0x0A
    chip8.cycle()

    expect(chip8.V[X]).toBe(actualVX)
    expect(chip8.pc).toBe(actualPC)
  })

  it('0xFX15 - Should set delay timer to VX', () => {
    const opcode = 0xF015
    const X = (opcode & 0x0F00) >> 8
    const actualPC = chip8.pc
    const actualDT = chip8.dt
    chip8.memory[chip8.pc] = 0xF0 | X
    chip8.memory[chip8.pc + 1] = 0x15
    chip8.V[X] = 0x1
    chip8.cycle()

    expect(chip8.dt).toBe((actualDT - 0x1) + chip8.V[X])
    expect(chip8.pc).toBe(actualPC + 2)
  })

  it('0xFX18 - Should set sound timer to VX', () => {
    const opcode = 0xF018
    const X = (opcode & 0x0F00) >> 8
    const actualPC = chip8.pc
    const actualST = chip8.st
    chip8.memory[chip8.pc] = 0xF0 | X
    chip8.memory[chip8.pc + 1] = 0x18
    chip8.V[X] = 0x1
    chip8.cycle()

    expect(chip8.st).toBe((actualST - 0x1) + chip8.V[X])
    expect(chip8.pc).toBe(actualPC + 2)
  })

  it('0xFX1E - Should set I = I + VX', () => {
    const opcode = 0xF01E
    const X = (opcode & 0x0F00) >> 8
    const actualPC = chip8.pc
    const actualI = chip8.I
    chip8.memory[chip8.pc] = 0xF0 | X
    chip8.memory[chip8.pc + 1] = 0x1E
    chip8.V[X] = 0x1
    chip8.cycle()

    expect(chip8.I).toBe(actualI + chip8.V[X])
    expect(chip8.pc).toBe(actualPC + 2)
  })

  it('0xFX29 - Should set I to location of sprite for digit VX', () => {
    const opcode = 0xF029
    const X = (opcode & 0x0F00) >> 8
    const actualPC = chip8.pc
    const actualI = chip8.I
    chip8.memory[chip8.pc] = 0xF0 | X
    chip8.memory[chip8.pc + 1] = 0x29
    chip8.V[X] = 0x1
    chip8.cycle()

    expect(chip8.I).toBe(actualI + (chip8.V[X] * 5))
    expect(chip8.pc).toBe(actualPC + 2)
  })

  it('0xFX33 - Should store BCD representation of VX in memory locations I, I+1, and I+2', () => {
    const opcode = 0xF033
    const X = (opcode & 0x0F00) >> 8
    const actualPC = chip8.pc
    const actualI = chip8.I
    chip8.memory[chip8.pc] = 0xF0 | X
    chip8.memory[chip8.pc + 1] = 0x33
    chip8.V[X] = 0x7B // 123 decimal
    chip8.cycle()

    expect(chip8.memory[actualI]).toBe(1)
    expect(chip8.memory[actualI + 1]).toBe(2)
    expect(chip8.memory[actualI + 2]).toBe(3)
    expect(chip8.pc).toBe(actualPC + 2)
  })

  it('0xFX55 - Should store V0 to VX in memory starting at address I', () => {
    const opcode = 0xF355
    const X = (opcode & 0x0F00) >> 8
    const actualPC = chip8.pc
    const actualI = chip8.I
    chip8.memory[chip8.pc] = 0xF0 | X
    chip8.memory[chip8.pc + 1] = 0x55
    chip8.V[0] = 0x1
    chip8.V[1] = 0x2
    chip8.V[2] = 0x3
    chip8.V[3] = 0x4
    chip8.cycle()

    expect(chip8.memory[actualI]).toBe(chip8.V[0])
    expect(chip8.memory[actualI + 1]).toBe(chip8.V[1])
    expect(chip8.memory[actualI + 2]).toBe(chip8.V[2])
    expect(chip8.memory[actualI + 3]).toBe(chip8.V[3])
    expect(chip8.pc).toBe(actualPC + 2)
  })

  it('0xFX65 - Should fill V0 to VX with values from memory starting at address I', () => {
    const opcode = 0xF365
    const X = (opcode & 0x0F00) >> 8
    const actualPC = chip8.pc
    const actualI = chip8.I
    chip8.memory[chip8.pc] = 0xF0 | X
    chip8.memory[chip8.pc + 1] = 0x65
    chip8.memory[actualI] = 0x1
    chip8.memory[actualI + 1] = 0x2
    chip8.memory[actualI + 2] = 0x3
    chip8.memory[actualI + 3] = 0x4
    chip8.cycle()

    expect(chip8.V[0]).toBe(chip8.memory[actualI])
    expect(chip8.V[1]).toBe(chip8.memory[actualI + 1])
    expect(chip8.V[2]).toBe(chip8.memory[actualI + 2])
    expect(chip8.V[3]).toBe(chip8.memory[actualI + 3])
    expect(chip8.pc).toBe(actualPC + 2)
  })
})