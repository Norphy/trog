import pkg from "mz";
const { fs, readline } = pkg;
import { FileInteractor, FindFileObject, MarkValues } from "./file-interactor";
import EventEmitter from "events";
import chalk from "chalk";

export class FileInteractorImpl implements FileInteractor {
  constructor() {}

  /**
   * Read the last `n` lines of a file. This is inspired by https://github.com/alexbbt/read-last-lines.
   * @param  {string}   input_file_path - File path to be read.
   * @param  {int}      maxLineCount    - Max number of lines to read in. (Entire document if n larger than lines in file).
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
  /**
   * This method watches a file for changes and returns an Event Emitter that will the new added part to a File.
   * @param  {string} pathToFile - path of the file to be watched.
   * @param  {encoding} encoding - Encoding of the file or the desired encoding of the data to be returned.
   * @param  {string} filter - Filters the data being returned (Text), will return only that contains filter text.
   * If blank, returns everything.
   * @param  {MarkValues} markedValues - Values (Text) that are needed to be marked in color. Contains text to be marked in
   *  a color and the color it is marked with.
   * @returns {Promise<EventEmitter>} - Event emitter that will emit text that is added to the file. Keyword for event is "change".
   */
  async keepWatchFile(
    pathToFile: string,
    encoding: string | BufferEncoding,
    filter?: string,
    markedValues?: MarkValues[]
  ): Promise<EventEmitter> {
    const eventEmitter = new EventEmitter();
    let prevFileStat = await fs.stat(pathToFile);
    const fsWatcher = fs.watch(pathToFile, (eventType, _) => {
      //If not change event return
      if (eventType !== "change") return;

      const fileStat = fs.statSync(pathToFile);

      //If change is not addition ignore
      if (fileStat.size <= prevFileStat.size) {
        return;
      }

      const fileDesc = fs.openSync(pathToFile, "r");
      const newBytes = fileStat.size - prevFileStat.size;
      let result;

      //Read only the difference in the new characters added to the file
      const bufferNewBytes = Buffer.alloc(newBytes);
      fs.readSync(fileDesc, bufferNewBytes, 0, newBytes, prevFileStat.size);
      if (encoding === "buffer") {
        result = bufferNewBytes;
      }
      if (Buffer.isEncoding(encoding)) {
        result = bufferNewBytes.toString(encoding);
      } else {
        throw new Error("Invalid encoding passed as option.");
      }
      fs.closeSync(fileDesc);

      //Check filter to return only desired text
      if (filter !== undefined) {
        if (!result.includes(filter)) return;
      }

      //Check marked values to mark text that is desired to be marked in a color
      if (markedValues !== undefined) {
        for (const markedValue of markedValues) {
          const index = result.indexOf(markedValue.value);
          const value = markedValue.value;
          const color = markedValue.color;
          if (index !== -1) {
            result = result.replace(value, color(value));
          }
        }
      }
      prevFileStat = fileStat;
      eventEmitter.emit("change", result);
    });

    // catches ctrl+c event
    process.on("SIGINT", () => {
      eventEmitter.removeAllListeners("change");
      fsWatcher.close();
    });
    return eventEmitter;
  }

  /**
   * This method finds certain text in a file (All occurances of text).
   * @param {string} filePath - Is the path to the file.
   * @param {string} searchText - Is text that is desired to be found
   * @returns {Promise<FindFileObject>} - returns a object that contains the line number of the text occurance
   * and the line containing the text occurance.
   */
  async findInFile(
    filePath: string,
    searchText: string
  ): Promise<FindFileObject> {
    return await this.getText(filePath, searchText);
  }

  getText = async function (
    filePath: string,
    search: string
  ): Promise<FindFileObject> {
    const findFileObject: FindFileObject = { fileContent: [], lineNumbers: [] };
    const inputStream = fs.createReadStream(filePath);
    const readLineInt = readline.createInterface({ input: inputStream });
    let lineCount = 0;
    for await (const line of readLineInt) {
      const indOfSearch = line.indexOf(search);
      if (indOfSearch !== -1) {
        findFileObject.lineNumbers.push(lineCount);
        const newLine = line.replace(search, chalk.bold.yellow(search));
        findFileObject.fileContent.push(
          chalk.bold.red(`${lineCount}:`) + newLine
        );
      } else {
        findFileObject.fileContent.push(chalk.bold.red(`${lineCount}:`) + line);
      }
      lineCount++;
    }
    return findFileObject;
  };
}
