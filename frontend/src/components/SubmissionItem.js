import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import MonacoEditor from "@monaco-editor/react";
import { fetchSubCodeFile } from "../services/auth";

const SubmissionItem = ({ submission, isExpanded, onToggle, onApprove, onReject, userId, codeLoading: initialCodeLoading, Submittedcode: initialSubmittedCode }) => {
    const [codeLoading, setCodeLoading] = useState(initialCodeLoading);
    const [Submittedcode, setSubmittedcode] = useState(initialSubmittedCode);

    useEffect(() => {
        if (isExpanded && !Submittedcode) {
            loadSubCode();
        }
    }, [isExpanded]);

    const loadSubCode = async () => {
        setCodeLoading(true);
        try {
            const { id: subId, user, bug } = submission;
            const fetchedCode = await fetchSubCodeFile(user.id, user.username, bug.language, bug.id, subId);
            setSubmittedcode(fetchedCode || "");
        } catch (error) {
            console.error("Error fetching code file:", error);
            setSubmittedcode("Error loading code.");
        } finally {
            setCodeLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }) + " at " + date.toLocaleTimeString("en-US");
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "approved": return "text-green-500";
            case "unapproved": return "text-orange-500";
            case "rejected": return "text-red-500";
            default: return "text-gray-500";
        }
    };

    const showActions = submission.user.id !== userId;
    const statusColor = getStatusColor(submission.approvalStatus);

    return (
        <div className="p-4 border-b border-gray-200 last:border-b-0">
            <div
                className="flex justify-between items-center cursor-pointer"
                onClick={onToggle}
            >
                <div>
                    <div className="text-sm text-gray-500">
                        Solution by: {submission.user?.username}
                        <span className={`ml-1 font-medium ${statusColor}`}>{submission.approvalStatus}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        Submitted on: {formatDate(submission.submittedAt)}
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
                    {showActions && (
                        <div className="flex justify-end mt-4">
                            <button
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                                onClick={() => onApprove(submission.id)}
                            >
                                Approve
                            </button>
                            <button
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => onReject(submission.id)}
                            >
                                Reject
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubmissionItem;
