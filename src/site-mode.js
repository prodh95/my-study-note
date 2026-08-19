// 本機的 .env.local 會開啟完整筆記；公開網站則預設不顯示未上傳的 PDF。
export const showLocalPdfs = import.meta.env.VITE_SHOW_LOCAL_PDFS === 'true';
