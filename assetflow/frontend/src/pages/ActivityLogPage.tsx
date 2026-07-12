import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import api from '../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Table, { TableHeader, TableBody, TableRow, TableCell, TableHead } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import { History, Search, RefreshCw, Eye } from 'lucide-react';
import Modal from '../components/ui/Modal';

export default function ActivityLogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const userId = searchParams.get('userId') || '';
  const entity = searchParams.get('entity') || '';
  const action = searchParams.get('action') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Detail dialog state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Fetch paginated logs
  const { data: result, isLoading, refetch } = useApi<any>(
    () =>
      api.get('/activity-logs', {
        params: { page, limit: 15, userId, entity, action, startDate, endDate },
      }),
    [page, userId, entity, action, startDate, endDate]
  );

  // Fetch filter user list
  const { data: employees } = useApi<any>(() => api.get('/users', { params: { limit: 100 } }));

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset page
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
  };

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  const userOptions = employees?.data
    ? [{ value: '', label: 'All Users' }, ...employees.data.map((e: any) => ({ value: e.id, label: e.name }))]
    : [{ value: '', label: 'All Users' }];

  const entityOptions = [
    { value: '', label: 'All Entities' },
    { value: 'Asset', label: 'Asset' },
    { value: 'Allocation', label: 'Allocation' },
    { value: 'Booking', label: 'Booking' },
    { value: 'MaintenanceRequest', label: 'Maintenance' },
    { value: 'AuditCycle', label: 'Audit Cycle' },
    { value: 'Department', label: 'Department' },
    { value: 'Category', label: 'Category' },
    { value: 'User', label: 'User' },
  ];

  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'CREATE', label: 'CREATE' },
    { value: 'UPDATE', label: 'UPDATE' },
    { value: 'DELETE', label: 'DELETE' },
    { value: 'ALLOCATE', label: 'ALLOCATE' },
    { value: 'RETURN', label: 'RETURN' },
    { value: 'TRANSFER_REQUEST', label: 'TRANSFER_REQUEST' },
    { value: 'TRANSFER_RESOLVE', label: 'TRANSFER_RESOLVE' },
    { value: 'AUDIT_START', label: 'AUDIT_START' },
    { value: 'AUDIT_VERIFY', label: 'AUDIT_VERIFY' },
    { value: 'AUDIT_CLOSE', label: 'AUDIT_CLOSE' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight">System Activity Logs</h2>
        <p className="text-surface-500 text-sm mt-1">
          Review tamper-proof audit trails of every single database transaction and asset allocation history.
        </p>
      </div>

      {/* Filters Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* User */}
            <Select
              options={userOptions}
              value={userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
            />

            {/* Entity */}
            <Select
              options={entityOptions}
              value={entity}
              onChange={(e) => handleFilterChange('entity', e.target.value)}
            />

            {/* Action */}
            <Select
              options={actionOptions}
              value={action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
            />

            {/* Start Date */}
            <div className="flex flex-col gap-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full bg-surface-50 border border-surface-200 hover:border-surface-300 focus:border-brand-500 rounded-xl py-2.5 px-3 text-sm focus:outline-none transition"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1">
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full bg-surface-50 border border-surface-200 hover:border-surface-300 focus:border-brand-500 rounded-xl py-2.5 px-3 text-sm focus:outline-none transition"
              />
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-surface-100 pt-3">
            <span className="text-xs text-surface-500 font-semibold">
              Showing {result?.data?.data?.length ?? 0} of {result?.data?.meta?.total ?? 0} activities
            </span>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-xs text-surface-600 hover:text-brand-600 font-semibold cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Reset Filters</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <Spinner className="py-20" />
          ) : result?.data?.data?.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.data.data.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-bold text-surface-900">{log.user?.name || 'System'}</TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-lg">
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-surface-700">{log.entity}</TableCell>
                      <TableCell className="font-mono text-xs text-surface-500 max-w-[100px] truncate">
                        {log.entityId}
                      </TableCell>
                      <TableCell>{log.ipAddress || '127.0.0.1'}</TableCell>
                      <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => handleViewDetails(log)}
                          className="p-1 text-surface-400 hover:text-brand-600 hover:bg-surface-50 rounded-lg cursor-pointer transition"
                          title="View JSON Payload"
                        >
                          <Eye size={16} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {result.data.meta && result.data.meta.totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-surface-100 bg-surface-50">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-surface-500 font-semibold">
                    Page {page} of {result.data.meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === result.data.meta.totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center text-surface-400 text-sm">
              No activity logs recorded matching the criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* modal - Log Payload Details */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Activity Log JSON Payload"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="bg-surface-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-inner leading-relaxed max-h-80">
              <pre>{JSON.stringify(selectedLog.details, null, 2) || '{}'}</pre>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
