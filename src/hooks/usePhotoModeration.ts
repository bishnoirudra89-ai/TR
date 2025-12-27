import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export function usePhotoModeration() {
  const mutation = useMutation(async (payload: { file: File; bucket?: string; folder?: string }) => {
    const { file, bucket = 'profile-photos', folder = '' } = payload;
    const form = new FormData();
    form.append('file', file);

    // 1) Call edge function to moderate the photo
    // Using supabase functions
    const res = await supabase.functions.invoke('moderate-photo', { body: form });

    if (!res || res.error) {
      throw new Error('Moderation failed');
    }

    // Expected response: { approved: boolean, reason?: string }
    const json = await res.json();
    if (!json.approved) {
      throw new Error('Image rejected by moderation: ' + (json.reason ?? 'unspecified'));
    }

    // 2) Upload to storage
    const filename = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from(bucket).upload(folder ? `${folder}/${filename}` : filename, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    return data;
  });

  return mutation;
}
