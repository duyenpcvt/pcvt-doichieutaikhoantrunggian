import { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ListOrdered, 
  Filter, 
  ArrowUpDown, 
  Download, 
  RefreshCw,
  Search,
  ChevronDown,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { fetchSheetData } from './services/sheetService';
import { Transaction, SortField, SortOrder } from './types';
import { cn, formatCurrency } from './lib/utils';

export default function App() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detail'>('overview');
  
  // Filters
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterAccount, setFilterAccount] = useState<string>('');
  const [filterCreator, setFilterCreator] = useState<string>('');
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSheetData();
      setData(result);
    } catch (err) {
      setError('Không thể tải dữ liệu từ Google Sheets. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Unique values for filters
  const uniqueDates = useMemo(() => Array.from(new Set(data.map(d => d.date))).sort(), [data]);
  const uniqueAccounts = useMemo(() => Array.from(new Set(data.map(d => d.account))).sort(), [data]);
  const uniqueCreators = useMemo(() => Array.from(new Set(data.map(d => d.creator))).sort(), [data]);

  // Filtered and Sorted Data
  const filteredData = useMemo(() => {
    let result = data.filter(item => {
      const matchDate = !filterDate || item.date === filterDate;
      const matchAccount = !filterAccount || item.account === filterAccount;
      const matchCreator = !filterCreator || item.creator === filterCreator;
      return matchDate && matchAccount && matchCreator;
    });

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (sortField === 'date') {
        // Simple string comparison for dates if they are ISO or YYYY-MM-DD
        // If they are DD/MM/YYYY, we might need more complex parsing
        // For now, assume string sort is okay or handle common formats
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, filterDate, filterAccount, filterCreator, sortField, sortOrder]);

  // Summary Stats
  const stats = useMemo(() => {
    const totalDebit = data.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = data.reduce((sum, item) => sum + item.credit, 0);
    const totalDiff = totalDebit - totalCredit;
    
    // Group by account for chart
    const accountStats = uniqueAccounts.map(acc => {
      const accData = data.filter(d => d.account === acc);
      return {
        name: acc,
        debit: accData.reduce((sum, d) => sum + d.debit, 0),
        credit: accData.reduce((sum, d) => sum + d.credit, 0),
      };
    });

    return { totalDebit, totalCredit, totalDiff, accountStats };
  }, [data, uniqueAccounts]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA] font-sans">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Đang tải dữ liệu đối chiếu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA] p-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đã xảy ra lỗi</h2>
        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
        <button 
          onClick={loadData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1F2937] font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">ReconcileMaster</h1>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Hệ thống đối chiếu tài khoản</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={loadData}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-200">
                AD
              </div>
              <span className="text-sm font-semibold text-gray-700">Admin</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs Navigation */}
        <div className="flex p-1 bg-gray-200/50 rounded-2xl w-fit mb-8 border border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
              activeTab === 'overview' 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('detail')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
              activeTab === 'detail' 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            )}
          >
            <ListOrdered className="w-4 h-4" />
            Chi tiết bút toán
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Tổng Nợ</span>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Tổng Nợ quy đổi</h3>
                  <p className="text-2xl font-black text-gray-900 font-mono">{formatCurrency(stats.totalDebit)}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                      <TrendingDown className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Tổng Có</span>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Tổng Có quy đổi</h3>
                  <p className="text-2xl font-black text-gray-900 font-mono">{formatCurrency(stats.totalCredit)}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      "p-3 rounded-2xl",
                      stats.totalDiff === 0 ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                    )}>
                      {stats.totalDiff === 0 ? <Minus className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    </div>
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-lg",
                      stats.totalDiff === 0 ? "text-blue-600 bg-blue-50" : "text-red-600 bg-red-50"
                    )}>Chênh lệch</span>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Tổng Chênh lệch</h3>
                  <p className={cn(
                    "text-2xl font-black font-mono",
                    stats.totalDiff === 0 ? "text-blue-600" : "text-red-600"
                  )}>{formatCurrency(stats.totalDiff)}</p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-blue-600" />
                    Đối chiếu theo Tài khoản
                  </h3>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.accountStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        />
                        <Tooltip 
                          cursor={{ fill: '#F9FAFB' }}
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '12px'
                          }}
                          formatter={(value: number) => [formatCurrency(value), '']}
                        />
                        <Bar dataKey="debit" name="Nợ" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
                        <Bar dataKey="credit" name="Có" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-600" />
                    Phân bổ Nợ theo Tài khoản
                  </h3>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.accountStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="debit"
                        >
                          {stats.accountStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '12px'
                          }}
                          formatter={(value: number) => [formatCurrency(value), '']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {stats.accountStats.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5] }}></div>
                        <span className="text-xs font-medium text-gray-600">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Filters Bar */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Ngày giao dịch</label>
                  <div className="relative">
                    <select
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all"
                    >
                      <option value="">Tất cả ngày</option>
                      {uniqueDates.map(date => (
                        <option key={date} value={date}>{date}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Tài khoản</label>
                  <div className="relative">
                    <select
                      value={filterAccount}
                      onChange={(e) => setFilterAccount(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all"
                    >
                      <option value="">Tất cả tài khoản</option>
                      {uniqueAccounts.map(acc => (
                        <option key={acc} value={acc}>{acc}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Người tạo</label>
                  <div className="relative">
                    <select
                      value={filterCreator}
                      onChange={(e) => setFilterCreator(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all"
                    >
                      <option value="">Tất cả người tạo</option>
                      {uniqueCreators.map(creator => (
                        <option key={creator} value={creator}>{creator}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFilterDate('');
                    setFilterAccount('');
                    setFilterCreator('');
                  }}
                  className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                >
                  Xóa lọc
                </button>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-bottom border-gray-100">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nguồn</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Số GD</th>
                        <th 
                          className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => toggleSort('date')}
                        >
                          <div className="flex items-center gap-2">
                            Ngày GD
                            <ArrowUpDown className={cn("w-3 h-3", sortField === 'date' ? "text-blue-600" : "text-gray-300")} />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => toggleSort('account')}
                        >
                          <div className="flex items-center gap-2">
                            Tài khoản
                            <ArrowUpDown className={cn("w-3 h-3", sortField === 'account' ? "text-blue-600" : "text-gray-300")} />
                          </div>
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Nợ quy đổi</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Có quy đổi</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Chênh lệch</th>
                        <th 
                          className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => toggleSort('creator')}
                        >
                          <div className="flex items-center gap-2">
                            Người tạo
                            <ArrowUpDown className={cn("w-3 h-3", sortField === 'creator' ? "text-blue-600" : "text-gray-300")} />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredData.length > 0 ? (
                        filteredData.map((item, idx) => (
                          <tr key={`${item.id}-${idx}`} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg group-hover:bg-white transition-colors">
                                {item.source}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-gray-600">{item.id}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.date}</td>
                            <td className="px-6 py-4 text-sm font-bold text-blue-600">{item.account}</td>
                            <td className="px-6 py-4 text-sm font-mono text-right text-emerald-600 font-bold">{formatCurrency(item.debit)}</td>
                            <td className="px-6 py-4 text-sm font-mono text-right text-amber-600 font-bold">{formatCurrency(item.credit)}</td>
                            <td className={cn(
                              "px-6 py-4 text-sm font-mono text-right font-black",
                              item.difference === 0 ? "text-gray-400" : "text-red-600"
                            )}>
                              {formatCurrency(item.difference)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                  {item.creator.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{item.creator}</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <Search className="w-12 h-12 text-gray-200 mb-4" />
                              <p className="text-gray-500 font-medium">Không tìm thấy bút toán nào khớp với bộ lọc.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Footer Info */}
                <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Hiển thị {filteredData.length} / {data.length} bút toán
                  </p>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase">Tổng Nợ lọc:</span>
                      <span className="text-sm font-mono font-bold text-emerald-600">
                        {formatCurrency(filteredData.reduce((sum, i) => sum + i.debit, 0))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase">Tổng Có lọc:</span>
                      <span className="text-sm font-mono font-bold text-amber-600">
                        {formatCurrency(filteredData.reduce((sum, i) => sum + i.credit, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm font-bold tracking-tight">ReconcileMaster v1.0</span>
          </div>
          <p className="text-sm text-gray-400 font-medium">
            &copy; 2024 Hệ thống đối chiếu tài khoản trung gian. Dữ liệu được đồng bộ từ Google Sheets.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Download className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><RefreshCw className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
