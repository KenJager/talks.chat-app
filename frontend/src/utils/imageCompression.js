// utils/imageCompression.js
import imageCompression from 'browser-image-compression'

// Configuration de la compression
const compressionOptions = {
    maxSizeMB: 0.5,           // Taille maximale : 500KB
    maxWidthOrHeight: 1280,    // Dimensions maximales
    useWebWorker: true,        // Utiliser WebWorker pour meilleures performances
    fileType: 'image/webp',    // Format WebP (plus léger)
    initialQuality: 0.75,      // Qualité 75%
}

// Version avec browser-image-compression (recommandée)
export const compressImage = async (file) => {
    try {
        // Vérifier si la compression est nécessaire
        if (file.size < 1024 * 100) { // Moins de 100KB
            return file
        }
        
        // Options adaptées selon le fichier
        const options = {
            ...compressionOptions,
            maxSizeMB: file.size / 1024 / 1024 > 1 ? 0.5 : 0.3, // Ajustement dynamique
        }
        
        const compressedFile = await imageCompression(file, options)
        
        console.log('Compression result:', {
            originalSize: `${(file.size / 1024).toFixed(2)} KB`,
            compressedSize: `${(compressedFile.size / 1024).toFixed(2)} KB`,
            reduction: `${((1 - compressedFile.size / file.size) * 100).toFixed(2)}%`
        })
        
        return compressedFile
    } catch (error) {
        console.error('Error compressing image:', error)
        return file // Retourner le fichier original en cas d'erreur
    }
}

// Convertir l'image compressée en base64 pour l'envoi
export const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
    })
}