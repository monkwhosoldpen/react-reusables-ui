'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, AlertTriangle, Database, Check, X, Smartphone, Code, Eye, Globe, TabletSmartphone } from 'lucide-react';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { cn } from '~/lib/utils';
import { Switch } from '../ui/switch';
import { useInAppDB } from '~/lib/core/providers/InAppDBProvider';

export function NotificationPreference() {

  const {
    user,
    updateNotificationPreference
  } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const inappDb = useInAppDB();

  // Get notification preference from InAppDB
  const userNotifications = user?.id ? inappDb.getUserNotifications(user.id) : false;

  const handleToggle = async (checked: boolean) => {
    if (!user?.id) return;

    setIsLoading(true);

    updateNotificationPreference(checked);
  };

  return (
    <div className={cn("flex flex-col space-y-3")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {userNotifications ? (
            <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </div>

        <Switch
          checked={userNotifications}
          onCheckedChange={handleToggle}
          disabled={isLoading || !user?.id}
        />
      </div>

    </div>
  );
} 