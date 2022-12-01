import { readFileSync } from "https://deno.land/std@0.167.0/node/fs.ts";
import { ERROR_CTX_CONSOLE_CONNECT } from "https://deno.land/std@0.167.0/node/internal_binding/_winerror.ts";

const data = readFileSync('Puzzle1.txt','utf8');
const splitted = data.split("\r\n\r\n");

const numberBlocks = splitted.map(function (block) {
    const numbers = block.split("\r\n").map( (s) => +s );

    return numbers;
});
// console.log(numberBlocks);

const sums = numberBlocks.map( (na) => na.reduce((acc,curr) => acc + curr, 0));
console.log("Summen: ", sums);

console.log("--- Day 1: Calorie Counting ---");
console.log("===============================");

// ----------------------------------------------------------------------------
console.log("Part 1: Most calories");
console.log("---------------------");

const highest = sums.reduce((a, b) => Math.max(a, b), -Infinity);
console.log("Maximum: ", highest);


// ----------------------------------------------------------------------------
console.log("Part 2: Sum three highest calories");
console.log("----------------------------------");

const sortedNumbers: Array<number> = sums.sort( (l,r) => r - l);
console.log(sortedNumbers);

const part2Result = sortedNumbers[0] + sortedNumbers[1] + sortedNumbers[2];
console.log("Sum of 3 highest calories: ", part2Result);
