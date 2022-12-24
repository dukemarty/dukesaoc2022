
export type Position = { X: number, Y: number };

export function parsePosition(line: string, sep = ",") {
    const tokens = line.split(sep);
    return { X: parseInt(tokens[0].trim()), Y: parseInt(tokens[1].trim()) };

}

export function positionEquals(l: Position, r: Position) {
    return l.X == r.X && l.Y == r.Y;
}

// default: 0=right, 1=down, 2=left, 3=up
export type Orientation = 0 | 1 | 2 | 3;

export type Pose = { pos: Position, dir: Orientation };

export type Position3D = { X: number, Y: number, Z: number };

export function parsePosition3D(line: string, sep = ",") {
    const tokens = line.split(sep);
    return { X: parseInt(tokens[0].trim()), Y: parseInt(tokens[1].trim()), Z: parseInt(tokens[2].trim()) };
}


export type Vector = { X: number, Y: number };

export function getVector(from: Position, to: Position) {
    return { X: to.X - from.X, Y: to.Y - from.Y };
}

export function transformVector(vec: Vector, trafo: (comp: number) => number) {
    vec.X = trafo(vec.X);
    vec.Y = trafo(vec.Y);
}

export function movePosition(pos: Position, v: Vector) {
    pos.X += v.X;
    pos.Y += v.Y;
}

export function movedPosition(pos: Position, v: Vector) {
    return { X: pos.X + v.X, Y: pos.Y + v.Y };
}

export type BoundingBox = { MinX: number, MaxX: number, MinY: number, MaxY: number };

export type BoundingBox3D = { MinX: number, MinY: number, MinZ: number, MaxX: number, MaxY: number, MaxZ: number };

export function mergeBoundingBoxes(boxes: Array<BoundingBox>): BoundingBox {
    return {
        MinX: Math.min(...boxes.map(bb => bb.MinX)),
        MaxX: Math.max(...boxes.map(bb => bb.MaxX)),
        MinY: Math.min(...boxes.map(bb => bb.MinY)),
        MaxY: Math.max(...boxes.map(bb => bb.MaxY)),
    };
}


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

export function isOneFullyContained(sec1: Section, sec2: Section): boolean {
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
