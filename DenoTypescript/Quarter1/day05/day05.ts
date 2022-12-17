import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";


class State {
    stacks: Array<Array<string>>

    constructor(setup: Array<string>) {
        const length = setup[setup.length - 1].split("  ").length;
        // console.log("Stacks: ", length);
        this.stacks = new Array<Array<string>>(length);
        for (let i = 0; i < length; ++i) {
            this.stacks[i] = [];
            // console.log(`Stack at ${i}: ${this.stacks[i]}`);
            // console.log("    Substacks length: ", this.stacks[i].length);
        }
        // console.log("Stacks length: ", this.stacks.length);
        setup.slice(0, -1).reverse().forEach((l) => this.parseLine(l));
    }

    move(from: number, to: number, count = 1) {
        const crates = new Array<string>();

        for (let i = 0; i < count; ++i) {
            const crate = this.stacks[from - 1].pop();
            if (crate == undefined) {
                break;
            }
            crates.push(crate);
        }

        while (crates.length > 0) {
            const crate = crates.pop();
            if (crate == undefined) {
                break;
            }
            this.stacks[to - 1].push(crate);
        }
        // console.log("State after: ", this);
    }

    private parseLine(line: string) {
        for (let i = 0; 1 + 4 * i < line.length; ++i) {
            const crate = line[1 + 4 * i];
            // console.log(`Found crate ${crate} at ${i}`);
            if (crate != " ") {
                this.stacks[i].push(crate);
            }
        }
        // console.log("  State now: ", this);
    }
}

class SingleMove {
    public from: number
    public to: number
    public count: number

    constructor(line: string) {
        this.from = -1;
        this.to = -1;
        this.count = -1;

        this.parseMove(line);
    }

    private parseMove(line: string) {
        const match = new RegExp("^move (?<count>\\d+) from (?<from>\\d+) to (?<to>\\d+)", "g").exec(line);
        // console.log(`Match on <${line}>: `, match);
        if (match == null || match.groups == null) { return; }

        this.from = parseInt(match.groups["from"]);
        this.to = parseInt(match.groups["to"]);
        this.count = parseInt(match.groups["count"]);
    }
}

class Moves {
    moves: Array<SingleMove>

    constructor(moves: Array<string>) {
        this.moves = moves.map(s => new SingleMove(s));
    }

    perform1(state: State) {
        this.moves.forEach((m) => {
            // console.log(`Move: ${m.count} times ${m.from}->${m.to}`);
            for (let i = 0; i < m.count; ++i) {
                state.move(m.from, m.to);
                // console.log(`State after ${m.from}->${m.to}: `, state);
            }
        });
    }

    perform2(state: State) {
        this.moves.forEach((m) => {
            // console.log(`Move: ${m.count} times ${m.from}->${m.to}`);
            state.move(m.from, m.to, m.count);
            // console.log(`State after ${m.from}->${m.to} (${m.count}): `, state);
        });
    }
}

const blocks = io.readEmptyLineSeparatedBlocks("Puzzle1.txt");
const state1 = new State(blocks[0]);
const state2 = new State(blocks[0]);
const moves = new Moves(blocks[1]);
// console.log("Setup: ", state);

aoc.printDayHeader(5, "Supply Stacks");

// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Top crates after all moves (single crates)");

moves.perform1(state1);
// console.log("End state: ", state);
const res1 = state1.stacks.filter((s) => s.length > 0).map((s) => s[s.length - 1]).join("");
console.log("Result 1: ", res1);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Top crates after all moves (multiple crates)");

moves.perform2(state2);
// console.log("End state: ", state);
const res2 = state2.stacks.filter((s) => s.length > 0).map((s) => s[s.length - 1]).join("");
console.log("Result 2: ", res2);

