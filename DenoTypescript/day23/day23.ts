import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";
import * as geo from "../geometry.ts";



type Candidate = { pos: geo.Position, elve: number };

class Grounds {

    consideredDirs = new Array<(p: geo.Position) => geo.Position | undefined>(...[
        (p: geo.Position) => this.map[p.Y - 1][p.X - 1] != "#" && this.map[p.Y - 1][p.X] != "#" && this.map[p.Y - 1][p.X + 1] != "#" ? { X: p.X, Y: p.Y - 1 } : undefined,
        (p: geo.Position) => this.map[p.Y + 1][p.X - 1] != "#" && this.map[p.Y + 1][p.X] != "#" && this.map[p.Y + 1][p.X + 1] != "#" ? { X: p.X, Y: p.Y + 1 } : undefined,
        (p: geo.Position) => this.map[p.Y - 1][p.X - 1] != "#" && this.map[p.Y][p.X - 1] != "#" && this.map[p.Y + 1][p.X - 1] != "#" ? { X: p.X - 1, Y: p.Y } : undefined,
        (p: geo.Position) => this.map[p.Y - 1][p.X + 1] != "#" && this.map[p.Y][p.X + 1] != "#" && this.map[p.Y + 1][p.X + 1] != "#" ? { X: p.X + 1, Y: p.Y } : undefined,
    ])

    map: Array<Array<string>>
    elves = new Array<geo.Position>();
    considerationStart = 0;

    constructor(public raw: Array<string>, public padding: number) {
        this.map = new Array<Array<string>>();
        for (let i = 0; i < 2 * padding + raw.length; ++i) {
            const next = new Array<string>(2 * padding + raw[0].length);
            next.fill(".");
            this.map.push(next);
        }
        for (let i = 0; i < raw.length; ++i) {
            this.map[padding + i].splice(padding, raw[i].length, ...Array.from(raw[i]))
        }

        for (let y = 0; y < raw.length; ++y) {
            for (let x = 0; x < raw[0].length; ++x) {
                if (raw[y][x] == "#") {
                    this.elves.push({ X: x + padding, Y: y + padding });
                }
            }
        }
    }

    printMap(bb: geo.BoundingBox | undefined = undefined) {
        if (bb == undefined) {
            this.map.forEach(r => {
                console.log(r.join(""));
            })
        } else {
            for (let y = bb.MinY; y <= bb.MaxY; ++y) {
                console.log(this.map[y].slice(bb.MinX, bb.MaxX+1).join(""));
            }
        }
    }

    run(rounds: number) {
        // this.printMap();
        // console.log("============================================");
        for (let i = 0; i < rounds; ++i) {
            this.step();
            this.considerationStart = (this.considerationStart + 1) % 4;
            // this.printMap();
            // console.log("--------------------------------------------");
        }
        // console.log("============================================");
    }

    runUntilNoMove(): number {
        let i = 1;
        for (; ; ++i) {
            const moveCount = this.step();
            this.considerationStart = (this.considerationStart + 1) % 4;
            // console.log("MoveCount: ", moveCount);

            if (moveCount == 0) {
                break;
            }
        }

        return i;
    }

    findSmallestBoundingBox(): geo.BoundingBox {
        const res = {
            MinX: Math.min(...this.elves.map(p => p.X)),
            MaxX: Math.max(...this.elves.map(p => p.X)),
            MinY: Math.min(...this.elves.map(p => p.Y)),
            MaxY: Math.max(...this.elves.map(p => p.Y))
        };

        return res;
    }

    countEmptySpace(bb: geo.BoundingBox): number {
        let res = 0;
        for (let y = bb.MinY; y <= bb.MaxY; ++y) {
            for (let x = bb.MinX; x <= bb.MaxX; ++x) {
                if (this.map[y][x] == ".") {
                    ++res;
                }
            }
        }

        return res;
    }

    private step(): number {
        const candidates = new Array<Candidate>();

        // first half
        this.elves.forEach((pos, i) => {
            if (this.isAlone(pos)) { return; }
            for (let d = 0; d < 4; ++d) {
                const cand = this.consideredDirs[(this.considerationStart + d) % 4](pos);
                if (cand != undefined) {
                    // console.log(`Found cand f. (${pos.X}/${pos.Y}) with dir. ${this.considerationStart} + ${d}`);
                    candidates.push({ pos: cand, elve: i });
                    if (this.map[cand.Y][cand.X] == ".") {
                        this.map[cand.Y][cand.X] = "1";
                    } else {
                        // console.log("        ", this.map[cand.Y][cand.X]);
                        // console.log("        ", parseInt(this.map[cand.Y][cand.X]));
                        // console.log("        ", parseInt(this.map[cand.Y][cand.X]) + 1);
                        this.map[cand.Y][cand.X] = `${parseInt(this.map[cand.Y][cand.X]) + 1}`;
                    }
                    break;
                }
            }
        });
        // console.log("Candidate positions: ", candidates);

        // console.log("-------------------");
        // this.printMap();
        // console.log("-------------------");

        // second half
        let res = 0;
        const toClear = new Array<geo.Position>();
        candidates.forEach(c => {
            const count = parseInt(this.map[c.pos.Y][c.pos.X]);
            if (count == 1) {
                const elve = this.elves[c.elve];
                this.map[elve.Y][elve.X] = ".";
                elve.X = c.pos.X;
                elve.Y = c.pos.Y;
                this.map[elve.Y][elve.X] = "#";
                ++res;
            } else {
                toClear.push(c.pos);
            }
        });

        toClear.forEach(p => {
            this.map[p.Y][p.X] = ".";
        });

        return res;
    }

    private isAlone(pos: geo.Position): boolean {
        const deltas = [-1, 0, 1];
        const res = deltas.map(dx => {
            return deltas.map(dy => {
                if (dx == 0 && dy == 0) { return true; }
                return this.map[pos.Y + dy][pos.X + dx] != "#";
            }).reduce((acc, curr) => acc && curr, true);
        }).reduce((acc, curr) => acc && curr, true);

        return res;
    }

    private createCandidatePosArray(): Array<Array<Array<Candidate>>> {
        const res = new Array<Array<Array<Candidate>>>();

        for (let y = 0; y < Math.ceil(this.map.length / 10); ++y) {
            const row = new Array<Array<Candidate>>();
            for (let x = 0; x < Math.ceil(this.map[0].length) / 10; ++x) {
                row.push(new Array<Candidate>());
            }
            res.push(row);
        }

        return res;
    }
}


// ======================================================================

aoc.printDayHeader(23, "Unstable Diffusion");

const data = io.readUniformFilledLines("Puzzle.txt");

// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Empty space between elves");

const grounds1 = new Grounds(data, 5);
grounds1.run(10);
// grounds.printMap();
const bb1 = grounds1.findSmallestBoundingBox();
// grounds1.printMap(bb1);
const res1 = grounds1.countEmptySpace(bb1);
console.log("Result: ", res1);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Steps until no elves moved");

const grounds2 = new Grounds(data, 50);
const res2 = grounds2.runUntilNoMove();
console.log("Result: ", res2);
