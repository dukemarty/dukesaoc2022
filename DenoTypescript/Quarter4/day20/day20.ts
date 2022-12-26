import * as aoc from "../aoc.ts";
import * as io from "../ioutility.ts";
import * as geo from "../geometry.ts";



class EncryptedEntry {

    constructor(public val: number, public origPos: number) { }
}

class EncryptedFile {

    entries: Array<EncryptedEntry>
    size: number

    constructor(lines: Array<string>) {
        this.entries = lines.map((v, i) => new EncryptedEntry(parseInt(v), i));
        this.size = this.entries.length;
    }

    decrypt1() {
        // console.log(this.entries.map(e => `${e.val}(${e.origPos})`).join(", "));
        for (let i = 0; i < this.entries.length; ++i) {
            const toMove = this.entries.findIndex(e => e.origPos == i);
            const entry = this.entries.splice(toMove, 1)[0];

            let newPos = toMove + entry.val;
            newPos = (newPos + this.size - 1) % (this.size - 1);

            this.entries.splice(newPos, 0, entry);

            // console.log(this.entries.map(e => `${e.val}(${e.origPos})`).join(", "));
        }
    }

    decrypt2() {
        this.entries.forEach(e => e.val *= 811589153);

        for (let runs = 0; runs < 10; ++runs) {
            // console.log(this.entries.map(e => `${e.val}(${e.origPos})`).join(", "));
            for (let i = 0; i < this.entries.length; ++i) {
                const toMove = this.entries.findIndex(e => e.origPos == i);
                const entry = this.entries.splice(toMove, 1)[0];

                let newPos = toMove + entry.val;
                newPos = (newPos + this.size - 1) % (this.size - 1);

                this.entries.splice(newPos, 0, entry);

                // console.log(this.entries.map(e => `${e.val}(${e.origPos})`).join(", "));
            }
        }
    }

    getNth(n: number): EncryptedEntry {
        const base = this.entries.findIndex(e => e.val == 0);
        const pos = (base + n) % this.size;

        return this.entries[pos];
    }
}


// ======================================================================

aoc.printDayHeader(20, "Grove Positioning System");

const data = io.readUniformFilledLines("Puzzle.txt");


// ----------------------------------------------------------------------------
aoc.printPartHeader(1, "Sum of decrypted 1000th, 2000th, 3000th");

const encryptedFile1 = new EncryptedFile(data);
// console.log(encryptedFile1);
encryptedFile1.decrypt1();
// console.log(encryptedFile1.getNth(1000));
// console.log(encryptedFile1.getNth(2000));
// console.log(encryptedFile1.getNth(3000));
const res1 = [1000, 2000, 3000].map(i => encryptedFile1.getNth(i)).reduce((acc, curr) => acc + curr.val, 0);
console.log("Result: ", res1);


// ----------------------------------------------------------------------------
aoc.printPartHeader(2, "Sum of more complexely decrypted 1000th, 2000th, 3000th");

const encryptedFile2 = new EncryptedFile(data);
// console.log(encryptedFile1);
encryptedFile2.decrypt2();
// console.log(encryptedFile1.getNth(1000));
// console.log(encryptedFile1.getNth(2000));
// console.log(encryptedFile1.getNth(3000));
const res2 = [1000, 2000, 3000].map(i => encryptedFile2.getNth(i)).reduce((acc, curr) => acc + curr.val, 0);
console.log("Result: ", res2);
