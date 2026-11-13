// utils/upload.js - upload a file straight from the browser to Cloudflare R2.
// 1) ask our API for a presigned URL, 2) PUT the file to R2, 3) return its public URL.
import axios from 'axios';

const API = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

export async function uploadToR2(file, folder, token, onProgress) {
  const { data } = await axios.post(
    `${API}/storage/presign`,
    { folder, fileName: file.name, contentType: file.type },
    { headers: { 'x-auth-token': token } }
  );

  // Plain axios call: no auth header, R2 only trusts the signature in the URL
  await axios.put(data.uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: onProgress
      ? (e) => e.total && onProgress(Math.round((e.loaded / e.total) * 100))
      : undefined,
  });

  return data.publicUrl;
}
