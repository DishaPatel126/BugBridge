import { useState, useEffect, useRef, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import './cursorStyle.css';
import {
    runCode,
    submitCode,
    saveDraft,
    fetchDraftCodeFile,
    fetchCodeFile,
    createSession,
} from "../services/auth";
import jsBeautify from "js-beautify";
import { Copy, Play, RotateCw, Save, Upload, Bell, ListChecks } from "lucide-react";
import CollabService from "../services/collabService";
import { getDatabase, ref, get } from "firebase/database";

export default function CodeEditor({ bug, draftCodeFilePath, rememberMeId }) {
    const [selectedLanguage, setSelectedLanguage] = useState(bug.language || "python");
    const originalCodeRef = useRef("");
    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");
    const [saveStatus, setSaveStatus] = useState("Saved");
    const [isSaving, setIsSaving] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [description, setDescription] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [joinRequests, setJoinRequests] = useState({}); // Owner's join requests
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [submissions, setSubmissions] = useState([]);
    const [solutions, setSolutions] = useState([]);

    // Handle opening and closing of the modal
    const handleOpenSubmitModal = () => {setShowSubmitModal(true);setoldCode(code);}
    const handleCloseSubmitModal = () => setShowSubmitModal(false);

    // For non-owners: notifications for available sessions
    const [showNotifications, setShowNotifications] = useState(false);
    const [availableSessions, setAvailableSessions] = useState([]);
    const [isOwnerForSession,setIsOwnerForSession]= useState(false);
    const saveTimeoutRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const periodicSyncIntervalRef = useRef(null);
    const [cursors, setCursors] = useState({});
    const editorRef = useRef(null);
    const decorationsRef = useRef([]);
    // Create a ref to hold the current sessionId
    const sessionIdRef = useRef(sessionId);

// Update the ref whenever sessionId changes
    useEffect(() => {
        sessionIdRef.current = sessionId;
    }, [sessionId]);

    const handleEditorDidMount = useCallback((editor, monaco) => {
        editorRef.current = editor;
        // console.log("Editor mounted");

        // Track local cursor changes
        editor.onDidChangeCursorPosition((e) => {
            // console.log("Editor mounted",rememberMeId);

            if (sessionIdRef.current) {  // use the ref here
                CollabService.sendCursorUpdate(sessionIdRef.current, {
                    userId: localStorage.getItem("userName"),
                    position: {
                        lineNumber: e.position.lineNumber,
                        column: e.position.column,
                    },
                });
            }
        });
    }, [rememberMeId]);
    // Handle editor initialization
    // ------------------ Session Handling ------------------

    // For owner: manually create/re-create a session.
    const handleCreateSession = async () => {
        try {
            let res = await createSession(rememberMeId, bug.id);
            setJoinRequests({});
            setIsOwnerForSession(true);
            // Adjust property access as needed
            setSessionId(res.body.sessionId);
            console.log("Session re-created (owner):", res.body.sessionId);
        } catch (error) {
            console.error("Error creating session:", error);
        }
    };

    // New: Leave Session feature
    const handleLeaveSession = () => {

        if (bug && isOwnerForSession) {
            // Owner: announce session ending.
            CollabService.sendCodeUpdate(sessionId, { ended: true });
            console.log("Owner marked session as ended.");
            setIsOwnerForSession(false);
            // Wait for the update to propagate, then remove the session node.
            setTimeout(() => {
              CollabService.endSession(sessionId);
            }, 1500);
          } else {
            console.log("Joiner leaving session");
          }
          // In all cases, disconnect and clear local session state.
          CollabService.disconnect();
          setSessionId(null);
          setJoinRequests({});
          setCursors({});
    };

    // ------------------ Join Requests (Joiner Side) ------------------

    // Sends a join request for a specific session and listens for the response.
    const handleJoinSessionForSession = (selectedSessionId) => {
        const userName = localStorage.getItem("userName");
        CollabService.sendJoinRequest(selectedSessionId, userName);
        console.log("Join request sent from", userName, "to session", selectedSessionId);
        CollabService.listenForJoinRequestForJoiner(selectedSessionId, userName, (data) => {
            if (data) {
                if (data.status === "accepted") {
                    setSessionId(selectedSessionId);
                    console.log("Join request accepted, joined session:", selectedSessionId);
                    setShowNotifications(false);
                } else if (data.status === "rejected") {
                    alert("Join request was rejected by the owner.");
                }
            }
        });
    };

    // ------------------ Load Available Sessions (for Notifications) ------------------

    // Load sessions from Firebase that match the current bug id.
    const loadAvailableSessions = async () => {
        try {
            const db = getDatabase();
            const sessionsRef = ref(db, "collabSessions");
            const snapshot = await get(sessionsRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                // Convert sessions object into an array and filter by bugId.
                const sessionsArray = Object.keys(data)
                    .map((key) => ({ sessionId: key, ...data[key] }))
                    .filter((session) => session.bugId === bug.id && session.sessionId != localStorage.getItem("userName")+"'s session"+bug.id);
                    console.log(sessionsArray);
                setAvailableSessions(sessionsArray);
            } else {
                setAvailableSessions([]);
            }
        } catch (error) {
            console.error("Error loading sessions:", error);
        }
    };

    const toggleNotifications = () => {
        setShowNotifications((prev) => !prev);
        if (!showNotifications) {
            loadAvailableSessions();
        }
    };

    // ------------------ Firebase Collaboration ------------------

    // Connect to Firebase collaboration when a session exists.
    useEffect(() => {
        if (sessionId) {
            CollabService.connect(sessionId,bug.id,isOwnerForSession,code,(update) => {
                console.log("Received update:", update);
                
                if (update.ended) {
                    alert("Session ended by the owner.");
                    setSessionId(null);
                    return;
                  }
                // Update code only if the update is not from the current user.
                setCode(update.code);
                
            });


        }
        CollabService.listenForCursorUpdates(sessionId, (cursorData) => {
            setCursors(cursorData);
        });
        return () => {
            CollabService.disconnect();
            if(editorRef.current)
            decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
        };
    }, [sessionId, rememberMeId, bug.id]);

    // Helper to generate a deterministic color based on userId
    const getUserColor = (userId) => {
        let r, g, b;
        do {
            // Generate each channel in the range 100 to 230.
            // This range keeps colors reasonably bright without being too light.
            r = Math.floor(Math.random() * 131) + 100;
            g = Math.floor(Math.random() * 131) + 100;
            b = Math.floor(Math.random() * 131) + 100;
            // If all channels are above 220, the color is too close to white. Regenerate.
        } while (r > 220 && g > 220 && b > 220);

        // Convert channels to hex and return the color code.
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    };

    useEffect(() => {
        if (!editorRef.current || !sessionId) return;

        const editor = editorRef.current;
        const monaco = window.monaco;

        // Clear previous decorations
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);

        // Create new decorations for each remote cursor
        const newDecorations = Object.entries(cursors)
            .filter(([userId]) => userId !== localStorage.getItem("userName"))
            .map(([userId, data]) => {
                const color = getUserColor(userId);
                const className = `remote-cursor-${userId}`;
                const afterClassName = `${className}-after`;

                // Inject CSS for the pseudo-element if not already done
                if (!document.getElementById(`style-${className}`)) {
                    const style = document.createElement("style");
                    style.id = `style-${className}`;
                    style.innerHTML = `
          .${afterClassName}::after {
            content: '▏';
            margin-left: 2px;
            font-size: 16px;
            line-height: 1;
            color: ${color};
          }
        `;
                    document.head.appendChild(style);
                }
                return {
                    range: new monaco.Range(
                        data.position.lineNumber,
                        data.position.column,
                        data.position.lineNumber,
                        data.position.column
                    ),
                    options: {
                        // Even if the range is collapsed, the after pseudo-element is rendered
                        afterContentClassName: afterClassName,
                        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                        hoverMessage: { value: `User: ${userId}` }
                    }
                };
            });

        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
    }, [cursors, sessionId, rememberMeId]);

    // For owner: listen for join requests.
    useEffect(() => {
        if (sessionId && bug && bug.creator && isOwnerForSession) {
            CollabService.listenForJoinRequests(sessionId, (data) => {
                console.log(sessionId);
                console.log("Join requests updated:", data);
                const pendingRequests = data
                    ? Object.fromEntries(
                        Object.entries(data).filter(([key, request]) => request.status === "pending")
                    )
                    : {};
                setJoinRequests(pendingRequests);
            });
        }
    }, [sessionId, bug]);

    // ------------------ Code Loading ------------------

    useEffect(() => {
        if (!bug || !bug.codeFilePath) {
            console.warn("No code snippet found for this bug.");
            return;
        }
        async function fetchFile(userId, username, language, filename) {
            try {
                let fetchedCode = await fetchDraftCodeFile(userId, username, bug.id, filename);
                console.log("Draft file fetched successfully:", fetchedCode);
                return fetchedCode;
            } catch (error) {
                const userId = bug.creator.id;
                const username = bug.creator.username;
                console.error("Failed to fetch draft file, trying fallback:", error);
                let codeFile = await fetchCodeFile(userId, username, language, filename);
                console.log("Fallback file fetched successfully:", codeFile);
                return codeFile;
            }
        }
        
        const loadCode = async () => {
            try {
                const userId = localStorage.getItem("rememberMe");
                const username = localStorage.getItem("userName");
                console.log("User ID:", userId);
                console.log("Username:", username);
                const language = bug.language;
                const filepath = bug.codeFilePath;
                const filename = filepath.split(/[/\\]/).pop();
                console.log(userId, username, language, filename);
                let fetchedCode = await fetchFile(userId, username, language, filename);
                if (fetchedCode) {
                    setCode(fetchedCode || "");
                    originalCodeRef.current = fetchedCode || "";
                }
            } catch (error) {
                console.error("Error fetching code file:", error);
            }
        };
        loadCode();
    }, [bug]);

    // Load saved code from localStorage if available.
    useEffect(() => {
        const savedCode = localStorage.getItem(`bug_${bug.id}_code`);
        if (savedCode) {
            setCode(savedCode);
        }
    }, [bug.id]);

    // ------------------ Auto-Saving ------------------

    useEffect(() => {
        periodicSyncIntervalRef.current = setInterval(() => {
            const codeToSave = localStorage.getItem(`bug_${bug.id}_code`);
            if (codeToSave) {
                console.log("Periodic sync called");
                debouncedSaveToDB(codeToSave);
            }
        }, 30000);
        return () => {
            clearInterval(periodicSyncIntervalRef.current);
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [bug.id, bug.creator?.username]);

    const debouncedSaveToDB = (codeToSave) => {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(async () => {
            try {
                const userId = localStorage.getItem("rememberMe");
                await saveDraft({
                    userId,
                    bugId: bug.id,
                    username: localStorage.getItem("userName"),
                    code: codeToSave,
                });
                setSaveStatus("Saved");
            } catch (error) {
                console.error("Error saving draft to DB:", error);
                setSaveStatus("Error saving draft");
            }
        }, 3000);
    };

    // ------------------ Action Handlers ------------------

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
            // fetchSubmissions();
        } catch (error) {
            console.error("Error submitting code:", error);
            setSuccessMessage("Failed to submit code");
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

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
        alert("Code copied to clipboard!");
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

    const handleResetCode = () => {
        setCode(originalCodeRef.current);
        localStorage.removeItem(`bug_${bug.id}_code`);
    };

    const handleCodeChange = (newCode) => {
        const formattedCode = jsBeautify(newCode, { indent_size: 2 });
        setCode(formattedCode);
        setIsSaving(true);
        localStorage.setItem(`bug_${bug.id}_code`, formattedCode);
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            setIsSaving(false);
        }, 800);
        debouncedSaveToDB(formattedCode);
        setSaveStatus("Saving Draft...");
        if (sessionId) {
            CollabService.sendCodeUpdate(sessionId, {
                code: formattedCode,
                senderId: rememberMeId,
                bugId: bug.id,
                timestamp: new Date().toISOString(),
            });
        }
        localStorage.setItem(`bug_${bug.id}_code`, formattedCode);

    };
    const [showJoinRequests, setShowJoinRequests] = useState(false);

    // ------------------ UI Rendering ------------------

    return (
        <div className="w-1/2 p-6 bg-white shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Code</h2>
                <div className="flex items-center space-x-2">
                    <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="p-1 border rounded-md"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                    </select>
                    <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" onClick={handleRunCode}>
                        <Play />
                    </button>
                    {/* Session Management UI */}
                    {sessionId ? (
                        // If session exists, show a label and Leave Session button.
                        <div className="flex items-center space-x-2">
                            <span className="text-green-600 font-semibold">
                                {bug && bug.creator && isOwnerForSession? "Session Started" : "Session Joined"}
                            </span>
                            <button
                                className="p-2 bg-red-500 text-white rounded-md hover:bg-red-700"
                                onClick={handleLeaveSession}
                            >
                                Leave Session
                            </button>
                            {(
                                <div className="relative">
                                    <button
                                        className="p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none"
                                        onClick={() => setShowJoinRequests((prev) => !prev)}
                                    >
                                        <Bell />
                                        {Object.keys(joinRequests).length > 0 && (
                                            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-600 rounded-full">
                                                {Object.keys(joinRequests).length}
                                            </span>
                                        )}
                                    </button>
                                    {showJoinRequests && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-20">
                                            <div className="p-2 border-b">
                                                <h3 className="text-sm font-semibold">Join Requests</h3>
                                            </div>
                                            <ul className="max-h-60 overflow-y-auto">
                                                {Object.entries(joinRequests).map(([joinerId, request]) =>
                                                    request.status === "pending" ? (
                                                        <li key={joinerId} className="flex items-center justify-between p-2 text-sm hover:bg-gray-100">
                                                            <span>{joinerId} wants to join</span>
                                                            <div>
                                                                <button
                                                                    className="text-green-600 mr-2"
                                                                    onClick={() => {
                                                                        setShowJoinRequests(false)
                                                                        CollabService.respondToJoinRequest(sessionId, joinerId, "accepted")}}
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    className="text-red-600"
                                                                    onClick={() => {
                                                                        setShowJoinRequests(false)
                                                                        CollabService.respondToJoinRequest(sessionId, joinerId, "rejected")}}
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ) : null
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        // If no session exists...
                        <>
                                <div className="flex flex-col space-y-2">
                                    <button
                                        className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                                        onClick={handleCreateSession}
                                    >
                                        Create Session
                                    </button>

                                </div>
                               {!isOwnerForSession && <div className="relative">
                                    <button
                                        className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                                        onClick={toggleNotifications}
                                    >
                                        <ListChecks />
                                    </button>
                                    {showNotifications && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-10">
                                            {availableSessions.length > 0 ? (
                                                <ul className="divide-y divide-gray-200">
                                                    {availableSessions.map((session) => (
                                                        <li key={session.sessionId} className="flex items-center justify-between p-2 text-sm">
                                                            <span>{session.sessionId}</span>
                                                            <button
                                                                className="text-blue-600"
                                                                onClick={() => handleJoinSessionForSession(session.sessionId)}
                                                            >
                                                                Join
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="p-2 text-sm text-gray-500">No sessions available</div>
                                            )}
                                        </div>
                                    )}
                                </div>}
                        </>
                    )}
                    <button className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600" onClick={handleOpenSubmitModal}>
                        <Upload />
                    </button>
                    {showSubmitModal && (
                            <div className="modal-overlay">
                                <div className="modal">
                                    <h2>Submit Code</h2>
                                    <label>Description:</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Enter a brief description..."
                                    />
                                    <label>Upload File (Optional):</label>
                                    <input type="file" onChange={handleFileChange} />
                                    <h4>OR</h4>
                                    <label>Code Preview:</label>
                                    <MonacoEditor
                                        theme="vs-dark"
                                        height="250px"
                                        defaultLanguage="javascript"
                                        value={code}
                                        options={{
                                            readOnly: true,
                                            minimap: { enabled: false },
                                            scrollbar: { vertical: "hidden" },
                                            lineNumbers: "on",
                                            automaticLayout: true,
                                        }}
                                    />
                                    {successMessage && (
                                        <p className="text-green-500 mt-2">{successMessage}</p>
                                    )}
                                    <button onClick={handleSubmitCode}>Submit</button>
                                    <button onClick={handleCloseSubmitModal}>Close</button>
                                </div>
                            </div>
                        )}

                    <button className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600" onClick={handleCopyCode}>
                        <Copy />
                    </button>
                </div>
            </div>

            <MonacoEditor
                height="500px"
                language={selectedLanguage}
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                onMount={handleEditorDidMount}
            />

            <div className="mt-2 flex justify-between items-center">
                <button className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600" onClick={handleResetCode}>
                    <RotateCw />
                </button>
                <p className="text-sm text-gray-500">{isSaving ? "Saving Draft..." : saveStatus}</p>
                <button onClick={handleSaveDraft} className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                    <Save />
                </button>
            </div>

            <h2 className="text-lg font-semibold mt-4">Output</h2>
            <div className="mt-2 p-4 bg-gray-800 text-white rounded-md">
                <pre>{output}</pre>
            </div>
        </div>
    );
}
