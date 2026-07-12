import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import auditService from '../services/audit.service';
import departmentService from '../services/department.service';
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
import { ClipboardCheck, Plus, CheckSquare, Eye, ShieldAlert, Award, UserPlus, FileSearch } from 'lucide-react';

const cycleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  departmentId: z.string().optional().nullable(),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

type CycleFormData = z.infer<typeof cycleSchema>;

export default function AuditPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const isManager = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  // State
  const [activeTab, setActiveTab] = useState('cycles');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  const [selectedCycle, setSelectedCycle] = useState<any>(null);
  const [selectedVerifyItem, setSelectedVerifyItem] = useState<any>(null);
  const [auditorSelects, setAuditorSelects] = useState<string[]>([]);

  // Verification Form State
  const [verifyStatus, setVerifyStatus] = useState<'VERIFIED' | 'MISSING' | 'DAMAGED'>('VERIFIED');
  const [verifyRemarks, setVerifyRemarks] = useState('');

  // Fetch cycles & checklists
  const { data: cycles, isLoading: cyclesLoading, refetch: refetchCycles } = useApi<any>(
    () => auditService.getAllCycles()
  );

  const { data: myItems, isLoading: myItemsLoading, refetch: refetchMyItems } = useApi<any>(
    () => auditService.getMyItems()
  );

  const { data: depts } = useApi<any>(() => departmentService.getAllDepartments({ limit: 100 }));
  const { data: employees } = useApi<any>(() => userService.getAllUsers({ limit: 100 }));

  // Forms
  const {
    register: registerCycle,
    handleSubmit: handleSubmitCycle,
    reset: resetCycle,
    formState: { errors: cycleErrors },
  } = useForm<CycleFormData>({
    resolver: zodResolver(cycleSchema),
  });

  const onCycleSubmit = async (data: CycleFormData) => {
    try {
      const payload = {
        title: data.title,
        departmentId: data.departmentId === 'none' ? null : data.departmentId,
        location: data.location || null,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };

      await auditService.createCycle(payload);
      showToast('Audit cycle created successfully', 'success');
      setCreateModalOpen(false);
      resetCycle();
      refetchCycles();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to create cycle', 'error');
    }
  };

  const handleStartCycle = async (id: string) => {
    try {
      await auditService.startCycle(id);
      showToast('Audit cycle started! Checklist generated.', 'success');
      refetchCycles();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to start cycle', 'error');
    }
  };

  const handleOpenAssign = (cycle: any) => {
    setSelectedCycle(cycle);
    setAuditorSelects(cycle.items?.map((i: any) => i.auditorId) || []);
    setAssignModalOpen(true);
  };

  const handleAssignAuditors = async () => {
    if (!selectedCycle || auditorSelects.length === 0) return;
    try {
      await auditService.assignAuditors(selectedCycle.id, auditorSelects);
      showToast('Auditors assigned successfully', 'success');
      setAssignModalOpen(false);
      refetchCycles();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Assignment failed', 'error');
    }
  };

  const handleOpenVerify = (item: any) => {
    setSelectedVerifyItem(item);
    setVerifyStatus('VERIFIED');
    setVerifyRemarks('');
    setVerifyModalOpen(true);
  };

  const handleVerifySubmit = async () => {
    if (!selectedVerifyItem) return;
    try {
      await auditService.verifyItem(selectedVerifyItem.id, {
        verification: verifyStatus,
        remarks: verifyRemarks,
      });
      showToast('Item verified successfully', 'success');
      setVerifyModalOpen(false);
      refetchMyItems();
      refetchCycles();
      if (selectedCycle) {
        // Refresh detail modal
        const refreshed = await auditService.getCycleById(selectedCycle.id);
        setSelectedCycle(refreshed.data.data);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Verification failed', 'error');
    }
  };

  const handleCloseCycle = async (id: string) => {
    if (!window.confirm('Are you sure you want to close this audit cycle? This will lock verifications and automatically mark discrepancies in the database.')) return;
    try {
      await auditService.closeCycle(id);
      showToast('Audit cycle closed! Discrepancy logs resolved.', 'success');
      refetchCycles();
      setDetailModalOpen(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to close cycle', 'error');
    }
  };

  const handleViewCycleDetails = async (cycle: any) => {
    try {
      const res = await auditService.getCycleById(cycle.id);
      setSelectedCycle(res.data.data);
      setDetailModalOpen(true);
    } catch (err: any) {
      showToast('Failed to load cycle items', 'error');
    }
  };

  const departmentOptions = depts
    ? [{ value: 'none', label: '-- All Departments --' }, ...depts.map((d: any) => ({ value: d.id, label: d.name }))]
    : [{ value: 'none', label: '-- All Departments --' }];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight">Audit Cycles Workspace</h2>
          <p className="text-surface-500 text-sm mt-1">
            Conduct inventory checklists, verify active locations, and flag discrepancies.
          </p>
        </div>
        {isManager && (
          <Button
            onClick={() => {
              resetCycle();
              setCreateModalOpen(true);
            }}
            className="gap-2 shadow-lg shadow-brand-500/25 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Audit Cycle</span>
          </Button>
        )}
      </div>

      <Tabs defaultValue="cycles" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="cycles">Audit Cycles</TabsTrigger>
          <TabsTrigger value="checklist">My Verification Checklist</TabsTrigger>
        </TabsList>

        {/* 1. Cycles List */}
        <TabsContent value="cycles">
          <Card>
            <CardHeader>
              <CardTitle>Enterprise Inventory Audits</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {cyclesLoading ? (
                <Spinner />
              ) : cycles && cycles.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Audit Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Verified Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cycles.map((cycle: any) => {
                      const verifiedCount = cycle.items?.filter((i: any) => i.verification !== 'PENDING').length || 0;
                      const totalCount = cycle._count?.items ?? cycle.items?.length ?? 0;
                      return (
                        <TableRow key={cycle.id}>
                          <TableCell className="font-bold text-surface-900">{cycle.title}</TableCell>
                          <TableCell>{cycle.department?.name || 'All Departments'}</TableCell>
                          <TableCell>{cycle.location || 'All Offices'}</TableCell>
                          <TableCell>{new Date(cycle.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(cycle.endDate).toLocaleDateString()}</TableCell>
                          <TableCell className="font-semibold text-surface-700">
                            {verifiedCount} / {totalCount} ({totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0}%)
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={cycle.status} />
                          </TableCell>
                          <TableCell className="text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewCycleDetails(cycle)}
                              className="p-1.5 text-surface-400 hover:text-brand-600 hover:bg-surface-50 rounded-lg cursor-pointer transition"
                              title="View Items"
                            >
                              <Eye size={16} />
                            </button>

                            {cycle.status === 'PLANNED' && isManager && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartCycle(cycle.id)}
                                className="text-xs py-1 px-2 hover:bg-brand-50"
                              >
                                Start
                              </Button>
                            )}

                            {cycle.status === 'IN_PROGRESS' && isManager && (
                              <button
                                onClick={() => handleOpenAssign(cycle)}
                                className="p-1.5 text-surface-400 hover:text-brand-600 hover:bg-surface-50 rounded-lg cursor-pointer"
                                title="Assign Auditors"
                              >
                                <UserPlus size={16} />
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center text-surface-400 text-sm">No audit cycles scheduled.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. My Checklist Tab */}
        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <CardTitle>My Verification Checklist</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {myItemsLoading ? (
                <Spinner />
              ) : myItems && myItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cycle</TableHead>
                      <TableHead>Asset Tag</TableHead>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Current Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myItems.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-semibold text-surface-700">
                          {item.auditCycle.title}
                        </TableCell>
                        <TableCell className="font-bold text-brand-600">{item.asset.assetTag}</TableCell>
                        <TableCell className="font-bold text-surface-900">{item.asset.name}</TableCell>
                        <TableCell>{item.asset.location || 'N/A'}</TableCell>
                        <TableCell>
                          <StatusBadge status={item.verification} />
                        </TableCell>
                        <TableCell className="text-right">
                          {item.verification === 'PENDING' && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenVerify(item)}
                              className="text-xs py-1 px-2.5 gap-1 shadow-sm cursor-pointer"
                            >
                              <CheckSquare size={12} />
                              <span>Verify</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center text-surface-400 text-sm">
                  You have no pending audit verifications assigned.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* modal - Create Cycle */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Inventory Audit Cycle">
        <form onSubmit={handleSubmitCycle(onCycleSubmit)} className="space-y-4">
          <Input
            label="Audit Cycle Title"
            placeholder="e.g. Q3 IT Assets Audit"
            error={cycleErrors.title?.message}
            {...registerCycle('title')}
          />
          <Select
            label="Target Department"
            options={departmentOptions}
            error={cycleErrors.departmentId?.message}
            {...registerCycle('departmentId')}
          />
          <Input
            label="Target Location / Office (Optional)"
            placeholder="e.g. Hyderabad Hq"
            error={cycleErrors.location?.message}
            {...registerCycle('location')}
          />
          <Input
            label="Start Date"
            type="date"
            error={cycleErrors.startDate?.message}
            {...registerCycle('startDate')}
          />
          <Input
            label="End Date"
            type="date"
            error={cycleErrors.endDate?.message}
            {...registerCycle('endDate')}
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Cycle</Button>
          </div>
        </form>
      </Modal>

      {/* modal - Cycle Items Detail */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedCycle ? `Cycle Details: ${selectedCycle.title}` : 'Cycle Details'}
        size="xl"
      >
        {selectedCycle && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-surface-150 pb-4">
              <div>
                <p className="text-xs text-surface-400 font-semibold uppercase">Schedule Dates</p>
                <p className="text-sm font-semibold text-surface-700 mt-0.5">
                  {new Date(selectedCycle.startDate).toLocaleDateString()} to{' '}
                  {new Date(selectedCycle.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-surface-400 font-semibold uppercase">Status</p>
                <StatusBadge status={selectedCycle.status} className="mt-1" />
              </div>
            </div>

            {/* Verification checklist table */}
            <div className="space-y-2">
              <h5 className="text-sm font-bold text-surface-800">Checklist Verification Items</h5>
              <div className="max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag</TableHead>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Assigned Auditor</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Verified Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCycle.items && selectedCycle.items.length > 0 ? (
                      selectedCycle.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-bold text-brand-600">{item.asset.assetTag}</TableCell>
                          <TableCell className="font-bold text-surface-900">{item.asset.name}</TableCell>
                          <TableCell className="font-medium text-surface-700">{item.auditor.name}</TableCell>
                          <TableCell>
                            <StatusBadge status={item.verification} />
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{item.remarks || '-'}</TableCell>
                          <TableCell>
                            {item.verifiedAt ? new Date(item.verifiedAt).toLocaleDateString() : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-surface-400">
                          Checklist has not been generated yet. Please start the cycle.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 border-t border-surface-150 pt-4">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
              {selectedCycle.status === 'IN_PROGRESS' && isManager && (
                <Button
                  onClick={() => handleCloseCycle(selectedCycle.id)}
                  className="bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-lg shadow-red-500/10"
                >
                  Close Cycle & Compute Discrepancies
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* modal - Assign Auditors */}
      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Audit Checkers">
        {selectedCycle && (
          <div className="space-y-4">
            <p className="text-sm text-surface-650">
              Select one or more staff members to conduct the checklist verifications for this cycle:
            </p>
            <div className="max-h-60 overflow-y-auto border border-surface-200 rounded-xl divide-y divide-surface-150">
              {employees?.map((emp: any) => {
                const isSelected = auditorSelects.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    onClick={() => {
                      if (isSelected) {
                        setAuditorSelects(auditorSelects.filter((id) => id !== emp.id));
                      } else {
                        setAuditorSelects([...auditorSelects, emp.id]);
                      }
                    }}
                    className={`flex items-center justify-between p-3 cursor-pointer transition hover:bg-surface-50 ${
                      isSelected ? 'bg-brand-50/20' : ''
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-surface-900">{emp.name}</p>
                      <p className="text-xs text-surface-400">{emp.email}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="h-4.5 w-4.5 text-brand-600 focus:ring-brand-500 border-surface-300 rounded cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-surface-100">
              <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignAuditors} disabled={auditorSelects.length === 0}>
                Confirm Assignments
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* modal - Verify Checklist Item */}
      <Modal isOpen={verifyModalOpen} onClose={() => setVerifyModalOpen(false)} title="Verify Checklist Item">
        {selectedVerifyItem && (
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-bold text-surface-900">{selectedVerifyItem.asset.name}</h5>
              <p className="text-xs font-bold text-brand-600 mt-0.5">Tag Code: {selectedVerifyItem.asset.assetTag}</p>
            </div>

            <Select
              label="Verification Verdict"
              options={[
                { value: 'VERIFIED', label: 'Verified (Present)' },
                { value: 'MISSING', label: 'Missing / Not Found' },
                { value: 'DAMAGED', label: 'Damaged / Defect' },
              ]}
              value={verifyStatus}
              onChange={(e: any) => setVerifyStatus(e.target.value)}
            />

            <Textarea
              label="Inspection Remarks"
              placeholder="e.g. Device verified at receptionist desk..."
              value={verifyRemarks}
              onChange={(e) => setVerifyRemarks(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-surface-100">
              <Button variant="outline" onClick={() => setVerifyModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleVerifySubmit}>Save Verification</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
