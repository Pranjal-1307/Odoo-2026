import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useToast } from '../contexts/ToastContext';
import notificationService from '../services/notification.service';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import StatusBadge from '../components/ui/StatusBadge';
import { Bell, Eye, CheckCheck } from 'lucide-react';

export default function NotificationPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Fetch notifications
  const { data: notifications, isLoading, refetch } = useApi<any>(
    () => notificationService.getAllNotifications({ limit: 100 })
  );

  const handleMarkAsRead = async (id: string, refType?: string | null, refId?: string | null) => {
    try {
      await notificationService.markAsRead(id);
      refetch();

      // Redirect logic depending on refType
      if (refType && refId) {
        if (refType.toUpperCase() === 'ASSET') {
          navigate(`/assets/${refId}`);
        } else if (refType.toUpperCase() === 'ALLOCATION') {
          navigate('/allocations');
        } else if (refType.toUpperCase() === 'BOOKING') {
          navigate('/bookings');
        } else if (refType.toUpperCase() === 'MAINTENANCE') {
          navigate('/maintenance');
        } else if (refType.toUpperCase() === 'AUDIT') {
          navigate('/audits');
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to update', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      showToast('All notifications marked as read', 'success');
      refetch();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Operation failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight">Notification Center</h2>
          <p className="text-surface-500 text-sm mt-1">
            Stay up to date with allocation alerts, maintenance request assignments, and resource booking schedules.
          </p>
        </div>
        {notifications && notifications.length > 0 && (
          <Button onClick={handleMarkAllAsRead} className="gap-2 cursor-pointer shadow-md">
            <CheckCheck size={16} />
            <span>Mark All As Read</span>
          </Button>
        )}
      </div>

      {/* Notifications list */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <Spinner className="py-20" />
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y divide-surface-150">
              {notifications.map((n: any) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id, n.refType, n.refId)}
                  className={`p-6 flex items-start gap-4 hover:bg-surface-50 transition cursor-pointer ${
                    !n.isRead ? 'bg-brand-50/5 border-l-4 border-l-brand-600' : ''
                  }`}
                >
                  <div className="h-10 w-10 rounded-xl bg-surface-100 flex items-center justify-center text-surface-500 shrink-0 mt-0.5 border border-surface-200">
                    <Bell size={20} className={!n.isRead ? 'text-brand-600' : 'text-surface-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm font-bold truncate ${!n.isRead ? 'text-surface-900' : 'text-surface-600'}`}>
                        {n.title}
                      </h4>
                      <span className="text-xs text-surface-400 font-semibold shrink-0">
                        {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 leading-relaxed ${!n.isRead ? 'text-surface-850 font-medium' : 'text-surface-500'}`}>
                      {n.message}
                    </p>
                    {n.refType && (
                      <div className="mt-3.5 flex items-center gap-1.5 text-xs font-bold text-brand-600">
                        <Eye size={12} />
                        <span>View {n.refType.toLowerCase()} link</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-surface-400 text-sm">
              Your inbox is clean! No notifications logged.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
