"use client";

import React, {useEffect, useState} from 'react';
import groupService from '@/services/resources/group';

type GroupItem = {
	id: string;
	name: string;
	description?: string;
};

type MemberItem = {
	userId: string;
	email?: string;
	role?: string;
};

export default function GroupPage() {
	const [groups, setGroups] = useState<GroupItem[]>([]);
	const [loading, setLoading] = useState(false);

	// Create modal (only name)
	const [name, setName] = useState('');
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [createError, setCreateError] = useState<string | null>(null);

	// For loading group by id
	const [loadId, setLoadId] = useState('');

	// Edit
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editName, setEditName] = useState('');
	const [editDescription, setEditDescription] = useState('');

	// Members modal
	const [openMembersFor, setOpenMembersFor] = useState<string | null>(null);
	const [members, setMembers] = useState<MemberItem[]>([]);
	const [newMemberUserId, setNewMemberUserId] = useState('');

	// Helper: add or replace group in local state
	function upsertGroup(g: GroupItem) {
		setGroups(prev => {
			const idx = prev.findIndex(x => x.id === g.id);
			if (idx === -1) return [g, ...prev];
			const copy = [...prev];
			copy[idx] = g;
			return copy;
		});
	}

	async function handleCreate(e?: React.FormEvent) {
		e?.preventDefault();
		setCreateError(null);
		if (!name.trim()) {
			setCreateError('Name is required');
			return;
		}
		setLoading(true);
		try {
			const res = await groupService.createGroup({name: name.trim()});
			if (res.error) {
				alert(res.error.messages?.join('\n') || 'Create failed');
			} else if (res.data) {
				// Backend may return created object directly or wrapped in { data }
				const payload = (res.data as any).data || res.data;
				const createdId = payload?.id || (res.data as any).id || String(Date.now());
				upsertGroup({id: createdId, name: name.trim(), description: ''});
				setName('');
				setIsCreateOpen(false);
				setCreateError(null);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	async function handleLoadById(e?: React.FormEvent) {
		e?.preventDefault();
		if (!loadId.trim()) return;
		setLoading(true);
		try {
			const res = await groupService.getGroup(loadId.trim());
			if (res.error) {
				alert(res.error.messages?.join('\n') || 'Load failed');
			} else if (res.data) {
				const g = (res.data as any).data || res.data;
				if (g) upsertGroup({id: g.id || loadId.trim(), name: g.name || '', description: g.description || ''});
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	function startEdit(g: GroupItem) {
		setEditingId(g.id);
		setEditName(g.name);
		setEditDescription(g.description || '');
	}

	async function saveEdit() {
		if (!editingId) return;
		setLoading(true);
		try {
			const res = await groupService.updateGroup(editingId, {name: editName, description: editDescription});
			if (res.error) {
				alert(res.error.messages?.join('\n') || 'Update failed');
			} else {
				upsertGroup({id: editingId, name: editName, description: editDescription});
				setEditingId(null);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	async function openMembers(gid: string) {
		setOpenMembersFor(gid);
		setMembers([]);
		setLoading(true);
		try {
			const res = await groupService.getMembers(gid);
			if (res.error) {
				alert(res.error.messages?.join('\n') || 'Failed to load members');
			} else if (res.data) {
				const payload = (res.data as any).data || res.data;
				setMembers(Array.isArray(payload) ? payload : []);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	async function handleAddMember() {
		if (!openMembersFor || !newMemberUserId.trim()) return;
		setLoading(true);
		try {
			const res = await groupService.addMember(openMembersFor, {userId: newMemberUserId.trim()});
			if (res.error) {
				alert(res.error.messages?.join('\n') || 'Add member failed');
			} else {
				// Reload members
				await openMembers(openMembersFor);
				setNewMemberUserId('');
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	async function handleRemoveMember(userId: string) {
		if (!openMembersFor) return;
		if (!confirm('Remove this member?')) return;
		setLoading(true);
		try {
			const res = await groupService.removeMember(openMembersFor, userId);
			if (res.error) {
				alert(res.error.messages?.join('\n') || 'Remove failed');
			} else {
				await openMembers(openMembersFor);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="p-6">
			<div className="max-w-6xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-semibold">Group Management</h1>
					<div className="flex items-center gap-3">
						<button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded shadow hover:opacity-95">➕ New Group</button>
					</div>
				</div>

				<section className="mb-6">
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
							<div className="px-6 py-4 border-b">
								<h2 className="text-lg font-medium">Groups</h2>
								<p className="text-sm text-gray-500">Create and manage groups and their members.</p>
							</div>

						{/* Create modal */}
						{isCreateOpen && (
							<div className="fixed inset-0 z-40 flex items-center justify-center p-6">
								<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
								<div className="relative bg-white w-full max-w-md rounded-lg shadow-lg p-6 z-50">
									<div className="flex items-start justify-between">
										<div>
											<h3 className="text-lg font-semibold">Create Group</h3>
											<p className="text-sm text-gray-500">Only a name is required to create a group.</p>
										</div>
										<button onClick={() => setIsCreateOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
									</div>

									<form onSubmit={handleCreate} className="mt-4">
										<div className="mb-3">
											<label className="block text-sm font-medium mb-1">Name</label>
											<input autoFocus value={name} onChange={e => setName(e.target.value)} className={`w-full border rounded px-3 py-2 focus:outline-none ${createError ? 'border-red-500' : 'border-gray-200'}`} />
											{createError && <p className="text-xs text-red-600 mt-1">{createError}</p>}
										</div>

										<div className="flex justify-end gap-2">
											<button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
											<button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>Create</button>
										</div>
									</form>
								</div>
							</div>
						)}
					</div>
				</section>

				<section className="mb-6 mt-6 px-1">
					<form onSubmit={handleLoadById} className="flex gap-2 items-end">
						<div className="flex-1">
							<label className="block text-sm font-medium">Load Group by ID</label>
							<input value={loadId} onChange={e => setLoadId(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none" />
						</div>
						<div>
							<button className="bg-gray-700 text-white px-4 py-2 rounded-md hover:opacity-95" disabled={loading}>Load</button>
						</div>
					</form>
				</section>

			<section>
				<h2 className="text-lg font-medium mb-2">Groups</h2>
				<div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
					<table className="min-w-full divide-y">
						<thead className="bg-gray-50">
						<tr>
							<th className="px-4 py-2 text-left">ID</th>
							<th className="px-4 py-2 text-left">Name</th>
							<th className="px-4 py-2 text-left">Description</th>
							<th className="px-4 py-2 text-left">Actions</th>
						</tr>
						</thead>
						<tbody className="bg-white divide-y">
						{groups.map(g => (
							<tr key={g.id} className="hover:bg-gray-50 transition-colors">
								<td className="px-4 py-2 text-sm">{g.id}</td>
								<td className="px-4 py-2">
									{editingId === g.id ? (
										<input className="border px-2 py-1" value={editName} onChange={e => setEditName(e.target.value)} />
									) : (
										g.name
									)}
								</td>
								<td className="px-4 py-2">
									{editingId === g.id ? (
										<input className="border px-2 py-1" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
									) : (
										g.description
									)}
								</td>
								<td className="px-4 py-2 space-x-2">
									{editingId === g.id ? (
										<>
											<button onClick={saveEdit} className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition">Save</button>
											<button onClick={() => setEditingId(null)} className="bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 transition">Cancel</button>
										</>
									) : (
										<>
											<button onClick={() => startEdit(g)} className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition">Edit</button>
											<button onClick={() => openMembers(g.id)} className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition">Members</button>
										</>
									)}
								</td>
							</tr>
						))}
						{groups.length === 0 && (
							<tr>
								<td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">No groups yet. Create or load one.</td>
							</tr>
						)}
						</tbody>
					</table>
				</div>
			</section>

			{/* Members modal-ish area */}
			{openMembersFor && (
				<div className="fixed inset-0 bg-black/30 flex items-start justify-center p-6">
					<div className="bg-white w-full max-w-2xl rounded shadow p-4">
						<div className="flex justify-between items-center mb-2">
							<h3 className="text-lg font-medium">Members of {openMembersFor}</h3>
							<button onClick={() => setOpenMembersFor(null)} className="px-2 py-1">Close</button>
						</div>

						<div className="mb-4">
							<div className="flex gap-2">
								<input placeholder="User ID" value={newMemberUserId} onChange={e => setNewMemberUserId(e.target.value)} className="flex-1 border px-2 py-1" />
								<button onClick={handleAddMember} className="bg-blue-600 text-white px-4 py-1 rounded">Add</button>
							</div>
						</div>

						<div className="overflow-auto max-h-64 border rounded">
							<table className="min-w-full">
								<thead className="bg-gray-50">
								<tr>
									<th className="px-4 py-2 text-left">User ID</th>
									<th className="px-4 py-2 text-left">Email</th>
									<th className="px-4 py-2 text-left">Role</th>
									<th className="px-4 py-2 text-left">Actions</th>
								</tr>
								</thead>
								<tbody>
								{members.map(m => (
									<tr key={m.userId}>
										<td className="px-4 py-2">{m.userId}</td>
										<td className="px-4 py-2">{m.email || '-'}</td>
										<td className="px-4 py-2">{m.role || '-'}</td>
										<td className="px-4 py-2">
											<button onClick={() => handleRemoveMember(m.userId)} className="bg-red-600 text-white px-3 py-1 rounded">Remove</button>
										</td>
									</tr>
								))}
								{members.length === 0 && (
									<tr>
										<td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">No members</td>
									</tr>
								)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}
			</div>
		</div>
	);
}

