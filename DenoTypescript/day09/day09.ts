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


class RopeSim {

    grid: Array<Array<string>>
    pos: Array<Position>
    tailIndex: number

    constructor(public gridSize: number, public knotCount: number = 2) {
        this.grid = new Array<Array<string>>();
        for (let r = 0; r < gridSize; ++r) {
            const newRow = new Array<string>();
            for (let c = 0; c < gridSize; ++c) {
                newRow.push(".");
            }
            this.grid.push(newRow);
        }

        const center = Math.floor(gridSize / 2);
        this.pos = new Array<Position>(this.knotCount);
        for (let i = 0; i < this.knotCount; ++i) {
            this.pos[i] = [center, center];
        }
        this.tailIndex = this.knotCount - 1;
    }

    runMoves(moves: Array<Motion>) {
        this.grid[this.pos[this.tailIndex][0]][this.pos[this.tailIndex][1]] = "#"
        moves.forEach((m) => {
            this.pos[0] = [this.pos[0][0] + m[0], this.pos[0][1] + m[1]];
            for (let i = 1; i < this.knotCount; ++i) {
                const [distR, distC] = [this.pos[i - 1][0] - this.pos[i][0], this.pos[i - 1][1] - this.pos[i][1]];
                if (Math.abs(distR) > 1 || Math.abs(distC) > 1) {
                    this.pos[i] = [this.pos[i][0] + Math.ceil(Math.abs(distR) / 2) * Math.sign(distR), this.pos[i][1] + Math.ceil(Math.abs(distC) / 2) * Math.sign(distC)];
                    // console.log(this.posT);
                }
            }
            this.grid[this.pos[this.tailIndex][0]][this.pos[this.tailIndex][1]] = "#"
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
aoc.printPartHeader(1, "Number of visited spots with 2-knots-rope");

const field1 = new RopeSim(400, 2);
field1.runMoves(moves);
// field.printGrid();
const res1 = field1.countHits();
console.log("Result: ", res1);

// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Number of visited spots with 10-knots-rope");

const field2 = new RopeSim(400, 10);
field2.runMoves(moves);
// field.printGrid();
const res2 = field2.countHits();
console.log("Result: ", res2);

