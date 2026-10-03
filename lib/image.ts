// Orbis squashes non 16:9 images. Cover crop to 16:9 before upload.

export async function cropTo169(file: File, width = 1280): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const height = Math.round((width * 9) / 16);
  const target = 16 / 9;
  const source = bitmap.width / bitmap.height;

  let sw = bitmap.width;
  let sh = bitmap.height;
  if (source > target) sw = Math.round(bitmap.height * target);
  else sh = Math.round(bitmap.width / target);
  const sx = Math.round((bitmap.width - sw) / 2);
  const sy = Math.round((bitmap.height - sh) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode image."))), "image/jpeg", 0.92),
  );
  const base = file.name.replace(/\.[^.]+$/, "") || "photograph";
  return new File([blob], `${base}-16x9.jpg`, { type: "image/jpeg" });
}

/** Asks the server for a one line description of the cropped photo. Null when unavailable. */
export async function describePhoto(file: File): Promise<string | null> {
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    const response = await fetch("/api/describe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: btoa(bin) }),
    });
    if (!response.ok) return null;
    const { caption } = (await response.json()) as { caption?: string };
    return caption?.trim() || null;
  } catch {
    return null;
  }
}
