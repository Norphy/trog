import { UI } from "./ui";
import { Widgets } from "blessed";
import pkg from "blessed";
const { screen, box } = pkg;

export class UIImpl implements UI {
  async setUpUIForFindText(
    fileContent: string[],
    lineNumbers: number[],
    linesBefore: number,
    linesAfter: number
  ): Promise<void> {
    let currValue = 0;
    // Create a screen object.
    const screenWid: Widgets.Screen = screen({
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
    screenWid.key(["escape", "q", "C-c"], function (_: any, __: any) {
      return process.exit(0);
    });

    //Get desired number of lines above and below the found text
    const topAndBotLimit: number[] = this.getTopAndBotLimit(
      lineNumbers[currValue],
      fileContent.length,
      linesBefore,
      linesAfter
    );
    let topCounter = topAndBotLimit[0];
    let botCounter = topAndBotLimit[1];

    //Set content of the box Widget
    boxWid.content = fileContent.slice(topCounter, botCounter + 1).join("\n");

    //Click up adds new lines
    screenWid.key(["up"], (_: any, __: any) => {
      if (topCounter <= 0) return;
      topCounter--;
      boxWid.insertLine(0, fileContent[topCounter]);
      screenWid.render();
    });

    //Click down adds new lines
    screenWid.key(["down"], function (ch: any, key: any) {
      if (botCounter >= fileContent.length - 1) return;
      botCounter++;
      boxWid.pushLine(fileContent[botCounter]);
      screenWid.render();
    });

    //Click n moves to the next find
    screenWid.key(["n"], (_: any, __: any) => {
      //Check if find number is at max of finds
      if (currValue >= lineNumbers.length - 1) return;
      currValue++;

      //Recalculate lines before and after for new find
      const topAndBotLimit: number[] = this.getTopAndBotLimit(
        lineNumbers[currValue],
        fileContent.length,
        linesBefore,
        linesAfter
      );

      topCounter = topAndBotLimit[0];
      botCounter = topAndBotLimit[1];

      //Set new content
      boxWid.content = fileContent.slice(topCounter, botCounter + 1).join("\n");
      screenWid.render();
    });

    //Click p moves to the previous find
    screenWid.key(["p"], (_: any, __: any) => {
      //Check if find number is already at first find
      if (currValue === 0) return;
      currValue--;

      //Recalculate lines before and after for new find
      const topAndBotLimit: number[] = this.getTopAndBotLimit(
        lineNumbers[currValue],
        fileContent.length,
        linesBefore,
        linesAfter
      );

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
  }

  //Method gets desired above and below lines to print around our find
  getTopAndBotLimit = function (
    currLine: number,
    arraySize: number,
    maxBefore: number,
    maxAfter: number
  ): number[] {
    const result: number[] = [];
    const desiredBefore: number = currLine - maxBefore;
    const desiredAfter: number = +currLine + +maxAfter;

    result.push(desiredBefore >= 0 ? desiredBefore : 0);
    result.push(desiredAfter < arraySize ? desiredAfter : arraySize - 1);
    return result;
  };

  //Method creates a box that shows info (Used for key interactions).
  getBoxInfo = function (content: string, distFromLeft: string) {
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
}
