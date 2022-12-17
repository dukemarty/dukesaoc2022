import * as io from "../ioutility.ts";
import * as aoc from "../aoc.ts";
import * as geo from "../geometry.ts";

class ElvesPair {

    elves: Array<geo.Section>

    constructor(line: string) {
        this.elves = line.split(",").map((t) => {
            const tokens = t.split("-");
            return new geo.Section(parseInt(tokens[0]), parseInt(tokens[1]));
        });
    }

    isOneFullyContained(): boolean {
        return geo.isOneFullyContained(this.elves[0], this.elves[1]);
    }

    somehowOverlaps(): boolean {
        return geo.areSectionsConnected(this.elves[0], this.elves[1]);
    }
}

const lines = io.readUniformFilledLines("Puzzle1.txt");
const pairs = lines.map((l) => new ElvesPair(l));

aoc.printDayHeader(4, "Camp Cleanup");

// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Number of fully overlapping pairs");

const containedPairs = pairs.filter((p) => p.isOneFullyContained());
console.log("Result:  ", containedPairs.length);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Number of somehow overlapping pairs");

const overlappingPairs = pairs.filter((p) => p.somehowOverlaps());
console.log("Result:  ", overlappingPairs.length);

