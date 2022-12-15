import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";


type Point = { X: number, Y: number };

type BoundingBox = { MinX: number, MaxX: number, MinY: number, MaxY: number };

class Rock {

    points: Array<Point>

    constructor(line: string) {
        const tokens = line.split("->").map(t => t.trim());
        this.points = tokens.map(t => {
            const parts = t.split(",");
            return { X: parseInt(parts[0]), Y: parseInt(parts[1]) };
        });
    }

    getBoundingBox(): BoundingBox {
        return { MinX: Math.min(...this.points.map(p => p.X)), MaxX: Math.max(...this.points.map(p => p.X)), MinY: Math.min(...this.points.map(p => p.Y)), MaxY: Math.max(...this.points.map(p => p.Y)) };
    }
}

class Cave {

    cave!: Array<Array<string>>
    closeSection: BoundingBox
    section: BoundingBox

    constructor(public rocks: Array<Rock>) {
        const boundingBoxes = rocks.map(r => r.getBoundingBox());
        boundingBoxes.push({ MinX: 500, MaxX: 500, MinY: 0, MaxY: 0 })
        this.closeSection = this.mergeBoxes(boundingBoxes);
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
                this.set(p.X, p.Y);
            } else {
                for (let i = 1; i < r.points.length; ++i) {
                    const p = r.points[i - 1];
                    const q = r.points[i];
                    if (p.X == q.X) {
                        for (let y = Math.min(p.Y, q.Y); y < Math.max(p.Y, q.Y) + 1; ++y) {
                            this.set(p.X, y);
                        }
                    } else {
                        for (let x = Math.min(p.X, q.X); x < Math.max(p.X, q.X) + 1; ++x) {
                            this.set(x, p.Y);
                        }
                    }
                }
            }
        });

        // add pour-in
        this.set(500, 0, "+");
    }

    pourSand1(): number {
        let res = 0;

        while (true) {
            let x = 500;
            let y = 0;

            let isResting = false;
            while (!isResting) {
                if (x == this.section.MinX || x == this.section.MaxX || y == this.section.MaxY) {
                    break;
                }

                if (this.isFree(x, y + 1)) {
                    ++y;
                } else if (this.isFree(x - 1, y + 1)) {
                    --x;
                    ++y;
                } else if (this.isFree(x + 1, y + 1)) {
                    ++x;
                    ++y;
                } else {
                    this.set(x, y, "o");
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
                this.set(p.X, p.Y);
            } else {
                for (let i = 1; i < r.points.length; ++i) {
                    const p = r.points[i - 1];
                    const q = r.points[i];
                    if (p.X == q.X) {
                        for (let y = Math.min(p.Y, q.Y); y < Math.max(p.Y, q.Y) + 1; ++y) {
                            this.set(p.X, y);
                        }
                    } else {
                        for (let x = Math.min(p.X, q.X); x < Math.max(p.X, q.X) + 1; ++x) {
                            this.set(x, p.Y);
                        }
                    }
                }
            }
        });

        // add pour-in
        this.set(500, 0, "+");

        // add bottom
        for (let x = this.section.MinX; x < this.section.MaxX + 1; ++x) {
            this.set(x, this.closeSection.MaxY + 2, "#");
        }
    }

    pourSand2(): number {
        let res = 0;

        while (true) {
            let x = 500;
            let y = 0;

            let isResting = false;
            while (!isResting) {
                if (this.isFree(x, y + 1)) {
                    ++y;
                } else if (this.isFree(x - 1, y + 1)) {
                    --x;
                    ++y;
                } else if (this.isFree(x + 1, y + 1)) {
                    ++x;
                    ++y;
                } else {
                    this.set(x, y, "o");
                    isResting = true;
                }
            }

            ++res;

            if (x==500 && y==0){
                break;
            }
        }

        return res;
    }

    print() {
        console.log(this.cave.map(l => l.join("")).join("\n"));
    }

    private isFree(x: number, y: number): boolean {
        // console.log(`${x}/${y} -> ${x - this.section.MinX}/${y - this.section.MinY}`);
        return this.cave[y - this.section.MinY][x - this.section.MinX] == ".";
    }

    
    private set(x: number, y: number, sym = "#") {
        // console.log(`${x}/${y} -> ${x - this.section.MinX}/${y - this.section.MinY}`);
        this.cave[y - this.section.MinY][x - this.section.MinX] = sym;
    }

    private mergeBoxes(boxes: Array<BoundingBox>): BoundingBox {
        return {
            MinX: Math.min(...boxes.map(bb => bb.MinX)),
            MaxX: Math.max(...boxes.map(bb => bb.MaxX)),
            MinY: Math.min(...boxes.map(bb => bb.MinY)),
            MaxY: Math.max(...boxes.map(bb => bb.MaxY)),
        };
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
cave.print();
console.log("Result: ", res1);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Sand until hole closed up");

cave.initializeCave2();
const res2 = cave.pourSand2();
cave.print();
console.log("Result: ", res2);
