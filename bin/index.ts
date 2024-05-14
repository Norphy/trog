#!/usr/bin/env node

import { program } from "commander";
import { FileInteractor } from "./implement/file-interactor.js";
import { FileInteractorImpl } from "./implement/file-interactor-impl.js";

program.version("0.0.1").description("Log Analyzer Cli App");

program
  .command("tail")
  .description("Reads bottom N lines of a file (Contains follow option).")
  .argument("<file>", "File path of the file to search for text.")
  .option(
    "-n, --number-lines <value>",
    "Number of lines to be printed from bottom of file. Default: 10 lines.",
    "10"
  )
  .option("-e, --encoding <value>", "Encoding of file. Deafult: utf8.", "utf8")
  .option(
    "-f, --follow",
    "Print any new changes to file. Default: false.",
    false
  )
  .action((argumentOne, opts) => {
    const fileInteractor: FileInteractor = new FileInteractorImpl();
    fileInteractor
      .readBottomNLines(argumentOne, opts.numberLines, opts.encoding)
      .then((data: string | Buffer) => {
        console.log(`${data}`);
      })
      .catch((error) => {
        console.log(`Error occured: ${error}`);
      });
  });

program.parse(process.argv);
