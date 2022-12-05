import { readFileSync } from "./deps.ts";
import { isEmptyString } from "./utility.ts"

export function readUniformFilledLines(filename: string): Array<string> {
    const data = readFileSync(filename, "utf8");
    const lines = data.split("\r\n").filter((l) => !isEmptyString(l));

    return lines;
}

export function readEmptyLineSeparatedBlocks(filename: string): Array<Array<string>> {
    const data = readFileSync(filename, 'utf8');
    const rawBlocks = data.split("\r\n\r\n").filter((b) => !isEmptyString(b));
    const blocks = rawBlocks.map((rb) => rb.split("\r\n").filter((l) => !isEmptyString(l)));

    return blocks;
}