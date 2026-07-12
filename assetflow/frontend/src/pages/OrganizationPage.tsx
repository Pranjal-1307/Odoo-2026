import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import departmentService from '../services/department.service';
import categoryService from '../services/category.service';
import userService from '../services/user.service';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Table, { TableHeader, TableBody, TableRow, TableCell, TableHead } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';
import { Plus, Edit2, ShieldAlert, ArrowUpRight, Search, UserMinus } from 'lucide-react';

// Form validation schemas
const deptSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  headId: z.string().optional().nullable(),
});

const catSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  warrantyPeriod: z.coerce.number().int().positive().optional().nullable(),
});

export default function OrganizationPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  // Tabs state
  const [activeTab, setActiveTab] = useState('departments');

  // Modals state
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);

  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // Search state
  const [empSearch, setEmpSearch] = useState('');

  // Fetch API data
  const { data: depts, isLoading: deptsLoading, refetch: refetchDepts } = useApi<any>(
    () => departmentService.getAllDepartments({ limit: 100 })
  );
  const { data: cats, isLoading: catsLoading, refetch: refetchCats } = useApi<any>(
    () => categoryService.getAllCategories({ limit: 100 })
  );
  const { data: employees, isLoading: employeesLoading, refetch: refetchEmployees } = useApi<any>(
    () => userService.getAllUsers({ limit: 100, search: empSearch }),
    [empSearch]
  );

  // Forms
  const {
    register: registerDept,
    handleSubmit: handleSubmitDept,
    reset: resetDept,
    setValue: setDeptValue,
    formState: { errors: deptErrors },
  } = useForm({
    resolver: zodResolver(deptSchema),
  });

  const {
    register: registerCat,
    handleSubmit: handleSubmitCat,
    reset: resetCat,
    setValue: setCatValue,
    formState: { errors: catErrors },
  } = useForm({
    resolver: zodResolver(catSchema),
  });

  // Department actions
  const onDeptSubmit = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || null,
        parentId: data.parentId === 'none' ? null : data.parentId,
        headId: data.headId === 'none' ? null : data.headId,
      };

      if (editingDept) {
        await departmentService.updateDepartment(editingDept.id, payload);
        showToast('Department updated successfully', 'success');
      } else {
        await departmentService.createDepartment(payload);
        showToast('Department created successfully', 'success');
      }
      setDeptModalOpen(false);
      setEditingDept(null);
      resetDept();
      refetchDepts();
      refetchEmployees(); // Promoted head role might change employee list roles
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Operation failed', 'error');
    }
  };

  const handleEditDept = (dept: any) => {
    setEditingDept(dept);
    setDeptValue('name', dept.name);
    setDeptValue('description', dept.description || '');
    setDeptValue('parentId', dept.parentId || 'none');
    setDeptValue('headId', dept.headId || 'none');
    setDeptModalOpen(true);
  };

  const handleDeactivateDept = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this department?')) return;
    try {
      await departmentService.deactivateDepartment(id);
      showToast('Department deactivated successfully', 'success');
      refetchDepts();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to deactivate', 'error');
    }
  };

  // Category actions
  const onCatSubmit = async (data: any) => {
    try {
      if (editingCat) {
        await categoryService.updateCategory(editingCat.id, data);
        showToast('Category updated successfully', 'success');
      } else {
        await categoryService.createCategory(data);
        showToast('Category created successfully', 'success');
      }
      setCatModalOpen(false);
      setEditingCat(null);
      resetCat();
      refetchCats();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Operation failed', 'error');
    }
  };

  const handleEditCat = (cat: any) => {
    setEditingCat(cat);
    setCatValue('name', cat.name);
    setCatValue('description', cat.description || '');
    setCatValue('warrantyPeriod', cat.warrantyPeriod || '');
    setCatModalOpen(true);
  };

  // Employee actions
  const handlePromoteRole = async (role: string) => {
    try {
      await userService.promoteUser(selectedEmployee.id, role);
      showToast(`Employee role updated to ${role}`, 'success');
      setPromoteModalOpen(false);
      setSelectedEmployee(null);
      refetchEmployees();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Promotion failed', 'error');
    }
  };

  const handleDeactivateEmployee = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this employee?')) return;
    try {
      await userService.deactivateUser(id);
      showToast('Employee deactivated successfully', 'success');
      refetchEmployees();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to deactivate employee', 'error');
    }
  };

  const parentDeptOptions = depts
    ? [{ value: 'none', label: '-- None (Root) --' }, ...depts.map((d: any) => ({ value: d.id, label: d.name }))]
    : [{ value: 'none', label: '-- None (Root) --' }];

  const headOptions = employees
    ? [{ value: 'none', label: '-- Unassigned --' }, ...employees.map((e: any) => ({ value: e.id, label: `${e.name} (${e.employeeCode})` }))]
    : [{ value: 'none', label: '-- Unassigned --' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight">Organization Directory</h2>
          <p className="text-surface-500 text-sm mt-1">Manage corporate hierarchy, asset classification categories, and employee directory.</p>
        </div>
      </div>

      <Tabs defaultValue="departments" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
        </TabsList>

        {/* 1. Departments Tab */}
        <TabsContent value="departments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Departments List</CardTitle>
              {isAdmin && (
                <Button
                  onClick={() => {
                    setEditingDept(null);
                    resetDept();
                    setDeptModalOpen(true);
                  }}
                  className="gap-1 px-3 py-2 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Department</span>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {deptsLoading ? (
                <Spinner />
              ) : depts && depts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Department Head</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {depts.map((dept: any) => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-bold text-surface-900">{dept.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{dept.description || 'No description'}</TableCell>
                        <TableCell>{dept.parent?.name || '-'}</TableCell>
                        <TableCell className="font-medium text-surface-700">{dept.head?.name || 'Unassigned'}</TableCell>
                        <TableCell className="font-bold">{dept._count?.employees ?? 0}</TableCell>
                        <TableCell>
                          <StatusBadge status={dept.status} />
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditDept(dept)}
                              className="p-1.5 text-surface-400 hover:text-brand-600 hover:bg-surface-100 rounded-lg cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            {dept.status === 'ACTIVE' && (
                              <button
                                onClick={() => handleDeactivateDept(dept.id)}
                                className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Deactivate"
                              >
                                <UserMinus size={16} />
                              </button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-6 text-surface-400">No departments added yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Asset Categories</CardTitle>
              {isAdmin && (
                <Button
                  onClick={() => {
                    setEditingCat(null);
                    resetCat();
                    setCatModalOpen(true);
                  }}
                  className="gap-1 px-3 py-2 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Category</span>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {catsLoading ? (
                <Spinner />
              ) : cats && cats.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Warranty Period</TableHead>
                      <TableHead>Total Assets</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cats.map((cat: any) => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-bold text-surface-900">{cat.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{cat.description || 'No description'}</TableCell>
                        <TableCell>{cat.warrantyPeriod ? `${cat.warrantyPeriod} Months` : 'None'}</TableCell>
                        <TableCell className="font-bold">{cat._count?.assets ?? 0}</TableCell>
                        <TableCell>
                          <StatusBadge status={cat.status} />
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditCat(cat)}
                              className="p-1.5 text-surface-400 hover:text-brand-600 hover:bg-surface-100 rounded-lg cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-6 text-surface-400">No categories added yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Employees Tab */}
        <TabsContent value="employees">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Employees Directory</CardTitle>
              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search code or email..."
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-200 hover:border-surface-300 focus:border-brand-500 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none transition"
                />
              </div>
            </CardHeader>
            <CardContent>
              {employeesLoading ? (
                <Spinner />
              ) : employees && employees.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp: any) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-bold text-brand-600">{emp.employeeCode}</TableCell>
                        <TableCell className="font-bold text-surface-900">{emp.name}</TableCell>
                        <TableCell>{emp.email}</TableCell>
                        <TableCell>{emp.phone || '-'}</TableCell>
                        <TableCell>{emp.department?.name || '-'}</TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-surface-700 bg-surface-100 border border-surface-200/50 px-2 py-0.5 rounded-lg">
                            {emp.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={emp.status} />
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right flex items-center justify-end gap-2">
                            {emp.id !== user?.id && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedEmployee(emp);
                                    setPromoteModalOpen(true);
                                  }}
                                  className="p-1.5 text-surface-400 hover:text-brand-600 hover:bg-surface-100 rounded-lg cursor-pointer"
                                  title="Change Role"
                                >
                                  <ArrowUpRight size={16} />
                                </button>
                                {emp.status === 'ACTIVE' && (
                                  <button
                                    onClick={() => handleDeactivateEmployee(emp.id)}
                                    className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                    title="Deactivate"
                                  >
                                    <UserMinus size={16} />
                                  </button>
                                )}
                              </>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-6 text-surface-400">No employees match search filter</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* modal - Add/Edit Department */}
      <Modal
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Add Department'}
      >
        <form onSubmit={handleSubmitDept(onDeptSubmit)} className="space-y-4">
          <Input
            label="Department Name"
            placeholder="e.g. Sales Division"
            error={deptErrors.name?.message as string}
            {...registerDept('name')}
          />
          <Textarea
            label="Description (Optional)"
            placeholder="Scope and function of division..."
            error={deptErrors.description?.message as string}
            {...registerDept('description')}
          />
          <Select
            label="Parent Department"
            options={parentDeptOptions}
            {...registerDept('parentId')}
          />
          <Select
            label="Department Head"
            options={headOptions}
            {...registerDept('headId')}
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* modal - Add/Edit Category */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={editingCat ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmitCat(onCatSubmit)} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. IT Equipment"
            error={catErrors.name?.message as string}
            {...registerCat('name')}
          />
          <Textarea
            label="Description (Optional)"
            placeholder="Laptops, peripherals, and network devices..."
            error={catErrors.description?.message as string}
            {...registerCat('description')}
          />
          <Input
            label="Warranty Period (Months)"
            type="number"
            placeholder="e.g. 24"
            error={catErrors.warrantyPeriod?.message as string}
            {...registerCat('warrantyPeriod')}
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setCatModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* modal - Promote Employee Role */}
      <Modal
        isOpen={promoteModalOpen}
        onClose={() => setPromoteModalOpen(false)}
        title="Promote / Reassign Employee Role"
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <p className="text-sm text-surface-600">
              Select the new elevated access role permissions for{' '}
              <span className="font-bold text-surface-900">{selectedEmployee.name}</span>:
            </p>
            <div className="flex flex-col gap-2 pt-2">
              {['EMPLOYEE', 'DEPARTMENT_HEAD', 'ASSET_MANAGER', 'ADMIN'].map((role) => (
                <button
                  key={role}
                  onClick={() => handlePromoteRole(role)}
                  className="flex items-center justify-between p-3.5 border border-surface-200 hover:border-brand-500 hover:bg-brand-50/20 rounded-xl text-left transition text-sm font-semibold text-surface-700 hover:text-surface-900 cursor-pointer"
                >
                  <span className="capitalize">{role.replace('_', ' ').toLowerCase()}</span>
                  <span className="text-xs text-surface-400 bg-surface-50 border border-surface-200 px-2 py-0.5 rounded-lg">
                    Set Role
                  </span>
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setPromoteModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
