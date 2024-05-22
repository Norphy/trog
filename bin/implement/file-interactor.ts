import EventEmitter from "events";

export interface FileInteractor {
  readBottomNLines(
    filePath: string,
    maxLineCount: number,
    encoding?: BufferEncoding | string
  ): Promise<Buffer | string>;

  keepWatchFile(
    filePath: string,
    bufferEncoding: BufferEncoding
  ): Promise<EventEmitter>;

  findInFile(filePath: string, searchText: string): Promise<FindFileObject>;
}

export interface FindFileObject {
  lineNumbers: number[];
  fileContent: string[];
}
