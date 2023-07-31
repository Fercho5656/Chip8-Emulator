export default interface IChip8 {
  screen: Uint8Array
  memory: Uint8Array
  stack: Uint16Array
  V: Uint8Array
  I: number
  dt: number
  st: number
  pc: number
  sp: number
}