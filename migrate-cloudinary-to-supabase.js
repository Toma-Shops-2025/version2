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