import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";
import { chr } from "../utility.ts";


function findFirstStartMarker(stream: string, size: number): number {
    const window = new Map<string, number>();
    for (let i = 0; i < 26; ++i) {
        window.set(String.fromCharCode(chr('a') + i), 0);
    }
    for (let i=0; i<size; ++i){
        window.set(stream[i], window.get(stream[i])! + 1);
    }

    for (let i = size; i < stream.length; ++i) {
        if ([...window.values()].every((v) => v < 2)) {
            return i;
        }
        window.set(stream[i-size], window.get(stream[i-size])! - 1);
        window.set(stream[i], window.get(stream[i])! + 1);
    }

    return -1;
}


const datastreams = io.readUniformFilledLines("Puzzle1.txt");
// console.log("Setup: ", state);

aoc.printDayHeader(6, "Tuning Trouble");

// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "End of first start packet marker");

for (let i = 0; i < datastreams.length; ++i) {
    // console.log("End state: ", state);
    const res1 = findFirstStartMarker(datastreams[i], 4);
    console.log(`Result 1 for stream ${i}: `, res1);
}


// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "End of first start message marker");

for (let i = 0; i < datastreams.length; ++i) {
    // console.log("End state: ", state);
    const res2 = findFirstStartMarker(datastreams[i], 14);
    console.log(`Result 2 for stream ${i}: `, res2);
}

// // ----------------------------------------------------------------------------
// aoc.printPartHeader(2, "Top crates after all moves (multiple crates)");

// moves.perform2(state2);
// // console.log("End state: ", state);
// const res2 = state2.stacks.filter((s) => s.length > 0).map((s) => s[s.length - 1]).join("");
// console.log("Result 2: ", res2);

