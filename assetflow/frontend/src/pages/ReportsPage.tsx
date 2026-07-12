import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import reportsService from '../services/reports.service';
import departmentService from '../services/department.service';
import categoryService from '../services/category.service';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import Table, { TableHeader, TableBody, TableRow, TableCell, TableHead } from '../components/ui/Table';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Wrench, Download, Printer, Filter, Calendar } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function ReportsPage() {
  const { showToast } = useToast();

  // Filters state
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [categoryId, setCategoryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  // Fetch filter dropdown options
  const { data: depts } = useApi<any>(() => departmentService.getAllDepartments({ limit: 100 }));
  const { data: cats } = useApi<any>(() => categoryService.getAllCategories({ limit: 100 }));

  // Fetch Reports data
  const { data: utilization, isLoading: utilLoading } = useApi<any>(
    () => reportsService.getAssetUtilization({ startDate, endDate, categoryId, departmentId }),
    [startDate, endDate, categoryId, departmentId]
  );

  const { data: lifecycle, isLoading: lifeLoading } = useApi<any>(
    () => reportsService.getAssetLifecycle(),
    []
  );

  const { data: deptAllocation, isLoading: deptAllocLoading } = useApi<any>(
    () => reportsService.getDepartmentAllocation(),
    []
  );

  const { data: maintenanceReport, isLoading: maintLoading } = useApi<any>(
    () => reportsService.getMaintenanceReport({ startDate, endDate, categoryId }),
    [startDate, endDate, categoryId]
  );

  // CSV Exporter helper
  const handleExportCSV = () => {
    if (!utilization) return;
    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Category/Dept,Total Assets,Allocated,Utilization Rate\n';
      
      utilization.forEach((item: any) => {
        csvContent += `"${item.category || item.department}",${item.totalAssets},${item.allocated},${item.utilizationRate}%\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `assetflow_utilization_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Utilization CSV file downloaded', 'success');
    } catch (err) {
      showToast('Failed to export CSV', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const categoryOptions = cats
    ? [{ value: '', label: 'All Categories' }, ...cats.map((c: any) => ({ value: c.id, label: c.name }))]
    : [{ value: '', label: 'All Categories' }];

  const departmentOptions = depts
    ? [{ value: '', label: 'All Departments' }, ...depts.map((d: any) => ({ value: d.id, label: d.name }))]
    : [{ value: '', label: 'All Departments' }];

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316'];

  return (
    <div className="space-y-6 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight">Reports & Analytics</h2>
          <p className="text-surface-500 text-sm mt-1 font-medium">
            Analyze asset lifecycle trends, check utilization heatmaps, and export checklists.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-1.5 cursor-pointer">
            <Printer size={16} />
            <span>Print PDF</span>
          </Button>
          <Button onClick={handleExportCSV} className="gap-1.5 cursor-pointer">
            <Download size={16} />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <Card className="print:hidden">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-surface-450 uppercase">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-surface-50 border border-surface-200 hover:border-surface-300 focus:border-brand-500 rounded-xl py-2 px-3 text-sm focus:outline-none transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-surface-450 uppercase">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-surface-50 border border-surface-200 hover:border-surface-300 focus:border-brand-500 rounded-xl py-2 px-3 text-sm focus:outline-none transition"
            />
          </div>
          <div className="flex flex-col justify-end">
            <Select
              label="Asset Category"
              options={categoryOptions}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end">
            <Select
              label="Department"
              options={departmentOptions}
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Asset Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-surface-800">
              <TrendingUp size={20} className="text-brand-600" />
              <span>Asset Utilization Rate (%)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {utilLoading ? (
              <Spinner />
            ) : utilization && utilization.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilization}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                  <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                  <Bar dataKey="utilizationRate" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-surface-400">No utilization data found</div>
            )}
          </CardContent>
        </Card>

        {/* 2. Department Allocations */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation by Department</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {deptAllocLoading ? (
              <Spinner />
            ) : deptAllocation && deptAllocation.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptAllocation}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    nameKey="department"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {deptAllocation.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} assets`]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-surface-400">No allocations data found</div>
            )}
          </CardContent>
        </Card>

        {/* 3. Maintenance Cost Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-surface-800">
              <Wrench size={20} className="text-orange-500" />
              <span>Maintenance Repair Expenses ($)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {maintLoading ? (
              <Spinner />
            ) : maintenanceReport ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={maintenanceReport.monthlyExpenses}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="$" />
                  <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                  <Legend />
                  <Line type="monotone" dataKey="totalCost" name="Expense" stroke="#f97316" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-surface-400">No repair costs logged</div>
            )}
          </CardContent>
        </Card>

        {/* 4. Asset Lifecycles Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Lifecycles Table</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {lifeLoading ? (
              <Spinner />
            ) : lifecycle && lifecycle.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Avg Age (Months)</TableHead>
                    <TableHead>Expected Useful Life</TableHead>
                    <TableHead>Total Depreciated Value</TableHead>
                    <TableHead>Average Repair Frequency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lifecycle.map((row: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-bold text-surface-950">{row.category}</TableCell>
                      <TableCell>{row.averageAgeMonths.toFixed(1)} m</TableCell>
                      <TableCell>{row.expectedUsefulLifeMonths} m</TableCell>
                      <TableCell>${Number(row.depreciatedValue).toLocaleString()}</TableCell>
                      <TableCell className="font-bold">{row.maintenanceCount} repairs</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-sm text-surface-450">No lifecycle data recorded</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
