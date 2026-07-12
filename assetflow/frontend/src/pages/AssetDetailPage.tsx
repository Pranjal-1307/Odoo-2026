import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import assetService from '../services/asset.service';
import allocationService from '../services/allocation.service';
import bookingService from '../services/booking.service';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Table, { TableHeader, TableBody, TableRow, TableCell, TableHead } from '../components/ui/Table';
import {
  ArrowLeft,
  Calendar,
  Wrench,
  User,
  History,
  QrCode,
  Edit,
  CheckCircle,
  FileText,
  AlertOctagon
} from 'lucide-react';

const editAssetSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
  location: z.string().optional(),
  description: z.string().optional(),
  bookable: z.boolean().default(false),
});

type EditFormData = z.infer<typeof editAssetSchema>;

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const isManager = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  // State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Fetch asset details
  const { data: asset, isLoading, refetch } = useApi<any>(() => assetService.getAssetById(id!), [id]);
  // Fetch asset history
  const { data: history, isLoading: historyLoading, refetch: refetchHistory } = useApi<any>(
    () => assetService.getAssetHistory(id!),
    [id]
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editAssetSchema),
  });

  const handleOpenEdit = () => {
    if (!asset) return;
    setValue('name', asset.name);
    setValue('condition', asset.condition);
    setValue('location', asset.location || '');
    setValue('description', asset.description || '');
    setValue('bookable', asset.bookable);
    setEditModalOpen(true);
  };

  const onEditSubmit = async (data: EditFormData) => {
    try {
      await assetService.updateAsset(id!, data);
      showToast('Asset updated successfully', 'success');
      setEditModalOpen(false);
      refetch();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to update', 'error');
    }
  };

  const handleReturnAsset = async () => {
    const activeAlloc = asset?.allocations?.find((a: any) => a.status === 'ACTIVE');
    if (!activeAlloc) return;

    const condition = window.prompt(
      'Enter return condition (NEW, GOOD, FAIR, POOR, DAMAGED):',
      asset.condition
    );
    if (!condition) return;

    const notes = window.prompt('Enter return notes (optional):', '');

    try {
      await allocationService.returnAsset(activeAlloc.id, {
        returnCondition: condition.toUpperCase(),
        returnNotes: notes,
      });
      showToast('Asset returned successfully', 'success');
      refetch();
      refetchHistory();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Return failed', 'error');
    }
  };

  if (isLoading) {
    return <Spinner className="mt-20" />;
  }

  if (!asset) {
    return (
      <div className="text-center py-20 text-surface-400">
        Asset not found or access denied.
      </div>
    );
  }

  const activeAllocation = asset.allocations?.find((a: any) => a.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Back & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          to="/assets"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-surface-500 hover:text-brand-600 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Assets</span>
        </Link>

        <div className="flex flex-wrap gap-2">
          {isManager && (
            <Button variant="outline" onClick={handleOpenEdit} className="gap-1.5">
              <Edit size={16} />
              <span>Edit Asset</span>
            </Button>
          )}

          {asset.status === 'ALLOCATED' && isManager && (
            <Button variant="destructive" onClick={handleReturnAsset} className="gap-1.5 cursor-pointer">
              <CheckCircle size={16} />
              <span>Mark Returned</span>
            </Button>
          )}

          {asset.status === 'AVAILABLE' && isManager && (
            <Button
              onClick={() => navigate(`/allocations?allocate=${asset.assetTag}`)}
              className="gap-1.5 shadow-lg shadow-brand-500/20"
            >
              <User size={16} />
              <span>Allocate Asset</span>
            </Button>
          )}

          {asset.bookable && asset.status === 'AVAILABLE' && (
            <Button
              variant="secondary"
              onClick={() => navigate(`/bookings?book=${asset.id}`)}
              className="gap-1.5 border border-surface-200"
            >
              <Calendar size={16} />
              <span>Book Resource</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
              <div>
                <CardTitle className="text-2xl font-extrabold">{asset.name}</CardTitle>
                <span className="text-sm font-semibold text-brand-600 mt-1 block">
                  Tag: {asset.assetTag}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                <StatusBadge status={asset.status} />
                <span className="text-xs font-bold text-surface-500 bg-surface-100 px-2 py-0.5 rounded-lg border border-surface-200/50">
                  Condition: {asset.condition}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image if uploaded */}
            {asset.photoUrl && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-surface-200 bg-surface-50 relative">
                <img
                  src={asset.photoUrl.startsWith('http') ? asset.photoUrl : `http://localhost:5000${asset.photoUrl}`}
                  alt={asset.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-surface-700">Description</h4>
              <p className="text-sm text-surface-600 leading-relaxed bg-surface-50 p-4 rounded-2xl border border-surface-100">
                {asset.description || 'No descriptive notes registered.'}
              </p>
            </div>

            {/* Specifications Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-surface-100">
              <div>
                <span className="text-xs text-surface-400 font-semibold block uppercase">Category</span>
                <span className="text-sm font-bold text-surface-900">{asset.category?.name}</span>
              </div>
              <div>
                <span className="text-xs text-surface-400 font-semibold block uppercase">Serial Number</span>
                <span className="text-sm font-bold text-surface-900">{asset.serialNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-surface-400 font-semibold block uppercase">Location</span>
                <span className="text-sm font-bold text-surface-900">{asset.location || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-surface-400 font-semibold block uppercase">Department</span>
                <span className="text-sm font-bold text-surface-900">{asset.department?.name || 'Central Office'}</span>
              </div>
              <div>
                <span className="text-xs text-surface-400 font-semibold block uppercase">Acquisition Cost</span>
                <span className="text-sm font-bold text-surface-900">
                  {asset.acquisitionCost ? `$${Number(asset.acquisitionCost).toLocaleString()}` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-xs text-surface-400 font-semibold block uppercase">Acquisition Date</span>
                <span className="text-sm font-bold text-surface-900">
                  {asset.acquisitionDate ? new Date(asset.acquisitionDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - QR & Current Allocations */}
        <div className="space-y-6">
          {/* QR Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-surface-500 uppercase tracking-wider">
                System Asset QR code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 text-center">
              {asset.qrCode ? (
                <div className="bg-surface-50 p-4 rounded-2xl border border-surface-200 shadow-inner mb-4">
                  <img src={asset.qrCode} alt="QR Code" className="h-40 w-40 object-contain" />
                </div>
              ) : (
                <QrCode size={120} className="text-surface-300 mb-4" />
              )}
              <p className="text-xs text-surface-500 max-w-[200px]">
                Scan this tag code with a mobile scanner to register allocations or view repairs.
              </p>
            </CardContent>
          </Card>

          {/* Allocation Holder Card */}
          {activeAllocation && (
            <Card className="border-brand-200 bg-brand-50/5">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-brand-700 uppercase tracking-wider">
                  Current Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold">
                    {activeAllocation.allocatedTo.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-surface-900">{activeAllocation.allocatedTo.name}</h5>
                    <p className="text-xs text-surface-500">{activeAllocation.allocatedTo.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-3 border-t border-surface-100">
                  <div>
                    <span className="text-surface-400 block uppercase">Allocated On</span>
                    <span className="text-surface-700">
                      {new Date(activeAllocation.allocationDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-surface-400 block uppercase">Expected Return</span>
                    <span className="text-surface-700">
                      {activeAllocation.expectedReturn
                        ? new Date(activeAllocation.expectedReturn).toLocaleDateString()
                        : 'No return bounds'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* History Timeline Logs Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-surface-800">
            <History size={20} />
            <span>Asset History Timeline Logs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <Spinner />
          ) : history ? (
            <Tabs defaultValue="allocations">
              <TabsList>
                <TabsTrigger value="allocations">Allocations</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="audits">Audits</TabsTrigger>
              </TabsList>

              <TabsContent value="allocations">
                {history.allocations && history.allocations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Holder</TableHead>
                        <TableHead>Allocated On</TableHead>
                        <TableHead>Returned On</TableHead>
                        <TableHead>Expected Return</TableHead>
                        <TableHead>Return Condition</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.allocations.map((alloc: any) => (
                        <TableRow key={alloc.id}>
                          <TableCell className="font-bold text-surface-900">
                            {alloc.allocatedTo.name}
                          </TableCell>
                          <TableCell>{new Date(alloc.allocationDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {alloc.returnedDate ? new Date(alloc.returnedDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            {alloc.expectedReturn ? new Date(alloc.expectedReturn).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>{alloc.returnCondition || '-'}</TableCell>
                          <TableCell>
                            <StatusBadge status={alloc.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-6 text-surface-400">No allocation history logged</p>
                )}
              </TabsContent>

              <TabsContent value="maintenance">
                {history.maintenance && history.maintenance.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Raised By</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Technician</TableHead>
                        <TableHead>Resolved Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.maintenance.map((m: any) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-bold text-surface-900">{m.raisedBy.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{m.issue}</TableCell>
                          <TableCell>
                            <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-lg">
                              {m.priority}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={m.status} />
                          </TableCell>
                          <TableCell>{m.technician?.name || '-'}</TableCell>
                          <TableCell>{m.resolvedAt ? new Date(m.resolvedAt).toLocaleDateString() : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-6 text-surface-400">No maintenance reports logged</p>
                )}
              </TabsContent>

              <TabsContent value="bookings">
                {history.bookings && history.bookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booked By</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.bookings.map((b: any) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-bold text-surface-900">{b.bookedBy.name}</TableCell>
                          <TableCell>{new Date(b.startTime).toLocaleString()}</TableCell>
                          <TableCell>{new Date(b.endTime).toLocaleString()}</TableCell>
                          <TableCell>{b.purpose || '-'}</TableCell>
                          <TableCell>
                            <StatusBadge status={b.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-6 text-surface-400">No bookings logged</p>
                )}
              </TabsContent>

              <TabsContent value="audits">
                {history.audits && history.audits.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Audit Title</TableHead>
                        <TableHead>Auditor</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead>Verified At</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.audits.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-bold text-surface-900">
                            {item.auditCycle.title}
                          </TableCell>
                          <TableCell>{item.auditor.name}</TableCell>
                          <TableCell>
                            <StatusBadge status={item.verification} />
                          </TableCell>
                          <TableCell>
                            {item.verifiedAt ? new Date(item.verifiedAt).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>{item.remarks || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-6 text-surface-400">No audit validations logged</p>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <p className="text-center py-6 text-surface-400">Failed to load history logs</p>
          )}
        </CardContent>
      </Card>

      {/* modal - Edit Asset */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Asset Properties">
        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
          <Input label="Asset Name" error={errors.name?.message} {...register('name')} />
          <Select
            label="Condition"
            options={[
              { value: 'NEW', label: 'New' },
              { value: 'GOOD', label: 'Good' },
              { value: 'FAIR', label: 'Fair' },
              { value: 'POOR', label: 'Poor' },
              { value: 'DAMAGED', label: 'Damaged' },
            ]}
            error={errors.condition?.message}
            {...register('condition')}
          />
          <Input label="Location" error={errors.location?.message} {...register('location')} />
          <Textarea label="Description" error={errors.description?.message} {...register('description')} />
          <div className="flex items-center gap-2 p-3 bg-surface-50 border border-surface-200 rounded-xl max-w-sm">
            <input
              id="edit-bookable"
              type="checkbox"
              className="h-4.5 w-4.5 text-brand-600 focus:ring-brand-500 border-surface-300 rounded cursor-pointer"
              {...register('bookable')}
            />
            <label htmlFor="edit-bookable" className="text-sm font-semibold text-surface-700 cursor-pointer">
              Allow hourly bookings / reservations
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
