import { useRef, useState } from "react";
import { coreApi, resolveImageUrl } from "../../api/client";

// Replaces the old in-app image gallery (ImagePickerModal). No thumbnails
// are rendered in the app itself — clicking the button opens the browser's
// own native "Choose File" dialog, the vendor picks any image file from
// their computer, and we upload it straight to the backend.
//
// Note: browsers don't let a web page control which folder that native
// dialog opens to by default — that's an OS/browser-level restriction, not
// something this component (or any web app) can override. The vendor just
// navigates to the file once; most browsers remember the last folder used.
export default function ProductImagePicker({ value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const openFileDialog = () => inputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset so picking the same file again still fires onChange
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await coreApi.post("/api/ad-images/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(res.data.url);
    } catch (err) {
      setError(err.response?.data?.error || "Could not upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="flex items-center gap-3">
          <img src={resolveImageUrl(value)} alt="Selected" className="h-16 w-16 rounded-lg object-cover" />
          <button
            type="button"
            onClick={openFileDialog}
            disabled={uploading}
            className="rounded-lg border-[1.5px] border-slate-200 px-4 py-2 text-sm font-semibold text-navy disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Change Image"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openFileDialog}
          disabled={uploading}
          className="flex items-center gap-2 rounded-[10px] border-[1.5px] border-dashed border-slate-300 bg-misty px-4 py-3 text-sm font-semibold text-slate-500 disabled:opacity-60"
        >
          📁 {uploading ? "Uploading..." : "Choose Image From Your Computer"}
        </button>
      )}

      {error && <p className="mt-2 text-xs text-brand-red">{error}</p>}
    </div>
  );
}
