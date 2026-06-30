const xlsx = require('xlsx');
const csvData = "col1,col2\n700500234,23.12.2568\n700500234,04.12.2568\n";
const buffer = Buffer.from(csvData);
const workbook = xlsx.read(buffer, { type: "buffer", raw: true });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
console.log(xlsx.utils.sheet_to_json(worksheet, { header: 1 }));
