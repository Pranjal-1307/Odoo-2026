import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import allocationService from '../services/allocation.service';
import userService from '../services/user.service';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Table, { TableHeader, TableBody, TableRow, TableCell, TableHead } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';
import { Shuffle, ArrowRightLeft, User, Check, X, AlertTriangle } from 'lucide-react';

const allocateSchema = z.object({
  assetTag: z.string().min(1, 'Asset Tag code is required'),
  allocatedToId: z.string().min(1, 'Please select a recipient employee'),
  expectedReturn: z.string().optional().nullable(),
});

type AllocateFormData = z.infer<typeof allocateSchema>;

export default function AllocationPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const prefilledTag = searchParams.get('allocate') || '';

  const isManager = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  // Tabs state
  const [activeTab, setActiveTab] = useState('allocations');

  // Modals state
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictData, setConflictData] = useState<any>(null);
  const [pendingTransferData, setPendingTransferData] = useState<any>(null);

  // Fetch lists
  const { data: allocations, isLoading: allocsLoading, refetch: refetchAllocs } = useApi<any>(
    () => isManager ? allocationService.getAllAllocations() : allocationService.getMyAllocations()
  );

  const { data: transfers, isLoading: transfersLoading, refetch: refetchTransfers } = useApi<any>(
    () => allocationService.getPendingTransfers()
  );

  const { data: employees } = useApi<any>(() => userService.getAllUsers({ limit: 100 }));

  // Form
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AllocateFormData>({
    resolver: zodResolver(allocateSchema),
  });

  useEffect(() => {
    if (prefilledTag) {
      setValue('assetTag', prefilledTag);
      setAllocateModalOpen(true);
    }
  }, [prefilledTag, setValue]);

  // Submit allocation
  const onAllocateSubmit = async (data: AllocateFormData) => {
    try {
      const payload = {
        assetTag: data.assetTag,
        allocatedToId: data.allocatedToId,
        expectedReturn: data.expectedReturn || null,
      };

      await allocationService.allocateAsset(payload);
      showToast('Asset allocated successfully', 'success');
      setAllocateModalOpen(false);
      reset();
      refetchAllocs();
    } catch (err: any) {
      if (err.response?.status === 409) {
        // Asset conflict! Open Conflict Dialog Modal
        const currentHolder = err.response.data.data?.currentHolder;
        const assetObj = err.response.data.data?.asset;
        setConflictData({
          asset: assetObj,
          holder: currentHolder,
          targetEmployeeId: data.allocatedToId,
        });
        setAllocateModalOpen(false);
        setConflictModalOpen(true);
      } else {
        showToast(err.response?.data?.message || err.message || 'Allocation failed', 'error');
      }
    }
  };

  const handleRequestTransfer = async () => {
    if (!conflictData) return;
    try {
      await allocationService.requestTransfer({
        assetId: conflictData.asset.id,
        toUserId: conflictData.targetEmployeeId,
        reason: `Direct transfer request triggered due to allocation overlap. Current holder: ${conflictData.holder.name}.`,
      });
      showToast('Transfer request submitted to the current holder', 'success');
      setConflictModalOpen(false);
      setConflictData(null);
      refetchTransfers();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Transfer request failed', 'error');
    }
  };

  // Resolve transfers
  const handleResolveTransfer = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await allocationService.resolveTransfer(id, status);
      showToast(`Transfer request ${status.toLowerCase()} successfully`, 'success');
      refetchTransfers();
      refetchAllocs();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Resolution failed', 'error');
    }
  };

  // Return asset
  const handleReturnAsset = async (allocId: string, currentCondition: string) => {
    const condition = window.prompt(
      'Enter return condition (NEW, GOOD, FAIR, POOR, DAMAGED):',
      currentCondition
    );
    if (!condition) return;

    const notes = window.prompt('Enter return notes (optional):', '');

    try {
      await allocationService.returnAsset(allocId, {
        returnCondition: condition.toUpperCase(),
        returnNotes: notes,
      });
      showToast('Asset marked as returned successfully', 'success');
      refetchAllocs();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Return failed', 'error');
    }
  };

  const employeeOptions = employees
    ? [{ value: '', label: '-- Select Employee --' }, ...employees.map((e: any) => ({ value: e.id, label: `${e.name} (${e.employeeCode})` }))]
    : [{ value: '', label: '-- Select Employee --' }];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight">Asset Allocations</h2>
          <p className="text-surface-500 text-sm mt-1">
            Track who is currently holding company equipment, handle returns, and resolve transfer approvals.
          </p>
        </div>

        {isManager && (
          <Button
            onClick={() => {
              reset();
              setAllocateModalOpen(true);
            }}
            className="gap-2 shadow-lg shadow-brand-500/25 cursor-pointer"
          >
            <Shuffle size={16} />
            <span>Allocate Asset</span>
          </Button>
        )}
      </div>

      <Tabs defaultValue="allocations" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="allocations">Active Allocations</TabsTrigger>
          {isManager && <TabsTrigger value="transfers">Transfer Approvals</TabsTrigger>}
        </TabsList>

        {/* 1. Allocations List */}
        <TabsContent value="allocations">
          <Card>
            <CardHeader>
              <CardTitle>{isManager ? 'All Active Corporate Allocations' : 'My Allocated Equipment'}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {allocsLoading ? (
                <Spinner />
              ) : allocations && allocations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag</TableHead>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Holder</TableHead>
                      <TableHead>Allocation Date</TableHead>
                      <TableHead>Expected Return</TableHead>
                      <TableHead>Status</TableHead>
                      {isManager && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocations.map((alloc: any) => (
                      <TableRow key={alloc.id}>
                        <TableCell className="font-bold text-brand-600">
                          {alloc.asset?.assetTag || 'N/A'}
                        </TableCell>
                        <TableCell className="font-bold text-surface-900">
                          {alloc.asset?.name || 'Deleted Asset'}
                        </TableCell>
                        <TableCell className="font-medium text-surface-700">
                          {alloc.allocatedTo?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>{new Date(alloc.allocationDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {alloc.expectedReturn
                            ? new Date(alloc.expectedReturn).toLocaleDateString()
                            : 'No return bounds'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={alloc.status} />
                        </TableCell>
                        {isManager && alloc.status === 'ACTIVE' && (
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReturnAsset(alloc.id, alloc.asset?.condition || 'GOOD')}
                              className="text-xs py-1 px-2.5 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition"
                            >
                              Return Asset
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center text-surface-400 text-sm">No active asset allocations</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Transfer Approvals List */}
        {isManager && (
          <TabsContent value="transfers">
            <Card>
              <CardHeader>
                <CardTitle>Pending Transfer Approvals</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {transfersLoading ? (
                  <Spinner />
                ) : transfers && transfers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Tag</TableHead>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>From User</TableHead>
                        <TableHead>To User</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Requested At</TableHead>
                        <TableHead className="text-right">Decide</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transfers.map((req: any) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-bold text-brand-600">{req.asset.assetTag}</TableCell>
                          <TableCell className="font-bold text-surface-900">{req.asset.name}</TableCell>
                          <TableCell className="font-semibold text-red-600">{req.fromUser.name}</TableCell>
                          <TableCell className="font-semibold text-emerald-600">{req.toUser.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{req.reason || '-'}</TableCell>
                          <TableCell>{new Date(req.requestedAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right flex justify-end gap-2">
                            <button
                              onClick={() => handleResolveTransfer(req.id, 'APPROVED')}
                              className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg cursor-pointer transition"
                              title="Approve Transfer"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleResolveTransfer(req.id, 'REJECTED')}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg cursor-pointer transition"
                              title="Reject Request"
                            >
                              <X size={16} />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center text-surface-400 text-sm">
                    No pending transfer requests at this time.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* modal - Allocate Asset */}
      <Modal
        isOpen={allocateModalOpen}
        onClose={() => setAllocateModalOpen(false)}
        title="Create New Asset Allocation"
      >
        <form onSubmit={handleSubmit(onAllocateSubmit)} className="space-y-4">
          <Input
            label="Asset Tag Code"
            placeholder="e.g. AF-000001"
            error={errors.assetTag?.message}
            {...register('assetTag')}
          />
          <Select
            label="Assignee Employee"
            options={employeeOptions}
            error={errors.allocatedToId?.message}
            {...register('allocatedToId')}
          />
          <Input
            label="Expected Return Date (Optional)"
            type="date"
            error={errors.expectedReturn?.message}
            {...register('expectedReturn')}
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setAllocateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Allocate</Button>
          </div>
        </form>
      </Modal>

      {/* modal - Conflict Dialog */}
      <Modal
        isOpen={conflictModalOpen}
        onClose={() => setConflictModalOpen(false)}
        title="Asset Allocation Conflict!"
      >
        {conflictData && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
              <AlertTriangle size={24} className="shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold">This asset is already allocated!</h5>
                <p className="text-xs mt-1">
                  The asset <span className="font-bold">{conflictData.asset.name} ({conflictData.asset.assetTag})</span> is currently checked out to another staff member.
                </p>
              </div>
            </div>

            <div className="bg-surface-50 p-4 rounded-2xl border border-surface-200 text-sm space-y-2">
              <p className="font-semibold text-surface-800">Current Custodian Details:</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <div>
                  <span className="text-surface-400 block uppercase">Name</span>
                  <span className="text-surface-800 font-bold">{conflictData.holder.name}</span>
                </div>
                <div>
                  <span className="text-surface-400 block uppercase">Email</span>
                  <span className="text-surface-800 font-bold">{conflictData.holder.email}</span>
                </div>
                <div className="col-span-2 pt-1.5 border-t border-surface-250 mt-1.5">
                  <span className="text-surface-400 block uppercase">Department</span>
                  <span className="text-surface-800 font-bold">
                    {conflictData.holder.department?.name || 'Corporate Office'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-surface-500">
              Would you like to request a direct transfer from the current holder instead of manual return? This will log a transfer notification in their dashboard.
            </p>

            <div className="flex justify-end gap-2 pt-4 border-t border-surface-100">
              <Button variant="outline" onClick={() => setConflictModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRequestTransfer} className="gap-1.5 cursor-pointer">
                <ArrowRightLeft size={16} />
                <span>Request Direct Transfer</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
