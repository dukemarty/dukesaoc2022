import { stringToFlags } from "https://deno.land/std@0.167.0/node/internal/fs/utils.mjs";
import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";


type Position = [number, number];
type Motion = [number, number];

const directions = new Map<string, Motion>([
    ["L", [0, -1]],
    ["R", [0, 1]],
    ["U", [-1, 0]],
    ["D", [1, 0]],
]);

function parseMove(line: string): Array<Motion> {
    const parts = line.split(" ");
    const dir = directions.get(parts[0]);

    if (dir === undefined) {
        return new Array<Motion>();
    }

    const res = new Array<Motion>();

    for (let i = 0; i < parseInt(parts[1]); ++i) {
        res.push(dir);
    }

    return res;
}


class Game {

    grid: Array<Array<string>>
    posH: Position
    posT: Position

    constructor(public size: number) {
        this.grid = new Array<Array<string>>();
        for (let r = 0; r < size; ++r) {
            const newRow = new Array<string>();
            for (let c = 0; c < size; ++c) {
                newRow.push(".");
            }
            this.grid.push(newRow);
        }

        const center = Math.floor(size / 2);
        this.posH = [center, center];
        this.posT = [center, center];
    }

    runMoves(moves: Array<Motion>) {
        this.grid[this.posT[0]][this.posT[1]] = "#"
        moves.forEach((m) => {
            this.posH = [this.posH[0] + m[0], this.posH[1] + m[1]];
            const [distR, distC] = [this.posH[0] - this.posT[0], this.posH[1] - this.posT[1]];
            if (Math.abs(distR) > 1 || Math.abs(distC) > 1) {
                this.posT = [this.posT[0] + Math.ceil(Math.abs(distR) / 2) * Math.sign(distR), this.posT[1] + Math.ceil(Math.abs(distC) / 2) * Math.sign(distC)];
                // console.log(this.posT);
                this.grid[this.posT[0]][this.posT[1]] = "#"
            }
        });
    }

    countHits(): number {
        return this.grid.map((r) => r.map((c) => c == "#" ? 1 : 0).reduce((acc: number, curr) => acc + curr, 0)).reduce((acc, curr) => acc + curr, 0)
    }

    printGrid() {
        console.log(this.grid.map((r) => r.join("")).join("\n"));
    }
}


// ======================================================================

aoc.printDayHeader(9, "Rope Bridge");

const rawMoves = io.readUniformFilledLines("Puzzle.txt");
const moves = rawMoves.flatMap(parseMove);
// console.log(moves);


// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Number of visited spots");

const field = new Game(300);
field.posH = [200, 50];
field.posT = [200, 50];
field.runMoves(moves);
// field.printGrid();
const res1 = field.countHits();
console.log("Result: ", res1);

// // ----------------------------------------------------------------------------
// aoc.printPartHeader(2, "Highest scenic score");

// const scenicScores = analyzeViews(treeMap);
// const res2 = Math.max(...scenicScores.map( (r) => Math.max(...r) ))
// console.log("Result: ", res2);

