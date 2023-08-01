export default interface IChip8 {
  screen: Uint8Array
  memory: Uint8Array
  stack: Uint16Array
  V: Uint8Array
  opcode: number
  I: number
  dt: number
  st: number
  pc: number
  sp: number
}