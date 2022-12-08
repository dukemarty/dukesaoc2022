import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";


type Visibility = boolean

function analyzeHeights(trees: Array<string>): Visibility[][] {
    const res = new Array<Array<Visibility>>(trees.length);
    for (let r = 0; r < res.length; ++r) {
        res[r] = new Array<Visibility>(trees[0].length);
        for (let c = 0; c < trees[0].length; ++c) {
            res[r][c] = false;
        }
    }

    // console.log(res);
    // console.log("-------------------------------------------");

    // L -> R
    for (let r = 0; r < trees.length; ++r) {
        res[r][0] = true;
        let highest = trees[r][0];
        for (let c = 0; c < trees[0].length; ++c) {
            if (trees[r][c] > highest) {
                res[r][c] = true;
                highest = trees[r][c];
            }
        }
    }

    // console.log(res);
    // console.log("-------------------------------------------");

    // R -> L
    for (let r = 0; r < trees.length; ++r) {
        res[r][trees[0].length - 1] = true;
        let highest = trees[r][trees[0].length - 1];
        for (let c = trees[0].length - 1; c >= 0; --c) {
            if (trees[r][c] > highest) {
                res[r][c] = true;
                highest = trees[r][c];
            }
        }
    }

    // console.log(res);
    // console.log("-------------------------------------------");

    // T -> B
    for (let c = 0; c < trees[0].length; ++c) {
        res[0][c] = true;
        let highest = trees[0][c];
        for (let r = 0; r < trees.length; ++r) {
            if (trees[r][c] > highest) {
                res[r][c] = true;
                highest = trees[r][c];
            }
        }
    }

    // console.log(res);
    // console.log("-------------------------------------------");

    // B -> T
    for (let c = 0; c < trees[0].length; ++c) {
        res[trees.length - 1][c] = true;
        let highest = trees[trees.length - 1][c];
        for (let r = trees.length - 1; r >= 0; --r) {
            if (trees[r][c] > highest) {
                res[r][c] = true;
                highest = trees[r][c];
            }
        }
    }

    // console.log(res);

    return res;
}

function determineViewLength(trees: Array<string>, r: number, c:number, dir: [number, number]):number {
    let pr = r + dir[0];
    let pc = c + dir[1];
    let i=1;
    for (;; ++i){
        if (trees[pr][pc] >= trees[r][c]){
            break;
        }
        pr += dir[0];
        pc += dir[1];

        if (!(pr>=0 && pr<trees.length && pc>=0 && pc<trees[0].length)){
            break;
        }
    }

    return i;
}

function analyzeViews(trees: Array<string>): number[][] {
    const res = new Array<Array<number>>(trees.length);
    const directions: Array<[number, number]> = [ [0, 1], [1, 0], [0, -1], [-1, 0] ];
    for (let r = 0; r < res.length; ++r) {
        res[r] = new Array<number>(trees[0].length);
        for (let c = 0; c < trees[0].length; ++c) {
            res[r][c] = 0;
        }
    }

    for (let r = 1; r < trees.length - 1; ++r) {
        for (let c = 1; c < trees.length - 1; ++c) {
            const score = directions.map( (d) => determineViewLength(trees, r, c, d)).reduce( (acc, curr) => acc * curr, 1);
            res[r][c] = score;
        }
    }

    return res;
}


const treeMap = io.readUniformFilledLines("Puzzle.txt");
// console.log("Setup: ", state);

aoc.printDayHeader(8, "Treetop Tree House");


// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Number of visible trees");

const visibilityMap = analyzeHeights(treeMap);
const visibleTreesInRow = visibilityMap.map((r) => r.filter((c) => c).length);
// console.log("Visible trees/row count: ", visibleTreesInRow);
const res1 = visibleTreesInRow.reduce((acc, curr) => acc + curr, 0);
console.log("Result: ", res1);

// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Highest scenic score");

const scenicScores = analyzeViews(treeMap);
const res2 = Math.max(...scenicScores.map( (r) => Math.max(...r) ))
console.log("Result: ", res2);

