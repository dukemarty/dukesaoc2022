import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";
import { chr } from "../utility.ts";

const posStates = ['UNSEEN', 'SEEN', 'VISITED'] as const;
type PosState = typeof posStates[number];

type Position = [number, number];

class StepInfo {

    state: PosState = 'UNSEEN';
    dist: number | undefined = undefined;

    constructor(public pred: Position, public height: number) { }
}

class PathFinder {

    start: Position
    destination: Position
    map: Array<Array<StepInfo>>

    constructor(public grid: Array<string>) {
        this.map = new Array<Array<StepInfo>>();
        for (let r = 0; r < grid.length; ++r) {
            const nextArray = new Array<StepInfo>();
            for (let c = 0; c < grid[0].length; ++c) {
                let height = chr(grid[r][c]) - chr('a');
                if (height < 0) {
                    if (grid[r][c] == 'S') {
                        height = 0;
                    } else {
                        height = 25;
                    }
                }
                nextArray.push(new StepInfo([-1, -1], height));
            }
            this.map.push(nextArray);
        }

        this.start = this.findPosition("S");
        this.destination = this.findPosition("E");

        this.map[this.start[0]][this.start[1]].state = 'SEEN';
        this.map[this.start[0]][this.start[1]].dist = 0;
    }

    findPath(): number {
        const unvisited = [this.start];
        while (unvisited.length > 0) {
            const nextPos = unvisited.splice(0, 1)[0];
            const pos = this.map[nextPos[0]][nextPos[1]];
            pos.state = 'VISITED';

            const neighbours = this.getValidNeighbours(nextPos);
            let reached = false;
            neighbours.forEach(n => {
                const cell = this.map[n[0]][n[1]];

                if (cell.state === 'VISITED') { return; }
                if (cell.state === 'SEEN') {
                    if (pos.dist! + 1 < cell.dist!) {
                        cell.dist = pos.dist! + 1;
                        cell.pred = nextPos;
                    }
                }
                if (cell.state === 'UNSEEN') {
                    cell.pred = nextPos;
                    cell.dist = pos.dist! + 1;
                    cell.state = 'SEEN';
                    unvisited.push(n);
                }

                if (n[0] == this.destination[0] && n[1] == this.destination[1]) {
                    reached = true;
                }
            });

            if (reached) {
                return this.map[this.destination[0]][this.destination[1]].dist!;
            }

            unvisited.sort((a: Position, b: Position) => this.calcHeuristic(a) - this.calcHeuristic(b));
        }

        return -1;
    }

    private calcHeuristic(p: Position): number {
        return this.map[p[0]][p[1]].dist! + (Math.abs(p[0] - this.destination[0]) + Math.abs(p[1] - this.destination[1]));
    }

    private findPosition(char: string): Position {
        for (let r = 0; r < this.grid.length; ++r) {
            for (let c = 0; c < this.grid[0].length; ++c) {
                if (this.grid[r][c] === char) {
                    return [r, c];
                }
            }
        }

        return [-1, -1];
    }

    private getValidNeighbours(pos: Position): Array<Position> {
        const res = new Array<Position>();

        if (pos[0] > 0) {
            if (this.map[pos[0] - 1][pos[1]].height - this.map[pos[0]][pos[1]].height <= 1) {
                res.push([pos[0] - 1, pos[1]]);
            }
        }
        if (pos[0] < this.map.length - 1) {
            if (this.map[pos[0] + 1][pos[1]].height - this.map[pos[0]][pos[1]].height <= 1) {
                res.push([pos[0] + 1, pos[1]]);
            }
        }
        if (pos[1] > 0) {
            if (this.map[pos[0]][pos[1] - 1].height - this.map[pos[0]][pos[1]].height <= 1) {
                res.push([pos[0], pos[1] - 1]);
            }
        }
        if (pos[1] < this.map[0].length - 1) {
            if (this.map[pos[0]][pos[1] + 1].height - this.map[pos[0]][pos[1]].height <= 1) {
                res.push([pos[0], pos[1] + 1]);
            }
        }

        return res;
    }
}


// ======================================================================

aoc.printDayHeader(12, "Hill Climbing Algorithm");

const grid = new PathFinder(io.readUniformFilledLines("Puzzle.txt"));
console.log("Start:       ", grid.start);
console.log("Destination: ", grid.destination);


// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Fewest steps path");

const path1 = grid.findPath();
console.log(path1);
// console.log(grid.map);
const res1 = 0;
console.log("Result: ", res1);


// // ----------------------------------------------------------------------------
// aoc.printPartHeader(2, "Monkey business after 10000 rounds");

// const correctionFactor = monkeys.map((m) => m.testValue).reduce((acc, curr) => acc * curr, 1);
// monkeys.forEach((m) => m.reset());
// for (let round = 0; round < 10000; ++round) {
//     for (let i = 0; i < monkeys.length; ++i) {
//         const throws = monkeys[i].inspectAllPart2(correctionFactor);
//         throws.forEach((t) => {
//             monkeys[t.targetMonkey].items.push(t.item)
//         })
//     }
//     // monkeys.forEach((m) => m.printItems());
// }
// monkeys.forEach((m) => m.printInspections());

// const sortedInspectionCounts2 = monkeys.map((m) => m.inspectionCount).toSorted((l, r) => r - l);
// const res2 = sortedInspectionCounts2[0] * sortedInspectionCounts2[1];
// console.log("Result: ", res2);

