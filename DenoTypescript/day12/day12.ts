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
    lowpoints: Array<Position>
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

        this.start = this.findPositions("S")[0];
        this.destination = this.findPositions("E")[0];
        this.lowpoints = this.findPositions("a");
    }

    private resetMap() {
        for (let r = 0; r < this.map.length; ++r) {
            for (let c = 0; c < this.map[0].length; ++c) {
                this.map[r][c].state = 'UNSEEN'
                this.map[r][c].dist = 0;
            }
        }
    }

    findPath(start: Position): number {
        this.resetMap();

        this.map[start[0]][start[1]].state = 'SEEN';
        this.map[start[0]][start[1]].dist = 0;

        const unvisited = [start];
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

    private findPositions(char: string): Array<Position> {
        const res = new Array<Position>();

        for (let r = 0; r < this.grid.length; ++r) {
            for (let c = 0; c < this.grid[0].length; ++c) {
                if (this.grid[r][c] === char) {
                    res.push([r, c]);
                }
            }
        }

        return res;
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
console.log("#Lowpoints:   ", grid.lowpoints.length);


// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Fewest steps path");

const res1 = grid.findPath(grid.start);
console.log("Result: ", res1);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Fewest steps from best startpoint");

const startPoints = Array.from(grid.lowpoints);
startPoints.push(grid.start);

const paths2 = startPoints.map(sp => grid.findPath(sp)).filter(d => d > 0);
// console.log("  Path lengths: ", paths2);
const res2 = Math.min(...paths2);
console.log("Result: ", res2);
