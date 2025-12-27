import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export function useKYC() {
  const mutation = useMutation(async (payload: { file: File }) => {
    const { file } = payload;
    const filename = `${Date.now()}_${file.name}`;

    // Upload to kyc-docs bucket
    const { data, error: uploadErr } = await supabase.storage.from('kyc-docs').upload(filename, file, { cacheControl: '3600', upsert: false });
    if (uploadErr) throw uploadErr;

    const path = data.path;
    const user = supabase.auth.user();
    if (!user) throw new Error('Not authenticated');

    // Insert kyc_documents record
    const { error: insertErr } = await supabase.from('kyc_documents').insert([{
      user_id: user.id,
      bucket: 'kyc-docs',
      path,
      status: 'pending'
    }]);

    if (insertErr) throw insertErr;

    return { path };
  });

  return mutation;
}
