import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";


class Directory {

    totalSize: number | undefined
    directSize: number
    subDirectories: Array<string>

    constructor(public name: string) {
        this.totalSize = undefined;
        this.directSize = 0;
        this.subDirectories = [];
    }

    addDir(dirname: string) {
        this.subDirectories.push(dirname);
    }

    addFile(size: number) {
        this.directSize += size;
    }

    calculateTotalSizes(directories: Map<string, Directory>): number {
        if (this.totalSize !== undefined) {
            return this.totalSize;
        }

        this.totalSize = this.directSize + this.subDirectories.map((d) => {
            // console.log("  Calculating total size for ", d);
            const dir = directories.get(d)!;
            return dir.calculateTotalSizes(directories);
        }).reduce((acc, curr) => acc + curr, 0);

        return this.totalSize;
    }
}

function analyzeOutput(lines: string[]): Map<string, Directory> {
    const cmdCdRgx = new RegExp("^\\$ cd (?<dirname>.*)$");
    const dirRgx = new RegExp("^dir\\s+(?<dirname>.+)$");
    const fileRgx = new RegExp("^(?<filesize>\\d+)\\s+(?<filename>.+)$");

    const directories = new Map<string, Directory>();

    let currentPath = new Array<string>();
    let currentDir: Directory;
    lines.forEach((l) => {
        switch (l[0]) {
            case "$": { // command
                const match = cmdCdRgx.exec(l);
                if (match == null || match.groups == null) { break; }
                switch (match.groups["dirname"]) {
                    case "/": {
                        currentPath = [""];
                        break;
                    }
                    case "..": {
                        currentPath.pop();
                        break;
                    }
                    default: {
                        currentPath.push(match.groups["dirname"]);
                        break;
                    }
                }
                const currentDirName = currentPath.join("/");
                if (!directories.has(currentDirName)) {
                    directories.set(currentDirName, new Directory(match.groups["dirname"]));
                }
                currentDir = directories.get(currentDirName)!;
                break;
            }
            case "d": { // dir entry
                const match = dirRgx.exec(l);
                if (match == null || match.groups == null) { break; }
                // console.log(`Directory entry: < ${match.groups["dirname"]} >`);
                currentDir.addDir(currentPath.join("/") + "/" + match.groups["dirname"]);
                break;
            }
            default: { // file entry
                const match = fileRgx.exec(l);
                if (match == null || match.groups == null) { break; }
                // console.log(`File entry: < ${match.groups["filename"]} > of size ${match.groups["filesize"]}`);
                currentDir.addFile(parseInt(match.groups["filesize"]));
                break
            }
        }
    });

    const mainDir = directories.get("")!;
    mainDir.calculateTotalSizes(directories);

    return directories;
}

const terminalOutput = io.readUniformFilledLines("Puzzle.txt");
// console.log("Setup: ", state);

aoc.printDayHeader(7, "No Space Left On Device");

const directories = analyzeOutput(terminalOutput);

// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Sum dir sizes <= 100_000");

const res1 = Array.from(directories.values()).filter((d) => d.totalSize! <= 100_000).reduce((acc, curr) => acc + curr.totalSize!, 0);
console.log("Result: ", res1);

// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Size of best dir to delete");

const unusedSpace = 70000000 - directories.get("")!.totalSize!;
const requiredSpace = 30000000 - unusedSpace;
const res2 = Math.min(...Array.from(directories.values()).filter((d) => d.totalSize! >= requiredSpace).map((d) => d.totalSize!));
console.log("Result: ", res2);

