import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import dashboardService from '../services/dashboard.service';
import Spinner from '../components/ui/Spinner';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ArrowRightLeft,
  UserCheck,
  TrendingUp,
  Clock,
  Plus,
  Wrench,
  FileSpreadsheet
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: kpis, isLoading: kpisLoading } = useApi<any>(() => dashboardService.getKPIs());
  const { data: activity, isLoading: activityLoading } = useApi<any>(() => dashboardService.getRecentActivity({ limit: 6 }));
  const { data: overdue, isLoading: overdueLoading } = useApi<any>(() => dashboardService.getOverdueReturns());

  if (kpisLoading || activityLoading || overdueLoading) {
    return <Spinner className="mt-20" />;
  }

  const role = user?.role || 'EMPLOYEE';
  const isManager = role === 'ADMIN' || role === 'ASSET_MANAGER';

  // Chart data
  const pieData = kpis ? [
    { name: 'Available', value: kpis.assetsAvailable, color: '#10b981' },
    { name: 'Allocated', value: kpis.assetsAllocated, color: '#3b82f6' },
    { name: 'Under Maintenance', value: kpis.assetsUnderMaintenance, color: '#f97316' },
  ] : [];

  const returnsData = kpis ? [
    { name: 'Overdue', count: kpis.overdueReturns, fill: '#ef4444' },
    { name: 'Upcoming (7d)', count: kpis.upcomingReturns, fill: '#f59e0b' },
  ] : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight">
            Welcome back, {user?.name}
          </h2>
          <p className="text-surface-500 text-sm mt-1">
            Here's what is happening with your organization's assets today.
          </p>
        </div>

        {/* Quick actions wrapper */}
        <div className="flex flex-wrap gap-3">
          {isManager && (
            <Link
              to="/assets/register"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 transition cursor-pointer"
            >
              <Plus size={16} />
              <span>Register Asset</span>
            </Link>
          )}
          <Link
            to="/bookings"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-surface-200 hover:bg-surface-50 text-surface-700 rounded-xl text-sm font-bold shadow-sm transition cursor-pointer"
          >
            <Calendar size={16} />
            <span>Book Resource</span>
          </Link>
          <Link
            to="/maintenance"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-surface-200 hover:bg-surface-50 text-surface-700 rounded-xl text-sm font-bold shadow-sm transition cursor-pointer"
          >
            <Wrench size={16} />
            <span>Raise Ticket</span>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-surface-500">Total Assets</p>
                <h4 className="text-3xl font-extrabold text-surface-900">{kpis.totalAssets}</h4>
              </div>
              <div className="h-12 w-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center">
                <Package size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-surface-500">Allocated Assets</p>
                <h4 className="text-3xl font-extrabold text-surface-900">{kpis.assetsAllocated}</h4>
              </div>
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <UserCheck size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-surface-500">Under Repair</p>
                <h4 className="text-3xl font-extrabold text-surface-900">{kpis.assetsUnderMaintenance}</h4>
              </div>
              <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                <Wrench size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-surface-500">Pending Transfers</p>
                <h4 className="text-3xl font-extrabold text-surface-900">{kpis.pendingTransfers}</h4>
              </div>
              <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                <ArrowRightLeft size={24} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphs & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Pie Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Asset Status Summary</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {kpis && kpis.totalAssets > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} assets`]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-surface-400">No assets registered</div>
            )}
            {/* Legend */}
            <div className="flex justify-center gap-4 text-xs font-semibold mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-surface-600">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Returns Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Returns & Overdue Tracking</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {kpis && (kpis.overdueReturns > 0 || kpis.upcomingReturns > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={returnsData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-surface-400">No upcoming returns pending</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overdue Returns Table & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Overdue Returns List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Clock size={20} />
              <span>Overdue Returns</span>
            </CardTitle>
            {overdue && overdue.length > 0 && (
              <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
                {overdue.length} Alert
              </span>
            )}
          </CardHeader>
          <CardContent>
            {overdue && overdue.length > 0 ? (
              <div className="divide-y divide-surface-100 max-h-80 overflow-y-auto">
                {overdue.map((item: any) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-surface-900">{item.asset.name}</p>
                      <p className="text-xs text-surface-500">Held by: {item.allocatedTo.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-xl">
                        {item.daysOverdue} days overdue
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-surface-400 text-sm">
                No overdue allocations. Everything is in order!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-surface-800">
              <TrendingUp size={20} />
              <span>Recent Activity Feed</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity && activity.length > 0 ? (
              <div className="divide-y divide-surface-100 max-h-80 overflow-y-auto">
                {activity.map((log: any) => (
                  <div key={log.id} className="py-3.5 flex items-start gap-3">
                    <div className="h-8 w-8 bg-surface-50 rounded-xl flex items-center justify-center shrink-0 border border-surface-200/50 mt-0.5">
                      <Clock size={16} className="text-surface-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-surface-700 leading-relaxed">
                        <span className="font-bold text-surface-900">{log.user?.name}</span>{' '}
                        {log.action.toLowerCase().replace('_', ' ')}d{' '}
                        <span className="font-medium text-brand-600">
                          {log.details?.name || log.details?.assetTag || log.entity}
                        </span>
                      </p>
                      <span className="text-[11px] text-surface-400 font-medium">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-surface-400 text-sm">
                No activity logged yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
