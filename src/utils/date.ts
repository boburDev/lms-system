function getDays(startDate: Date, endDate: Date): Date[] {
    let dates: Date[] = [];
    let theDate: Date = new Date(startDate.getTime());

    while (theDate.getTime() <= endDate.getTime()) {
        dates = [...dates, new Date(theDate)];
        theDate.setDate(theDate.getDate() + 1);
    }

    return dates;
}

export {
    getDays
}