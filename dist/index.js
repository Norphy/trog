#!/usr/bin/env node
import { program } from "commander";
import fs from "mz/fs.js";
import { FileInteractorImpl } from "./implement/file-interactor-impl.js";
program
    .version("0.0.1")
    .description("Log Analyzer Cli App");
program
    .command("find")
    .description("Check if file contains search text.")
    .argument("<file>", "File path of the file to search for text")
    .argument("<searchText>", "Text to be found in the file")
    .action((argumentOne, argumentTwo) => {
    let found = findText(argumentOne, argumentTwo);
    console.log(`Found text: ${found}`);
});
program
    .command("tail")
    .description("Reads bottom N lines of a file (Contains follow option).")
    .argument("<file>", "File path of the file to search for text.")
    .option("-n, --number-lines <value>", "Number of lines to be printed from bottom of file. Default: 10 lines.", "10")
    .option("-e, --encoding <value>", "Encoding of file. Deafult: utf8.", "utf8")
    .option("-f, --follow", "Print any new changes to file. Default: false.", false)
    .action((argumentOne, opts) => {
    const fileInteractor = new FileInteractorImpl();
    fileInteractor
        .readBottomNLines(argumentOne, opts.numberLines, opts.encoding)
        .then((data) => {
        console.log(`${data}`);
    })
        .catch((error) => {
        console.log(`Error occured: ${error}`);
    });
});
function findText(path, searchText) {
    const content = fs.readFileSync(path, "utf8");
    console.log(`Text: ${content} and path: ${path} SearchText: ${searchText}`);
    return content.includes(searchText);
}
program.parse(process.argv);
//# sourceMappingURL=index.js.map