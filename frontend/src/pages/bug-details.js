
import { useState, useEffect, useRef } from "react";

import "../styles/SubmitModal.css";
import CodeEditor from "../components/CodeEditor";
import { useNavigate, useLocation } from "react-router-dom";
// import HorizontalNav from "../components/HorizontalNav";
import SolutionPage from "./SolutionPage";
import SubmissionsPage from "./SubmissionsPage";
import MonacoEditor from "@monaco-editor/react";




import { runCode, fetchSuggestionbyBug , submitCode, fetchSolution, fetchCodeFile, updateBug, fetchUserSubmissionsByBug, fetchComments, addComment, saveDraft, deleteComment, fetchSubCodeFile } from "../services/auth";

import jsBeautify from "js-beautify";
import { Trash } from "lucide-react";

export default function BugDetails({ currentUser }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("description");
    const draft = location.state;
    const bug = draft.bug;
    const draftCodeFilePath = draft.codeFilePath;
    const rememberMeId = parseInt(localStorage.getItem("rememberMe"), 10);
    const isCreator = bug && bug.creator && bug.creator.id === rememberMeId;
    const [selectedLanguage, setSelectedLanguage] = useState(bug.language || "python");
    const [output, setOutput] = useState("");
    const [code, setCode] = useState("");
    const [bugDescription, setBugDescription] = useState(bug.description);
    const [savedDescription, setSavedDescription] = useState(bug.description);
    const [saveStatus, setSaveStatus] = useState("Saved"); // "Saving..." | "Saved"
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [descriptionMinimized, setDescriptionMinimized] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const commentsContainerRef = useRef(null);
    const originalCodeRef = useRef("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const saveTimeoutRef = useRef(null);
    const [selectedItem, setSelectedItem] = useState(null);

    // Debounce Timer Ref
    const debounceTimerRef = useRef(null);
    // Periodic Sync Interval Ref
    // const periodicSyncIntervalRef = useRef(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [description, setDescription] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [submissions, setSubmissions] = useState([]);
    const [solutions, setSolutions] = useState([]);

    // Handle opening and closing of the modal
    const handleOpenSubmitModal = () => {setShowSubmitModal(true);setoldCode(code);}
    const handleCloseSubmitModal = () => {setShowSubmitModal(false);}

    useEffect(() => {
        if (!bug) return;
        // Load saved description from localStorage or use bug.description
        const savedBugDescription = localStorage.getItem(`bug_${bug.id}_description`);
        setBugDescription(savedBugDescription || bug.description);
        setSavedDescription(savedBugDescription || bug.description);
    }, [bug]);

    useEffect(() => {
        const getComments = async () => {
            try {
                const commentsData = await fetchComments(bug.id);
                setComments(commentsData);
                console.log(commentsData)
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };
        getComments();
    }, [bug.id]);

    const handleDescriptionChange = (e) => {
        const newDescription = e.target.value;
        setBugDescription(newDescription);
        setIsSaving(true);
        localStorage.setItem(`bug_${bug.id}_description`, newDescription);
    };

    const saveChanges = async () => {
        if (!isCreator) return;
        try {
            const updatedBug = { ...bug, description: bugDescription };
            await updateBug(updatedBug);
            setSavedDescription(bugDescription);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating bug description:", error);
        }
    };

    const discardChanges = () => {
        setBugDescription(savedDescription);
        setIsEditing(false);
    };

    const handleRunCode = async () => {
        try {
            const result = await runCode(code, selectedLanguage);
            setOutput(result || "No output");
        } catch (error) {
            console.error("Error running code:", error);
            setOutput(`Unexpected Error: ${error.message || error}`);
        }
    };

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB in bytes
    const [oldcode, setoldCode] = useState("");

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            setSuccessMessage("File size exceeds 10 MB limit. Please upload a smaller file.");
            setSelectedFile(null);
            setCode(oldcode); // Reset code if file is too large
            event.target.value = null; // Reset the file input
            return;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileContent = e.target.result; // File content as a string
            setCode(fileContent); // Set the file content as the code
        };
        reader.onerror = (e) => {
            console.error("Error reading file:", e);
            setSuccessMessage("Failed to read file");
            setSelectedFile(null);
            setCode("");
            event.target.value = null;
        };
        reader.readAsText(file); // Read the file as text
    } else {
        setSelectedFile(null);
        setCode(""); // Reset code if no file is selected
    }
};

    const handleSubmitCode = async () => {
        try {
            const userId = localStorage.getItem("rememberMe");
            const bugId = bug.id;
            const desc = description;

            const formData = new FormData();
            formData.append("userId", userId);
            formData.append("bugId", bugId);
            formData.append("desc", desc);
            formData.append("code", code);
            
            await submitCode({ userId, bugId, desc, code });
            setSuccessMessage("✅ Code submitted successfully!");
            fetchSubmissions();
        } catch (error) {
            console.error("Error submitting code:", error);
            setSuccessMessage("Failed to submit code");
        }
    };

    const handleResetCode = () => {
        setCode(originalCodeRef.current);
        localStorage.removeItem(`bug_${bug.id}_code`);
        setIsModalOpen(false);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
        alert("Code copied to clipboard!");
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteComment(commentId);
            const updatedComments = await fetchComments(bug.id);
            setComments(updatedComments);
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const handleAddComment = async () => {
        if (newComment.trim() === "") return;
        try {
            const commentData = {
                bugId: bug.id,
                userId: localStorage.getItem("rememberMe"),
                text: newComment,
            };
            await addComment(commentData);
            const updatedComments = await fetchComments(bug.id);
            setComments(updatedComments);
            setNewComment("");
            setTimeout(() => {
                commentsContainerRef.current?.scrollTo({ top: commentsContainerRef.current.scrollHeight, behavior: "smooth" });
            }, 100);
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleSaveDraft = async () => {
        try {
            setSaveStatus("Saving Draft...");
            const userId = localStorage.getItem("rememberMe");
            const bugId = bug.id;
            const username = bug.creator.username;
            await saveDraft({ userId, bugId, username, code });
            setSaveStatus("Saved");
        } catch (error) {
            console.error("Error saving draft:", error);
            setSaveStatus("Error saving draft");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
        });
    };

    const fetchSubmissions = async () => {
        try {
            const userId = localStorage.getItem("rememberMe");
            const bugId = bug.id;
            const submitData = await fetchUserSubmissionsByBug(userId, bugId);
            console.log("sub", submitData.body);
            setSubmissions(submitData.body||[]);
        } catch (error) {
            console.error("Error fetching submissions:", error);
        }
    };

    const fetchSolutions = async () => {
        try {
            const bugId = bug.id;
            const solutionData = await fetchSolution(bugId);
            console.log("sol", solutionData.body);
            setSolutions(solutionData.body||[]);
        } catch (error) {
            console.error("Error fetching solutions:", error);
        }
    };

    const [suggestions, setSuggestions] = useState([]);

const fetchSuggestions = async () => {
    try {
      const bugId = bug.id;
        const data = await fetchSuggestionbyBug(bugId);
        // setSuggestions(data.suggestions.slice(0, 5));
        setSuggestions(data.suggestions);
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        // Optionally set an error state or show a notification to the user
    }
};


    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Left: Bug Description & Comments */}
            <div className="w-1/2 flex flex-col p-6 bg-white shadow-lg h-screen">
                {/* Breadcrumb Navigation */}
                <div className="flex items-center space-x-2 mb-4">
                    <button className="text-blue-500 hover:underline text-lg font-semibold" onClick={() => navigate("/dashboard")}>
                        ⬅ Bug Board
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="tabs mb-4">
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium 
                                focus:outline-none focus:ring-2 focus:ring-blue-500 
                                transition-colors duration-200 
                                ${activeTab === "description" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    onClick={() => setActiveTab("description")}
                  >
                    Description
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium 
                                focus:outline-none focus:ring-2 focus:ring-blue-500 
                                transition-colors duration-200 
                                ${activeTab === "submissions" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    onClick={() => {
                      setActiveTab("submissions");
                      fetchSubmissions();
                    }}
                  >
                    Submissions
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium 
                                focus:outline-none focus:ring-2 focus:ring-blue-500 
                                transition-colors duration-200 
                                ${activeTab === "solutions" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    onClick={() => {
                      setActiveTab("solutions");
                      fetchSolutions();
                    }}
                  >
                    Solutions
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium 
                                focus:outline-none focus:ring-2 focus:ring-blue-500 
                                transition-colors duration-200 
                                ${activeTab === "suggestions" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    onClick={() => {
                      setActiveTab("suggestions");
                      fetchSuggestions();
                    }}
                  >
                    Suggestions
                  </button>
                </div>

                {/* Bug Title & Edit Button */}
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{bug.title}</h2>
                    {isCreator && !isEditing && (
                        <button
                            className="p-1 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit
                        </button>
                    )}
                </div>

                        {/* Severity & Status */}
                        <p className="text-gray-600 mt-2">
                            <strong>Severity:</strong> {bug.severity} | <strong>Status:</strong> {bug.status}
                        </p>

                {/* Tab Content */}
                {activeTab === "description" && (
                    <>
                        <textarea
                            className="w-full p-3 mt-2 border rounded-md h-[420px] overflow-y-auto focus:outline-none bg-white resize-none"
                            placeholder="Edit bug description..."
                            value={bugDescription}
                            onChange={handleDescriptionChange}
                            readOnly={!isEditing || !isCreator}
                        />
                        {isEditing && isCreator && (
                            <div className="mt-2 flex space-x-4">
                                <button className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600" onClick={saveChanges}>
                                    Save Changes
                                </button>
                                <button className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600" onClick={discardChanges}>
                                    Discard Changes
                                </button>
                            </div>
                        )}
                        <div className="mt-6">
                            <h3 className="text-xl font-bold mb-2">Comments</h3>
                            <div ref={commentsContainerRef} className="transition-all border p-2 rounded-md overflow-y-auto flex-grow h-48">
                                {comments?.length === 0 ? (
                                    <p className="text-gray-500">No comments yet.</p>
                                ) : (
                                    comments?.map((comment) => (
                                        <div key={comment?.id} style={{ justifyContent: 'space-between' }} className="mb-3 flex gap-2">
                                            <div className="mb-3 flex gap-2">
                                                <div className="bg-black rounded-full w-[30px] text-white flex justify-center items-center font-bold">
                                                    {comment?.user?.username[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-light text-gray-500">
                                                        {comment?.user?.username}
                                                    </p>
                                                    <p className="text-sm text-gray-800">
                                                        {comment?.text}
                                                    </p>
                                                </div>
                                            </div>
                                            {isCreator && (
                                                <div onClick={() => handleDeleteComment(comment.id)} style={{ cursor: "pointer" }} className="flex items-center space-x-2">
                                                    <Trash className="h-4 w-4 text-red-500" />
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="mt-2 flex space-x-2 sticky bottom-0 bg-white p-2">
                                <input
                                    type="text"
                                    className="flex-grow p-2 border rounded-md focus:outline-none"
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddComment();
                                        }
                                    }}
                                />
                                <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" onClick={handleAddComment}>
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "submissions" && (
                    <div className="space-y-2">
                        {submissions.length === 0 || !Array.isArray(submissions) ? (
                            <p className="text-gray-500">No submissions found.</p>
                        ) : (
                            submissions.map((submission) => (
                                <div
                                    key={submission.id}
                                    className="p-3 border rounded cursor-pointer hover:bg-gray-50 transition duration-150 ease-in-out flex justify-between items-center"
                                    onClick={() => setSelectedItem(submission)}
                                >
                                    <div>
                                        <h3 className="font-medium">
                                        <span className={
                                            submission.approvalStatus === "approved" ? "text-green-500" :
                                            submission.approvalStatus === "rejected" ? "text-red-500" :
                                            "text-orange-500"
                                        }>
                                            {submission.approvalStatus}
                                        </span>

                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            <span>{formatDate(submission.submittedAt)}</span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "solutions" && (
                    <div className="space-y-2">
                        {solutions.length === 0 ? (
                            <p className="text-gray-500">No solutions found.</p>
                        ) : (
                            solutions.map((solution) => (
                                <div
                                    key={solution.id}
                                    className="p-3 border rounded cursor-pointer hover:bg-gray-50 transition duration-150 ease-in-out flex justify-between items-center"
                                    onClick={() => setSelectedItem(solution)}
                                >
                                    <div>
                                        <h3 className="font-medium">
                                            <span className={solution.approvalStatus === "approved" ? "text-green-500" : "text-orange-500"}>
                                                Solution by: {solution.user.username}
                                            </span>
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            <span>{formatDate(solution.submittedAt)}</span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
                {activeTab === "suggestions" && (
                <div className="space-y-2">
                    {suggestions.length === 0 ? (
                    <p className="text-gray-500">No suggestions found.</p>
                    ) : (
                    <>
                        <div className="max-h-[600px] overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                            <div
                            key={index}
                            className="p-3 border rounded cursor-pointer hover:bg-gray-50 transition duration-150 ease-in-out"
                            onClick={() => window.open(suggestion.link, "_blank")}
                            >
                            <h3 className="font-medium text-blue-500">{suggestion.title}</h3>
                            </div>
                        ))}
                        </div>
                        <div className="flex items-center justify-end mt-2">
                        <span className="text-gray-600 text-sm mr-2">Powered by</span>
                        <a
                            href="https://stackoverflow.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Stack_Overflow_icon.svg/768px-Stack_Overflow_icon.svg.png"
                            alt="Stack Overflow"
                            className="h-6 w-auto"
                            />
                        </a>
                        </div>
                    </>
                    )}
                </div>
                )}



            </div>

            {/* Right: Code Editor */}
          

                <CodeEditor bug={bug} draftCodeFilePath={draftCodeFilePath} rememberMeId={localStorage.getItem("rememberMe")} />
    
            {selectedItem && (
                <SubmissionModal item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}
        </div>
    );
}
function SubmissionModal({ item, onClose }) {
  const [loading, setLoading] = useState(true);
  const [Submittedcode, setsubCode] = useState("");

  useEffect(() => {
      const loadSubCode = async () => {
          try {
            const subId = item.id;
              const userId = item.user.id;
              const bugId = item.bug.id;
              const username = item.user.username;
              const language = item.bug.language;
              console.log(userId, bugId, username, language);
              const fetchedCode = await fetchSubCodeFile(userId, username, language, bugId, subId);
              console.log('fetch', fetchedCode);

              setsubCode(fetchedCode || ""); // Set the fetched code
          } catch (error) {
              console.error("Error fetching code file:", error);
              setsubCode("Error loading code."); // Optional: Set an error message
          } finally {
              setLoading(false); // Always update loading state
          }
      };

      loadSubCode();
  }, [item]);

  // Optional: Log the state after it updates (for debugging)
  useEffect(() => {
      console.log('Updated Submittedcode:', Submittedcode);
  }, [Submittedcode]);

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-3/4 h-3/4 overflow-auto">
              <h2 className="text-xl font-bold mb-4">Submission Details</h2>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 mb-4">{item.description}</p>
              <h3 className="text-lg font-semibold mb-2">Code</h3>
              {loading ? (
                  <p>Loading code...</p>
              ) : (
                  <MonacoEditor
                      height="400px"
                      language={item.bug.language || "javascript"}
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
              <button
                  className="mt-4 p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  onClick={onClose}
              >
                  Close
              </button>
          </div>
      </div>
  );
}
