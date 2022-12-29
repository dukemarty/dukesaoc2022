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


// Folding formats:
// "Dog":
//         1111
//         1111
//         1111
//         1111
// 222233334444
// 222233334444
// 222233334444
// 222233334444
//     55556666
//     55556666
//     55556666
//     55556666

// "Giraffe":
//     11112222
//     11112222
//     11112222
//     11112222
//     3333
//     3333
//     3333
//     3333
// 44445555
// 44445555
// 44445555
// 44445555
// 6666
// 6666
// 6666
// 6666


class Cube {

    static moves: Array<geo.Vector> = [{ X: 1, Y: 0 }, { X: 0, Y: 1 }, { X: -1, Y: 0 }, { X: 0, Y: -1 }];

    pose: geo.Pose
    faceSize: number
    boundingBox: geo.BoundingBox
    xBounds: Array<geo.Section>
    yBounds: Array<geo.Section>
    correctPose: (pose: geo.Pose) => void

    constructor(public map: Array<string>, wrapMode: string) {
        this.boundingBox = { MinX: 0, MinY: 0, MaxY: map.length, MaxX: Math.max(...map.map(r => r.length)) };
        this.pose = this.findStartpoint();
        console.log("Map sizes: ", map.length, map[0].length);
        switch (wrapMode) {
            case "dog": {
                this.correctPose = this.correctPoseDog;
                this.faceSize = map.length / 3;
                break;
            }
            case "giraffe": {
                this.correctPose = this.correctPoseGiraffe;
                this.faceSize = map.length / 4;
                break;
            }
            default: {
                this.correctPose = this.correctPoseDog;
                this.faceSize = map.length / 3;
                break;
            }
        }
        ({ X: this.xBounds, Y: this.yBounds } = this.findBoundaries());
    }

    runPath(path: Path) {
        path.commands.forEach(cmd => {
            this.applyCommand(cmd);
            // console.log(this.pose);
        });
    }

    private applyCommand(cmd: Command) {
        console.log("Apply cmd: ", cmd);
        switch (cmd.type) {
            case "MOVE": {
                for (let i = 0; i < cmd.count; ++i) {
                    const nextPose = { pos: geo.movedPosition(this.pose.pos, Board.moves[this.pose.dir]), dir: this.pose.dir };
                    this.correctPose(nextPose);
                    // console.log("  Corrected Pose: ", nextPose);
                    if (this.map[nextPose.pos.Y][nextPose.pos.X] == ".") {
                        this.pose = nextPose;
                    }
                }
                break;
            }
            case "ROT": {
                this.performRotation(cmd.dir);
                break;
            }
        }
    }

    private correctPoseDog(pose: geo.Pose) {
        const xb = this.xBounds[pose.pos.Y];
        const yb = this.yBounds[pose.pos.X];
        if (pose.dir == 0 && pose.pos.X > xb.To) {
            if (pose.pos.Y < this.faceSize) { // left 1 -> 6
                pose.dir = 2;
                pose.pos.Y = 3 * this.faceSize - pose.pos.Y - 1;
                pose.pos.X = 4 * this.faceSize - 1;
            } else if (pose.pos.Y < 2 * this.faceSize) { // left 4 -> 6
                console.log("    left 4 -> 6");
                pose.dir = 1;
                pose.pos.X = 4 * this.faceSize - (pose.pos.Y - this.faceSize) - 1;
                pose.pos.Y = 2 * this.faceSize;
            } else { // left 6 -> 1
                pose.dir = 2;
                pose.pos.Y = this.faceSize - (pose.pos.Y - 2 * this.faceSize) - 1;
                pose.pos.X = 3 * this.faceSize - 1;
            }
        }
        if (pose.dir == 2 && pose.pos.X < xb.From) {
            if (pose.pos.Y < this.faceSize) { // left 1 -> 3
                pose.dir = 1;
                pose.pos.X = this.faceSize + pose.pos.Y;
                pose.pos.Y = this.faceSize;
            } else if (pose.pos.Y < 2 * this.faceSize) { // left 2 -> 6
                pose.dir = 3;
                pose.pos.X = 3 * this.faceSize + (pose.pos.Y - this.faceSize);
                pose.pos.Y = 3 * this.faceSize - 1;
            } else { // left 5 -> 3
                pose.dir = 3;
                pose.pos.X = 2 * this.faceSize - (pose.pos.Y - 2 * this.faceSize) - 1;
                pose.pos.Y = 2 * this.faceSize - 1;
            }
        }
        if (pose.dir == 1 && pose.pos.Y > yb.To) {
            if (pose.pos.X < this.faceSize) { // left 2 -> 5
                pose.dir = 3;
                pose.pos.X = 3 * this.faceSize - pose.pos.X - 1;
                pose.pos.Y = 3 * this.faceSize - 1;
            } else if (pose.pos.X < 2 * this.faceSize) { // left 3 -> 5
                console.log("left 3 -> 5");
                pose.dir = 0;
                pose.pos.Y = 3 * this.faceSize - (pose.pos.X - this.faceSize) - 1;
                pose.pos.X = 2 * this.faceSize;
            } else if (pose.pos.X < 3 * this.faceSize) { // left 5 -> 2
                console.log("left 5 -> 2");
                pose.dir = 3;
                pose.pos.X = this.faceSize - (pose.pos.X - 2 * this.faceSize) - 1;
                pose.pos.Y = 2 * this.faceSize - 1;
            } else { // left 6 -> 2
                pose.dir = 0;
                pose.pos.Y = this.faceSize + (this.faceSize - (pose.pos.X - 3 * this.faceSize));
                pose.pos.X = 3 * this.faceSize - 1;
            }
        }
        if (pose.dir == 3 && pose.pos.Y < yb.From) {
            if (pose.pos.X < this.faceSize) { // left 2 -> 1
                console.log("left 2 -> 1");
                pose.dir = 1;
                pose.pos.X = 2 * this.faceSize + (this.faceSize - pose.pos.X);
                pose.pos.Y = 0;
            } else if (pose.pos.X < 2 * this.faceSize) { // left 3 -> 1
                console.log("left 3 -> 1");
                console.log("    ", pose, this.faceSize);
                pose.dir = 0;
                pose.pos.Y = pose.pos.X - this.faceSize;
                pose.pos.X = 2 * this.faceSize;
            } else if (pose.pos.X < 3 * this.faceSize) { // left 1 -> 2
                console.log("left 1 -> 2");
                pose.dir = 1;
                pose.pos.X = this.faceSize - (pose.pos.X - 2 * this.faceSize);
                pose.pos.Y = this.faceSize;
            } else { // left 6 -> 4
                console.log("left 6 -> 4");
                pose.dir = 2;
                pose.pos.Y = this.faceSize + (this.faceSize - (pose.pos.X - 3 * this.faceSize));
                pose.pos.X = 3 * this.faceSize - 1;
            }
        }
    }

    private correctPoseGiraffe(pose: geo.Pose) {
        const xb = this.xBounds[pose.pos.Y];
        // const yb = this.yBounds[pose.pos.X];
        let yb: geo.Section
        if (pose.pos.X >= 0) {
            yb = this.yBounds[pose.pos.X];
        } else {
            yb = this.yBounds[0];
        }
        if (yb == undefined || yb.To == undefined) {
            console.log("Apparently could not find bounds for:", pose);
        }
        if (pose.dir == 0 && pose.pos.X > xb.To) {
            if (pose.pos.Y < this.faceSize) { // left 2 -> 5
                pose.dir = 2;
                pose.pos.Y = 3 * this.faceSize - pose.pos.Y - 1;
                pose.pos.X = 2 * this.faceSize - 1;
            } else if (pose.pos.Y < 2 * this.faceSize) { // left 3 -> 2
                // console.log("    left 3 -> 2");
                pose.dir = 3;
                pose.pos.X = 2 * this.faceSize + (pose.pos.Y - this.faceSize);
                pose.pos.Y = this.faceSize - 1;
            } else if (pose.pos.Y < 3 * this.faceSize) { // left 5 -> 2
                pose.dir = 2;
                // 2*f -> f-1, 3f-1 -> 0
                pose.pos.Y = this.faceSize - (pose.pos.Y - 2 * this.faceSize) - 1;
                pose.pos.X = 3 * this.faceSize - 1;
            } else { // left 6 -> 5
                pose.dir = 3;
                pose.pos.X = this.faceSize + (pose.pos.Y - 3 * this.faceSize);
                pose.pos.Y = 3 * this.faceSize - 1;
            }
        }
        if (pose.dir == 2 && pose.pos.X < xb.From) {
            if (pose.pos.Y < this.faceSize) { // left 1 -> 4
                pose.dir = 0;
                pose.pos.X = 3 * this.faceSize - pose.pos.Y - 1;
                pose.pos.Y = 0;
            } else if (pose.pos.Y < 2 * this.faceSize) { // left 3 -> 4
                pose.dir = 1;
                pose.pos.X = pose.pos.Y - this.faceSize;
                pose.pos.Y = 2 * this.faceSize;
            } else if (pose.pos.Y < 3 * this.faceSize) { // left 4 -> 1
                pose.dir = 0;
                pose.pos.Y = this.faceSize - (pose.pos.Y - 2 * this.faceSize) - 1;
                pose.pos.X = this.faceSize;
            } else { // left 6 -> 1
                pose.dir = 1;
                pose.pos.X = this.faceSize + (pose.pos.Y - 3 * this.faceSize);
                pose.pos.Y = 0;
            }
        }
        if (pose.dir == 1 && pose.pos.Y > yb.To) {
            if (pose.pos.X < this.faceSize) { // left 6 -> 2
                pose.dir = 1;
                pose.pos.X = 2 * this.faceSize + pose.pos.X;
                pose.pos.Y = 0;
            } else if (pose.pos.X < 2 * this.faceSize) { // left 5 -> 6
                // console.log("left 5 -> 6");
                pose.dir = 2;
                pose.pos.Y = 3 * this.faceSize - (pose.pos.X - this.faceSize) - 1;
                pose.pos.X = this.faceSize - 1;
            } else { // left 2 -> 3
                pose.dir = 2;
                pose.pos.Y = this.faceSize + (pose.pos.X - 2 * this.faceSize);
                pose.pos.X = 2 * this.faceSize - 1;
            }
        }
        if (pose.dir == 3 && pose.pos.Y < yb.From) {
            if (pose.pos.X < this.faceSize) { // left 4 -> 3
                // console.log("left 4 -> 3");
                pose.dir = 0;
                pose.pos.Y = this.faceSize + (pose.pos.X);
                pose.pos.X = this.faceSize;
            } else if (pose.pos.X < 2 * this.faceSize) { // left 1 -> 6
                // console.log("left 1 -> 6");
                pose.dir = 0;
                pose.pos.Y = 3 * this.faceSize - (pose.pos.X - this.faceSize);
                pose.pos.X = 0;
            } else { // left 2 -> 6
                // console.log("left 2 -> 6");
                pose.dir = 3;
                pose.pos.X = pose.pos.X - 2 * this.faceSize;
                pose.pos.Y = 4 * this.faceSize - 1;
            }
        }
    }

    private findBoundaries(): { X: Array<geo.Section>, Y: Array<geo.Section> } {
        const xbounds = this.map.map(row => new geo.Section(row.search(/\.|#/), row.length - 1));
        const ybounds = new Array<geo.Section>()
        for (let x = 0; x < this.boundingBox.MaxX; ++x) {
            ybounds.push(this.findBoundsInColumn(x));
        }

        // console.log("Found boundaries: ", xbounds, ybounds);
        return { X: xbounds, Y: ybounds };
    }

    private findBoundsInColumn(col: number): geo.Section {
        const from = this.map.findIndex(s => s.length > col && s[col] != " ");
        const to = this.map.findLastIndex(s => s.length > col && s[col] != " ");

        if (to == undefined) {
            console.log("no to-bound found for column ", col);
        }

        return new geo.Section(from, to);
    }

    private findStartpoint(): geo.Pose {
        const startCol = this.map[0].search(/\./);
        console.log("Start columns: ", startCol);
        return { pos: { X: startCol, Y: 0 }, dir: 0 };
    }

    private performRotation(dir: string) {
        this.pose.dir = ((this.pose.dir + (dir == "L" ? -1 : +1) + 4) % 4) as geo.Orientation;
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

const foldForm = "giraffe";
const data = io.readEmptyLineSeparatedBlocks("Puzzle.txt");
const path = new Path(data[1][0]);
// console.log(path);

// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Final password (position)");

// const board = new Board(data[0]);
// // console.log(board);
// board.runPath(path);
// const fp1 = board.pose;
// console.log("Final pose: ", fp1);
// const res1 = 1000 * (fp1.pos.Y + 1) + 4 * (fp1.pos.X + 1) + fp1.dir;
// console.log("Result: ", res1);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "");

const cube = new Cube(data[0], foldForm);
// console.log(cube);
// // console.log(board);
cube.runPath(path);
const fp2 = cube.pose;
console.log("Final pose: ", fp2);
const res2 = 1000 * (fp2.pos.Y + 1) + 4 * (fp2.pos.X + 1) + fp2.dir;
console.log("Result: ", res2);
