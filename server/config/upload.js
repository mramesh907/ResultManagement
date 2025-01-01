// upload.js
import multer from "multer"

// Configure multer to store files in memory
const storage = multer.memoryStorage() // Store file in memory, not on disk
const upload = multer({ storage }).single("file") // 'file' is the field name for the file in your form

export default upload
