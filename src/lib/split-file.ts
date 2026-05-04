export async function splitFile() {
  const fileName = "tmp.mp4";
  const downloadUrl = `./tmp_download/${fileName}`;
  const file = Bun.file(downloadUrl);

  // const CHUNK_SIZE = 19 * 1024 * 1024;
  // const CHUNK_SIZE = 10 * 1024 * 1024;
  const CHUNK_SIZE = 15 * 1024 * 1024;

  let chunkIndex = 0;
  let bytesWrittenInChunk = 0;

  let writer = Bun.file(
    `./tmp_download/parts/${fileName}.part${chunkIndex}`,
  ).writer();

  const reader = file.stream().getReader();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    let offset = 0;

    while (offset < value.length) {
      const remainingChunkSpace = CHUNK_SIZE - bytesWrittenInChunk;
      const bytesToWrite = Math.min(remainingChunkSpace, value.length - offset);
      const slice = value.subarray(offset, offset + bytesToWrite);
      await writer.write(slice);
      offset += bytesToWrite;
      bytesWrittenInChunk += bytesToWrite;
      if (bytesWrittenInChunk >= CHUNK_SIZE) {
        await writer.end();
        chunkIndex++;
        writer = Bun.file(
          `./tmp_download/parts/${fileName}.part${chunkIndex}`,
        ).writer();
        bytesWrittenInChunk = 0;
      }
    }
  }

  if (bytesWrittenInChunk > 0) {
    await writer.end();
  }

  console.log(`Finished splitting into ${chunkIndex + 1} chunks`);
}
