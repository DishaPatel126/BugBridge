"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import SideNav from "../components/SideNav";
import { fetchSubmissionByUser } from "../services/auth"; // Import the new function
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    RefreshCcw,
    ChevronDown,
    ChevronUp,
    Search,
    Filter,
} from "lucide-react";
import MonacoEditor from "@monaco-editor/react";
import { fetchSubCodeFile } from "../services/auth";

export default function MySubs() {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedBugs, setExpandedBugs] = useState({});
    const [expandedSubmission, setExpandedSubmission] = useState(null); // To track which submission is expanded
    const [Submittedcode, setSubmittedcode] = useState("");
    const [userId, setUserId] = useState(() => {
        const storedUserId = localStorage.getItem("rememberMe");
        return storedUserId ? parseInt(storedUserId, 10) : null;
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [codeLoading, setCodeLoading] = useState(false);

    useEffect(() => {
        const fetchSubmissions = async () => {
            setIsLoading(true);
            try {
                if (userId) {
                    const data = await fetchSubmissionByUser(userId);
                    setSubmissions(data.body || []);
                } else {
                    console.warn("User ID not found in localStorage");
                    setSubmissions([]);
                }
            } catch (error) {
                console.error("Error fetching submissions:", error);
                setSubmissions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubmissions();
    }, [userId]);

    const toggleBugExpanded = (bugId) => {
        setExpandedBugs((prev) => ({
            ...prev,
            [bugId]: !prev[bugId],
        }));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return (
            date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }) +
            " at " +
            date.toLocaleTimeString("en-US")
        );
    };

    const filteredBugs = useMemo(() => {
        const uniqueBugs = [];
        const bugIds = new Set();

        // Collect unique bugs based on bug ID
        submissions.forEach((submission) => {
            if (!bugIds.has(submission.bug.id)) {
                uniqueBugs.push(submission.bug);
                bugIds.add(submission.bug.id);
            }
        });

        // Filter by search term if provided
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return uniqueBugs.filter((bug) =>
                bug.title.toLowerCase().includes(term) || bug.description.toLowerCase().includes(term)
            );
        }

        return uniqueBugs;
    }, [submissions, searchTerm]);

    const getSubmissionsForBug = (bugId) => {
        return submissions.filter((submission) => submission.bug.id === bugId);
    };

    const toggleSubmissionExpanded = async (submission) => {
        if (expandedSubmission === submission.id) {
            setExpandedSubmission(null);
            setSubmittedcode(""); // Clear the code when collapsing
        } else {
            setExpandedSubmission(submission.id);
            await loadSubCode(submission);
        }
    };

    const loadSubCode = async (item) => {
        setCodeLoading(true);
        try {
            const subId = item.id;
            const userId = item.user.id;
            const bugId = item.bug.id;
            const username = item.user.username;
            const language = item.bug.language;

            const fetchedCode = await fetchSubCodeFile(userId, username, language, bugId, subId);

            setSubmittedcode(fetchedCode || ""); // Set the fetched code
        } catch (error) {
            console.error("Error fetching code file:", error);
            setSubmittedcode("Error loading code."); // Optional: Set an error message
        } finally {
            setCodeLoading(false); // Always update loading state
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "approved":
                return "text-green-500";
            case "unapproved":
                return "text-orange-500";
            case "rejected":
                return "text-red-500";
            default:
                return "text-gray-500"; // Default color if status is unknown
        }
    };

    const renderSubmissionItem = (submission) => {
        const isExpanded = expandedSubmission === submission.id;

        const statusColor = getStatusColor(submission.approvalStatus);

        return (
            <div key={submission.id} className="p-4 border-b border-gray-200 last:border-b-0">
                <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleSubmissionExpanded(submission)}
                >
                    <div>
                        <div className="text-sm text-gray-500">
                        Submitted on: {formatDate(submission.submittedAt)}
                            <span className={`ml-1 font-medium ${statusColor}`}>{submission.approvalStatus}</span>
                        </div>
                    </div>
                    <div>
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </div>
                </div>

                {isExpanded && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <p className="text-gray-700 mb-4">{submission.description}</p>
                        <h3 className="text-lg font-semibold mb-2">Code</h3>
                        {codeLoading ? (
                            <p>Loading code...</p>
                        ) : (
                            <MonacoEditor
                                height="400px"
                                language={submission.bug.language || "javascript"}
                                theme="vs-dark"
                                value={Submittedcode}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    scrollbar: { vertical: "hidden" },
                                    lineNumbers: "on",
                                    automaticLayout: true,
                                }}
                            />
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex flex-1">
                <div className="w-48 flex-shrink-0">
                    <SideNav />
                </div>
                <main className="flex-1 bg-gray-100 p-4 overflow-auto">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-2xl font-bold mb-6">Submissions</h1>
                        <div className="flex-1 relative mb-4">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search bugs..."
                                className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {isLoading ? (
                            <div className="text-center py-4">Loading submissions...</div>
                        ) : (
                            <>
                                {filteredBugs.length === 0 ? (
                                    <div className="text-center py-4">No submissions found for any bugs created by you.</div>
                                ) : (
                                    filteredBugs.map((bug) => (
                                        <div key={bug.id} className="bg-white rounded-lg shadow mb-3 border border-gray-200 overflow-hidden">
                                            <div
                                                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                                onClick={() => toggleBugExpanded(bug.id)}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="text-lg font-medium text-blue-500">{bug.title}</div>
                                                    <div className="flex items-center">
                                                        {expandedBugs[bug.id] ? (
                                                            <ChevronUp className="h-5 w-5 text-gray-400" />
                                                        ) : (
                                                            <ChevronDown className="h-5 w-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {expandedBugs[bug.id] && (
                                                <div className="border-t border-gray-100">
                                                    {getSubmissionsForBug(bug.id).map((submission) => renderSubmissionItem(submission))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
