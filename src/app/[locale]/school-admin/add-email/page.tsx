"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon,
    EnvelopeIcon,
    PaperAirplaneIcon
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
// import axios from "axios"; // Uncomment when API is ready
// import axios from "axios"; // Uncomment when API is ready
import { SchoolAdminService } from "@/services/resources/schoolAdmin";
import { SchoolService } from "@/services/resources/school";
import { useAuth } from "@/hooks/useAuth";

const AddEmailPage: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [emailList, setEmailList] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleAddEmail = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedEmail = email.trim();

        if (!trimmedEmail) return;

        if (!emailRegex.test(trimmedEmail)) {
            toast.error("Please enter a valid email address");
            return;
        }

        if (emailList.includes(trimmedEmail)) {
            toast.error("This email has already been added");
            return;
        }

        setEmailList([...emailList, trimmedEmail]);
        setEmail("");
    };

    const handleRemoveEmail = (emailToRemove: string) => {
        setEmailList(emailList.filter(e => e !== emailToRemove));
    };

    const { user } = useAuth(); // Assuming useAuth is available or import it

    const handleSubmit = async () => {
        if (emailList.length === 0) {
            toast.error("Please add at least one email address");
            return;
        }

        if (!user || !user.id) {
            toast.error("User information not available");
            return;
        }

        setIsLoading(true);

        try {
            // Fetch school ID using the current user's ID
            const schoolResponse = await SchoolService.getSchoolByUserId(user.id);
            const schoolId = schoolResponse.data?.id;

            if (!schoolId) {
                throw new Error("Could not retrieve School ID");
            }

            await SchoolAdminService.addEmails(schoolId, emailList);

            toast.success(`Successfully assigned ${emailList.length} teachers`);
            setEmailList([]);
            router.push('/school-admin');
        } catch (error) {
            console.error("Failed to assign teachers:", error);
            toast.error("Failed to assign teachers. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 space-y-8 bg-bg-secondary min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors text-text-secondary"
                >
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Assign Teachers</h1>
                    <p className="text-text-secondary">Add teachers to your school&apos;s subscription plan</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Input Section */}
                <div className="bg-bg-primary p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <EnvelopeIcon className="h-5 w-5 text-brand-primary" />
                        Add Email Addresses
                    </h2>
                    <form onSubmit={handleAddEmail} className="flex gap-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="teacher@school.edu"
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!email || isLoading}
                            className="btn-primary px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Add
                        </button>
                    </form>
                </div>

                {/* List Section */}
                {emailList.length > 0 && (
                    <div className="bg-bg-primary p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-text-primary">
                                Teachers to Assign <span className="text-text-secondary text-sm font-normal">({emailList.length})</span>
                            </h2>
                            <button
                                onClick={() => setEmailList([])}
                                className="text-sm text-red-600 hover:text-red-700 hover:underline"
                            >
                                Clear all
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {emailList.map((item, index) => (
                                <div
                                    key={`${item}-${index}`}
                                    className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg border border-gray-100 group hover:border-brand-primary/30 transition-colors"
                                >
                                    <span className="text-text-primary font-medium">{item}</span>
                                    <button
                                        onClick={() => handleRemoveEmail(item)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                        title="Remove email"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="btn-primary px-8 py-3 rounded-lg font-medium flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <PaperAirplaneIcon className="h-5 w-5" />
                                        Confirm Assignment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default AddEmailPage;
