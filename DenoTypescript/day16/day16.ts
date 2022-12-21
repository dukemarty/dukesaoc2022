import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";
import * as geo from "../geometry.ts";


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

function copyMatrix(m: Array<Array<number>>): Array<Array<number>> {
    const res = new Array<Array<number>>();

    for (let i = 0; i < m.length; ++i) {
        res.push([...m[i]])
    }

    return res;
}

class Graph {

    size: number

    constructor(public adjMatrix: Array<Array<number>>) {
        this.size = adjMatrix.length;
    }

    flattenOutNode(nodeIndex: number) {
        const targetWithCost = this.adjMatrix[nodeIndex].map((val, idx) => [idx, val]).filter(a => a[1] != 0);
        for (let i = 0; i < this.adjMatrix.length; ++i) {
            if (this.adjMatrix[i][nodeIndex] != 0) {
                targetWithCost.forEach(a => {
                    if (this.adjMatrix[i][a[0]] == 0 || this.adjMatrix[i][nodeIndex] + this.adjMatrix[nodeIndex][a[0]] < this.adjMatrix[i][a[0]]) {
                        this.adjMatrix[i][a[0]] = this.adjMatrix[i][nodeIndex] + this.adjMatrix[nodeIndex][a[0]];
                    }
                });
                this.adjMatrix[i][nodeIndex] = 0;
            }
        }
    }
}

class Network {

    nameToIndex = new Map<string, number>();
    indexToName: Array<string>
    graph: Graph

    constructor(connections: Map<string, Array<string>>, connectionBaseCost: number) {
        this.indexToName = Array.from(connections.keys());
        for (let i = 0; i < this.indexToName.length; ++i) {
            this.nameToIndex.set(this.indexToName[i], i);
        }

        this.graph = new Graph(this.createAdjacencyMatrix(connections, connectionBaseCost))
    }

    createAdjacencyMatrix(connections: Map<string, Array<string>>, connectionCost: number): Array<Array<number>> {
        const adjMatrix = new Array<Array<number>>(this.indexToName.length);
        for (let i = 0; i < this.indexToName.length; ++i) {
            adjMatrix[i] = new Array<number>(adjMatrix.length);
        }
        for (let i = 0; i < adjMatrix.length; ++i) {
            adjMatrix[i].fill(0, 0, adjMatrix.length);
        }
        connections.forEach((val, key) => {
            val.forEach(v => adjMatrix[this.nameToIndex.get(key)!][this.nameToIndex.get(v)!] = connectionCost);
        });

        return adjMatrix;
    }

    simplify(removals: Array<string>) {
        removals.forEach(r => {
            this.graph.flattenOutNode(this.nameToIndex.get(r)!);
        });
    }

    searchMaxRelease(initialValveRates: Map<string, number>, time: number) {
        let maxRelease = 0;
        const states = new Array<SearchState>();

        const initialState = new SearchState("AA", this.graph.adjMatrix, initialValveRates, 0, 0);
        states.push(initialState);

        while (states.length > 0) {
            const nextState = states.shift()!;
            console.log(`Evaluating in ${nextState.pos} at t=${nextState.time}`);
            if (nextState.time >= 29) {
                if (nextState.accumulatedRelease > maxRelease) {
                    maxRelease = nextState!.accumulatedRelease;
                    console.log("New max release: ", maxRelease);
                }
                continue;
            }

            states.push(...this.expand(nextState));
        }

        return maxRelease;
    }

    expand(state: SearchState): Array<SearchState> {
        const res = new Array<SearchState>();

        const posIndex = this.nameToIndex.get(state.pos)!;
        for (let i = 0; i < this.graph.size; ++i) {
            if (state.graph.adjMatrix[posIndex][i] != 0) {
                if (state.valveRates.get(state.pos)! > 0) {
                    const newAdjMatrix = copyMatrix(state.graph.adjMatrix);
                    const newValveRates = new Map(state.valveRates);
                    newValveRates.set(state.pos, 0);
                    const newAccumulatedRelease = state.accumulatedRelease + (30 - state.time - 1) * state.valveRates.get(state.pos)!;
                    const firstReleaseState = new SearchState(this.indexToName[i], newAdjMatrix, newValveRates, state.time + 1 + state.graph.adjMatrix[posIndex][i], newAccumulatedRelease);
                    firstReleaseState.graph.flattenOutNode(posIndex);
                    res.push(firstReleaseState);
                }
                const gotoState = new SearchState(this.indexToName[i], state.graph.adjMatrix, state.valveRates, state.time + state.graph.adjMatrix[posIndex][i], state.accumulatedRelease);
                res.push(gotoState);
            }
        }

        return res;
    }
}

// Object.assign([], myArray);

class SearchState {
    graph: Graph

    constructor(public pos: string, adjMatrix: Array<Array<number>>, public valveRates: Map<string, number>, public time: number, public accumulatedRelease: number) {
        this.graph = new Graph(adjMatrix);
    }
}

class Cave {
    net: Network

    constructor(public valves: Array<Valve>) {
        this.net = this.createNetwork(valves);
    }

    findMaximumRelease(): number {
        const initialValveRates = new Map<string, number>();
        this.valves.forEach(v => initialValveRates.set(v.name, v.rate));
        const res = this.net.searchMaxRelease(initialValveRates, 30);
        return res;
    }

    private createNetwork(valves: Array<Valve>): Network {
        const connections = new Map<string, Array<string>>();
        valves.forEach(v => {
            connections.set(v.name, v.tunnelsTo);
        })
        const res = new Network(connections, 1);
        console.log(res.graph);
        res.simplify(valves.filter(v => v.name != "AA" && v.rate == 0).map(v => v.name));
        console.log("-------------------------");
        console.log(res.graph);

        return res;
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
const res1 = cave.findMaximumRelease();
console.log("Result: ", res1);


// // ----------------------------------------------------------------------------
// aoc.printPartHeader(2, "Distress beacons tuning frequency");

// const res2 = 0;
// console.log("Result: ", res2);
