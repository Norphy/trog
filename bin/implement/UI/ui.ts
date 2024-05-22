export interface UI {
  setUpUIForFindText(
    fileContent: string[],
    lineNumbers: number[],
    linesBefore: number,
    linesAfter: number
  ): Promise<void>;
}
