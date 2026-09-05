'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppLayout from '../../components/AppLayout';
import TaskBoard from '../../components/TaskBoard';
import { getStoredUser } from '../../lib/auth';
import { User } from '../../types/user';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  return (
    <ProtectedRoute>
      <AppLayout breadcrumbSubtitle="Product Roadmap">
        <TaskBoard currentUser={currentUser} />
      </AppLayout>
    </ProtectedRoute>
  );
}
