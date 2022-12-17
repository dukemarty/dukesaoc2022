import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";
import * as geo from "../geometry.ts";



class Rock {

    points: Array<geo.Position>

    constructor(line: string) {
        const tokens = line.split("->").map(t => t.trim());
        this.points = tokens.map(t => geo.parsePosition(t));
    }

    getBoundingBox(): geo.BoundingBox {
        return { MinX: Math.min(...this.points.map(p => p.X)), MaxX: Math.max(...this.points.map(p => p.X)), MinY: Math.min(...this.points.map(p => p.Y)), MaxY: Math.max(...this.points.map(p => p.Y)) };
    }
}

class Cave {

    cave!: Array<Array<string>>
    closeSection: geo.BoundingBox
    section: geo.BoundingBox

    constructor(public rocks: Array<Rock>) {
        const boundingBoxes = rocks.map(r => r.getBoundingBox());
        boundingBoxes.push({ MinX: 500, MaxX: 500, MinY: 0, MaxY: 0 })
        this.closeSection = geo.mergeBoundingBoxes(boundingBoxes);
        this.section = this.closeSection;
    }

    initializeCave1() {
        this.section = { MinX: this.closeSection.MinX - 3, MaxX: this.closeSection.MaxX + 3, MinY: this.closeSection.MinY, MaxY: this.closeSection.MaxY + 3 };

        this.cave = new Array<Array<string>>();
        for (let y = 0; y < this.section.MaxY + 1; ++y) {
            const nextRow = new Array<string>();
            for (let i = 0; i < this.section.MaxX - this.section.MinX + 1; ++i) {
                nextRow.push(".");
            }
            this.cave.push(nextRow);
        }

        // add rocks
        this.rocks.map(r => {
            if (r.points.length == 1) {
                const p = r.points[0];
                this.set(p);
            } else {
                for (let i = 1; i < r.points.length; ++i) {
                    const p = r.points[i - 1];
                    const q = r.points[i];
                    if (p.X == q.X) {
                        for (let y = Math.min(p.Y, q.Y); y < Math.max(p.Y, q.Y) + 1; ++y) {
                            this.set({ X: p.X, Y: y });
                        }
                    } else {
                        for (let x = Math.min(p.X, q.X); x < Math.max(p.X, q.X) + 1; ++x) {
                            this.set({ X: x, Y: p.Y });
                        }
                    }
                }
            }
        });

        // add pour-in
        this.set({ X: 500, Y: 0 }, "+");
    }

    pourSand1(): number {
        let res = 0;

        while (true) {
            let p = { X: 500, Y: 0 };

            let isResting = false;
            while (!isResting) {
                if (p.X == this.section.MinX || p.X == this.section.MaxX || p.Y == this.section.MaxY) {
                    break;
                }

                const [below, belowLeft, belowRight] = this.getPossibleTargets(p);
                if (this.isFree(below)) {
                    p = below;
                } else if (this.isFree(belowLeft)) {
                    p = belowLeft;
                } else if (this.isFree(belowRight)) {
                    p = belowRight;
                } else {
                    this.set(p, "o");
                    isResting = true;
                }
            }

            if (!isResting) {
                break;
            }

            ++res;
        }

        return res;
    }

    initializeCave2() {
        const height = this.closeSection.MaxY;
        this.section = { MinX: this.closeSection.MinX - height, MaxX: this.closeSection.MaxX + height, MinY: this.closeSection.MinY, MaxY: this.closeSection.MaxY + 3 };

        this.cave = new Array<Array<string>>();
        for (let y = 0; y < this.section.MaxY + 1; ++y) {
            const nextRow = new Array<string>();
            for (let i = 0; i < this.section.MaxX - this.section.MinX + 1; ++i) {
                nextRow.push(".");
            }
            this.cave.push(nextRow);
        }

        // add rocks
        this.rocks.map(r => {
            if (r.points.length == 1) {
                const p = r.points[0];
                this.set(p);
            } else {
                for (let i = 1; i < r.points.length; ++i) {
                    const p = r.points[i - 1];
                    const q = r.points[i];
                    if (p.X == q.X) {
                        for (let y = Math.min(p.Y, q.Y); y < Math.max(p.Y, q.Y) + 1; ++y) {
                            this.set({ X: p.X, Y: y });
                        }
                    } else {
                        for (let x = Math.min(p.X, q.X); x < Math.max(p.X, q.X) + 1; ++x) {
                            this.set({ X: x, Y: p.Y });
                        }
                    }
                }
            }
        });

        // add pour-in
        this.set({ X: 500, Y: 0 }, "+");

        // add bottom
        for (let x = this.section.MinX; x < this.section.MaxX + 1; ++x) {
            this.set({ X: x, Y: this.closeSection.MaxY + 2 }, "#");
        }
    }

    pourSand2(): number {
        let res = 0;

        while (true) {
            let p = { X: 500, Y: 0 };

            let isResting = false;
            while (!isResting) {
                const [below, belowLeft, belowRight] = this.getPossibleTargets(p);
                if (this.isFree(below)) {
                    p = below;
                } else if (this.isFree(belowLeft)) {
                    p = belowLeft;
                } else if (this.isFree(belowRight)) {
                    p = belowRight;
                } else {
                    this.set(p, "o");
                    isResting = true;
                }
            }

            ++res;

            if (p.X == 500 && p.Y == 0) {
                break;
            }
        }

        return res;
    }

    private getPossibleTargets(p: geo.Position): Array<geo.Position> {
        return [geo.movedPosition(p, { X: 0, Y: 1 }),
        geo.movedPosition(p, { X: -1, Y: 1 }),
        geo.movedPosition(p, { X: 1, Y: 1 })];
    }

    print() {
        console.log(this.cave.map(l => l.join("")).join("\n"));
    }

    private isFree(p: geo.Position): boolean {
        // console.log(`${p.X}/${p.Y} -> ${p.X - this.section.MinX}/${p.Y - this.section.MinY}`);
        return this.cave[p.Y - this.section.MinY][p.X - this.section.MinX] == ".";
    }

    private set(p: geo.Position, sym = "#") {
        // console.log(`${p.X}/${p.Y} -> ${p.X - this.section.MinX}/${p.Y - this.section.MinY}`);
        this.cave[p.Y - this.section.MinY][p.X - this.section.MinX] = sym;
    }
}

// ======================================================================

aoc.printDayHeader(14, "Regolith Reservoir");

const rawdata = io.readUniformFilledLines("Puzzle.txt");
const rocks = rawdata.map(d => new Rock(d));
// console.log(rocks);
const cave = new Cave(rocks);
// console.log(cave);
// cave.print();


// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Sand until free-flowing");

cave.initializeCave1();
const res1 = cave.pourSand1();
// cave.print();
console.log("Result:   ", res1);
// console.log("Original: ", 964);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Sand until hole closed up");

cave.initializeCave2();
const res2 = cave.pourSand2();
// cave.print();
console.log("Result:   ", res2);
// console.log("Original: ", 32041);
