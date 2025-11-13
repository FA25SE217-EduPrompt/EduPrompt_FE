import React from "react";
import {
    BookOpenIcon,
    SparklesIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    WalletIcon,
    PlusCircleIcon,
    BoltIcon,
    StarIcon,
    AcademicCapIcon,
} from "@heroicons/react/24/outline";

const TeacherDashboard: React.FC = () => {
    return (
        <div className="flex h-screen bg-bg-secondary text-text-primary">
            <aside className="w-64 bg-brand-primary text-text-on-brand flex flex-col">
                <div className="p-5 text-2xl font-bold border-b border-brand-secondary/30">EduPrompt</div>
                <nav className="flex-1 p-4 space-y-2">
                    <NavItem icon={<SparklesIcon className="h-5 w-5" />} label="My Prompts" />
                    <NavItem icon={<BookOpenIcon className="h-5 w-5" />} label="My Collections" />
                    <NavItem icon={<ChartBarIcon className="h-5 w-5" />} label="Explore / Community" />
                    <NavItem icon={<Cog6ToothIcon className="h-5 w-5" />} label="Personalization" />
                    <NavItem icon={<WalletIcon className="h-5 w-5" />} label="Subscription & Wallet" />
                </nav>

                {/* Footer area in sidebar */}
                <div className="p-4 border-t border-brand-secondary/30 space-y-2"></div>
            </aside>

            {/* Main content area (header + dashboard panels) */}
            <div className="flex-1 flex flex-col">
                {/* Header: uses 'bg-primary' (white) with opacity */}
                <header className="flex items-center justify-between bg-bg-primary/90 backdrop-blur-md shadow-sm px-6 py-3">
                    <h1 className="text-xl font-semibold text-text-primary">Teacher Dashboard</h1>

                    {/* Simple profile block */}
                    <div className="flex items-center gap-4">
                        <img
                            src="#"
                            alt="User avatar"
                            className="rounded-full h-8 w-8 border border-brand-secondary"
                        />
                        <span className="text-sm font-medium text-text-secondary">Lord Tri Nguyen</span>
                    </div>
                </header>

                {/* Main scrollable content */}
                <main className="flex-1 overflow-y-auto p-6 space-y-8">
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Prompts Created"
                            value="42"
                            color="from-brand-primary to-brand-secondary"
                        />
                        <StatCard
                            title="Collections Owned"
                            value="8"
                            color="from-brand-secondary to-brand-highlight"
                        />
                        <StatCard
                            title="Optimizations Used"
                            value="120"
                            color="from-brand-primary to-brand-secondary"
                        />
                        <StatCard
                            title="Tokens Remaining"
                            value="1,250"
                            color="from-brand-secondary to-brand-highlight"
                        />
                    </section>

                    {/* Prompts area */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                                My Prompts
                            </h2>

                            <button
                                aria-label="Create new prompt"
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm shadow-sm btn-primary"
                            >
                                <PlusCircleIcon className="h-5 w-5" />
                                <span>Create</span>
                            </button>
                        </div>

                        {/* Prompt grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <PromptCard
                                title="Photosynthesis Quiz"
                                subject="Biology"
                                grade="10"
                                type="Quiz"
                                rating={4.5}
                                aiGenerated
                            />
                            <PromptCard
                                title="Newton’s Laws Practice"
                                subject="Physics"
                                grade="11"
                                type="Worksheet"
                                rating={4.8}
                            />
                            <PromptCard
                                title="Vietnamese Poetry Analysis"
                                subject="Literature"
                                grade="12"
                                type="Essay"
                                rating={4.2}
                                aiGenerated
                            />
                            <PromptCard
                                title="Chemical Reactions Lab"
                                subject="Chemistry"
                                grade="10"
                                type="Activity"
                                rating={4.7}
                            />
                        </div>
                    </section>

                    {/* Recommendations area */}
                    <section>
                        <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                            <AcademicCapIcon className="h-5 w-5 text-brand-primary" /> AI Suggestions for You
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <PromptCard
                                title="Grammar Challenge: Passive Voice"
                                subject="English"
                                grade="11"
                                type="Exercise"
                                rating={4.6}
                                aiGenerated
                            />
                            <PromptCard
                                title="Vietnamese History Timeline"
                                subject="History"
                                grade="12"
                                type="Project"
                                rating={4.9}
                                aiGenerated
                            />
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

/* -----------------------------
   Reusable subcomponents below
   ----------------------------- */

// NavItem
const NavItem = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <div
        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-brand-secondary/20 cursor-pointer transition text-text-on-brand"
    >
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </div>
);

// StatCard: Updated to use text-on-brand
const StatCard = ({
                      title,
                      value,
                      color,
                  }: {
    title: string;
    value: string;
    color: string;
}) => (
    <div
        className={`bg-gradient-to-r ${color} text-text-on-brand rounded-xl p-4 flex flex-col items-start shadow-sm`}
        role="status"
        aria-label={`${title}: ${value}`}
    >
        <span className="text-sm opacity-95">{title}</span>
        <span className="text-2xl font-bold mt-1">{value}</span>
    </div>
);

const PromptCard = ({
                        title,
                        subject,
                        grade,
                        type,
                        rating,
                        aiGenerated,
                    }: {
    title: string;
    subject: string;
    grade: string;
    type: string;
    rating: number;
    aiGenerated?: boolean;
}) => (
    <div className="bg-bg-primary rounded-xl p-4 shadow-sm hover:shadow-md transition border border-brand-subtle text-text-primary relative">
        <div className="flex justify-between items-start">
            <h3 className="font-semibold text-text-primary text-base">{title}</h3>

            <div className="flex items-center gap-2">
                {aiGenerated && (
                    <SparklesIcon className="h-5 w-5 text-brand-primary" title="AI Generated" />
                )}


                <button
                    aria-label={`Optimize prompt ${title}`}
                    className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md text-xs shadow-sm btn-primary"
                >
                    <BoltIcon className="h-4 w-4" />
                    <span>Optimize</span>
                </button>
            </div>
        </div>


        <div className="flex flex-wrap gap-2 mt-2">
            <Badge color="bg-brand-subtle text-brand-primary" text={subject} />
            <Badge color="bg-brand-subtle text-brand-primary" text={`Grade ${grade}`} />
            <Badge color="bg-brand-subtle text-brand-primary" text={type} />
        </div>


        <div className="flex items-center mt-3 text-brand-secondary">
            <StarIcon className="h-4 w-4 fill-current text-brand-secondary" />
            <span className="ml-1 text-sm text-text-secondary">{rating.toFixed(1)}</span>
        </div>
    </div>
);

const Badge = ({ color, text }: { color: string; text: string }) => (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${color}`}>{text}</span>
);

export default TeacherDashboard;