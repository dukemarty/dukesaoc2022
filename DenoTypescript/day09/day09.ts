import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";
import * as geo from "../geometry.ts";


const directions = new Map<string, geo.Vector>([
    ["L", { X: -1, Y: 0 }],
    ["R", { X: 1, Y: 0 }],
    ["U", { X: 0, Y: -1 }],
    ["D", { X: 0, Y: 1 }],
]);

function parseMove(line: string): Array<geo.Vector> {
    const parts = line.split(" ");
    const dir = directions.get(parts[0]);

    if (dir === undefined) {
        return new Array<geo.Vector>();
    }

    const res = new Array<geo.Vector>();

    for (let i = 0; i < parseInt(parts[1]); ++i) {
        res.push(dir);
    }

    return res;
}


class RopeSim {

    grid: Array<Array<string>>
    pos: Array<geo.Position>
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
        this.pos = new Array<geo.Position>(this.knotCount);
        for (let i = 0; i < this.knotCount; ++i) {
            this.pos[i] = { X: center, Y: center };
        }
        this.tailIndex = this.knotCount - 1;
    }

    runMoves(moves: Array<geo.Vector>) {
        this.grid[this.pos[this.tailIndex].Y][this.pos[this.tailIndex].X] = "#"
        moves.forEach((m) => {
            geo.movePosition(this.pos[0], m);
            for (let i = 1; i < this.knotCount; ++i) {
                const dist = geo.getVector(this.pos[i], this.pos[i-1]);
                if (Math.abs(dist.X) > 1 || Math.abs(dist.Y) > 1) {
                    geo.transformVector(dist, c => Math.ceil(Math.abs(c) / 2) * Math.sign(c))
                    geo.movePosition(this.pos[i], dist);
                    // console.log(this.posT);
                }
            }
            this.grid[this.pos[this.tailIndex].Y][this.pos[this.tailIndex].X] = "#"
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
console.log("Result:   ", res1);

// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Number of visited spots with 10-knots-rope");

const field2 = new RopeSim(400, 10);
field2.runMoves(moves);
// field.printGrid();
const res2 = field2.countHits();
console.log("Result:   ", res2);

