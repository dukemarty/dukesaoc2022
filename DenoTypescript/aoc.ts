
export function printDayHeader(day: number, title: string){
    const firstLine = `--- Day ${day}: ${title} ---`;
    const secondLine = "=".repeat(firstLine.length);

    console.log("");
    console.log(firstLine);
    console.log(secondLine);
}

export function printPartHeader(id: number, title: string){
    const firstLine = `Part ${id}: ${title}`;
    const secondLine = "-".repeat(firstLine.length);

    console.log("");
    console.log(firstLine);
    console.log(secondLine);
}
