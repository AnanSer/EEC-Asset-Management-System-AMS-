import React from 'react';
import { Users, UserCheck, UserX, Building2 } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { Employee } from '@/constants/employees';

interface EmployeeStatsProps {
  employees: Employee[];
  total: number;
  totalDepartments?: number;
}

export default function EmployeeStats({
  employees,
  total,
  totalDepartments = 10,
}: EmployeeStatsProps) {
  const activeCount = employees.filter((e) => e.isActive).length;
  const inactiveCount = employees.filter((e) => !e.isActive).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        title="Total Personnel"
        value={total.toString()}
        icon={Users}
        subtitle="Registered workforce"
        color="primary"
      />
      <StatCard
        title="Active Employees"
        value={activeCount.toString()}
        icon={UserCheck}
        subtitle="Operational staff"
        color="accent"
      />
      <StatCard
        title="Inactive Employees"
        value={inactiveCount.toString()}
        icon={UserX}
        subtitle="Restricted access"
        color="active"
      />
      <StatCard
        title="Departments"
        value={totalDepartments.toString()}
        icon={Building2}
        subtitle="Assigned directorates"
        color="primary"
      />
    </div>
  );
}
