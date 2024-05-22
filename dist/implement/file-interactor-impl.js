var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import pkg from "mz";
const { fs, readline } = pkg;
import EventEmitter from "events";
import chalk from "chalk";
export class FileInteractorImpl {
    constructor() {
        this.getText = function (filePath, search) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, e_1, _b, _c;
                const findFileObject = { fileContent: [], lineNumbers: [] };
                const inputStream = fs.createReadStream(filePath);
                const readLineInt = readline.createInterface({ input: inputStream });
                let lineCount = 0;
                try {
                    for (var _d = true, readLineInt_1 = __asyncValues(readLineInt), readLineInt_1_1; readLineInt_1_1 = yield readLineInt_1.next(), _a = readLineInt_1_1.done, !_a; _d = true) {
                        _c = readLineInt_1_1.value;
                        _d = false;
                        const line = _c;
                        const indOfSearch = line.indexOf(search);
                        if (indOfSearch !== -1) {
                            findFileObject.lineNumbers.push(lineCount);
                            const newLine = line.replace(search, chalk.bold.yellow(search));
                            findFileObject.fileContent.push(chalk.bold.red(`${lineCount}:`) + newLine);
                        }
                        else {
                            findFileObject.fileContent.push(chalk.bold.red(`${lineCount}:`) + line);
                        }
                        lineCount++;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = readLineInt_1.return)) yield _b.call(readLineInt_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return findFileObject;
            });
        };
    }
    /**
     * Read the last `n` lines of a file. This is inspired by https://github.com/alexbbt/read-last-lines
     * @param  {string}   input_file_path - File path to be read
     * @param  {int}      maxLineCount    - Max number of lines to resad in. (Entire document if n larger than lines in file)
     * @param  {encoding} encoding        - Specifies the character encoding to be used, or 'buffer'. defaults to 'utf8'.
     *
     * @return {promise}  a promise resolved with the lines or rejected with an error.
     */
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
    keepWatchFile(pathToFile, encoding) {
        return __awaiter(this, void 0, void 0, function* () {
            const eventEmitter = new EventEmitter();
            fs.watchFile(pathToFile, (curr, prev) => {
                if (curr.size === prev.size) {
                    return;
                }
                const fileDesc = fs.openSync(pathToFile, "r");
                const newBytes = curr.size - prev.size;
                const bufferNewBytes = Buffer.alloc(newBytes);
                fs.readSync(fileDesc, bufferNewBytes, 0, newBytes, prev.size);
                let result;
                if (encoding === "buffer") {
                    result = bufferNewBytes;
                }
                if (Buffer.isEncoding(encoding)) {
                    result = bufferNewBytes.toString(encoding);
                }
                else {
                    throw new Error("Invalid encoding passed as option.");
                }
                fs.closeSync(fileDesc);
                eventEmitter.emit(result);
            });
            // catches ctrl+c event
            process.on("SIGINT", () => {
                fs.unwatchFile(pathToFile);
                eventEmitter.removeAllListeners("change");
            });
            return eventEmitter;
        });
    }
    findInFile(filePath, searchText) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getText(filePath, searchText);
        });
    }
}
//# sourceMappingURL=file-interactor-impl.js.map