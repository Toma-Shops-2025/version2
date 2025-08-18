import cloudinaryModule from 'cloudinary';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cloudinary = cloudinaryModule.v2;

cloudinary.config({
  cloud_name: 'dumnzljgn',
  api_key: '638214249426658',
  api_secret: '3AZ8ZAVDx-z5L4sYBfnys5JNDa8'
});

const SUPABASE_URL = 'https://nkkpfzqtgbpncdtyirid.supabase.co';
const SUPABASE_KEY = 'YOUR_NEW_ANON_KEY_HERE';
const BUCKET = 'uploads';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

console.log('Starting migration...');

async function migrateResources(resourceType) {
  let nextCursor = undefined;
  let total = 0;
  do {
    const result = await cloudinary.api.resources({
      resource_type: resourceType,
      type: 'upload',
      max_results: 100,
      next_cursor: nextCursor
    });
    console.log(`Fetched ${result.resources.length} ${resourceType}s from Cloudinary`);
    for (const resource of result.resources) {
      const ext = resource.format;
      const publicId = resource.public_id;
      const fileName = `${publicId}.${ext}`;
      const localPath = path.join(__dirname, 'downloads', fileName);

      // Download file
      await fs.ensureDir(path.dirname(localPath));
      const res = await fetch(resource.secure_url);
      const fileStream = fs.createWriteStream(localPath);
      await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on('error', reject);
        fileStream.on('finish', resolve);
      });

      // Upload to Supabase
      console.log(`Uploading ${fileName} to Supabase...`);
      const fileBuffer = await fs.readFile(localPath);
      const { error } = await supabase
        .storage
        .from(BUCKET)
        .upload(fileName, fileBuffer, {
          upsert: true,
          contentType: resourceType === 'video' ? `video/${ext}` : `image/${ext}`
        });
      if (error) {
        console.error(`Failed to upload ${fileName}:`, error.message);
      } else {
        console.log(`Uploaded: ${fileName}`);
      }
    }
    nextCursor = result.next_cursor;
  } while (nextCursor);
  console.log(`Finished migrating ${resourceType}s.`);
}

(async () => {
  await migrateResources('image');
  await migrateResources('video');
  console.log('Migration complete!');
})(); 