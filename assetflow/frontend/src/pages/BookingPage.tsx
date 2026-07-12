import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import bookingService from '../services/booking.service';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Table, { TableHeader, TableBody, TableRow, TableCell, TableHead } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Calendar, Plus, Clock, X, Edit, AlertCircle } from 'lucide-react';

const bookingSchema = z.object({
  assetId: z.string().min(1, 'Please select a bookable asset'),
  startTime: z.string().min(1, 'Start Time is required'),
  endTime: z.string().min(1, 'End Time is required'),
  purpose: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const rescheduleSchema = z.object({
  startTime: z.string().min(1, 'Start Time is required'),
  endTime: z.string().min(1, 'End Time is required'),
});

type RescheduleFormData = z.infer<typeof rescheduleSchema>;

export default function BookingPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const prefilledAssetId = searchParams.get('book') || '';

  const isManager = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  // State
  const [activeTab, setActiveTab] = useState('my-bookings');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [reschedulingBooking, setReschedulingBooking] = useState<any>(null);
  
  // Overlap warning state
  const [overlapModalOpen, setOverlapModalOpen] = useState(false);
  const [overlapDetails, setOverlapDetails] = useState<any[]>([]);

  // Fetch bookings lists
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useApi<any>(
    () => isManager ? bookingService.getAllBookings() : bookingService.getMyBookings()
  );

  const { data: bookables } = useApi<any>(() => bookingService.getBookableAssets());

  // Forms
  const {
    register: registerBooking,
    handleSubmit: handleSubmitBooking,
    setValue: setBookingValue,
    reset: resetBooking,
    formState: { errors: bookingErrors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const {
    register: registerReschedule,
    handleSubmit: handleSubmitReschedule,
    setValue: setRescheduleValue,
    reset: resetReschedule,
    formState: { errors: rescheduleErrors },
  } = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
  });

  useEffect(() => {
    if (prefilledAssetId) {
      setBookingValue('assetId', prefilledAssetId);
      setCreateModalOpen(true);
    }
  }, [prefilledAssetId, setBookingValue]);

  // Submit new booking
  const onBookingSubmit = async (data: BookingFormData) => {
    try {
      await bookingService.createBooking({
        assetId: data.assetId,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        purpose: data.purpose || null,
      });
      showToast('Booking reserved successfully', 'success');
      setCreateModalOpen(false);
      resetBooking();
      refetchBookings();
    } catch (err: any) {
      if (err.response?.status === 409) {
        // Overlap error
        const existing = err.response.data.data?.existingBookings || [];
        setOverlapDetails(existing);
        setCreateModalOpen(false);
        setOverlapModalOpen(true);
      } else {
        showToast(err.response?.data?.message || err.message || 'Booking failed', 'error');
      }
    }
  };

  // Submit reschedule booking
  const onRescheduleSubmit = async (data: RescheduleFormData) => {
    if (!reschedulingBooking) return;
    try {
      await bookingService.rescheduleBooking(reschedulingBooking.id, {
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
      });
      showToast('Booking rescheduled successfully', 'success');
      setRescheduleModalOpen(false);
      setReschedulingBooking(null);
      resetReschedule();
      refetchBookings();
    } catch (err: any) {
      if (err.response?.status === 409) {
        const existing = err.response.data.data?.existingBookings || [];
        setOverlapDetails(existing);
        setRescheduleModalOpen(false);
        setOverlapModalOpen(true);
      } else {
        showToast(err.response?.data?.message || err.message || 'Rescheduling failed', 'error');
      }
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingService.cancelBooking(id);
      showToast('Booking cancelled successfully', 'success');
      refetchBookings();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to cancel', 'error');
    }
  };

  const handleOpenReschedule = (booking: any) => {
    setReschedulingBooking(booking);
    // Format dates to fit local datetime-local inputs: yyyy-MM-ddThh:mm
    const startStr = new Date(booking.startTime).toISOString().slice(0, 16);
    const endStr = new Date(booking.endTime).toISOString().slice(0, 16);
    setRescheduleValue('startTime', startStr);
    setRescheduleValue('endTime', endStr);
    setRescheduleModalOpen(true);
  };

  const assetOptions = bookables
    ? [{ value: '', label: '-- Select Asset / Room --' }, ...bookables.map((b: any) => ({ value: b.id, label: `${b.name} (${b.location || 'Central'})` }))]
    : [{ value: '', label: '-- Select Asset / Room --' }];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight">Resource Bookings</h2>
          <p className="text-surface-500 text-sm mt-1">
            Reserve company assets, conference rooms, laptops or shared technical modules on an hourly basis.
          </p>
        </div>
        <Button
          onClick={() => {
            resetBooking();
            setCreateModalOpen(true);
          }}
          className="gap-2 shadow-lg shadow-brand-500/25 cursor-pointer"
        >
          <Calendar size={16} />
          <span>New Reservation</span>
        </Button>
      </div>

      <Tabs defaultValue="my-bookings" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
          {isManager && <TabsTrigger value="all-bookings">All Active Bookings</TabsTrigger>}
        </TabsList>

        <TabsContent value="my-bookings">
          <Card>
            <CardHeader>
              <CardTitle>My Shared Reservations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {bookingsLoading ? (
                <Spinner />
              ) : bookings && bookings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings
                      .filter((b: any) => b.bookedById === user?.id)
                      .map((b: any) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-bold text-surface-900">{b.asset.name}</TableCell>
                          <TableCell>{b.asset.location || 'Central'}</TableCell>
                          <TableCell>{new Date(b.startTime).toLocaleString()}</TableCell>
                          <TableCell>{new Date(b.endTime).toLocaleString()}</TableCell>
                          <TableCell className="max-w-xs truncate">{b.purpose || '-'}</TableCell>
                          <TableCell>
                            <StatusBadge status={b.status} />
                          </TableCell>
                          <TableCell className="text-right flex justify-end gap-2">
                            {b.status === 'UPCOMING' && (
                              <>
                                <button
                                  onClick={() => handleOpenReschedule(b)}
                                  className="p-1.5 text-surface-400 hover:text-brand-600 hover:bg-surface-50 rounded-lg cursor-pointer"
                                  title="Reschedule"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleCancelBooking(b.id)}
                                  className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                  title="Cancel Booking"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center text-surface-400 text-sm">No bookings scheduled.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isManager && (
          <TabsContent value="all-bookings">
            <Card>
              <CardHeader>
                <CardTitle>Enterprise Reservations List</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {bookingsLoading ? (
                  <Spinner />
                ) : bookings && bookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Resource</TableHead>
                        <TableHead>Booked By</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((b: any) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-bold text-surface-900">{b.asset.name}</TableCell>
                          <TableCell className="font-semibold text-surface-700">{b.bookedBy.name}</TableCell>
                          <TableCell>{new Date(b.startTime).toLocaleString()}</TableCell>
                          <TableCell>{new Date(b.endTime).toLocaleString()}</TableCell>
                          <TableCell>
                            <StatusBadge status={b.status} />
                          </TableCell>
                          <TableCell className="text-right flex justify-end gap-2">
                            {b.status === 'UPCOMING' && (
                              <button
                                onClick={() => handleCancelBooking(b.id)}
                                className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Cancel Booking"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center text-surface-400 text-sm">No enterprise bookings logged.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* modal - New Booking */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Reserve Shared Resource">
        <form onSubmit={handleSubmitBooking(onBookingSubmit)} className="space-y-4">
          <Select
            label="Bookable Resource / Room"
            options={assetOptions}
            error={bookingErrors.assetId?.message}
            {...registerBooking('assetId')}
          />
          <Input
            label="Start Date & Time"
            type="datetime-local"
            error={bookingErrors.startTime?.message}
            {...registerBooking('startTime')}
          />
          <Input
            label="End Date & Time"
            type="datetime-local"
            error={bookingErrors.endTime?.message}
            {...registerBooking('endTime')}
          />
          <Textarea
            label="Purpose of Booking"
            placeholder="e.g. Weekly project sync with client team..."
            error={bookingErrors.purpose?.message}
            {...registerBooking('purpose')}
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm Booking</Button>
          </div>
        </form>
      </Modal>

      {/* modal - Reschedule Booking */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Reservation"
      >
        <form onSubmit={handleSubmitReschedule(onRescheduleSubmit)} className="space-y-4">
          <Input
            label="New Start Date & Time"
            type="datetime-local"
            error={rescheduleErrors.startTime?.message}
            {...registerReschedule('startTime')}
          />
          <Input
            label="New End Date & Time"
            type="datetime-local"
            error={rescheduleErrors.endTime?.message}
            {...registerReschedule('endTime')}
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setRescheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Schedule</Button>
          </div>
        </form>
      </Modal>

      {/* modal - Overlap Conflict Warning */}
      <Modal
        isOpen={overlapModalOpen}
        onClose={() => setOverlapModalOpen(false)}
        title="Booking Conflict Detected!"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-950">
            <AlertCircle size={24} className="shrink-0 mt-0.5 text-red-600" />
            <div>
              <h5 className="font-bold">Overlapping Booking Interval</h5>
              <p className="text-xs mt-1">
                The resource you are trying to reserve has overlapping bookings scheduled during that time slice.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-bold text-surface-800">Conflicting Schedules:</p>
            <div className="divide-y divide-surface-100 max-h-40 overflow-y-auto bg-surface-50 border border-surface-200 rounded-xl px-4 py-2">
              {overlapDetails.map((b: any, index: number) => (
                <div key={index} className="py-2.5 text-xs text-surface-700 flex justify-between gap-4">
                  <div>
                    <p className="font-bold">Booked by: {b.bookedBy.name}</p>
                    <p className="text-surface-400 mt-0.5">Purpose: {b.purpose || 'No purpose notes'}</p>
                  </div>
                  <div className="text-right text-surface-600 font-medium">
                    <p>Start: {new Date(b.startTime).toLocaleString()}</p>
                    <p>End: {new Date(b.endTime).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-surface-100">
            <Button
              onClick={() => {
                setOverlapModalOpen(false);
                // Return to booking form/modal
                setCreateModalOpen(true);
              }}
            >
              Adjust Scheduling Times
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
