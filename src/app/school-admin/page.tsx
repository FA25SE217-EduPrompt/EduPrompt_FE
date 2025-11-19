"use client";

import React, { useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import {
    UserGroupIcon,
    DocumentTextIcon,
    ChartBarIcon,
    PlusIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";

const SchoolAdminDashboard: React.FC = () => {
    const [showAssignModal, setShowAssignModal] = useState(true);
    const [emailInput, setEmailInput] = useState("");
    const [assignedEmails, setAssignedEmails] = useState<string[]>([]);

    const handleAddEmail = (e: React.FormEvent) => {
        e.preventDefault();
        if (emailInput && !assignedEmails.includes(emailInput)) {
            setAssignedEmails([...assignedEmails, emailInput]);
            setEmailInput("");
        }
    };

    const removeEmail = (email: string) => {
        setAssignedEmails(assignedEmails.filter(e => e !== email));
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">School Dashboard</h1>
                    <p className="text-gray-600">Overview of your school&apos;s usage and performance</p>
                </div>
                <button
                    onClick={() => setShowAssignModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Assign Teachers</span>
                </button>
            </div>

            {/* Stats Overview */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Active Teachers"
                    value="24"
                    icon={<UserGroupIcon />}
                    gradientClass="from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Total Prompts"
                    value="1,458"
                    icon={<DocumentTextIcon />}
                    gradientClass="from-purple-500 to-purple-600"
                />
                <StatCard
                    title="Monthly Usage"
                    value="85%"
                    icon={<ChartBarIcon />}
                    gradientClass="from-green-500 to-green-600"
                />
            </section>

            {/* Recent Activity */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    <UserGroupIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">New teacher joined: Sarah Johnson</p>
                                    <p className="text-xs text-gray-500">2 hours ago</p>
                                </div>
                            </div>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Active
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Assign Teachers Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Assign Teachers</h3>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                Enter email addresses to invite teachers to your school&apos;s organization.
                            </p>

                            <form onSubmit={handleAddEmail} className="flex gap-2">
                                <input
                                    type="email"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    placeholder="teacher@school.edu"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                                >
                                    Add
                                </button>
                            </form>

                            {assignedEmails.length > 0 && (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {assignedEmails.map((email) => (
                                        <div key={email} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                            <span className="text-sm text-gray-700">{email}</span>
                                            <button
                                                onClick={() => removeEmail(email)}
                                                className="text-red-400 hover:text-red-600"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    console.log('Inviting:', assignedEmails);
                                    setShowAssignModal(false);
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                            >
                                Send Invitations
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchoolAdminDashboard;
