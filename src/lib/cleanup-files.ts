import { Glob } from "bun";

export async function cleanupFiles() {
  const tmpFile = Bun.file("./tmp_download/input.mp4");

  if (await tmpFile.exists()) {
    await tmpFile.delete();
  }

  const glob = new Glob("./tmp_download/parts/*.mp4");
  for await (const file of glob.scan(".")) {
    Bun.file(file).delete();
  }

  const mergedFile = Bun.file("./tmp_download/merged.mp4");
  if (await mergedFile.exists()) {
    await mergedFile.delete();
  }
}
