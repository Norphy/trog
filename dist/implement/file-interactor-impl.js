var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fs } from "mz";
export class FileInteractorImpl {
    constructor() { }
    readBottomNLines(filePath, maxLineCount, encoding) {
        return __awaiter(this, void 0, void 0, function* () {
            const NEW_LINE_CHARACTERS = ["\n"];
            const exists = yield fs.exists(filePath);
            if (!exists) {
                throw new Error("File doesn't exist");
            }
            if (!encoding) {
                encoding = "utf8";
            }
            const readLastChar = function (fileDesc, fileSize, currentCharCount) {
                return __awaiter(this, void 0, void 0, function* () {
                    const bytesReadAndBuffer = yield fs.read(fileDesc, Buffer.alloc(1), 0, 1, fileSize - 1 - currentCharCount);
                    return String.fromCharCode(bytesReadAndBuffer[1][0]);
                });
            };
            const fileDesc = yield fs.open(filePath, "r");
            const fileStat = yield fs.stat(filePath);
            let charCount = 0;
            let lineCount = 0;
            let lines = "";
            while (lines.length < fileStat.size && lineCount < maxLineCount) {
                const nextChar = yield readLastChar(fileDesc, fileStat.size, charCount);
                lines = nextChar + lines;
                if (NEW_LINE_CHARACTERS.includes(nextChar) && lines.length > 1) {
                    lineCount++;
                }
                charCount++;
            }
            if (NEW_LINE_CHARACTERS.includes(lines.substring(0, 1))) {
                lines = lines.substring(1);
            }
            yield fs.close(fileDesc);
            if (encoding === "buffer") {
                return Buffer.from(lines, "binary");
            }
            if (Buffer.isEncoding(encoding)) {
                return Buffer.from(lines, "binary").toString(encoding);
            }
            throw new Error("Invalid encoding passed as argument.");
        });
    }
}
//# sourceMappingURL=file-interactor-impl.js.map