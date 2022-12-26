import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";
import { ArithmeticOperations, SimpleArithmeticOperation } from "../utility.ts";


abstract class Monkey {

    abstract tag: string

    constructor(public name: string) { }

    abstract getValue(): number;

    abstract matchToResult(targetResult: number): { next: string | undefined, result: number };
}

class NumberMonkey extends Monkey {

    tag = "Number";

    constructor(name: string, public value: number) {
        super(name);
    }

    getValue(): number {
        return this.value;
    }

    matchToResult(targetResult: number): { next: string | undefined, result: number } {
        return { next: undefined, result: targetResult };
    }
}

class TermMonkey extends Monkey {

    tag = "Term";
    public op1Value: number | undefined = undefined;
    public op2Value: number | undefined = undefined;
    op: SimpleArithmeticOperation;

    constructor(name: string, public op1: string, public op2: string, public operation: string) {
        super(name);
        this.op = ArithmeticOperations.get(operation.trim())!;
    }

    isFinished(): boolean {
        return this.op1Value != undefined && this.op2Value != undefined;
    }

    setOperand(name: string, value: number) {
        if (name == this.op1) {
            this.op1Value = value;
        } else if (name == this.op2) {
            this.op2Value = value;
        }
    }

    getValue(): number {
        if (!this.isFinished()) {
            throw new Error("monkey not ready to calc value");
        }

        return this.op(this.op1Value!, this.op2Value!);
    }

    matchToResult(targetResult: number): { next: string | undefined, result: number } {
        if (this.op1Value == undefined) {
            if (this.operation == "+") {
                return { next: this.op1, result: targetResult - this.op2Value! };
            } else if (this.operation == "-") {
                return { next: this.op1, result: targetResult + this.op2Value! };
            } else if (this.operation == "*") {
                return { next: this.op1, result: targetResult / this.op2Value! };
            } else if (this.operation == "/") {
                return { next: this.op1, result: targetResult * this.op2Value! };
            }
        } else if (this.op2Value == undefined) {
            if (this.operation == "+") {
                return { next: this.op2, result: targetResult - this.op1Value! };
            } else if (this.operation == "-") {
                return { next: this.op2, result: this.op1Value! - targetResult };
            } else if (this.operation == "*") {
                return { next: this.op2, result: targetResult / this.op1Value! };
            } else if (this.operation == "/") {
                return { next: this.op2, result: this.op1Value! / targetResult };
            }
        }

        return { next: undefined, result: targetResult };
    }
}

function parseLine(line: string, index: number): Monkey | undefined {
    // dbpl: 5
    // cczh: sllz + lgvd
    const directNumberMatch = new RegExp(/^(?<name>\w+):\s+(?<value>-?\d+)$/, "g").exec(line);
    const termMatch = new RegExp(/^(?<name>\w+):\s+(?<op1>\w+)\s*(?<op>[-+*/])\s*(?<op2>\w+)$/, "g").exec(line);
    if (directNumberMatch != null) {
        return new NumberMonkey(directNumberMatch!.groups!["name"], parseInt(directNumberMatch!.groups!["value"]));
    } else if (termMatch != null) {
        return new TermMonkey(termMatch!.groups!["name"], termMatch!.groups!["op1"], termMatch!.groups!["op2"], termMatch!.groups!["op"]);
    } else {
        console.log(`Error when parsing line ${index}: ${line}`);
    }

    return undefined;
}

class MonkeyListener {

    monkeys = new Map<string, Monkey>();
    final = new Map<string, number>();
    dependentWaiting = new Map<string, Array<string>>();

    constructor(monkeys: Array<Monkey>) {
        monkeys.forEach(m => {
            this.monkeys.set(m.name, m);
            if (m.tag == "Number") {
                this.final.set(m.name, m.getValue());
            } else if (m.tag == "Term") {
                const tm = m as TermMonkey;
                this.dependOn(tm.name, tm.op1);
                this.dependOn(tm.name, tm.op2);
            }
        });
    }

    run1(): number {
        const notinserted = Array.from(this.final.keys());
        const finished = new Map(this.final);
        const dependent = new Map(this.dependentWaiting);


        while (notinserted.length > 0) {
            const next = notinserted.shift()!;
            if (dependent.has(next)) {
                dependent.get(next)!.forEach(d => {
                    const tm = this.monkeys.get(d) as TermMonkey;
                    tm.setOperand(next, finished.get(next)!);
                    if (tm.isFinished()) {
                        finished.set(tm.name, tm.getValue());
                        notinserted.push(tm.name);
                    }
                });
                dependent.delete(next);
            }
        }

        return this.monkeys.get("root")!.getValue();
    }

    run2(): number {
        const finished = new Map(this.final);
        finished.delete("humn");
        const notinserted = Array.from(finished.keys());
        const dependent = new Map(this.dependentWaiting);

        while (notinserted.length > 0) {
            const next = notinserted.shift()!;
            if (dependent.has(next)) {
                dependent.get(next)!.forEach(d => {
                    const tm = this.monkeys.get(d) as TermMonkey;
                    tm.setOperand(next, finished.get(next)!);
                    if (tm.isFinished()) {
                        finished.set(tm.name, tm.getValue());
                        notinserted.push(tm.name);
                    }
                });
                dependent.delete(next);
            }
        }

        // console.log("--------------------------");
        // console.log(finished);
        // console.log(dependent);

        const rootNode = this.monkeys.get("root") as TermMonkey;
        // console.log(rootNode);
        const toDefine = rootNode.op1Value == undefined ? rootNode.op1 : rootNode.op2;
        let resultToMatch = rootNode.op2Value == undefined ? rootNode.op1Value! : rootNode.op2Value!;
        console.log(toDefine);
        let nextToFind = this.monkeys.get(toDefine);
        while (nextToFind != undefined) {
            // console.log(nextToFind);
            const r = nextToFind.matchToResult(resultToMatch);
            resultToMatch = r.result;
            if (r.next == undefined) {
                break;
            }

            nextToFind = this.monkeys.get(r.next);
        }

        return resultToMatch;
    }

    private dependOn(dependent: string, target: string) {
        if (!this.dependentWaiting.has(target)) {
            this.dependentWaiting.set(target, new Array<string>());
        }

        this.dependentWaiting.get(target)!.push(dependent);
    }
}

// ======================================================================

aoc.printDayHeader(21, "Monkey Math");

const data = io.readUniformFilledLines("Puzzle.txt");

// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Number yelled by root");

const monkeys1 = data.map(parseLine).filter(m => m != undefined).map(m => m as Monkey);
// console.log(monkeys1);
const ml1 = new MonkeyListener(monkeys1);
// console.log(ml1);
const res1 = ml1.run1();
console.log("Result: ", res1);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "");

const monkeys2 = data.map(parseLine).filter(m => m != undefined).map(m => m as Monkey);
// console.log(monkeys2);
const ml2 = new MonkeyListener(monkeys2);
// console.log(ml2);
const res2 = ml2.run2();
console.log("Result: ", res2);
