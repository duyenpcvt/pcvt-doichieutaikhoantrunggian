import Papa from 'papaparse';
import { Transaction } from '../types';

const SHEET_ID = '1G7GiDwZYaxDL9v7rGaYkI-Qail4AtFv1';
const GID = '1691049923';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

export async function fetchSheetData(): Promise<Transaction[]> {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch Google Sheet data');
    }
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rawData = results.data as any[];
          const transactions: Transaction[] = rawData.map((row) => {
            const debit = parseFloat(String(row['Nợ quy đổi']).replace(/,/g, '')) || 0;
            const credit = parseFloat(String(row['Có quy đổi']).replace(/,/g, '')) || 0;
            
            return {
              source: row['Nguồn phát sinh'] || '',
              id: row['Số giao dịch'] || '',
              date: row['Ngày giao dịch'] || '',
              account: row['Tài khoản'] || '',
              debit,
              credit,
              creator: row['Người tạo'] || '',
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
