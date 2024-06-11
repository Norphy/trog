#!/usr/bin/env node
import { program } from "commander";
import { FileInteractorImpl } from "./implement/file-interactor-impl.js";
import { UIImpl } from "./implement/UI/ui-impl.js";
program.version("0.0.1").description("Log Analyzer Cli App");
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
    if (opts.follow) {
        fileInteractor
            .keepWatchFile(argumentOne, opts.encoding)
            .then((eventEmitter) => {
            eventEmitter.on("change", (readBytes) => {
                console.log(readBytes);
            });
        })
            .catch((error) => {
            console.log(`Error occured: ${error}`);
        });
    }
});
program
    .command("find")
    .description("Reads bottom N lines of a file (Contains follow option).")
    .argument("<file>", "File path of the file to search for text.")
    .argument("<searchText>", "Text which we would like to find in the file.")
    .option("-A, --After-value <value>", "Number of lines to be printed after finding target. Default: 5 lines.", "5")
    .option("-B, --Before-value <value>", "Number of lines to be printed before finding target. Default: 5 lines.", "5")
    .action((filePath, searchText, opts) => {
    const fileInteractor = new FileInteractorImpl();
    const ui = new UIImpl();
    fileInteractor
        .findInFile(filePath, searchText)
        .then((result) => {
        //Search text not found in file content
        if (result.lineNumbers.length === 0) {
            console.log("Text not found.");
            return;
        }
        ui.setUpUIForFindText(result.fileContent, result.lineNumbers, opts.BeforeValue, opts.AfterValue);
    })
        .catch((error) => {
        console.log(`Error occurred: ${error}`);
    });
});
program
    .command("log")
    .description("Watches a file for changes.")
    .argument("<file>", "File path of the file of which to log changes")
    .option("-e, --encoding <value>", "Encoding of file. Deafult: utf8.", "utf8")
    .action((filePath, opts) => {
    const fileInteractor = new FileInteractorImpl();
    const ui = new UIImpl();
    fileInteractor
        .keepWatchFile(filePath, opts.encoding)
        .then((eventEmitter) => {
        return ui.setUpUIForTail(eventEmitter);
    })
        .then(() => { })
        .catch((error) => {
        console.log(`Error occured: ${error}`);
    });
});
program.parse(process.argv);
//# sourceMappingURL=index.js.map