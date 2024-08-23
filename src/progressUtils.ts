
export const progress = ( title: string, current: number, total: number, message?: string ) => {
    const value = ((current / total) * 100).toFixed(2);
    process.stdout.write(`\r${title} - ${current} of ${total} (${value}%) - ${message ? message : ""}`);


}