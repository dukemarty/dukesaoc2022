import { readFileSync } from "./deps.ts";
import { isEmptyString } from "./utility.ts"

export function readUniformFilledLines(filename: string): Array<string> {
    const data = readFileSync(filename, "utf8");
    const lines = data.split("\r\n").filter((l) => !isEmptyString(l));

    return lines;
}
