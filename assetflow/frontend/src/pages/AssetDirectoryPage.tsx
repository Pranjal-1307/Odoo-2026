import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import assetService from '../services/asset.service';
import departmentService from '../services/department.service';
import categoryService from '../services/category.service';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Table, { TableHeader, TableBody, TableRow, TableCell, TableHead } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';
import { Search, Plus, Filter, RefreshCw, QrCode } from 'lucide-react';

export default function AssetDirectoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states (controlled by search params for deep linking)
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const departmentId = searchParams.get('departmentId') || '';
  const status = searchParams.get('status') || '';
  const bookable = searchParams.get('bookable') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const isManager = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  // Fetch directory assets
  const { data: result, isLoading, refetch } = useApi<any>(
    () =>
      assetService.getAllAssets({
        page,
        limit: 10,
        search,
        categoryId,
        departmentId,
        status,
        bookable,
      }),
    [page, search, categoryId, departmentId, status, bookable]
  );

  // Fetch filter dropdown options
  const { data: depts } = useApi<any>(() => departmentService.getAllDepartments({ limit: 100 }));
  const { data: cats } = useApi<any>(() => categoryService.getAllCategories({ limit: 100 }));

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

  const categoryOptions = cats
    ? [{ value: '', label: 'All Categories' }, ...cats.map((c: any) => ({ value: c.id, label: c.name }))]
    : [{ value: '', label: 'All Categories' }];

  const departmentOptions = depts
    ? [{ value: '', label: 'All Departments' }, ...depts.map((d: any) => ({ value: d.id, label: d.name }))]
    : [{ value: '', label: 'All Departments' }];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'ALLOCATED', label: 'Allocated' },
    { value: 'RESERVED', label: 'Reserved' },
    { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
    { value: 'LOST', label: 'Lost' },
    { value: 'RETIRED', label: 'Retired' },
    { value: 'DISPOSED', label: 'Disposed' },
  ];

  const bookableOptions = [
    { value: '', label: 'All Resources' },
    { value: 'true', label: 'Bookable Only' },
    { value: 'false', label: 'Not Bookable' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight">Asset Directory</h2>
          <p className="text-surface-500 text-sm mt-1">
            Search and manage corporate equipment, hardware, and reserve meeting rooms.
          </p>
        </div>
        {isManager && (
          <Link
            to="/assets/register"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Register Asset</span>
          </Link>
        )}
      </div>

      {/* Filters Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Search tag, name, serial..."
                value={search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full bg-surface-50 border border-surface-200 hover:border-surface-300 focus:border-brand-500 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none transition"
              />
            </div>

            {/* Category */}
            <Select
              options={categoryOptions}
              value={categoryId}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            />

            {/* Department */}
            <Select
              options={departmentOptions}
              value={departmentId}
              onChange={(e) => handleFilterChange('departmentId', e.target.value)}
            />

            {/* Status */}
            <Select
              options={statusOptions}
              value={status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            />

            {/* Bookable */}
            <Select
              options={bookableOptions}
              value={bookable}
              onChange={(e) => handleFilterChange('bookable', e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center border-t border-surface-100 pt-3">
            <span className="text-xs text-surface-500 font-medium">
              Showing {result?.data?.length ?? 0} of {result?.meta?.total ?? 0} assets
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

      {/* Directory Grid/Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <Spinner className="py-20" />
          ) : result && result.data?.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag</TableHead>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Bookable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.data.map((asset: any) => (
                    <TableRow
                      key={asset.id}
                      onClick={() => navigate(`/assets/${asset.id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-bold text-brand-600 flex items-center gap-1">
                        <QrCode size={14} className="text-surface-400" />
                        <span>{asset.assetTag}</span>
                      </TableCell>
                      <TableCell className="font-bold text-surface-900">{asset.name}</TableCell>
                      <TableCell>{asset.category.name}</TableCell>
                      <TableCell>{asset.location || '-'}</TableCell>
                      <TableCell>
                        <StatusBadge status={asset.status} />
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-surface-700 bg-surface-100 border border-surface-200/50 px-2 py-0.5 rounded-lg">
                          {asset.condition}
                        </span>
                      </TableCell>
                      <TableCell>
                        {asset.bookable ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                            Bookable
                          </span>
                        ) : (
                          <span className="text-xs text-surface-400">No</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination controls */}
              {result.meta && result.meta.totalPages > 1 && (
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
                    Page {page} of {result.meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === result.meta.totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center text-surface-400 text-sm">
              No assets registered in the folder structure matching filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
