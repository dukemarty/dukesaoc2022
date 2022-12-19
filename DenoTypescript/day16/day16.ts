import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";
import * as geo from "../geometry.ts";
import { kEmptyObject } from "https://deno.land/std@0.167.0/node/internal/util.mjs";


class Valve {
    name: string
    rate: number
    tunnelsTo: Array<string>
    isStart = false;

    constructor(line: string) {
        // Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
        const match = new RegExp(/^\s*Valve (?<name>\w+) has flow rate=(?<rate>\d+); tunnels? leads? to valves? (?<tunnels>.+)$/, "g").exec(line);
        this.name = match!.groups!["name"];
        this.rate = parseInt(match!.groups!["rate"]);
        this.tunnelsTo = match!.groups!["tunnels"].split(",").map(t => t.trim());
    }
}

class Network {

    nameToIndex = new Map<string, number>();
    indexToName: Array<string>
    adjMatrix: Array<Array<number>>

    constructor(connections: Map<string, Array<string>>, connectionCost: number) {
        this.indexToName = Array.from(connections.keys());
        for (let i = 0; i < this.indexToName.length; ++i) {
            this.nameToIndex.set(this.indexToName[i], i);
        }
        // console.log(this.indexToName);
        // console.log(this.nameToIndex);

        this.adjMatrix = new Array<Array<number>>(this.indexToName.length);
        for (let i = 0; i < this.indexToName.length; ++i) {
            this.adjMatrix[i] = new Array<number>(this.adjMatrix.length);
        }
        for (let i = 0; i < this.adjMatrix.length; ++i) {
            this.adjMatrix[i].fill(0, 0, this.adjMatrix.length);
        }
        // console.log(this.adjMatrix);

        connections.forEach((val, key) => {
            val.forEach(v => this.adjMatrix[this.nameToIndex.get(key)!][this.nameToIndex.get(v)!] = connectionCost);
        });
    }

    simplify(removals: Array<string>) {
        removals.forEach(r => {
            this.removeNode(r);
        });


    }

    simplified(removals: Array<string>): Network {
        const res = this.clone();
        res.simplify(removals);

        return res;
    }

    private clone(): Network {
        const res = {
            nameToIndex: this.nameToIndex, indexToName: this.indexToName,
            adjMatrix: this.adjMatrix
        };

        return res;
    }

    private removeNode(node: string) {
        console.log("Try to remove", r, "from adjacency matrix");
    }
}

class Cave {
    net: Network

    constructor(public valves: Array<Valve>) {
        const connections = new Map<string, Array<string>>();
        valves.forEach(v => {
            connections.set(v.name, v.tunnelsTo);
        })
        this.net = new Network(connections, 1);
        this.net.simplify(valves.filter(v => v.name != "AA" && v.rate == 0).map(v => v.name));
    }
}

// ======================================================================

aoc.printDayHeader(16, "Proboscidea Volcanium");

const scanOutput = io.readUniformFilledLines("Sample.txt");
const allValves = scanOutput.map(l => new Valve(l));
allValves[0].isStart = true;
// console.log(allValves);


// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Maximum pressure release");

const cave = new Cave(allValves);
console.log(cave);
const res1 = 0;
console.log("Result: ", res1);


// // ----------------------------------------------------------------------------
// aoc.printPartHeader(2, "Distress beacons tuning frequency");

// const res2 = 0;
// console.log("Result: ", res2);
