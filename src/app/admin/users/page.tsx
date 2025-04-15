'use client';

import React from 'react';
import UserTable from './components/UserTable';

const UserManagementPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold">User Management</h1>
      <p className="mt-2">
        Manage your users here.
      </p>
      <UserTable />
    </div>
  );
};

export default UserManagementPage;
