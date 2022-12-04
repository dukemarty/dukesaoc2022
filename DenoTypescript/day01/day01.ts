import { readFileSync } from "../deps.ts";
import * as aoc from "../aoc.ts";


const data = readFileSync('Puzzle1.txt','utf8');
const splitted = data.split("\r\n\r\n");

const numberBlocks = splitted.map(function (block) {
    const numbers = block.split("\r\n").map( (s) => +s );

    return numbers;
});
// console.log(numberBlocks);

const sums = numberBlocks.map( (na) => na.reduce((acc,curr) => acc + curr, 0));
console.log("Summen: ", sums);


aoc.printDayHeader(1, "Calorie Counting");

// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Most calories");

const highest = sums.reduce((a, b) => Math.max(a, b), -Infinity);
console.log("Maximum: ", highest);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Sum three highest calories");

const sortedNumbers: Array<number> = sums.sort( (l,r) => r - l);
console.log(sortedNumbers);

const part2Result = sortedNumbers[0] + sortedNumbers[1] + sortedNumbers[2];
console.log("Sum of 3 highest calories: ", part2Result);
