import { readFileSync } from "../deps.ts";
import { isEmptyString } from "../utility.ts"

enum Choice {
  Unknown = 0,
  Rock = 1,
  Paper = 2,
  Scissors = 3,
}

enum Goal {
    Unknown = 255,
    Loss = -1,
    Draw = 0,
    Win = 1,
}

class Round {
  myChoice: Choice = Choice.Unknown;
  myGoal: Goal = Goal.Unknown;
  opponent: Choice = Choice.Unknown;

  constructor(opp: string, me: string) {
    this.myChoice = me[0].charCodeAt(0) - "X".charCodeAt(0) + 1;
    this.myGoal = me[0].charCodeAt(0) - "Y".charCodeAt(0);
    this.opponent = opp[0].charCodeAt(0) - "A".charCodeAt(0) + 1;
  }

  calcPointsPart1(): number {
    const basePoints = this.choicePoints(this.myChoice);
    const comparePoints = this.compareChoices();

    return basePoints + comparePoints;
  }

  choicePoints(c: Choice): number {
    const res: number = c;
    return res;
  }

  compareChoices(): number {
    if (this.myChoice == this.opponent) {
      return 3;
    }

    if (
      (this.myChoice == Choice.Rock && this.opponent == Choice.Scissors) ||
      (this.myChoice == Choice.Paper && this.opponent == Choice.Rock) ||
      (this.myChoice == Choice.Scissors && this.opponent == Choice.Paper)
    ) {
      return 6;
    }

    return 0;
  }

  calcPointsPart2(): number {
    const myChoice: Choice = ((this.opponent + this.myGoal + 2) % 3) + 1;
    const basePoints = this.choicePoints(myChoice);
    const goalPoints = 3 * (this.myGoal + 1);
    // console.log("    base/goal: ", basePoints, goalPoints);

    return basePoints + goalPoints;
  }
}

const data = readFileSync("Puzzle1.txt", "utf8");
const lines = data.split("\r\n").filter( (l) => !isEmptyString(l));
console.log("Lines: ", lines);
const rounds = lines.map((l) => {
  const tokens = l.split(" ");
  return new Round(tokens[0], tokens[1]);
});
console.log("Rounds: ", rounds);

console.log("\n\n--- Day 2: Rock Paper Scissors ---");
console.log("==================================");

// ----------------------------------------------------------------------------
console.log("Part 1: Points through the strategy");
console.log("-----------------------------------");

const pointsInRoundsP1 = rounds.map((r) => r.calcPointsPart1());
// console.log("  Points/round: ", pointsInRoundsP1);
const resPart1 = pointsInRoundsP1.reduce((acc, curr) => acc + curr, 0);

console.log("Summe: ", resPart1);


// ----------------------------------------------------------------------------
console.log("\n\nPart 2: ");
console.log("----------------------------------");

const pointsInRoundsP2 = rounds.map((r) => r.calcPointsPart2());
// console.log("  Points/round: ", pointsInRoundsP2);
const resPart2 = pointsInRoundsP2.reduce( (acc, curr) => acc + curr, 0);

console.log("Summe: ", resPart2);

