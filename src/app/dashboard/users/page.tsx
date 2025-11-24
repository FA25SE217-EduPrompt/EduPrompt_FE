"use client";

import React, {useEffect, useState} from 'react';
import userService from '@/services/userService';

type UserItem = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
};

export default function UsersPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Create modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [createError, setCreateError] = useState<string | null>(null);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editEmail, setEditEmail] = useState('');
    const [editFirst, setEditFirst] = useState('');
    const [editLast, setEditLast] = useState('');

    async function loadUsers() {
        setLoading(true);
        try {
            const res = await userService.getUsers();
            if (res.error) {
                console.error(res.error);
            } else if (res.data) {
                const payload = (res.data as any).data || res.data;
                setUsers(Array.isArray(payload) ? payload : []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    async function handleCreate(e?: React.FormEvent) {
        e?.preventDefault();
        setCreateError(null);
        if (!email.trim()) {
            setCreateError('Email is required');
            return;
        }
        setLoading(true);
        try {
            const res = await userService.createUser({email: email.trim(), firstName: firstName.trim() || undefined, lastName: lastName.trim() || undefined});
            if (res.error) {
                setCreateError(res.error.messages?.join('\n') || 'Create failed');
            } else {
                setIsCreateOpen(false);
                setEmail(''); setFirstName(''); setLastName('');
                await loadUsers();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function startEdit(u: UserItem) {
        setEditingId(u.id);
        setEditEmail(u.email);
        setEditFirst(u.firstName || '');
        setEditLast(u.lastName || '');
    }

    async function saveEdit() {
        if (!editingId) return;
        setLoading(true);
        try {
            const res = await userService.updateUser(editingId, {email: editEmail, firstName: editFirst, lastName: editLast});
            if (res.error) {
                alert(res.error.messages?.join('\n') || 'Update failed');
            } else {
                setEditingId(null);
                await loadUsers();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(userId: string) {
        if (!confirm('Delete this user?')) return;
        setLoading(true);
        try {
            const res = await userService.deleteUser(userId);
            if (res.error) {
                alert(res.error.messages?.join('\n') || 'Delete failed');
            } else {
                await loadUsers();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">User Management</h1>
                <button onClick={() => setIsCreateOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-md shadow">➕ New User</button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-medium">Users</h2>
                    <p className="text-sm text-gray-500">List of users in the system.</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">First Name</th>
                            <th className="px-4 py-3 text-left">Last Name</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    {editingId === u.id ? (
                                        <input className="border px-2 py-1 rounded-md" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                                    ) : (
                                        u.email
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {editingId === u.id ? (
                                        <input className="border px-2 py-1 rounded-md" value={editFirst} onChange={e => setEditFirst(e.target.value)} />
                                    ) : (
                                        u.firstName || '-'
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {editingId === u.id ? (
                                        <input className="border px-2 py-1 rounded-md" value={editLast} onChange={e => setEditLast(e.target.value)} />
                                    ) : (
                                        u.lastName || '-'
                                    )}
                                </td>
                                <td className="px-4 py-3 space-x-2">
                                    {editingId === u.id ? (
                                        <>
                                            <button onClick={saveEdit} className="bg-blue-600 text-white px-3 py-1 rounded-md">Save</button>
                                            <button onClick={() => setEditingId(null)} className="bg-gray-200 px-3 py-1 rounded-md">Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEdit(u)} className="bg-yellow-400 px-3 py-1 rounded-md">Edit</button>
                                            <button onClick={() => handleDelete(u.id)} className="bg-red-600 text-white px-3 py-1 rounded-md">Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">No users yet.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isCreateOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setIsCreateOpen(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg p-6 z-50">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Create User</h3>
                                <p className="text-sm text-gray-500">Enter email and optional names.</p>
                            </div>
                            <button onClick={() => setIsCreateOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>

                        <form onSubmit={handleCreate} className="mt-4 space-y-3">
                            <div>
                                <label className="block text-sm font-medium">Email</label>
                                <input value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium">First name</label>
                                    <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Last name</label>
                                    <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2" />
                                </div>
                            </div>
                            {createError && <p className="text-xs text-red-600">{createError}</p>}
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-md border">Cancel</button>
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
