import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";
import * as geo from "../geometry.ts";


// type Range = { From: number, To: number } | undefined;


class SensorBeaconPair {

    sensor: geo.Position
    beacon: geo.Position
    dist: number

    constructor(line: string) {
        // Sensor at x=2, y=18: closest beacon is at x=-2, y=15
        const match = new RegExp(/^\s*Sensor at x=(?<sensorX>-?\d+), y=(?<sensorY>-?\d+): closest beacon is at x=(?<beaconX>-?\d+), y=(?<beaconY>-?\d+)$/, "g").exec(line);
        this.sensor = { X: parseInt(match!.groups!["sensorX"]), Y: parseInt(match!.groups!["sensorY"]) };
        this.beacon = { X: parseInt(match!.groups!["beaconX"]), Y: parseInt(match!.groups!["beaconY"]) };
        this.dist = Math.abs(this.sensor.X - this.beacon.X) + Math.abs(this.sensor.Y - this.beacon.Y);
    }

    occupationInLine(y: number): geo.Range {
        const yDist = Math.abs(y - this.sensor.Y);
        if (yDist > this.dist) {
            return undefined;
        }

        const breadth = this.dist - yDist;
        return new geo.Section(this.sensor.X - breadth, this.sensor.X + breadth);
    }
}


// ======================================================================

aoc.printDayHeader(15, "Beacon Exclusion Zone");

// const lineToEvaluate = 10;
// const boxForBeacon = { MinX: 0, MinY: 0, MaxX: 20, MaxY: 20 };
const lineToEvaluate = 2000000;
const boxForBeacon = { MinX: 0, MinY: 0, MaxX: 4000000, MaxY: 4000000 };
const rawdata = io.readUniformFilledLines("Puzzle.txt");
const readings = rawdata.map(l => new SensorBeaconPair(l));
// console.log(readings);


// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Impossible sensor positions in single line");

const occupied: Array<geo.Section> = readings.map(r => r.occupationInLine(lineToEvaluate)).filter(r => r != undefined).map(r => r as geo.Section);
// console.log(occupied);
const merged = geo.mergeSections(occupied);
// console.log(merged);
const res1 = merged.map(s => s.To - s.From + 1).reduce((acc, curr) => acc + curr, 0) - (new Set(readings.filter(r => r.beacon.Y == lineToEvaluate).map(r => r.beacon.X))).size;
console.log("Result: ", res1);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Distress beacons tuning frequency");

let pos: geo.Position | undefined = undefined;
const checkSection = new geo.Section(boxForBeacon.MinX, boxForBeacon.MaxX);
for (let y = boxForBeacon.MinY; y < boxForBeacon.MaxY; ++y) {
    const occupied: Array<geo.Section> = readings.map(r => r.occupationInLine(y)).filter(r => r != undefined).map(r => r as geo.Section);
    const merged = geo.mergeSections(occupied);
    let skip = false;
    for (let i = 0; i < merged.length; ++i) {
        if (merged[i].fullyContains(checkSection)) {
            skip = true;
            break;
        }
    }
    if (skip) { continue; }

    for (let i = 0; i < merged.length; ++i) {
        if (merged[i].overlaps(checkSection)) {
            checkSection.remove(merged[i]);
        }
    }
    if (checkSection.From!=checkSection.To){
        console.log("ERROR: more than one candidate found!");
    }
    pos = { Y: y, X: checkSection.From };
    break;
}
if (pos != undefined) {
    console.log("  Position of beacon: ", pos);
    const res2 = pos.X * 4000000 + pos.Y;
    console.log("Result: ", res2);
} else {
    console.log("Could not find beacon position!");
}
