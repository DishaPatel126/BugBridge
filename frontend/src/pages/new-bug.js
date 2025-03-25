"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import apiClient from "../utils/apiClient"
import { submitBug } from "../services/auth"; 

function NewBugPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState("")
  const [language, setLanguage] = useState("")
  const [codeSnippet, setCodeSnippet] = useState("")
  const [file, setFile] = useState(null)


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("language", language);
      formData.append("severity", severity);
      formData.append("status", "open");
      formData.append("creatorId", localStorage.getItem("rememberMe"));
  
      if (file) {
        formData.append("codeFilePath", file);
      } else if (codeSnippet) {
        const extensions = { 
          python: "py", 
          javascript: "js", 
          java: "java" 
        };
        const fileExtension = extensions[language] || "txt";

        const generateUUID = () => Math.random().toString(36).substring(2, 8).toUpperCase();

        const uniqueFilename = `${generateUUID()}.${fileExtension}`;

        const textFile = new File(
          [codeSnippet], 
          `${uniqueFilename}`, 
          { type: "text/plain" }
        );
  
        formData.append("codeFilePath", textFile);
      }
  
      // Send to API
      await submitBug(formData);
  
      // Save locally and reset form
      const newBug = {
        id: Date.now().toString(),
        title,
        description,
        severity,
        language,
        codeSnippet,
        codeFilePath: file ? file.name : "code-snippet.txt",
        status: "open",
        creator: "1",
        creationDate: new Date().toISOString(),
      };
  
      const existingBugs = JSON.parse(localStorage.getItem("bugs")) || [];
      localStorage.setItem("bugs", JSON.stringify([newBug, ...existingBugs]));
  
      console.log("Bug saved successfully");
      setTitle("");
      setDescription("");
      setSeverity("");
      setLanguage("");
      setCodeSnippet("");
      setFile(null);
  
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving bug:", error);
      alert("Failed to save bug. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-medium leading-6 text-gray-900 mb-4">Submit a New Bug</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                  Severity
                </label>
                <select
                  id="severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Select severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Select language</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="codeSnippet" className="block text-sm font-medium text-gray-700">
                Code Snippet
              </label>
              <textarea
                id="codeSnippet"
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono p-3"
                placeholder="Paste your code snippet here..."
              />
            </div>
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                Attachment (optional)
              </label>
              <input
                type="file"
                id="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit Bug
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewBugPage

export const storageKeys = {
  BUGS: 'bugs',
  AUTH: 'auth'
};

export const storage = {
  getBugs: () => {
    try {
      return JSON.parse(localStorage.getItem(storageKeys.BUGS) || '[]');
    } catch (error) {
      console.error('Error reading bugs from storage:', error);
      return [];
    }
  },

  saveBugs: (bugs) => {
    try {
      localStorage.setItem(storageKeys.BUGS, JSON.stringify(bugs));
      return true;
    } catch (error) {
      console.error('Error saving bugs to storage:', error);
      return false;
    }
  },

  addBug: (bug) => {
    try {
      const bugs = storage.getBugs();
      bugs.unshift(bug); // Add to beginning of array
      return storage.saveBugs(bugs);
    } catch (error) {
      console.error('Error adding bug to storage:', error);
      return false;
    }
  }
};