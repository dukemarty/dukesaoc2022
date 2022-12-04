
export function printDayHeader(day: number, title: string){
    let firstLine = `--- Day ${day}: ${title} ---`;
    let secondLine = "=".repeat(firstLine.length);

    console.log("");
    console.log(firstLine);
    console.log(secondLine);
}

export function printPartHeader(id: number, title: string){
    let firstLine = `Part ${id}: ${title}`;
    let secondLine = "=".repeat(firstLine.length);

    console.log("");
    console.log(firstLine);
    console.log(secondLine);
}
