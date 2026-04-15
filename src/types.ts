export interface Transaction {
  source: string;        // Nguồn phát sinh
  id: string;            // Số giao dịch
  date: string;          // Ngày giao dịch
  account: string;       // Tài khoản
  debit: number;         // Nợ quy đổi
  credit: number;        // Có quy đổi
  creator: string;       // Người tạo
  difference: number;    // Chênh lệch (debit - credit)
}

export type SortField = 'date' | 'account' | 'creator';
export type SortOrder = 'asc' | 'desc';
