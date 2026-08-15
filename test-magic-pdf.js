import { fileTypeFromBuffer } from 'file-type';

async function check() {
  // A minimal valid PDF signature
  const buf = Buffer.from("%PDF-1.4\n%âãÏÓ\n", "utf-8");
  const res = await fileTypeFromBuffer(buf);
  console.log(res);
}

check();
