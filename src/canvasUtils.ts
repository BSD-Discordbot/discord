import { loadImage, createCanvas } from 'canvas'
import path from 'path'

export async function showCards (cards: number[]): Promise<Buffer> {
  const images = await Promise.all(cards.map(async (c) => await loadImage(path.join(__dirname, '../cards/', `${c.toString()}.png`))))
  const gap = 0.2
  const { height, width } = images[0]
  const pixelGap = (width * gap)
  const canvas = createCanvas((width + pixelGap) * 5 + pixelGap, (height + pixelGap) + pixelGap)
  const final = createCanvas(canvas.width / 2, canvas.height / 2)
  const ctx = canvas.getContext('2d')
  const fctf = final.getContext('2d')
  images.forEach((img, index) => {
    ctx.drawImage(img, pixelGap + (index % 5) * (pixelGap + width), pixelGap + Math.floor(index / 5) * (pixelGap + 881))
  })

  fctf.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width * 0.5, canvas.height * 0.5)
  return final.toBuffer()
}
