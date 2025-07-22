import cloudinaryModule from 'cloudinary';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const cloudinary = cloudinaryModule.v2;

cloudinary.config({
  cloud_name: 'dumnzljgn',
  api_key: '638214249426658',
  api_secret: '3AZ8ZAVDx-z5L4sYBfnys5JNDa8'
});

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
      // ... existing code ...
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