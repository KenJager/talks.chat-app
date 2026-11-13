// cloudinary.js (simplifié)
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadDir = path.join(__dirname, "../../uploads")

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const saveBase64Image = async (base64String) => {
  if (!base64String || typeof base64String !== "string") {
    throw new Error("Invalid image data");
  }

  const matches = base64String.match(/^data:(image\/[^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid base64 image string");
  }

  // Générer un nom de fichier unique
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const filePath = path.join(uploadDir, filename);
  
  // Sauvegarder directement l'image déjà compressée côté client
  const imageBuffer = Buffer.from(matches[2], "base64");
  await fs.promises.writeFile(filePath, imageBuffer);
  
  const port = process.env.PORT || 5000;
  const serverUrl = process.env.SERVER_URL || `http://localhost:${port}`;
  
  return {
    secure_url: `${serverUrl}/uploads/${filename}`
  };
};

const cloudinary = {
  uploader: {
    upload: saveBase64Image,
  },
}

export default cloudinary