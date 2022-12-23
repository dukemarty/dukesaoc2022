import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";
import * as geo from "../geometry.ts";


class Board {

    static moves: Array<geo.Vector> = [{ X: 1, Y: 0 }, { X: 0, Y: 1 }, { X: -1, Y: 0 }, { X: 0, Y: -1 }];

    pose: geo.Pose
    boundingBox: geo.BoundingBox
    xBounds: Array<geo.Section>
    yBounds: Array<geo.Section>

    constructor(public map: Array<string>) {
        this.boundingBox = { MinX: 0, MinY: 0, MaxY: map.length, MaxX: Math.max(...map.map(r => r.length)) };
        this.pose = this.findStartpoint();
        ({ X: this.xBounds, Y: this.yBounds } = this.findBoundaries());
    }

    runPath(path: Path) {
        path.commands.forEach(cmd => {
            this.applyCommand(cmd);
            // console.log(this.pose);
        });
    }

    private applyCommand(cmd: Command) {
        // console.log("Apply cmd: ", cmd);
        switch (cmd.type) {
            case "MOVE": {
                for (let i = 0; i < cmd.count; ++i) {
                    const nextPos = geo.movedPosition(this.pose.pos, Board.moves[this.pose.dir]);
                    this.correctPos(nextPos, this.pose.dir);
                    // console.log("Corrected Pose: ", nextPos);
                    if (this.map[nextPos.Y][nextPos.X] == ".") {
                        this.pose.pos = nextPos;
                    }
                }
                break;
            }
            case "ROT": {
                this.pose.dir = ((this.pose.dir + (cmd.dir == "L" ? -1 : +1) + 4) % 4) as geo.Orientation;
                break;
            }
        }
    }

    private correctPos(pos: geo.Position, dir: geo.Orientation) {
        const xb = this.xBounds[pos.Y];
        const yb = this.yBounds[pos.X];
        // console.log("Bounds for pos ", pos, ":  ", xb, yb);
        if (dir == 0 || dir == 2) {
            if (pos.X < xb.From) {
                pos.X = xb.To;
            }
            if (pos.X > xb.To) {
                pos.X = xb.From;
            }
        }
        if (dir == 1 || dir == 3) {
            if (pos.Y < yb.From) {
                pos.Y = yb.To;
            }
            if (pos.Y > yb.To) {
                pos.Y = yb.From;
            }
        }
    }

    private findBoundaries(): { X: Array<geo.Section>, Y: Array<geo.Section> } {
        const xbounds = this.map.map(row => new geo.Section(row.search(/\.|#/), row.length - 1));
        const ybounds = new Array<geo.Section>()
        for (let x = 0; x < this.boundingBox.MaxX; ++x) {
            ybounds.push(this.findBoundsInColumn(x));
        }

        return { X: xbounds, Y: ybounds };
    }

    private findBoundsInColumn(col: number): geo.Section {
        const from = this.map.findIndex(s => s.length > col && s[col] != " ");
        const to = this.map.findLastIndex(s => s.length > col && s[col] != " ");

        return new geo.Section(from, to);
    }

    private findStartpoint(): geo.Pose {
        const startCol = this.map[0].search(/\./);
        console.log("Start columns: ", startCol);
        return { pos: { X: startCol, Y: 0 }, dir: 0 };
    }
}

class Cube {

    static moves: Array<geo.Vector> = [{ X: 1, Y: 0 }, { X: 0, Y: 1 }, { X: -1, Y: 0 }, { X: 0, Y: -1 }];

    pose: geo.Pose
    faceSize: number
    boundingBox: geo.BoundingBox
    xBounds: Array<geo.Section>
    yBounds: Array<geo.Section>

    constructor(public map: Array<string>) {
        this.boundingBox = { MinX: 0, MinY: 0, MaxY: map.length, MaxX: Math.max(...map.map(r => r.length)) };
        this.pose = this.findStartpoint();
        this.faceSize = map.length / 3;
        ({ X: this.xBounds, Y: this.yBounds } = this.findBoundaries());
    }

    runPath(path: Path) {
        path.commands.forEach(cmd => {
            this.applyCommand(cmd);
            // console.log(this.pose);
        });
    }

    private applyCommand(cmd: Command) {
        // console.log("Apply cmd: ", cmd);
        switch (cmd.type) {
            case "MOVE": {
                for (let i = 0; i < cmd.count; ++i) {
                    const nextPos = geo.movedPosition(this.pose.pos, Board.moves[this.pose.dir]);
                    this.correctPos(nextPos, this.pose.dir);
                    // console.log("Corrected Pose: ", nextPos);
                    if (this.map[nextPos.Y][nextPos.X] == ".") {
                        this.pose.pos = nextPos;
                    }
                }
                break;
            }
            case "ROT": {
                this.pose.dir = ((this.pose.dir + (cmd.dir == "L" ? -1 : +1) + 4) % 4) as geo.Orientation;
                break;
            }
        }
    }

    private correctPos(pos: geo.Position, dir: geo.Orientation) {
        const xb = this.xBounds[pos.Y];
        const yb = this.yBounds[pos.X];
        // console.log("Bounds for pos ", pos, ":  ", xb, yb);
        if (dir == 0 || dir == 2) {
            if (pos.X < xb.From) {
                pos.X = xb.To;
            }
            if (pos.X > xb.To) {
                pos.X = xb.From;
            }
        }
        if (dir == 1 || dir == 3) {
            if (pos.Y < yb.From) {
                pos.Y = yb.To;
            }
            if (pos.Y > yb.To) {
                pos.Y = yb.From;
            }
        }
    }

    private findBoundaries(): { X: Array<geo.Section>, Y: Array<geo.Section> } {
        const xbounds = this.map.map(row => new geo.Section(row.search(/\.|#/), row.length - 1));
        const ybounds = new Array<geo.Section>()
        for (let x = 0; x < this.boundingBox.MaxX; ++x) {
            ybounds.push(this.findBoundsInColumn(x));
        }

        return { X: xbounds, Y: ybounds };
    }

    private findBoundsInColumn(col: number): geo.Section {
        const from = this.map.findIndex(s => s.length > col && s[col] != " ");
        const to = this.map.findLastIndex(s => s.length > col && s[col] != " ");

        return new geo.Section(from, to);
    }

    private findStartpoint(): geo.Pose {
        const startCol = this.map[0].search(/\./);
        console.log("Start columns: ", startCol);
        return { pos: { X: startCol, Y: 0 }, dir: 0 };
    }
}

type Command = { type: "ROT", dir: string } | { type: "MOVE", count: number };

class Path {

    commands: Array<Command>

    constructor(public raw: string) {
        this.commands = new Array<Command>();
        // const m = new RegExp(/^((?<steps>\d+)(?<turn>[LR]))*(?<laststeps>\d+)?$/, "g").exec(raw);
        const r = new RegExp(/(?<move>\d+)|(?<rot>[LR])/g);
        let m = r.exec(raw);
        while (m != null) {
            // console.log(m?.groups);
            // console.log(m);
            if (m.groups!["move"] != undefined) {
                this.commands.push({ type: "MOVE", count: parseInt(m.groups!["move"]) });
            } else if (m.groups!["rot"] != undefined) {
                this.commands.push({ type: "ROT", dir: m.groups!["rot"] });
            } else {
                console.log("ERROR parsing the path commands !!!");
            }
            m = r.exec(raw);
        }
    }
}

// ======================================================================

aoc.printDayHeader(22, "Monkey Map");

const data = io.readEmptyLineSeparatedBlocks("Sample.txt");
const path = new Path(data[1][0]);
// console.log(path);

// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Final password (position)");

const board = new Board(data[0]);
// console.log(board);
board.runPath(path);
const fp1 = board.pose;
console.log("Final pose: ", fp1);
const res1 = 1000 * (fp1.pos.Y + 1) + 4 * (fp1.pos.X + 1) + fp1.dir;
console.log("Result: ", res1);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "");

const cube = new Cube(data[0]);
console.log(cube);
// console.log(board);
cube.runPath(path);
const fp2 = cube.pose;
console.log("Final pose: ", fp2);
const res2 = 1000 * (fp2.pos.Y + 1) + 4 * (fp2.pos.X + 1) + fp2.dir;
console.log("Result: ", res2);
