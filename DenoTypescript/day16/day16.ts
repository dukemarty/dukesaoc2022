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
    shortAdjMatrix: Array<Array<number>>

    constructor(public adjMatrix: Array<Array<number>>) {
        this.size = adjMatrix.length;

        this.shortAdjMatrix = new Array<Array<number>>();
        for (let r = 0; r < this.size; ++r) {
            const nextRow = new Array<number>();
            for (let c = 0; c < this.size; ++c) {
                if (this.adjMatrix[r][c] == 1) {
                    nextRow.push(1);
                } else {
                    nextRow.push(Number.MAX_VALUE);
                }
            }
            this.shortAdjMatrix.push(nextRow);
        }
    }

    // implementation of Floyd algorithm
    // -> https://www.inf.hs-flensburg.de/lang/algorithmen/graph/warshall.htm#:~:text=Der%20Graph%20G%20%2B%20hei%C3%9Ft%20transitive,von%203%20nach%201%20gibt.
    calcShortestPaths() {
        for (let k = 0; k < this.size; k++)
            for (let i = 0; i < this.size; i++)
                for (let j = 0; j < this.size; j++)
                    this.shortAdjMatrix[i][j] = Math.min(this.shortAdjMatrix[i][j], this.shortAdjMatrix[i][k] + this.shortAdjMatrix[k][j])
        // console.log(this.shortAdjMatrix);
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

    simplify() {
        this.graph.calcShortestPaths();
    }

    searchMaxRelease(initialValveRates: Map<string, number>, time: number) {
        let maxRelease = 0;
        const states = new Array<SearchState>();
        const processed = new Array<SearchState>();

        const initialState = new SearchState("AA", this.graph.shortAdjMatrix, initialValveRates, 0, 0);
        states.push(initialState);

        let noImprovementOfMaxReleaseCount = 0;
        while (states.length > 0) { // && noImprovementOfMaxReleaseCount < 100000) {
            states.sort((a, b) => b.heuristic - a.heuristic);
            // states.forEach(s => console.log("Heur: ", s.heuristic));
            // console.log("------------------");
            const nextState = states.shift()!;
            // console.log(`eval. ${nextState.accumulatedRelease}/${nextState.heuristic} vs. best: ${maxRelease}`);
            // if ((nextState.accumulatedRelease + 10 > maxRelease) && (nextState.heuristic + 10 < maxRelease)) {
            if (nextState.heuristic + 10 < maxRelease) {
                console.log("Found stop condition:");
                console.log(`    eval. ${nextState.accumulatedRelease}/${nextState.heuristic} vs. best: ${maxRelease}`);
                continue;
            }
            // console.log(`Evaluating in ${nextState.pos} at t=${nextState.time}: ${nextState.accumulatedRelease}`);
            // console.log(nextState);
            if (states.length % 20 == 0) {
                // console.log(states.length);
                console.log(`  eval. ${nextState.accumulatedRelease}/${nextState.heuristic} vs. best: ${maxRelease}`);
            }
            if (nextState.time >= time || Math.max(...nextState.valveRates.values()) == 0) {
                if (nextState.accumulatedRelease > maxRelease) {
                    maxRelease = nextState!.accumulatedRelease;
                    console.log("New max release: ", maxRelease);
                    noImprovementOfMaxReleaseCount = 0;
                } else {
                    ++noImprovementOfMaxReleaseCount;
                }
                continue;
            }

            const expansion = this.expand(nextState);
            const newStates = new Array<SearchState>();
            for (let i = 0; i < expansion.length; ++i) {
                const stateToCheck = expansion[i];
                const rateNamesToCheck = Array.from(stateToCheck.valveRates.keys());
                const eqState = states.find((s, idx) => {
                    const eqPos = stateToCheck.pos == s.pos;
                    const eqTime = stateToCheck.time == s.time;
                    const eqRates = rateNamesToCheck.map(name => stateToCheck.valveRates.get(name) == s.valveRates.get(name)).reduce((acc, curr) => acc && curr, true);
                    return eqPos && eqTime && eqRates;
                });
                const procEqState = processed.find((s, idx) => {
                    const eqPos = stateToCheck.pos == s.pos;
                    const eqTime = stateToCheck.time == s.time;
                    const eqRates = rateNamesToCheck.map(name => stateToCheck.valveRates.get(name) == s.valveRates.get(name)).reduce((acc, curr) => acc && curr, true);
                    return eqPos && eqTime && eqRates;
                });
                if (eqState == undefined) {
                    if (procEqState == undefined) {
                        newStates.push(stateToCheck);
                    } else {
                        if (stateToCheck.accumulatedRelease > procEqState.accumulatedRelease) {
                            newStates.push(stateToCheck);
                        } else {
                            console.log("Already processed better version of state");
                        }
                    }
                } else {
                    if (stateToCheck.accumulatedRelease > eqState.accumulatedRelease) {
                        eqState.accumulatedRelease = stateToCheck.accumulatedRelease;
                        eqState.heuristic = stateToCheck.heuristic;
                        // console.log("Improved state");
                    } else {
                        // console.log("skipped worse state");
                    }
                }
            }
            states.push(...newStates);
            processed.push(nextState);
        }

        return maxRelease;
    }

    expand(state: SearchState): Array<SearchState> {
        const res = new Array<SearchState>();

        const posIndex = this.nameToIndex.get(state.pos)!;
        for (let i = 0; i < this.graph.size; ++i) {
            const newPos = this.indexToName[i];
            if (state.valveRates.get(newPos)! > 0) {
                const newValveRates = new Map(state.valveRates);
                newValveRates.set(newPos, 0);
                const newTime = state.time + 1 + state.adjMatrix[posIndex][i];
                let newAccumulatedRelease: number;
                if (newTime > 30) {
                    newAccumulatedRelease = state.accumulatedRelease;
                } else {
                    newAccumulatedRelease = state.accumulatedRelease + (30 - newTime) * state.valveRates.get(newPos)!;
                }
                const firstReleaseState = new SearchState(newPos, state.adjMatrix, newValveRates, newTime, newAccumulatedRelease);
                res.push(firstReleaseState);
            }
        }

        return res;
    }
}

// Object.assign([], myArray);

class SearchState {

    heuristic: number

    // constructor(public pos: string, public adjMatrix: Array<Array<number>>, public valveRates: Map<string, number>, public time: number, public accumulatedRelease: number) {
    //     // const avgValue = Array.from(valveRates.values()).reduce((acc, curr) => acc + curr, 0) / valveRates.size;
    //     const bestRate = Math.max(...valveRates.values());
    //     const avgDist = (2 / 3) * adjMatrix.map(r => r.reduce((acc, curr) => acc + curr, 0)).reduce((acc, curr) => acc + curr, 0) / (adjMatrix.length * adjMatrix[0].length);
    //     const remainingTime = 30 - time;
    //     const mult = Math.ceil(remainingTime / avgDist);
    //     this.heuristic = this.accumulatedRelease + (30 - time - avgDist) * bestRate * mult;
    //     // this.heuristic = this.accumulatedRelease + (29 - time) * Math.min(...valveRates.values());
    // }

    constructor(public pos: string, public adjMatrix: Array<Array<number>>, public valveRates: Map<string, number>, public time: number, public accumulatedRelease: number) {
        // const avgValue = Array.from(valveRates.values()).reduce((acc, curr) => acc + curr, 0) / valveRates.size;
        const bestRates = Array.from(valveRates.values()).toSorted((a, b) => b - a);
        // console.log("  best rates: ", bestRates);
        let remainingTime = 30 - time;
        // console.log("  time / remaining time: ", time, remainingTime);
        let expectedAdditionalRelease = 0;
        for (remainingTime -= 2; remainingTime > 0; remainingTime -= 2) {
            const nextRate = bestRates.shift();
            expectedAdditionalRelease += nextRate! * remainingTime;
        }
        // console.log("   g: ", expectedAdditionalRelease);
        this.heuristic = this.accumulatedRelease + expectedAdditionalRelease;
        // this.heuristic = this.accumulatedRelease + (29 - time) * Math.min(...valveRates.values());
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
        // res.simplify(valves.filter(v => v.name != "AA" && v.rate == 0).map(v => v.name));
        res.simplify();
        console.log(res.graph);

        return res;
    }
}

// ======================================================================

aoc.printDayHeader(16, "Proboscidea Volcanium");

const scanOutput = io.readUniformFilledLines("Puzzle.txt");
const allValves = scanOutput.map(l => new Valve(l));
allValves[0].isStart = true;
// console.log(allValves);


// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Maximum pressure release");

const cave = new Cave(allValves);
// console.log(cave);
const res1 = cave.findMaximumRelease();
// const res1 = 0;
console.log("Result: ", res1);


// // ----------------------------------------------------------------------------
// aoc.printPartHeader(2, "Distress beacons tuning frequency");

// const res2 = 0;
// console.log("Result: ", res2);
