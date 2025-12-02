export function getTodayIST(): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export function getCurrentTimeIST(): string {
    return new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
}

export function getStartOfDayIST(date: Date = new Date()): Date {
    const istDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    istDate.setHours(0, 0, 0, 0);
    return istDate;
}

export function getEndOfDayIST(date: Date = new Date()): Date {
    const istDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    istDate.setHours(23, 59, 59, 999);
    return istDate;
}
