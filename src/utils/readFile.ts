export default async (romName: string): Promise<Uint8Array> => {
  const romFile = await fetch(`./roms/${romName}.ch8`)
  const romBuffer = await romFile.arrayBuffer()
  const rom = new Uint8Array(romBuffer)
  return rom
}
