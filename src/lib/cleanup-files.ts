import { Glob } from "bun";

export async function cleanupFiles() {
  const tmpFile = Bun.file("./tmp_download/tmp.mp4");

  if (await tmpFile.exists()) {
    await tmpFile.delete();
  }

  const glob = new Glob("./tmp_download/parts/tmp.mp4.*");
  for await (const file of glob.scan(".")) {
    await Bun.file(file).delete();
  }
}
