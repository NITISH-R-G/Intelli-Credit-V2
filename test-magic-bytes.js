import { fileTypeFromBuffer } from 'file-type';

async function check() {
  const buf = Buffer.from("Hello world!");
  const res = await fileTypeFromBuffer(buf);
  console.log(res);
}

check();
