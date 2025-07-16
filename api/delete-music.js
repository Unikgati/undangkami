// Vercel Serverless Function: /api/delete-music.js
// Pastikan environment variable CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME sudah di-set di Vercel

import { v2 as cloudinary } from 'cloudinary';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { public_id } = req.body;
  if (!public_id) {
    return res.status(400).json({ error: 'public_id diperlukan' });
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    await cloudinary.uploader.destroy(public_id, { resource_type: 'video', invalidate: true });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}