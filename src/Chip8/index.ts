import IChip8 from "./IChip8"
import { FONT_SET } from "../const/Chip8"
import opcodes from "./opcodes"

export default class Chip8 implements IChip8 {
  screen: Uint8Array
  keys: Uint8Array
  memory: Uint8Array
  stack: Uint16Array
  V: Uint8Array
  opcode: number
  I: number
  dt: number
  st: number
  pc: number
  sp: number

  constructor() {
    this.screen = new Uint8Array(64 * 32)
    this.keys = new Uint8Array(16)
    this.memory = new Uint8Array(4096)
    this.stack = new Uint16Array(16)
    this.V = new Uint8Array(16)
    this.opcode = 0
    this.I = 0
    this.dt = 0
    this.st = 0
    this.pc = 0x200
    this.sp = 0
    this.memory.set(FONT_SET, 0)
  }

  init() {
    this.screen = new Uint8Array(64 * 32)
    this.keys = new Uint8Array(16)
    this.memory = new Uint8Array(4096)
    this.stack = new Uint16Array(16)
    this.V = new Uint8Array(16)
    this.opcode = 0
    this.I = 0
    this.dt = 0
    this.st = 0
    this.pc = 0x200
    this.sp = 0
    this.memory.set(FONT_SET, 0)
  }

  cycle() {
    // Fetch opcode
    this.opcode = this.memory[this.pc] << 8 | this.memory[this.pc + 1]
    // console.log(`opcode: 0x${this.opcode.toString(16)}`)
    // Decode opcode
    // console.log(`decoded opcode: 0x${(this.opcode & 0xF000).toString(16)}`)
    opcodes[(this.opcode & 0xF000) as keyof typeof opcodes](this)
    // Execute opcode
    // Update timers
  }

  loadRom(rom: Uint8Array) {
    if (0xFFF - 0x200 < rom.length) {
      throw new Error('ROM too big for memory')
    }
    this.memory.set(rom, 0x200)
  }
}