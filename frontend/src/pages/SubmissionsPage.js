"use client"

import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import SideNav from "../components/SideNav";
import { fetchSubmissionByCreator, approveSubmission, rejectSubmission } from "../services/auth";
import { CheckCircle, Search, ChevronDown, ChevronUp, XCircle, Clock, AlertCircle, Code  } from "lucide-react";
import SubmissionItem from "../components/SubmissionItem";
import MonacoEditor from "@monaco-editor/react"
import { fetchSubCodeFile } from "../services/auth"

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBugs, setExpandedBugs] = useState({});
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [submittedCode, setSubmittedCode] = useState("");
  const [userId, setUserId] = useState(() => {
    const storedUserId = localStorage.getItem("rememberMe")
    return storedUserId ? Number.parseInt(storedUserId, 10) : null
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true)
      try {
        if (userId) {
          const data = await fetchSubmissionByCreator(userId)
          console.log(data)
          setSubmissions(data.body || [])
        } else {
          console.warn("User ID not found in localStorage")
          setSubmissions([])
        }
      } catch (error) {
        console.error("Error fetching submissions:", error)
        setSubmissions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubmissions()
  }, [userId])

  const toggleBugExpanded = (bugId) => {
    setExpandedBugs((prev) => ({
      ...prev,
      [bugId]: !prev[bugId],
    }))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return (
      date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }) +
      " at " +
      date.toLocaleTimeString("en-US")
    )
  }

  const filteredBugs = useMemo(() => {
    const uniqueBugs = []
    const bugIds = new Set()

    // Collect unique bugs based on bug ID
    submissions.forEach((submission) => {
      if (!bugIds.has(submission.bug.id)) {
        uniqueBugs.push(submission.bug)
        bugIds.add(submission.bug.id)
      }
    })

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return uniqueBugs.filter((bug) =>
                bug.title.toLowerCase().includes(term) || bug.description.toLowerCase().includes(term)
            );
        }

    return uniqueBugs
  }, [submissions, searchTerm])

  const getSubmissionsForBug = (bugId) => {
    return submissions.filter((submission) => submission.bug.id === bugId)
  }

  const toggleSubmissionExpanded = async (submission) => {
    if (expandedSubmission === submission.id) {
      setExpandedSubmission(null)
      setSubmittedCode("") // Clear the code when collapsing
    } else {
      setExpandedSubmission(submission.id)
      await loadSubCode(submission)
    }
  }

  const loadSubCode = async (item) => {
    setCodeLoading(true)
    try {
      const subId = item.id
      const userId = item.user.id
      const bugId = item.bug.id
      const username = item.user.username
      const language = item.bug.language

      const fetchedCode = await fetchSubCodeFile(userId, username, language, bugId, subId)

      setSubmittedCode(fetchedCode || "") // Set the fetched code
    } catch (error) {
      console.error("Error fetching code file:", error)
      setSubmittedCode("Error loading code.") // Optional: Set an error message
    } finally {
      setCodeLoading(false) // Always update loading state
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center"
      case "unapproved":
        return "bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center"
      case "rejected":
        return "bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center"
      default:
        return "bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 mr-1" />
      case "unapproved":
        return <Clock className="h-4 w-4 mr-1" />
      case "rejected":
        return <XCircle className="h-4 w-4 mr-1" />
      default:
        return <AlertCircle className="h-4 w-4 mr-1" />
    }
  }

  const capitalizeFirstLetter = (str) => {
    if (!str) return ""
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const handleApprove = async (submissionId) => {
    try {
      const approverId = userId; // Use the current user's ID as the approver
      if (!approverId) {
        console.error("Approver ID is missing.")
        return
      }

      const response = await approveSubmission(submissionId, approverId)
      console.log("Approval response:", response)

            setSubmissions((prevSubmissions) =>
                prevSubmissions.map((sub) =>
                    sub.id === submissionId ? { ...sub, approvalStatus: "approved" } : sub
                )
            );
            setExpandedSubmission(null);
        } catch (error) {
            console.error("Error approving submission:", error);
        }
    };

    const handleReject = async (submissionId) => {
        try {
            const rejecterId = userId;
            if (!rejecterId) {
                console.error("Rejecter ID is missing.");
                return;
            }

      const response = await rejectSubmission(submissionId, rejecterId)
      console.log("Reject response:", response)

      // Update the submission status locally
      setSubmissions((prevSubmissions) =>
        prevSubmissions.map((sub) => (sub.id === submissionId ? { ...sub, approvalStatus: "rejected" } : sub)),
      )
      setExpandedSubmission(null) // Collapse the submission after rejection
    } catch (error) {
      console.error("Error rejecting submission:", error)
    }
  }

  const renderSubmissionItem = (submission) => {
    const isExpanded = expandedSubmission === submission.id
    const showActions = submission.user.id !== userId // Hide actions if it's the current user's submission
    const statusClass = getStatusColor(submission.approvalStatus)

    return (
      <div key={submission.id} className="p-3 border rounded mb-2 hover:bg-gray-50 transition">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSubmissionExpanded(submission)}
        >
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="font-medium text-gray-700">Solution by: {submission.user?.username}</span>
            </div>
            <div className="text-sm text-gray-500 flex flex-wrap gap-2 mt-1">
              <span className={statusClass}>
                {getStatusIcon(submission.approvalStatus)}
                {capitalizeFirstLetter(submission.approvalStatus)}
              </span>
              <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium">
                {formatDate(submission.submittedAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <Code className="h-4 w-4 text-gray-400 mr-2" />
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded">{submission.description}</p>

            <h3 className="font-medium mb-2">Code Solution</h3>
            {codeLoading ? (
              <div className="flex justify-center items-center h-40">
                <Clock className="h-6 w-6 text-blue-500 animate-spin" />
                <span className="ml-2">Loading code...</span>
              </div>
            ) : (
              <div className="border border-gray-200 rounded overflow-hidden mb-4">
                <MonacoEditor
                  height="400px"
                  language={submission.bug.language || "javascript"}
                  theme="vs-dark"
                  value={submittedCode}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    scrollbar: {
                      vertical: "visible",
                      horizontalSliderSize: 4,
                      verticalSliderSize: 4,
                      alwaysConsumeMouseWheel: false,
                    },
                    lineNumbers: "on",
                    automaticLayout: true,
                  }}
                />
              </div>
            )}

            {showActions && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleApprove(submission.id)
                  }}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReject(submission.id)
                  }}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1">
        <div className="w-48 flex-shrink-0">
          <SideNav />
        </div>
        <main className="flex-1 bg-gray-100 p-4 pt-16 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Submissions</h1>

            {/* Search input */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search bugs..."
                  className="p-2 border rounded hover:border-gray-400 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="bg-white p-4 rounded shadow">
                <div className="flex justify-center items-center h-40">
                  <Clock className="h-6 w-6 text-blue-500 animate-spin" />
                  <span className="ml-2">Loading submissions...</span>
                </div>
              </div>
            ) : (
              <>
                {filteredBugs.length === 0 ? (
                  <div className="bg-white p-4 rounded shadow">
                    <p className="text-gray-500">No submissions found for any bugs created by you.</p>
                  </div>
                ) : (
                  filteredBugs.map((bug) => (
                    <div key={bug.id} className="bg-white p-4 rounded shadow mb-4">
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => toggleBugExpanded(bug.id)}
                      >
                        <div className="flex flex-col">
                          <h3 className="font-medium text-blue-500 hover:underline">{bug.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{bug.description}</p>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium mr-2">
                            {getSubmissionsForBug(bug.id).length} solution
                            {getSubmissionsForBug(bug.id).length !== 1 ? "s" : ""}
                          </span>
                          {expandedBugs[bug.id] ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {expandedBugs[bug.id] && (
                        <div className="mt-4 space-y-2">
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
  )
}