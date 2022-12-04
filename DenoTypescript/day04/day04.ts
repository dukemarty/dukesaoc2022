import { numberToBytes } from "https://deno.land/std@0.167.0/node/internal_binding/buffer.ts";
import { readFileSync } from "../deps.ts";
import { isEmptyString } from "../utility.ts";
import * as aoc from "../aoc.ts";


class Sections {
    from: number
    to: number

    constructor(assignment: string){
        const tokens = assignment.split("-");
        this.from = parseInt(tokens[0]);
        this.to = parseInt(tokens[1]);
    }

    fullyContains(other: Sections){
        return other.from >= this.from && other.to <= this.to;
    }

    overlaps(other: Sections){
        return this.contains(other.from) || this.contains(other.to);
    }

    private contains(section: number){
        return this.from <= section && section <= this.to;
    }
}

class ElvesPair {

    elves: Array<Sections>

    constructor(line: string){
        this.elves = line.split(",").map( (t) => new Sections(t));
    }

    isOneFullyContained(): boolean {
        return this.elves[0].fullyContains(this.elves[1]) || this.elves[1].fullyContains(this.elves[0]);
    }

    somehowOverlaps(): boolean {
        return this.elves[0].overlaps(this.elves[1]) || this.isOneFullyContained();
    }
}

const data = readFileSync("Puzzle1.txt", "utf8");
const lines = data.split("\r\n").filter( (l) => !isEmptyString(l));
const pairs = lines.map( (l) => new ElvesPair(l));

aoc.printDayHeader(4, "Camp Cleanup");

// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Number of fully overlapping pairs");

const  containedPairs = pairs.filter( (p) => p.isOneFullyContained());
console.log("Result: ", containedPairs.length);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Number of somehow overlapping pairs");

const overlappingPairs = pairs.filter( (p) => p.somehowOverlaps());
console.log("Result: ", overlappingPairs.length);

