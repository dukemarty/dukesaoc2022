import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";


const numberBlocks = io.readEmptyLineSeparatedBlocks("Sample.txt").map((b) => b.map((s) => +s));
// console.log(numberBlocks);

const sums = numberBlocks.map((na) => na.reduce((acc, curr) => acc + curr, 0));
console.log("Summen: ", sums);


aoc.printDayHeader(1, "Calorie Counting");

// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Most calories");

const highest = sums.reduce((a, b) => Math.max(a, b), -Infinity);
console.log("Maximum: ", highest);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Sum three highest calories");

const sortedNumbers: Array<number> = sums.sort((l, r) => r - l);
console.log(sortedNumbers);

const part2Result = sortedNumbers[0] + sortedNumbers[1] + sortedNumbers[2];
console.log("Sum of 3 highest calories: ", part2Result);
