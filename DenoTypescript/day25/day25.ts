import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";
import * as geo from "../geometry.ts";


const snafuDigit2Number = new Map<string, number>([
    ["2", 2],
    ["1", 1],
    ["0", 0],
    ["-", -1],
    ["=", -2]
]);

const number2SnafuDigit = new Map<number, string>([
    [2, "2"],
    [1, "1"],
    [0, "0"],
    [-1, "-"],
    [-2, "="]
]);

function toBase10Digit(digit: string): number {
    return snafuDigit2Number.get(digit)!;
}

function toSnafuDigit(digit: number): string {
    return number2SnafuDigit.get(digit)!;
}

function convertSnafuToNumber(snafu: string): number {
    let res = 0;
    let place = 1;
    Array.from(snafu).toReversed().forEach(d => {
        res += place * toBase10Digit(d);
        place *= 5;
    })

    return res;
}

function convertNumberToSnafu(n: number): string {
    const resArr = new Array<number>();
    const baseExp = Math.trunc(Math.log(n) / Math.log(5));
    let place = Math.pow(5, baseExp);
    while (true) {
        // for (let i = 0; i < 6; ++i) {
        // console.log("n=", n, "     place=", place);
        if (Math.abs(n) < 2 * (place / 5)) {
            resArr.push(0);
        } else {
            const rem1 = Math.abs(Math.abs(n) - place);
            const rem2 = Math.abs(Math.abs(n) - 2 * place);
            const nextBase = rem1 < rem2 ? 1 : 2;
            const next = Math.sign(n) * nextBase;
            resArr.push(next);
            n -= next * place;
        }
        // console.log("     ---> ", resArr[resArr.length - 1]);

        if (place == 1) { break; }
        place /= 5;
    }

    return resArr.map(toSnafuDigit).join("");
}


// ======================================================================

aoc.printDayHeader(25, "Full of Hot Air");

const data = io.readUniformFilledLines("Puzzle.txt");
// console.log(data);

// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "SNAFU of summed fuel");

const fuelSum = data.map(convertSnafuToNumber).reduce((acc, curr) => acc + curr, 0);
// console.log(fuelSum);
const res1 = convertNumberToSnafu(fuelSum);
console.log("Result: ", res1);


// // ----------------------------------------------------------------------------
// aoc.printPartHeader(2, "Steps until no elves moved");

// const grounds2 = new Grounds(data, 50);
// const res2 = grounds2.runUntilNoMove();
// console.log("Result: ", res2);
