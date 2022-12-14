import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";


type ComparisonResult = { res: "Correct" } | { res: "Undecided" } | { res: "Incorrect", pos: number };

class PacketPair {

    left: any[] = [];
    right: any[] = [];

    constructor(pair: string[]) {
        const left = JSON.parse(pair[0]);
        const right = JSON.parse(pair[1]);
        if (Array.isArray(left) && Array.isArray(right)) {
            this.left = left;
            this.right = right;
        }
    }

    arePacketsInCorrectOrder(): boolean {
        const compRes = this.compareLists(this.left, this.right);

        if (compRes.res === "Correct") {
            // console.log(`Result for ${this}: Correct`);
            return true;
        } else if (compRes.res === "Incorrect") {
            // console.log(`Result for ${this}: Incorrect`);
            return false;
        } else {
            // console.log(`Result for ${this}: Undecided`);
            return false;
        }
    }

    private compareObjects(l: object, r: object): ComparisonResult {
        // console.log("Types: ", typeof l, typeof r);
        if (typeof l === "number" && typeof r === "number") {
            const ln = Number(l);
            const rn = Number(r);
            // console.log("  Numbers to compare: ", ln, rn);
            if (ln < rn) {
                // console.log("    l < r => Correct");
                return { res: "Correct" };
            } else if (ln > rn) {
                return { res: "Incorrect", pos: 1 };
            }
            else {
                return { res: "Undecided" };
            }
        } else if (typeof l === "number") {
            return this.compareLists([Number(l)], r as Array<any>);
        } else if (typeof r === "number") {
            return this.compareLists(l as Array<any>, [Number(r)]);
        } else {
            return this.compareLists(l as Array<any>, r as Array<any>);
        }
    }

    // -1 if they are compared correct, otherwise index of position where incorrect
    private compareLists(llist: any[], rlist: any[]): ComparisonResult {
        // console.log("    Lists to compare: ", llist, rlist);
        for (let i = 0; i < llist.length; ++i) {
            if (i >= rlist.length) {
                return { res: "Incorrect", pos: i + 1 };
            }

            const compRes = this.compareObjects(llist[i], rlist[i]);
            if (compRes.res === "Correct") {
                return compRes;
            } else if (compRes.res === "Incorrect") {
                return { res: "Incorrect", pos: i + 1 };
            }
        }

        if (rlist.length > llist.length) {
            return { res: "Correct" };
        } else {
            return { res: "Undecided" };
        }
    }
}


// ======================================================================

aoc.printDayHeader(13, "Distress Signal");

const blocksFromFiles = io.readEmptyLineSeparatedBlocks("Puzzle.txt");
const packetPairs = blocksFromFiles.map(b => new PacketPair(b));
// console.log(packetPairs);


// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Indices sum of correct pairs");

const res1 = packetPairs.map((pair, index) => {
    if (pair.arePacketsInCorrectOrder()) { return index + 1 } else { return 0; }
}).reduce((acc, current) => acc + current, 0);
console.log("Result: ", res1);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Decoder Key");

let simpleLines = blocksFromFiles.flat();
// console.log(simpleLines);
const dividerPackets = ["[[2]]", "[[6]]"]
dividerPackets.forEach(dp => simpleLines.push(dp));
simpleLines.sort((l, r) => {
    const pair = new PacketPair([l, r]);
    const res = pair.arePacketsInCorrectOrder();
    if (res) {
        return -1;
    } else {
        return 1;
    }
});
// console.log(simpleLines);
const dividerPositions = dividerPackets.map(dp => simpleLines.findIndex(l => l === dp));
console.log("  Divider Positions: ", dividerPositions);
const res2 = dividerPositions.reduce((acc, curr) => acc * (curr + 1), 1);
console.log("Result: ", res2);

