import { supabase } from '../client';

/**
 * Upload a file to Supabase Storage
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File,
  options: {
    cacheControl?: string;
    upsert?: boolean;
  } = {}
): Promise<{ path: string; url: string } | null> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = path ? `${path}/${fileName}` : fileName;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: options.cacheControl || '3600',
      upsert: options.upsert || false,
    });

  if (error) {
    console.error('Error uploading file:', error);
    return null;
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    path: data.path,
    url: publicUrl,
  };
};

/**
 * Delete a file from Supabase Storage
 */
export const deleteFile = async (
  bucket: string,
  path: string
): Promise<boolean> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('Error deleting file:', error);
    return false;
  }

  return true;
};

/**
 * Get a public URL for a file
 */
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return publicUrl;
};
