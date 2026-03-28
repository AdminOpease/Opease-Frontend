import db from '../config/database.js';
import { getUploadUrl, getDownloadUrl } from '../config/s3.js';
import { NotFoundError } from '../utils/errors.js';

export async function presignedUrl(req, res, next) {
  try {
    const { fileName, contentType, category, driverId } = req.body;
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `drivers/${driverId}/${category}/${timestamp}-${safeName}`;

    const uploadUrl = await getUploadUrl({ key, contentType });

    res.json({ uploadUrl, s3Key: key });
  } catch (err) {
    next(err);
  }
}

export async function downloadUrl(req, res, next) {
  try {
    const doc = await db('documents').where({ id: req.params.documentId }).first();
    if (!doc) throw new NotFoundError('Document');

    const url = await getDownloadUrl({ key: doc.s3_key });
    res.json({ downloadUrl: url, fileName: doc.file_name });
  } catch (err) {
    next(err);
  }
}
