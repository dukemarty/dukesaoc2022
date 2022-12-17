import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";


type UpdateOp = (l: number, r: number) => number;

const operations = new Map<string, UpdateOp>([
    ["+", (l: number, r: number) => l + r],
    ["-", (l: number, r: number) => l - r],
    ["*", (l: number, r: number) => l * r],
    ["/", (l: number, r: number) => l / r]
]);

interface IArgument {
    getValue: (old: number) => number;
}

class ConstArgument {

    constructor(public value: number) { }

    getValue(_old: number): number {
        return this.value;
    }
}

class VarArgument {

    constructor(public varName: string) { }

    getValue(old: number): number {
        if (this.varName === "old") {
            return old;
        } else {
            return 0;
        }
    }
}

function parseArgument(argRaw: string): IArgument {
    const fix = parseInt(argRaw);
    if (isNaN(fix)) {
        return new VarArgument(argRaw);
    } else {
        return new ConstArgument(fix);
    }
}


class UpdateOperation {

    op: UpdateOp
    arg1: IArgument
    arg2: IArgument

    constructor(operationCode: string) {
        // console.log(operationCode);
        const opMatch = new RegExp("^(?<arg1>.*)\\s+(?<op>\\S)\\s+(?<arg2>.*)$", "g").exec(operationCode);
        this.op = operations.get(opMatch!.groups!["op"].trim())!;
        this.arg1 = parseArgument(opMatch!.groups!["arg1"].trim());
        this.arg2 = parseArgument(opMatch!.groups!["arg2"].trim());
    }

    run(old: number): number {
        return this.op(this.arg1.getValue(old), this.arg2.getValue(old));
    }
}


class Monkey {

    id: number
    initialItems: Array<number>
    items: Array<number>
    update: UpdateOperation
    testValue: number
    targetMap: Map<boolean, number>;
    inspectionCount = 0

    constructor(block: Array<string>) {
        const line1Match = new RegExp("^Monkey (?<id>\\d+):$", "g").exec(block[0]);
        this.id = parseInt(line1Match!.groups!["id"]);
        const line2Match = new RegExp("^\\s+Starting items: (?<items>[\\d, ]+)$", "g").exec(block[1]);
        this.initialItems = line2Match!.groups!["items"].split(", ").map((n) => parseInt(n));
        this.items = [...this.initialItems];
        const line3Match = new RegExp("^\\s+Operation:\\s+new = (?<operation>.+)$", "g").exec(block[2]);
        this.update = new UpdateOperation(line3Match!.groups!["operation"]);
        const line4Match = new RegExp("^\\s+Test: divisible by (?<value>\\d+)$", "g").exec(block[3]);
        this.testValue = parseInt(line4Match!.groups!["value"]);
        const line5Match = new RegExp("^\\s+If true: throw to monkey (?<monkeyindex>\\d+)$", "g").exec(block[4]);
        const line6Match = new RegExp("^\\s+If false: throw to monkey (?<monkeyindex>\\d+)$", "g").exec(block[5]);
        // this.throwTargetIfTrue = parseInt(line5Match!.groups!["monkeyindex"]);
        // this.throwTargetIfFalse = parseInt(line6Match!.groups!["monkeyindex"]);
        this.targetMap = new Map<boolean, number>([
            [true, parseInt(line5Match!.groups!["monkeyindex"])],
            [false, parseInt(line6Match!.groups!["monkeyindex"])]
        ]);
    }

    reset() {
        this.items = [...this.initialItems];
        this.inspectionCount = 0;
    }

    inspectAllPart1(): Array<Throw> {
        const res = this.items.map((i) => {
            const newVal = Math.floor(this.update.run(i) / 3);
            const target = this.targetMap.get(newVal % this.testValue == 0)!;
            return new Throw(target, newVal);
        })

        this.items = new Array<number>();
        this.inspectionCount += res.length;

        return res;
    }

    inspectAllPart2(correctionFactor: number): Array<Throw> {
        const res = this.items.map((i) => {
            const newVal = this.update.run(i) % correctionFactor;
            const target = this.targetMap.get(newVal % this.testValue == 0)!;
            return new Throw(target, newVal);
        })

        this.items = new Array<number>();
        this.inspectionCount += res.length;

        return res;
    }

    printItems() {
        console.log(`Monkey ${this.id}: ${this.items.join(", ")}`);
    }

    printInspections() {
        console.log(`Monkey ${this.id} inspected items ${this.inspectionCount} times.`);
    }
}


class Throw {

    constructor(public targetMonkey: number, public item: number) { }
}


// ======================================================================

aoc.printDayHeader(11, "Monkey in the Middle");

const monkeyData = io.readEmptyLineSeparatedBlocks("Puzzle.txt");
const monkeys = monkeyData.map((md) => new Monkey(md));
// monkeys.forEach((m) => m.printItems());


// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Monkey business after 20 rounds");

for (let round = 0; round < 20; ++round) {
    for (let i = 0; i < monkeys.length; ++i) {
        const throws = monkeys[i].inspectAllPart1();
        throws.forEach((t) => {
            monkeys[t.targetMonkey].items.push(t.item)
        })
    }
    // monkeys.forEach((m) => m.printItems());
}
monkeys.forEach((m) => m.printInspections());

const sortedInspectionCounts1 = monkeys.map((m) => m.inspectionCount).toSorted((l, r) => r - l);
const res1 = sortedInspectionCounts1[0] * sortedInspectionCounts1[1];
console.log("Result: ", res1);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Monkey business after 10000 rounds");

const correctionFactor = monkeys.map((m) => m.testValue).reduce((acc, curr) => acc * curr, 1);
monkeys.forEach((m) => m.reset());
for (let round = 0; round < 10000; ++round) {
    for (let i = 0; i < monkeys.length; ++i) {
        const throws = monkeys[i].inspectAllPart2(correctionFactor);
        throws.forEach((t) => {
            monkeys[t.targetMonkey].items.push(t.item)
        })
    }
    // monkeys.forEach((m) => m.printItems());
}
monkeys.forEach((m) => m.printInspections());

const sortedInspectionCounts2 = monkeys.map((m) => m.inspectionCount).toSorted((l, r) => r - l);
const res2 = sortedInspectionCounts2[0] * sortedInspectionCounts2[1];
console.log("Result: ", res2);

