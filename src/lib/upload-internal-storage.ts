export async function uploadInternalStorage() {
  const fileName = "tmp.mp4";
  const file = Bun.file(`./tmp_download/${fileName}.merged.mp4`);

  const fileBuffer = await file.arrayBuffer();

  const initFormData = new FormData();
  initFormData.append("name", String(file.name));
  initFormData.append("size", String(file.size));
  initFormData.append("mime", file.type);
  initFormData.append("expiry_hours", "12");
  initFormData.append("gallery_visible", "0");

  const initResponse = await fetch("https://punkpaste.ir/upload/init", {
    method: "POST",
    body: initFormData,
  });

  const initData = (await initResponse.json()) as {
    upload_id: string;
    chunk_size: number;
    total_chunks: number;
  };

  console.log({ initData });

  for (let index = 0; index < initData.total_chunks; index++) {
    const start = index * initData.chunk_size;
    const end = Math.min(start + initData.chunk_size, file.size);
    const chunk = fileBuffer.slice(start, end);

    const chunkResponse = await fetch(
      `https://punkpaste.ir/upload/chunk/${initData.upload_id}?index=${index}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: chunk,
      },
    );
    const chunkResponseJson = await chunkResponse.json();
    console.log({ chunkResponseJson });
  }

  const completeUploadResponse = await fetch(
    `https://punkpaste.ir/upload/complete/${initData.upload_id}`,
    { method: "POST" },
  );
  const completeUpload = (await completeUploadResponse.json()) as {
    link: string;
  };
  console.log({ completeUpload });

  return completeUpload;
}
