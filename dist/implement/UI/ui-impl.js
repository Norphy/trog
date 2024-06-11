var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import pkg from "blessed";
const { screen, box, textbox, log } = pkg;
import chalk from "chalk";
export class UIImpl {
    constructor() {
        this.getRegex = (value) => {
            return RegExp(value, "gi");
        };
        this.worksAsRegex = (value) => {
            try {
                RegExp(value);
                return true;
            }
            catch (error) {
                return false;
            }
        };
        //Method gets desired above and below lines to print around our find
        this.getTopAndBotLimit = function (currLine, arraySize, maxBefore, maxAfter) {
            const result = [];
            const desiredBefore = currLine - maxBefore;
            const desiredAfter = +currLine + +maxAfter;
            result.push(desiredBefore >= 0 ? desiredBefore : 0);
            result.push(desiredAfter < arraySize ? desiredAfter : arraySize - 1);
            return result;
        };
        //Method creates a box that shows info (Used for key interactions).
        this.getBoxInfo = function (content, distFromLeft) {
            return box({
                bottom: "0",
                left: distFromLeft,
                width: "15%",
                height: "12%",
                align: "center",
                valign: "middle",
                content: content,
                border: {
                    type: "line",
                },
                style: {
                    fg: "white",
                    border: {
                        fg: "#f0f0f0",
                    },
                },
            });
        };
        this.getHighlightTextBox = function () {
            return textbox({
                label: " Highlight ",
                bottom: "0",
                right: "0",
                width: "30%",
                height: "shrink",
                valign: "middle",
                inputOnFocus: true,
                mouse: true,
                border: {
                    type: "line",
                },
                style: {
                    fg: "white",
                    border: {
                        fg: "default",
                        bg: "default",
                    },
                    focus: {
                        border: {
                            fg: "red",
                        },
                    },
                },
            });
        };
        this.getFilterTextBox = function () {
            return textbox({
                label: " Filter ",
                bottom: "0",
                left: "0",
                width: "30%",
                height: "shrink",
                valign: "middle",
                inputOnFocus: true,
                mouse: true,
                border: {
                    type: "line",
                },
                style: {
                    fg: "white",
                    border: {
                        fg: "default",
                        bg: "default",
                    },
                    focus: {
                        border: {
                            fg: "red",
                        },
                    },
                },
            });
        };
    }
    setUpUIForFindText(fileContent, lineNumbers, linesBefore, linesAfter) {
        return __awaiter(this, void 0, void 0, function* () {
            let currValue = 0;
            // Create a screen object.
            const screenWid = screen({
                smartCSR: true,
            });
            screenWid.title = "Search Window";
            //Create a box perfectly centered horizontally and vertically.
            const boxWid = box({
                alwaysScroll: true,
                scrollable: true,
                top: "0",
                right: "0",
                width: "100%",
                height: "90%",
                tags: true,
                keys: true,
                tag: true,
                scrollbar: {
                    ch: " ",
                    track: {
                        bg: "yellow",
                    },
                    style: {
                        inverse: true,
                        fg: "blue",
                    },
                },
                border: {
                    type: "line",
                },
                style: {
                    fg: "white",
                    border: {
                        fg: "#f0f0f0",
                    },
                },
            });
            // Append our box to the screen.
            screenWid.append(boxWid);
            //Create info boxes for key interactions
            const boxWidQ = this.getBoxInfo("Press q to quit.", "0%");
            const boxWidN = this.getBoxInfo("Press n to next find.", "28%");
            const boxWidUpDown = this.getBoxInfo("↑\nScroll up and down.\n↓", "56%");
            const boxWidP = this.getBoxInfo("Press p to previous find.", "85%");
            //Append boxes into our screen
            screenWid.append(boxWidQ);
            screenWid.append(boxWidN);
            screenWid.append(boxWidUpDown);
            screenWid.append(boxWidP);
            // Quit on Escape, q, or Control-C.
            screenWid.key(["escape", "q", "C-c"], function (_, __) {
                return process.exit(0);
            });
            //Get desired number of lines above and below the found text
            const topAndBotLimit = this.getTopAndBotLimit(lineNumbers[currValue], fileContent.length, linesBefore, linesAfter);
            let topCounter = topAndBotLimit[0];
            let botCounter = topAndBotLimit[1];
            //Set content of the box Widget
            boxWid.content = fileContent.slice(topCounter, botCounter + 1).join("\n");
            //Click up adds new lines
            screenWid.key(["up"], (_, __) => {
                if (topCounter <= 0)
                    return;
                topCounter--;
                boxWid.insertLine(0, fileContent[topCounter]);
                screenWid.render();
            });
            //Click down adds new lines
            screenWid.key(["down"], function (ch, key) {
                if (botCounter >= fileContent.length - 1)
                    return;
                botCounter++;
                boxWid.pushLine(fileContent[botCounter]);
                screenWid.render();
            });
            //Click n moves to the next find
            screenWid.key(["n"], (_, __) => {
                //Check if find number is at max of finds
                if (currValue >= lineNumbers.length - 1)
                    return;
                currValue++;
                //Recalculate lines before and after for new find
                const topAndBotLimit = this.getTopAndBotLimit(lineNumbers[currValue], fileContent.length, linesBefore, linesAfter);
                topCounter = topAndBotLimit[0];
                botCounter = topAndBotLimit[1];
                //Set new content
                boxWid.content = fileContent.slice(topCounter, botCounter + 1).join("\n");
                screenWid.render();
            });
            //Click p moves to the previous find
            screenWid.key(["p"], (_, __) => {
                //Check if find number is already at first find
                if (currValue === 0)
                    return;
                currValue--;
                //Recalculate lines before and after for new find
                const topAndBotLimit = this.getTopAndBotLimit(lineNumbers[currValue], fileContent.length, linesBefore, linesAfter);
                topCounter = topAndBotLimit[0];
                botCounter = topAndBotLimit[1];
                //Set new content
                boxWid.content = fileContent.slice(topCounter, botCounter + 1).join("\n");
                screenWid.render();
            });
            // Focus our element.
            boxWid.focus();
            // Render the screen.
            screenWid.render();
        });
    }
    setUpUIForTail(eventEmitter) {
        return __awaiter(this, void 0, void 0, function* () {
            let filter;
            let highlight;
            // Create a screen object.
            const screenWid = screen({
                smartCSR: true,
            });
            screenWid.title = "Trog Log Analysis";
            let scrollToBot = false;
            //Create a box perfectly centered horizontally and vertically.
            const boxWid = box({
                scrollable: true,
                scrollOnInput: true,
                alwaysScroll: true,
                top: "0",
                right: "0",
                width: "100%",
                height: "95%",
                tags: true,
                keys: true,
                mouse: true,
                tag: true,
                scrollbar: {
                    ch: " ",
                    track: {
                        bg: "yellow",
                    },
                    style: {
                        inverse: true,
                        fg: "blue",
                    },
                },
                border: {
                    type: "line",
                },
                style: {
                    fg: "white",
                    border: {
                        fg: "#f0f0f0",
                    },
                },
            });
            const scrollBotBox = box({
                top: "10%",
                left: "90%",
                width: "5%",
                height: "10%",
                align: "center",
                valign: "middle",
                content: "Scroll\n↓",
                border: {
                    type: "line",
                },
                style: {
                    fg: "white",
                    border: {
                        fg: "white",
                    },
                    focus: {},
                },
            });
            //Highlight text box
            const highlightTextBoxWid = this.getHighlightTextBox();
            // //On change to Filter text box, reset the filter text.
            highlightTextBoxWid.on("set content", () => {
                highlight = highlightTextBoxWid.content;
            });
            //Filter text box
            const filterTextBoxWid = this.getFilterTextBox();
            // //On change to Filter text box, reset the filter text.
            filterTextBoxWid.on("set content", () => {
                filter = filterTextBoxWid.content;
            });
            // Quit on Escape, q, or Control-C.
            screenWid.key(["escape", "q", "C-c"], function (_, __) {
                return process.exit(0);
            });
            //On pushes to the file, check if filter text is in new text and show it if it does.
            eventEmitter.on("change", (text) => {
                if (text.endsWith("\n"))
                    text = text.slice(0, text.length - 1);
                let matcherFilter = "";
                if (filter !== "") {
                    if (this.worksAsRegex(filter)) {
                        matcherFilter = this.getRegex(filter);
                    }
                    else {
                        matcherFilter = filter;
                    }
                }
                const matches = typeof matcherFilter === "object"
                    ? text.match(matcherFilter)
                    : text.includes(matcherFilter);
                if (matcherFilter === "" || matches) {
                    let matcherHighlight;
                    if (this.worksAsRegex(highlight)) {
                        matcherHighlight = this.getRegex(highlight);
                    }
                    else {
                        matcherHighlight = highlight;
                    }
                    text = text.replace(matcherHighlight, (value) => chalk.bgBlueBright.bold(value));
                    boxWid.pushLine(text);
                    if (scrollToBot) {
                        boxWid.setScrollPerc(100);
                    }
                    screenWid.render();
                }
            });
            //Toggle Scroll to bottom with input
            scrollBotBox.on("click", () => {
                scrollToBot = !scrollToBot;
                if (scrollToBot) {
                    scrollBotBox.style.border.fg = "red";
                }
                else {
                    scrollBotBox.style.border.fg = "white";
                }
            });
            //Properly blur and cancel text boxes when clicking other elements on the screen.
            boxWid.on("click", () => {
                filterTextBoxWid.cancel();
                highlightTextBoxWid.cancel();
            });
            scrollBotBox.on("click", () => {
                filterTextBoxWid.cancel();
                highlightTextBoxWid.cancel();
            });
            highlightTextBoxWid.on("click", () => {
                screenWid.render();
                highlightTextBoxWid.cancel();
                filterTextBoxWid.cancel();
            });
            filterTextBoxWid.on("click", () => {
                screenWid.render();
                highlightTextBoxWid.cancel();
                filterTextBoxWid.cancel();
            });
            // Append our box to the screen.
            screenWid.append(boxWid);
            screenWid.append(scrollBotBox);
            screenWid.append(filterTextBoxWid);
            screenWid.append(highlightTextBoxWid);
            screenWid.render();
        });
    }
}
//# sourceMappingURL=ui-impl.js.map