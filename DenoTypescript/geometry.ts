
export type Position = { X: number, Y: number };

type BoundingBox = { MinX: number, MaxX: number, MinY: number, MaxY: number };

export class Section {

    constructor(public From: number, public To: number) { }

    fullyContains(other: Section) {
        return other.From >= this.From && other.To <= this.To;
    }

    overlaps(other: Section) {
        return this.contains(other.From) || this.contains(other.To);
    }

    remove(other: Section) {
        if (this.contains(other.From)) {
            this.To = other.From - 1;
        } else {
            this.From = other.To + 1;
        }
    }

    private contains(section: number) {
        return this.From <= section && section <= this.To;
    }
}

export function areSectionsConnected(sec1: Section, sec2: Section): boolean {
    return sec1.overlaps(sec2) || isOneFullyContained(sec1, sec2);
}

function isOneFullyContained(sec1: Section, sec2: Section): boolean {
    return sec1.fullyContains(sec2) || sec2.fullyContains(sec1);
}

export function mergeSections(sections: Array<Section>): Array<Section> {
    const sortedSections = sections.toSorted((secLeft, secRight) => secLeft.From - secRight.From);
    // console.log(sortedSections);

    const res = new Array<Section>();
    let acc = sortedSections[0];
    for (let i = 1; i < sortedSections.length; ++i) {
        const curr = sortedSections[i];
        if (areSectionsConnected(acc, curr)) {
            acc = new Section(Math.min(acc.From, curr.From), Math.max(acc.To, curr.To));
        } else {
            res.push(acc);
            acc = curr;
        }
    }
    res.push(acc);

    return res;
}

export type Range = Section | undefined;
