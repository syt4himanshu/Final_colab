'use strict';

const XLSX = require('xlsx');

function parseUsersFromExcel(filePath) {
    const wb = XLSX.readFile(filePath);
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
    return json.map((row) => ({
        uid: String(row.uid || row.UID || row.Uid || '').trim(),
        role: String(row.role || row.Role || '').trim() || 'student',
        password: row.password ? String(row.password) : undefined,
    }));
}

module.exports = { parseUsersFromExcel };


