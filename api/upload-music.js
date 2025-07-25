
import { formidable } from 'formidable';
import cloudinary from 'cloudinary';

export const config = {
  api: { bodyParser: false },
};

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);
    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const result = await cloudinary.v2.uploader.upload(file.filepath, {
      resource_type: 'auto',
      folder: 'undangkami/music',
    });
    return res.status(200).json({ url: result.secure_url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
