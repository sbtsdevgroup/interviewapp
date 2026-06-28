'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { aiInterviewAPI } from '@/services/ai-interview-service';
import { useAuthStore } from '@/lib/store/auth-store';
import { Plus, Trash2, Key, Shield, User, Loader2 } from 'lucide-react';

interface AdminAccount {
  id: string;
  email: string;
  role: 'super-admin' | 'manager' | 'viewer';
  created_at: string;
}

export default function AdminManagementPage() {
  const { admin: currentAdmin } = useAuthStore();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminAccount | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'super-admin' | 'manager' | 'viewer'>('manager');
  
  // Edit Password form state
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'super-admin' | 'manager' | 'viewer'>('manager');

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiInterviewAPI.getAdmins();
      setAdmins(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch admin accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setError(null);
    try {
      await aiInterviewAPI.createAdmin(email.trim(), password.trim(), role);
      setCreateOpen(false);
      setEmail('');
      setPassword('');
      setRole('manager');
      fetchAdmins();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    setError(null);
    try {
      const payload: any = { role: newRole };
      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }
      await aiInterviewAPI.updateAdmin(selectedAdmin.id, payload);
      setEditOpen(false);
      setNewPassword('');
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update admin');
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (id === currentAdmin?.id) {
      alert('You cannot delete your own admin account.');
      return;
    }
    if (!confirm('Are you sure you want to delete this admin account?')) return;
    setError(null);
    try {
      await aiInterviewAPI.deleteAdmin(id);
      fetchAdmins();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete admin');
    }
  };

  const getRoleBadge = (roleName: string) => {
    switch (roleName) {
      case 'super-admin':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-100">
            <Shield className="h-3 w-3" />
            Super Admin
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
            <Shield className="h-3 w-3" />
            Manager
          </span>
        );
      case 'viewer':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
            <User className="h-3 w-3" />
            Viewer
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto py-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Management</h1>
            <p className="text-slate-500 text-sm mt-1">
              Create and manage administrative accounts to control access settings
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-[#155dfc] hover:bg-[#155dfc]/90 text-white rounded-xl shadow-sm gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Admin
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-none bg-white overflow-hidden shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-slate-900 text-lg">Administrators List</CardTitle>
            <CardDescription className="text-slate-500">
              Users registered with backend credentials to configure interviews and view stats
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75 border-b border-slate-100">
                    <TableHead className="pl-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</TableHead>
                    <TableHead className="py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Access Level</TableHead>
                    <TableHead className="py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Created Date</TableHead>
                    <TableHead className="pr-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-12 text-center text-slate-600">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-[#155dfc]" />
                          <span className="text-sm font-medium">Fetching accounts...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-12 text-center text-slate-500">
                        No admin accounts registered
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((acc) => (
                      <TableRow key={acc.id} className="hover:bg-slate-50/50 border-b border-slate-100 transition-colors">
                        <TableCell className="pl-6 py-4 font-medium text-slate-900">
                          {acc.email}
                          {acc.id === currentAdmin?.id && (
                            <span className="ml-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              You
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">{getRoleBadge(acc.role)}</TableCell>
                        <TableCell className="py-4 text-slate-500 text-sm">
                          {acc.created_at ? new Date(acc.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : '—'}
                        </TableCell>
                        <TableCell className="pr-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-1.5"
                              onClick={() => {
                                setSelectedAdmin(acc);
                                setNewRole(acc.role);
                                setEditOpen(true);
                              }}
                            >
                              <Key className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={acc.id === currentAdmin?.id}
                              onClick={() => handleDeleteAdmin(acc.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="rounded-2xl max-w-md bg-white border-none shadow-xl">
            <form onSubmit={handleCreateAdmin}>
              <DialogHeader>
                <DialogTitle className="text-slate-900">Create Admin Account</DialogTitle>
                <DialogDescription className="text-slate-500">
                  Register a new administrative account with specific permissions.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="e.g. manager@dbi.edu.ng"
                    className="rounded-xl border-slate-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-slate-700">Access Role</Label>
                  <Select
                    value={role}
                    onValueChange={(val: any) => setRole(val)}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-100 rounded-xl">
                      <SelectItem value="super-admin">Super Admin (Full Admin Control)</SelectItem>
                      <SelectItem value="manager">Manager (Edit and Schedule)</SelectItem>
                      <SelectItem value="viewer">Viewer (Read-Only access)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pass" className="text-slate-700">Password</Label>
                  <Input
                    id="pass"
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    className="rounded-xl border-slate-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#155dfc] hover:bg-[#155dfc]/90 text-white rounded-xl px-5"
                >
                  Save Account
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="rounded-2xl max-w-md bg-white border-none shadow-xl">
            <form onSubmit={handleUpdateAdmin}>
              <DialogHeader>
                <DialogTitle className="text-slate-900">Edit Admin Settings</DialogTitle>
                <DialogDescription className="text-slate-500">
                  Update role settings or reset password for {selectedAdmin?.email}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-role" className="text-slate-700">Access Role</Label>
                  <Select
                    value={newRole}
                    disabled={selectedAdmin?.id === currentAdmin?.id}
                    onValueChange={(val: any) => setNewRole(val)}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-100 rounded-xl">
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-pass" className="text-slate-700">Change Password (Optional)</Label>
                  <Input
                    id="edit-pass"
                    type="password"
                    placeholder="Leave blank to keep current password"
                    className="rounded-xl border-slate-200"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl"
                  onClick={() => {
                    setEditOpen(false);
                    setSelectedAdmin(null);
                    setNewPassword('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#155dfc] hover:bg-[#155dfc]/90 text-white rounded-xl px-5"
                >
                  Apply Updates
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
