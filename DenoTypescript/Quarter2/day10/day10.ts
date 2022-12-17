import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";


class InvalidCommand {
    duration: number = 0;
    valueChange: number = 0;
}

class AddCommand {
    duration: number = 2;

    constructor(public valueChange: number) { }
}

class NoOpCommand {
    duration: number = 1;
    valueChange: number = 0;
}

type Command = InvalidCommand | AddCommand | NoOpCommand;

function parseCommand(line: string): Command {
    const tokens = line.split(" ");

    if (tokens[0] === "noop") {
        return new NoOpCommand();
    } else if (tokens[0] === "addx") {
        return new AddCommand(parseInt(tokens[1]));
    } else {
        return new InvalidCommand();
    }
}

class ClockCircuit {
    x: number = 1;

    reset() {
        this.x = 1;
    }

    runProgram(commands: Array<Command>): Array<number> {
        const res = new Array<number>();

        commands.forEach((cmd) => {
            for (let i = 0; i < cmd.duration; ++i) {
                res.push(this.x)
            }
            this.x += cmd.valueChange;
        });
        res.push(this.x)

        return res;
    }
}

// ======================================================================

aoc.printDayHeader(10, "Cathode-Ray Tube");

const rawMoves = io.readUniformFilledLines("Puzzle.txt");
const commands = rawMoves.map(parseCommand);
// console.log(commands);
const circuit = new ClockCircuit();
const registerValues = circuit.runProgram(commands);
// console.log(registerValues);


// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Specific signal strength");

const requiredPoints = [20, 60, 100, 140, 180, 220];
const res1 = requiredPoints.map((p) => registerValues[p - 1] * p).reduce((acc, curr) => acc + curr, 0);
console.log("Result: ", res1);

// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "CRT output");

const parts = new Array<Array<number>>();
for (let i = 0; i < 6; ++i) {
    parts.push(registerValues.splice(0, 40));
}
const pixels = parts.map( (p) => p.map( (regVal, cycle) => {
    if (Math.abs(regVal - cycle) < 2) {
        return "#";
    } else {
        return ".";
    }
}));
const res2 = pixels.map( (l) => l.join("")).join("\n");
console.log("Result:");
console.log(res2);
