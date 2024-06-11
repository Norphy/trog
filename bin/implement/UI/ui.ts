import { EventEmitter } from "stream";

export interface UI {
  setUpUIForFindText(
    fileContent: string[],
    lineNumbers: number[],
    linesBefore: number,
    linesAfter: number
  ): Promise<void>;

  setUpUIForTail(eventEmitter: EventEmitter): Promise<void>;
}
