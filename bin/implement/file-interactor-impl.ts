import { fs } from "mz";
import { FileInteractor } from "./file-interactor";

export class FileInteractorImpl implements FileInteractor {
  constructor() {}

  /**
   * Read the last `n` lines of a file. This is inspired by https://github.com/alexbbt/read-last-lines
   * @param  {string}   input_file_path - File path to be read
   * @param  {int}      maxLineCount    - Max number of lines to read in. (Entire document if n larger than lines in file)
   * @param  {encoding} encoding        - Specifies the character encoding to be used, or 'buffer'. defaults to 'utf8'.
   *
   * @return {promise}  a promise resolved with the lines or rejected with an error.
   */
  async readBottomNLines(
    filePath: string,
    maxLineCount: number,
    encoding?: BufferEncoding | string
  ): Promise<Buffer | string> {
    const NEW_LINE_CHARACTERS = ["\n"];
    const exists = await fs.exists(filePath);

    if (!exists) {
      throw new Error("File doesn't exist");
    }
    if (!encoding) {
      encoding = "utf8";
    }

    const readLastChar = async function (
      fileDesc: number,
      fileSize: number,
      currentCharCount: number
    ): Promise<string> {
      const bytesReadAndBuffer = await fs.read(
        fileDesc,
        Buffer.alloc(1),
        0,
        1,
        fileSize - 1 - currentCharCount
      );
      return String.fromCharCode(bytesReadAndBuffer[1][0]);
    };

    const fileDesc = await fs.open(filePath, "r");
    const fileStat = await fs.stat(filePath);

    let charCount: number = 0;
    let lineCount: number = 0;
    let lines: string = "";
    while (lines.length < fileStat.size && lineCount < maxLineCount) {
      const nextChar: string = await readLastChar(
        fileDesc,
        fileStat.size,
        charCount
      );
      lines = nextChar + lines;
      if (NEW_LINE_CHARACTERS.includes(nextChar) && lines.length > 1) {
        lineCount++;
      }
      charCount++;
    }

    if (NEW_LINE_CHARACTERS.includes(lines.substring(0, 1))) {
      lines = lines.substring(1);
    }

    await fs.close(fileDesc);

    if (encoding === "buffer") {
      return Buffer.from(lines, "binary");
    }
    if (Buffer.isEncoding(encoding)) {
      return Buffer.from(lines, "binary").toString(encoding);
    }
    throw new Error("Invalid encoding passed as argument.");
  }
}
