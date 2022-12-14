import { isLowercase, chr, partitionArray, intersectSets } from "../utility.ts";
import * as io from "../ioutility.ts";
import * as aoc from "../aoc.ts";


function itemToPrio(item: string): number {
    if (isLowercase(item)){
        return chr(item) - chr('a') + 1;
    } else {
        return chr(item) - chr('A') + 27;
    }
}

class Rucksack {
    compartments: Array<string>
    allItems: Set<string>

    constructor(line: string) {
        const middle = line.length / 2;
        this.compartments = [line.slice(0, middle), line.slice(middle)];
        this.allItems = new Set<string>(Array.from(line));
    }

    findItemsInBoth(): Set<string> {
        return new Set<string>(Array.from(this.compartments[0]).filter((c) => this.compartments[1].search(c)!=-1));
    }
}


const lines = io.readUniformFilledLines("Puzzle1.txt");
// console.log("Lines: ", lines);
const sacks = lines.map((l) => new Rucksack(l) );
// console.log("Rucksacks: ", sacks);


aoc.printDayHeader(3, "Rucksack Reorganization");

// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Items in both compartments");

const items = sacks.map( (s) => s.findItemsInBoth() ).reduce( (acc: Array<string>, curr) => acc.concat(Array.from(curr.values())), []);
// console.log("Items: ", items);
const prios = items.map( (i) => itemToPrio(i));
// console.log("Prios: ", prios);
const resPart1 = prios.reduce((acc, curr) => acc + curr, 0);
console.log("Ergebnis Teil 1 (Summe der Prioritäten): ", resPart1);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Sum of evaluted badges");

const groups = partitionArray(sacks, 3);
// console.log("Groups: ", groups);
const badges = groups.map( (g) => g.slice(1).reduce( (acc, curr) => intersectSets(acc, curr.allItems), g[0].allItems));
// console.log("Badges: ", badges);
const resPart2 = badges.map( (bs) => itemToPrio(Array.from(bs.values())[0])).reduce((acc, curr) => acc + curr, 0);
console.log("Ergebnis Teil 2 (Summe der Badges): ", resPart2);


