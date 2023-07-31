import { assert, describe, it, test } from 'vitest'
import Chip8 from '../Chip8'
import TestRom from '../const/TestRom'

describe('Init Chip8 values correctly', () => {
  const chip8 = new Chip8()

  it('Screen size is 64 * 32 pixels', () => {
    assert(chip8.screen.length === 64 * 32)
  })

  it('Memory size is 4096 bytes', () => {
    assert(chip8.memory.length === 4096)
  })

  it('Stack size is 16 bytes', () => {
    assert(chip8.stack.length === 16)
  })

  it('V size is 16 bytes', () => {
    assert(chip8.V.length === 16)
  })

  it('I is 0', () => {
    assert(chip8.I === 0)
  })

  it('DT is 0', () => {
    assert(chip8.dt === 0)
  })

  it('ST is 0', () => {
    assert(chip8.st === 0)
  })

  it('PC starts at 0x200', () => {
    assert(chip8.pc === 0x200)
  })

  it('SP is 0', () => {
    assert(chip8.sp === 0)
  })

  it('Cycle is a function', () => {
    assert(typeof chip8.cycle === 'function')
  })

  it('loadRom is a function', () => {
    assert(typeof chip8.loadRom === 'function')
  })

  it('loads font set into memory', () => {
    for (let i = 0; i < chip8.memory.length; i++) {
      if (i >= 80) continue
      assert(chip8.memory[i] !== 0x00)
    }
  })
})

test('Loads ROM into memory', () => {
  const chip8 = new Chip8()

  chip8.loadRom(TestRom)
  const rom = chip8.memory.slice(0x200)
  assert(rom.some((byte) => byte !== 0x00))
})