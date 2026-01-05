'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { notificationsAPI } from '@/lib/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

interface NotificationsProps {
  userType?: 'student' | 'admin';
}

export function Notifications({ userType = 'student' }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', userType],
    queryFn: () => notificationsAPI.getAll(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: unreadCount = { count: 0 } } = useQuery({
    queryKey: ['notifications', 'unread-count', userType],
    queryFn: () => notificationsAPI.getUnreadCount(),
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadNotifications = notifications.filter((n: Notification) => !n.isRead);
  const readNotifications = notifications.filter((n: Notification) => n.isRead);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount.count > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500"
          >
            {unreadCount.count > 9 ? '9+' : unreadCount.count}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-12 z-50 w-96 max-h-[600px] overflow-hidden flex flex-col shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadNotifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsReadMutation.mutate()}
                    className="text-xs"
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CardContent className="p-0 overflow-y-auto flex-1">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#155dfc] mb-2"></div>
                  <p>Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {unreadNotifications.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                        Unread ({unreadNotifications.length})
                      </div>
                      {unreadNotifications.map((notification: Notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 transition-colors ${getNotificationColor(notification.type)} border-l-4`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-sm">{notification.title}</h4>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => markAsReadMutation.mutate(notification.id)}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => deleteMutation.mutate(notification.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {readNotifications.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                        Read ({readNotifications.length})
                      </div>
                      {readNotifications.map((notification: Notification) => (
                        <div
                          key={notification.id}
                          className="p-4 hover:bg-gray-50 transition-colors opacity-75"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl flex-shrink-0 opacity-50">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-sm text-gray-600">{notification.title}</h4>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 flex-shrink-0"
                                  onClick={() => deleteMutation.mutate(notification.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

