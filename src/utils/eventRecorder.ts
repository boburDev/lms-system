type Change = {
    field: string;
    before: any;
    after: any;
};

function isDate(value: any): boolean {
    return value instanceof Date && !isNaN(value.getTime());
}

export function getChanges(original: any, updated: any, fields: string[]): Change[] {
    const changes: Change[] = [];

    for (const field of fields) {
        const beforeValue = original[field];
        const afterValue = updated[field];

        const areBothDates = isDate(beforeValue) && isDate(afterValue);

        if (areBothDates) {
            if (beforeValue.getTime() !== afterValue.getTime()) {
                changes.push({
                    field,
                    before: beforeValue,
                    after: afterValue,
                });
            }
        } else if (beforeValue !== afterValue) { 
            changes.push({
                field,
                before: beforeValue,
                after: afterValue,
            });
        }
    }

    return changes;
}