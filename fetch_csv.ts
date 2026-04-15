import fs from 'fs';
import Papa from 'papaparse';

async function run() {
  const res = await fetch('https://docs.google.com/spreadsheets/d/1G7GiDwZYaxDL9v7rGaYkI-Qail4AtFv1/export?format=csv&gid=1814902842');
  const text = await res.text();
  const lines = text.split('\n');
  const headerIndex = lines.findIndex(line => line.startsWith('Nguồn phát sinh'));
  const csvData = lines.slice(headerIndex).join('\n');
  
  Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const rawData = results.data as any[];
      console.log(rawData[0]);
      
      const row = rawData[0];
      // trim keys
      const cleanRow: any = {};
      for (const key in row) {
        cleanRow[key.trim()] = row[key];
      }
      
      console.log(cleanRow['Nợ quy đổi']);
      
      const debitStr = String(cleanRow['Nợ quy đổi'] || '').trim().replace(/\./g, '').replace(/,/g, '.');
      console.log('debitStr:', debitStr, 'parsed:', parseFloat(debitStr));
    }
  });
}

run();
