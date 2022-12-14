import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";


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

function mymax(a: Array<number>): number {
    let r = a[0];
    for (let i = 1; i < a.length; ++i) {
        if (a[i] > r) {
            r = a[i];
        }
    }

    return r;
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
        const shortStates = new Map<string, SearchState>();
        const processedShorts = new Map<string, ShortSingleState>();

        const initialState = new SearchState("AA", this.nameToIndex, this.graph.shortAdjMatrix, initialValveRates, 0, 0);
        states.push(initialState);
        shortStates.set(initialState.short.val, initialState);

        while (states.length > 0) {
            states.sort((a, b) => b.heuristic - a.heuristic);
            const nextState = states.shift()!;
            shortStates.delete(nextState.short.val);
            // console.log(`eval. ${nextState.accumulatedRelease}/${nextState.heuristic} vs. best: ${maxRelease}`);
            if (nextState.heuristic + 10 < maxRelease) {
                // console.log("Found stop condition:");
                // console.log(`    eval. ${nextState.accumulatedRelease}/${nextState.heuristic} vs. best: ${maxRelease}`);
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
                }
                continue;
            }

            const expansion = this.expand(nextState);
            const newStates = new Array<SearchState>();
            for (let i = 0; i < expansion.length; ++i) {
                const stateToCheck = expansion[i];
                // const rateNamesToCheck = Array.from(stateToCheck.valveRates.keys());
                // const eqState = states.find((s, idx) => {
                //     const eqPos = stateToCheck.pos == s.pos;
                //     const eqTime = stateToCheck.time == s.time;
                //     const eqRates = rateNamesToCheck.map(name => stateToCheck.valveRates.get(name) == s.valveRates.get(name)).reduce((acc, curr) => acc && curr, true);
                //     return eqPos && eqTime && eqRates;
                // });
                // if (eqState == undefined) {
                if (!shortStates.has(stateToCheck.short.val)) {
                    const short = new ShortSingleState(stateToCheck);
                    const procEqState = processedShorts.has(short.val);
                    if (!procEqState) {
                        newStates.push(stateToCheck);
                        processedShorts.set(short.val, short);
                    } else {
                        const procEqShortState = processedShorts.get(short.val)!;
                        if (stateToCheck.accumulatedRelease > procEqShortState.accumulatedRelease) {
                            newStates.push(stateToCheck);
                            processedShorts.set(short.val, short);
                        } else {
                            // console.log("Already processed better version of state");
                        }
                    }
                } else {
                    const eqState = shortStates.get(stateToCheck.short.val)!;
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
        }

        return maxRelease;
    }

    searchMaxReleaseByPair(initialValveRates: Map<string, number>, time: number): number {
        let maxRelease = 0;
        const states = new Array<SearchPairState>();
        const heuristics = new Array<number>();
        const shortStates = new Map<string, SearchPairState>();
        const processedShorts = new Map<string, ShortPairState>();

        const initialState = new SearchPairState("AA", "AA", this.nameToIndex, this.graph.shortAdjMatrix, initialValveRates, 0, 0, 0, time);
        states.push(initialState);
        shortStates.set(initialState.short.val1, initialState);
        shortStates.set(initialState.short.val2, initialState);
        heuristics.push(initialState.heuristic);

        let count = 0;
        while (states.length > 0) {
            ++count;
            const maxHeuristic = mymax(heuristics);
            const hi = heuristics.findIndex(h => h == maxHeuristic);
            heuristics.splice(hi, 1);
            const ni = states.findIndex(s => s.heuristic == maxHeuristic);
            const nextState = states[ni];
            states.splice(ni, 1);
            shortStates.delete(nextState.short.val1);
            shortStates.delete(nextState.short.val2);
            // console.log(`eval. ${nextState.accumulatedRelease}/${nextState.heuristic} vs. best: ${maxRelease}`);
            if (nextState.heuristic + 10 < maxRelease) {
                console.log("Found stop condition:");
                console.log(`    eval. ${nextState.accumulatedRelease}/${nextState.heuristic} vs. best: ${maxRelease}`);
                break;
            }
            // console.log(`Evaluating in ${nextState.pos} at t=${nextState.time}: ${nextState.accumulatedRelease}`);
            // console.log(nextState);
            if (count % 5000 == 0) {
                console.log(`    eval. ${nextState.accumulatedRelease}/${nextState.heuristic} vs. best: ${maxRelease} (len = ${states.length})`);
            }
            if ((nextState.time1 >= time && nextState.time2 >= time) || Math.max(...nextState.valveRates.values()) == 0) {
                if (nextState.accumulatedRelease > maxRelease) {
                    maxRelease = nextState!.accumulatedRelease;
                    console.log("New max release: ", maxRelease);
                }
                continue;
            }

            const expansion = this.expandPair(nextState, time);
            const newStates = new Array<SearchPairState>();
            for (let i = 0; i < expansion.length; ++i) {
                const stateToCheck = expansion[i];
                // console.log(`  stateToCheck: ${stateToCheck.short.val1} / ${stateToCheck.short.val2}`);
                if (!shortStates.has(stateToCheck.short.val1)) {
                    const procEqState = processedShorts.has(stateToCheck.short.val1);
                    if (!procEqState) {
                        newStates.push(stateToCheck);
                        processedShorts.set(stateToCheck.short.val1, stateToCheck.short);
                        processedShorts.set(stateToCheck.short.val2, stateToCheck.short);
                    } else {
                        const procEqShortState = processedShorts.get(stateToCheck.short.val1)!;
                        // console.log(`    Found: ${procEqShortState.val1}`);
                        if (stateToCheck.accumulatedRelease > procEqShortState.accumulatedRelease) {
                            newStates.push(stateToCheck);
                            processedShorts.set(stateToCheck.short.val1, stateToCheck.short);
                            processedShorts.set(stateToCheck.short.val2, stateToCheck.short);
                            // console.log("Improved version of processed state found");
                        } else {
                            // console.log("Already processed better version of state");
                        }
                    }
                } else {
                    const eqState = shortStates.get(stateToCheck.short.val1)!;
                    if (stateToCheck.accumulatedRelease > eqState.accumulatedRelease) {
                        eqState.accumulatedRelease = stateToCheck.accumulatedRelease;
                        const hi = heuristics.findIndex(h => h == eqState.heuristic);
                        heuristics.splice(hi, 1);
                        eqState.heuristic = stateToCheck.heuristic;
                        heuristics.push(stateToCheck.heuristic);
                        // console.log("Improved state");
                    } else {
                        // console.log("skipped worse state");
                    }
                }
            }
            states.push(...newStates);
            newStates.forEach(s => {
                shortStates.set(s.short.val1, s);
                shortStates.set(s.short.val2, s);
                heuristics.push(s.heuristic);
            })
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
                const firstReleaseState = new SearchState(newPos, this.nameToIndex, state.adjMatrix, newValveRates, newTime, newAccumulatedRelease);
                res.push(firstReleaseState);
            }
        }

        return res;
    }

    expandPair(state: SearchPairState, maxTime: number): Array<SearchPairState> {
        const res = new Array<SearchPairState>();

        if (state.time2 < state.time1) {
            const posIndex = this.nameToIndex.get(state.pos2)!;
            for (let i = 0; i < this.graph.size; ++i) {
                const newPos = this.indexToName[i];
                if (state.valveRates.get(newPos)! > 0) {
                    const newValveRates = new Map(state.valveRates);
                    newValveRates.set(newPos, 0);
                    const newTime = state.time2 + 1 + state.adjMatrix[posIndex][i];
                    let newAccumulatedRelease: number;
                    if (newTime > maxTime) {
                        newAccumulatedRelease = state.accumulatedRelease;
                    } else {
                        newAccumulatedRelease = state.accumulatedRelease + (maxTime - newTime) * state.valveRates.get(newPos)!;
                    }
                    const firstReleaseState = new SearchPairState(state.pos1, newPos, this.nameToIndex, state.adjMatrix, newValveRates, state.time1, newTime, newAccumulatedRelease, maxTime);
                    res.push(firstReleaseState);
                }
            }
        } else {
            const posIndex = this.nameToIndex.get(state.pos1)!;
            for (let i = 0; i < this.graph.size; ++i) {
                const newPos = this.indexToName[i];
                if (state.valveRates.get(newPos)! > 0) {
                    const newValveRates = new Map(state.valveRates);
                    newValveRates.set(newPos, 0);
                    const newTime = state.time1 + 1 + state.adjMatrix[posIndex][i];
                    let newAccumulatedRelease: number;
                    if (newTime > maxTime) {
                        newAccumulatedRelease = state.accumulatedRelease;
                    } else {
                        newAccumulatedRelease = state.accumulatedRelease + (maxTime - newTime) * state.valveRates.get(newPos)!;
                    }
                    const firstReleaseState = new SearchPairState(newPos, state.pos2, this.nameToIndex, state.adjMatrix, newValveRates, newTime, state.time2, newAccumulatedRelease, maxTime);
                    res.push(firstReleaseState);
                }
            }
        }

        return res;
    }
}

class ShortSingleState {
    val: string
    accumulatedRelease: number

    constructor(orig: SearchState) {
        this.val = orig.pos + orig.time + Array.from(orig.valveRates.keys()).toSorted().map(k => orig.valveRates.get(k)).join("");
        this.accumulatedRelease = orig.accumulatedRelease;
    }
}

class SearchState {

    heuristic: number
    short: ShortSingleState

    constructor(public pos: string, nameToIndex: Map<string, number>, public adjMatrix: Array<Array<number>>, public valveRates: Map<string, number>, public time: number, public accumulatedRelease: number) {
        const bestRates = Array.from(valveRates.values()).toSorted((a, b) => b - a);
        // console.log("  best rates: ", bestRates);
        let remainingTime = 30 - time;
        // console.log("  time / remaining time: ", time, remainingTime);
        let expectedAdditionalRelease = 0;
        const remainingTargets = Array.from(valveRates.keys()).filter(k => valveRates.get(k)! > 0);
        let timeStep = Math.min(...remainingTargets.map(k => adjMatrix[nameToIndex.get(pos)!][nameToIndex.get(k)!]).filter(d => d > 0));
        for (remainingTime -= timeStep, timeStep = 2; remainingTime > 0; remainingTime -= timeStep) {
            const nextRate = bestRates.shift();
            expectedAdditionalRelease += nextRate! * remainingTime;
        }
        // console.log("   g: ", expectedAdditionalRelease);
        this.heuristic = this.accumulatedRelease + expectedAdditionalRelease;

        this.short = new ShortSingleState(this);
    }
}

class ShortPairState {
    val1: string
    val2: string
    accumulatedRelease: number

    constructor(orig: SearchPairState) {
        this.val1 = orig.pos1 + orig.time1 + orig.pos2 + orig.time2 + Array.from(orig.valveRates.keys()).toSorted().map(k => orig.valveRates.get(k)).join("");
        this.val2 = orig.pos2 + orig.time2 + orig.pos1 + orig.time1 + Array.from(orig.valveRates.keys()).toSorted().map(k => orig.valveRates.get(k)).join("");
        this.accumulatedRelease = orig.accumulatedRelease;
    }
}

class SearchPairState {

    heuristic: number
    short: ShortPairState

    constructor(public pos1: string, public pos2: string, nameToIndex: Map<string, number>, public adjMatrix: Array<Array<number>>, public valveRates: Map<string, number>, public time1: number, public time2: number, public accumulatedRelease: number, maxTime: number) {
        // const avgValue = Array.from(valveRates.values()).reduce((acc, curr) => acc + curr, 0) / valveRates.size;
        const bestRates = Array.from(valveRates.values()).toSorted((a, b) => b - a);
        // console.log("  best rates: ", bestRates);
        let remainingTime1 = maxTime - time1;
        let remainingTime2 = maxTime - time2;
        // console.log("  time / remaining time: ", time, remainingTime);
        let expectedAdditionalRelease = 0;
        const remainingTargets = Array.from(valveRates.keys()).filter(k => valveRates.get(k)! > 0);
        let timeStep1 = Math.min(...remainingTargets.map(k => adjMatrix[nameToIndex.get(pos1)!][nameToIndex.get(k)!]).filter(d => d > 0));
        let timeStep2 = Math.min(...remainingTargets.map(k => adjMatrix[nameToIndex.get(pos2)!][nameToIndex.get(k)!]).filter(d => d > 0));
        while (remainingTime1 > 0 || remainingTime2 > 0) {
            const nextRate = bestRates.shift();
            if (nextRate == undefined) {
                break;
            }

            if (remainingTime2 > remainingTime1) {
                remainingTime2 -= timeStep2;
                if (remainingTime2 > 0) {
                    expectedAdditionalRelease += nextRate * remainingTime2;
                }
                timeStep2 = 2;
            } else {
                remainingTime1 -= timeStep1;
                if (remainingTime1 > 0) {
                    expectedAdditionalRelease += nextRate * remainingTime1;
                }
                timeStep1 = 2;
            }
        }
        this.heuristic = this.accumulatedRelease + expectedAdditionalRelease;

        this.short = new ShortPairState(this);
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

    findMaximumReleaseForPair(): number {
        const initialValveRates = new Map<string, number>();
        this.valves.forEach(v => initialValveRates.set(v.name, v.rate));
        const res = this.net.searchMaxReleaseByPair(initialValveRates, 26);
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
        // console.log(res.graph);

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

const cave1 = new Cave(allValves);
// console.log(cave1);
const res1 = cave1.findMaximumRelease();
// const res1 = 0;
console.log("Result: ", res1);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Maximum pressure release working with elephant");

const cave2 = new Cave(allValves);
const res2 = cave2.findMaximumReleaseForPair();
console.log("Result: ", res2);
