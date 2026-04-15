import Papa from 'papaparse';
import { Transaction } from '../types';

const SHEET_ID = '1G7GiDwZYaxDL9v7rGaYkI-Qail4AtFv1';
const GID = '1814902842';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

export async function fetchSheetData(): Promise<Transaction[]> {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch Google Sheet data');
    }
    const csvText = await response.text();
    
    // The CSV has some title rows before the actual header.
    // We need to find the actual header row and slice the text.
    const lines = csvText.split('\n');
    const headerIndex = lines.findIndex(line => line.startsWith('Nguồn phát sinh'));
    const validCsvText = headerIndex >= 0 ? lines.slice(headerIndex).join('\n') : csvText;
    
    return new Promise((resolve, reject) => {
      Papa.parse(validCsvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rawData = results.data as any[];
          const transactions: Transaction[] = rawData.map((row) => {
            // Trim keys because the CSV might have spaces around column names
            const cleanRow: Record<string, string> = {};
            for (const key in row) {
              cleanRow[key.trim()] = row[key];
            }
            
            // Parse numbers: remove dots (thousand separators), replace comma with dot (decimal separator)
            const parseAmount = (val: string) => {
              if (!val) return 0;
              const cleanStr = String(val).trim().replace(/\./g, '').replace(/,/g, '.');
              return parseFloat(cleanStr) || 0;
            };

            const debit = parseAmount(cleanRow['Nợ quy đổi']);
            const credit = parseAmount(cleanRow['Có quy đổi']);
            
            return {
              source: cleanRow['Nguồn phát sinh'] || '',
              id: cleanRow['Số giao dịch'] || '',
              date: cleanRow['Ngày giao dịch'] || '',
              account: cleanRow['Tài khoản'] || '',
              debit,
              credit,
              creator: cleanRow['Người tạo'] || '',
              difference: debit - credit
            };
          });
          resolve(transactions);
        },
        error: (error: Error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}
