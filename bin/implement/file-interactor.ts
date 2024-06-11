import EventEmitter from "events";
import { ChalkInstance } from "chalk";

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

  keepWatchFile(
    filePath: string,
    bufferEncoding: BufferEncoding,
    filter?: string,
    markValues?: MarkValues[]
  ): Promise<EventEmitter>;

  findInFile(filePath: string, searchText: string): Promise<FindFileObject>;
}

export interface FindFileObject {
  lineNumbers: number[];
  fileContent: string[];
}

export interface MarkValues {
  value: string;
  color: ChalkInstance;
}
