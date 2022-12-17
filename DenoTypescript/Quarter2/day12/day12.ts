import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";
import { chr } from "../utility.ts";
import * as geo from "../geometry.ts";

const posStates = ['UNSEEN', 'SEEN', 'VISITED'] as const;
type PosState = typeof posStates[number];

class StepInfo {

    state: PosState = 'UNSEEN';
    dist: number | undefined = undefined;

    constructor(public pred: geo.Position, public height: number) { }
}

class PathFinder {

    start: geo.Position
    destination: geo.Position
    lowpoints: Array<geo.Position>
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
                nextArray.push(new StepInfo({ X: -1, Y: -1 }, height));
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

    findPath(start: geo.Position): number {
        this.resetMap();

        this.map[start.Y][start.X].state = 'SEEN';
        this.map[start.Y][start.X].dist = 0;

        const unvisited = [start];
        while (unvisited.length > 0) {
            const nextPos = unvisited.splice(0, 1)[0];
            const pos = this.map[nextPos.Y][nextPos.X];
            pos.state = 'VISITED';

            const neighbours = this.getValidNeighbours(nextPos);
            let reached = false;
            neighbours.forEach(n => {
                const cell = this.map[n.Y][n.X];

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

                if (n.X == this.destination.X && n.Y == this.destination.Y) {
                    reached = true;
                }
            });

            if (reached) {
                return this.map[this.destination.Y][this.destination.X].dist!;
            }

            unvisited.sort((a: geo.Position, b: geo.Position) => this.calcHeuristic(a) - this.calcHeuristic(b));
        }

        return -1;
    }

    private calcHeuristic(p: geo.Position): number {
        return this.map[p.Y][p.X].dist! + (Math.abs(p.Y - this.destination.Y) + Math.abs(p.X - this.destination.X));
    }

    private findPositions(char: string): Array<geo.Position> {
        const res = new Array<geo.Position>();

        for (let r = 0; r < this.grid.length; ++r) {
            for (let c = 0; c < this.grid[0].length; ++c) {
                if (this.grid[r][c] === char) {
                    res.push({ X: c, Y: r });
                }
            }
        }

        return res;
    }

    private getValidNeighbours(pos: geo.Position): Array<geo.Position> {
        const res = new Array<geo.Position>();

        if (pos.Y > 0) {
            if (this.map[pos.Y - 1][pos.X].height - this.map[pos.Y][pos.X].height <= 1) {
                res.push(geo.movedPosition(pos, { X: 0, Y: -1 }));
            }
        }
        if (pos.Y < this.map.length - 1) {
            if (this.map[pos.Y + 1][pos.X].height - this.map[pos.Y][pos.X].height <= 1) {
                res.push(geo.movedPosition(pos, { X: 0, Y: 1 }));
            }
        }
        if (pos.X > 0) {
            if (this.map[pos.Y][pos.X - 1].height - this.map[pos.Y][pos.X].height <= 1) {
                res.push(geo.movedPosition(pos, { X: - 1, Y: 0 }));
            }
        }
        if (pos.X < this.map[0].length - 1) {
            if (this.map[pos.Y][pos.X + 1].height - this.map[pos.Y][pos.X].height <= 1) {
                res.push(geo.movedPosition(pos, { X: 1, Y: 0 }));
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
console.log("Result:   ", res1);

// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Fewest steps from best startpoint");

const startPoints = Array.from(grid.lowpoints);
startPoints.push(grid.start);

const paths2 = startPoints.map(sp => grid.findPath(sp)).filter(d => d > 0);
// console.log("  Path lengths: ", paths2);
const res2 = Math.min(...paths2);
console.log("Result:   ", res2);
