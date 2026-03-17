'use client';

import { useEffect, useState } from 'react';
import { permissionsService } from '@/lib/services/permissions.service';
import { DatabasePermission } from '@workspace/common';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Plus, Trash2, Key, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Badge } from '@workspace/ui/components/badge';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Record<string, DatabasePermission[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);

  useEffect(() => {
    loadPermissions();
  }, []);

  async function loadPermissions() {
    try {
      setLoading(true);
      const data = await permissionsService.getAll();
      setPermissions(data);
      // Expand all by default
      setExpandedSubjects(Object.keys(data));
    } catch (error) {
      console.error('Failed to load permissions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(permission: DatabasePermission) {
    if (!confirm(`Delete permission "${permission.action}:${permission.subject}"?`)) {
      return;
    }

    try {
      await permissionsService.delete(permission.id);
      await loadPermissions();
    } catch (error: any) {
      alert(`Failed to delete: ${error.response?.data?.message || error.message}`);
    }
  }

  function toggleSubject(subject: string) {
    setExpandedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  }

  const filteredPermissions: Record<string, DatabasePermission[]> = {};
  Object.entries(permissions).forEach(([subject, perms]) => {
    const filtered = perms.filter(p => 
      p.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (filtered.length > 0) {
      filteredPermissions[subject] = filtered;
    }
  });

  if (loading && Object.keys(permissions).length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="size-4" />
          New Permission
        </Button>
      </div>

      {/* Permissions by Subject */}
      <div className="space-y-4">
        {Object.keys(filteredPermissions).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No permissions found.
            </CardContent>
          </Card>
        ) : (
          Object.entries(filteredPermissions).map(([subject, perms]) => (
            <Card key={subject} className="overflow-hidden">
              <CardHeader 
                className="bg-muted/30 py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSubject(subject)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {expandedSubjects.includes(subject) ? (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 text-muted-foreground" />
                    )}
                    <CardTitle className="text-base font-semibold">{subject}</CardTitle>
                    <Badge variant="outline" className="ml-2 font-normal">
                      {perms.length} actions
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              {expandedSubjects.includes(subject) && (
                <CardContent className="p-0 border-t">
                  <div className="divide-y">
                    {perms.map((perm) => (
                      <div
                        key={perm.id}
                        className="p-4 flex justify-between items-center hover:bg-muted/20 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-semibold uppercase text-[10px] tracking-wider">
                              {perm.action}
                            </Badge>
                            <span className="text-sm font-medium">{perm.subject}</span>
                          </div>
                          {perm.description && (
                            <p className="text-sm text-muted-foreground mt-1">{perm.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(perm)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreatePermissionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadPermissions}
        />
      )}
    </div>
  );
}

// Create Permission Modal
function CreatePermissionModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [action, setAction] = useState('read');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const actions = ['create', 'read', 'update', 'delete', 'view', 'manage'];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await permissionsService.create({ action, subject, description });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create permission');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle>Create New Permission</CardTitle>
          <CardDescription>Define a new action-subject pair for access control.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="perm-action">Action</Label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger id="perm-action">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="perm-subject">Subject</Label>
              <Input
                id="perm-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Dashboard, User, Report"
                required
                pattern="[A-Z][a-zA-Z0-9]*"
                title="PascalCase (e.g., Dashboard, UserProfile)"
              />
              <p className="text-[10px] text-muted-foreground">Must be in PascalCase (e.g., UserProfile)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="perm-desc">Description</Label>
              <Textarea
                id="perm-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What does this permission grant?"
              />
            </div>
            {error && <p className="text-destructive text-sm font-medium">{error}</p>}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? 'Creating...' : 'Create Permission'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
