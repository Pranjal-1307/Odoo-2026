import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import maintenanceService from '../services/maintenance.service';
import assetService from '../services/asset.service';
import userService from '../services/user.service';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';
import { Wrench, Plus, Upload, Play, CheckCircle, Image as ImageIcon, Users, Eye } from 'lucide-react';

const ticketSchema = z.object({
  assetId: z.string().min(1, 'Please select an asset'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  issue: z.string().min(5, 'Issue details must be at least 5 characters'),
});

type TicketFormData = z.infer<typeof ticketSchema>;

const priorityColors: Record<string, string> = {
  LOW: 'border-l-4 border-l-blue-400',
  MEDIUM: 'border-l-4 border-l-yellow-400',
  HIGH: 'border-l-4 border-l-orange-500',
  CRITICAL: 'border-l-4 border-l-red-600 animate-pulse',
};

const priorityText: Record<string, string> = {
  LOW: 'text-blue-800 bg-blue-50 border-blue-200',
  MEDIUM: 'text-yellow-800 bg-yellow-50 border-yellow-200',
  HIGH: 'text-orange-850 bg-orange-50 border-orange-200',
  CRITICAL: 'text-red-800 bg-red-50 border-red-200',
};

export default function MaintenancePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const isManager = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  
  const [assignDropdownOpen, setAssignDropdownOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Fetch API lists
  const { data: tickets, isLoading: ticketsLoading, refetch: refetchTickets } = useApi<any>(
    () => isManager ? maintenanceService.getAllRequests() : maintenanceService.getMyRequests()
  );

  const { data: assets } = useApi<any>(() => assetService.getAllAssets({ limit: 200 }));
  const { data: employees } = useApi<any>(() => userService.getAllUsers({ limit: 100 }));

  // Form for new ticket
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      priority: 'MEDIUM',
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const onTicketSubmit = async (data: TicketFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('assetId', data.assetId);
      formData.append('priority', data.priority);
      formData.append('issue', data.issue);
      if (photo) {
        formData.append('photo', photo);
      }

      await maintenanceService.raiseRequest(formData);
      showToast('Maintenance request raised successfully', 'success');
      setCreateModalOpen(false);
      reset();
      setPhoto(null);
      refetchTickets();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Operation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Status transitions
  const handleApproveReject = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await maintenanceService.approveOrReject(id, status);
      showToast(`Ticket status updated to ${status.toLowerCase()}`, 'success');
      refetchTickets();
      if (selectedTicket && selectedTicket.id === id) setDetailModalOpen(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Resolution failed', 'error');
    }
  };

  const handleAssignTechnician = async (id: string, technicianId: string) => {
    try {
      await maintenanceService.assignTechnician(id, technicianId);
      showToast('Technician assigned to repair ticket', 'success');
      setAssignDropdownOpen(false);
      refetchTickets();
      if (selectedTicket && selectedTicket.id === id) setDetailModalOpen(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Assign failed', 'error');
    }
  };

  const handleStartWork = async (id: string) => {
    try {
      await maintenanceService.startWork(id);
      showToast('Work started on repair ticket', 'success');
      refetchTickets();
      if (selectedTicket && selectedTicket.id === id) setDetailModalOpen(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Start work failed', 'error');
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket || !resolutionNotes.trim()) return;
    try {
      await maintenanceService.resolveRequest(selectedTicket.id, resolutionNotes);
      showToast('Ticket resolved and closed', 'success');
      setResolveModalOpen(false);
      setDetailModalOpen(false);
      setResolutionNotes('');
      refetchTickets();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to resolve', 'error');
    }
  };

  const assetOptions = assets?.data
    ? [{ value: '', label: '-- Select Asset --' }, ...assets.data.map((a: any) => ({ value: a.id, label: `${a.name} (${a.assetTag})` }))]
    : [{ value: '', label: '-- Select Asset --' }];

  const technicianOptions = employees
    ? [{ value: '', label: '-- Select Technician --' }, ...employees.map((e: any) => ({ value: e.id, label: e.name }))]
    : [{ value: '', label: '-- Select Technician --' }];

  // Group tickets by Kanban board columns
  const kanbanColumns = ['PENDING', 'APPROVED', 'REJECTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

  const getTicketsByColumn = (col: string) => {
    return tickets ? tickets.filter((t: any) => t.status === col) : [];
  };

  const handleViewDetails = (ticket: any) => {
    setSelectedTicket(ticket);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight">Maintenance Kanban Board</h2>
          <p className="text-surface-500 text-sm mt-1">
            Review equipment issues, assign support engineers, and track repair cycles.
          </p>
        </div>
        <Button
          onClick={() => {
            reset();
            setCreateModalOpen(true);
          }}
          className="gap-2 shadow-lg shadow-brand-500/25 cursor-pointer"
        >
          <Plus size={16} />
          <span>Raise Ticket</span>
        </Button>
      </div>

      {/* Kanban Board Container */}
      {ticketsLoading ? (
        <Spinner className="mt-20" />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start select-none min-h-[500px]">
          {kanbanColumns.map((col) => {
            const list = getTicketsByColumn(col);
            return (
              <div key={col} className="w-80 shrink-0 bg-surface-100 rounded-2xl p-4 border border-surface-200/60 max-h-[80vh] flex flex-col">
                {/* Column header */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-surface-700 uppercase tracking-wider">
                    {col.replace('_', ' ')}
                  </h4>
                  <span className="text-xs bg-surface-250/70 text-surface-700 font-bold px-2 py-0.5 rounded-full">
                    {list.length}
                  </span>
                </div>

                {/* Column items wrapper */}
                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {list.length > 0 ? (
                    list.map((ticket: any) => (
                      <div
                        key={ticket.id}
                        onClick={() => handleViewDetails(ticket)}
                        className={`bg-white p-4 rounded-xl shadow-sm border border-surface-200 hover:shadow-md hover:border-surface-300 transition duration-200 cursor-pointer ${
                          priorityColors[ticket.priority]
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="text-xs font-bold text-brand-600 truncate">
                            {ticket.asset.assetTag}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityText[ticket.priority]}`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-surface-900 line-clamp-1">{ticket.asset.name}</h5>
                        <p className="text-xs text-surface-500 line-clamp-2 mt-1.5 leading-relaxed">
                          {ticket.issue}
                        </p>
                        <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between text-[11px] text-surface-400 font-medium">
                          <span>By: {ticket.raisedBy.name}</span>
                          {ticket.technician && (
                            <span className="text-brand-600 font-bold truncate max-w-[100px]">
                              {ticket.technician.name}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-xs text-surface-400 border border-dashed border-surface-300 rounded-xl bg-surface-50/50">
                      Empty column
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* modal - Raise Ticket */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Raise Maintenance Ticket">
        <form onSubmit={handleSubmit(onTicketSubmit)} className="space-y-4">
          <Select
            label="Target Asset"
            options={assetOptions}
            error={errors.assetId?.message}
            {...register('assetId')}
          />
          <Select
            label="Priority Level"
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'CRITICAL', label: 'Critical' },
            ]}
            error={errors.priority?.message}
            {...register('priority')}
          />
          <Textarea
            label="Issue details"
            placeholder="Describe the technical error or defect..."
            error={errors.issue?.message}
            {...register('issue')}
          />

          {/* Photo File selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-surface-700">Attach Damage Photo</label>
            <div className="border border-dashed border-surface-300 bg-surface-50 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition hover:bg-surface-100">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="ticket-photo-upload"
              />
              <label htmlFor="ticket-photo-upload" className="flex flex-col items-center cursor-pointer">
                {photo ? (
                  <>
                    <ImageIcon size={24} className="text-brand-600 mb-1" />
                    <span className="text-xs font-bold text-surface-900 truncate max-w-xs">{photo.name}</span>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="text-surface-400 mb-1" />
                    <span className="text-xs font-bold text-surface-700">Click to upload photo</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>

      {/* modal - Ticket Details */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Maintenance Ticket Details"
      >
        {selectedTicket && (
          <div className="space-y-5">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className="text-lg font-bold text-surface-900">{selectedTicket.asset.name}</h4>
                <p className="text-xs font-bold text-brand-600 mt-0.5">Tag: {selectedTicket.asset.assetTag}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <StatusBadge status={selectedTicket.status} />
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${priorityText[selectedTicket.priority]}`}>
                  Priority: {selectedTicket.priority}
                </span>
              </div>
            </div>

            {/* Photo preview */}
            {selectedTicket.photoUrl && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-surface-200 bg-surface-50">
                <img
                  src={selectedTicket.photoUrl.startsWith('http') ? selectedTicket.photoUrl : `http://localhost:5000${selectedTicket.photoUrl}`}
                  alt="Damage"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <h5 className="text-xs font-bold text-surface-400 uppercase">Issue Description</h5>
              <p className="text-sm text-surface-700 bg-surface-50 p-4 rounded-xl border border-surface-100 leading-relaxed">
                {selectedTicket.issue}
              </p>
            </div>

            {selectedTicket.resolutionNotes && (
              <div className="space-y-1.5 p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                <h5 className="text-xs font-bold text-emerald-800 uppercase">Resolution Details</h5>
                <p className="text-sm text-emerald-950 font-medium leading-relaxed">
                  {selectedTicket.resolutionNotes}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-4 border-t border-surface-100">
              <div>
                <span className="text-surface-400 block uppercase">Raised By</span>
                <span className="text-surface-850 font-bold">{selectedTicket.raisedBy.name}</span>
              </div>
              <div>
                <span className="text-surface-400 block uppercase">Assigned Technician</span>
                <span className="text-surface-850 font-bold">{selectedTicket.technician?.name || 'None'}</span>
              </div>
            </div>

            {/* Action buttons depending on state */}
            <div className="flex flex-wrap gap-2 justify-end pt-5 border-t border-surface-100">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>

              {/* Manager Approvals */}
              {selectedTicket.status === 'PENDING' && isManager && (
                <>
                  <Button variant="destructive" onClick={() => handleApproveReject(selectedTicket.id, 'REJECTED')}>
                    Reject
                  </Button>
                  <Button onClick={() => handleApproveReject(selectedTicket.id, 'APPROVED')} className="shadow-lg shadow-brand-500/20">
                    Approve
                  </Button>
                </>
              )}

              {/* Assign Technician */}
              {selectedTicket.status === 'APPROVED' && isManager && (
                <div className="relative">
                  <Button onClick={() => setAssignDropdownOpen(!assignDropdownOpen)} className="gap-1.5 cursor-pointer">
                    <Users size={16} />
                    <span>Assign Technician</span>
                  </Button>
                  {assignDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setAssignDropdownOpen(false)} />
                      <div className="absolute right-0 bottom-12 w-56 bg-white border border-surface-200 rounded-xl shadow-xl py-2 z-50 animate-fade-in max-h-40 overflow-y-auto">
                        {technicianOptions.slice(1).map((tech) => (
                          <button
                            key={tech.value}
                            onClick={() => handleAssignTechnician(selectedTicket.id, tech.value)}
                            className="w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-brand-50 hover:text-brand-600 transition cursor-pointer"
                          >
                            {tech.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Start Work (Technician or Admin/Manager) */}
              {selectedTicket.status === 'ASSIGNED' && (
                <Button onClick={() => handleStartWork(selectedTicket.id)} className="gap-1.5 shadow-lg shadow-brand-500/20 cursor-pointer">
                  <Play size={16} />
                  <span>Start Repair</span>
                </Button>
              )}

              {/* Resolve ticket */}
              {selectedTicket.status === 'IN_PROGRESS' && (
                <Button onClick={() => setResolveModalOpen(true)} className="gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle size={16} />
                  <span>Resolve & Close</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* modal - Resolve notes input */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Close Repair Ticket"
      >
        <div className="space-y-4">
          <Textarea
            label="Resolution & Closing Notes"
            placeholder="Explain steps taken to repair the device (e.g. replaced SSD)..."
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolveTicket} className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
              Confirm Resolution
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
