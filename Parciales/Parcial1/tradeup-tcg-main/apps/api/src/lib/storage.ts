import { v2 as cloudinary } from 'cloudinary'
import { randomUUID } from 'node:crypto'

// Cloudinary se configura automaticamente desde las variables de entorno:
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.config({
  cloud_name: process.env['CLOUDINARY_CLOUD_NAME'],
  api_key:    process.env['CLOUDINARY_API_KEY'],
  api_secret: process.env['CLOUDINARY_API_SECRET'],
  secure:     true,
})

const CLOUDINARY_FOLDER = process.env['CLOUDINARY_FOLDER'] ?? 'tradeup/listings'

/**
 * Sube un archivo a Cloudinary y devuelve la URL publica segura.
 * El resto del codebase usa esta abstraccion sin necesitar cambios.
 */
export async function saveFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const base64  = Buffer.from(buffer).toString('base64')
  const mimeType = file.type || 'image/jpeg'
  const dataUri  = `data:${mimeType};base64,${base64}`

  const publicId = `${CLOUDINARY_FOLDER}/${randomUUID()}`

  const result = await cloudinary.uploader.upload(dataUri, {
    public_id:      publicId,
    overwrite:      false,
    resource_type:  'image',
    // Transformacion automatica: max 1200px de ancho, calidad auto, formato webp
    transformation: [
      { width: 1200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'webp' },
    ],
  })

  return result.secure_url
}
