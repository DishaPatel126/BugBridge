import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBugs, fetchUsers } from "../services/auth";
import { Plus, AlertCircle, CheckCircle, Clock, PauseCircle, XCircle, HelpCircle } from "lucide-react"

const BugListWithFilters = ({ showAddButton = true }) => {
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCreator, setFilterCreator] = useState("");
  const [sortOption, setSortOption] = useState("created_at");
  const [bugs, setBugs] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [filterLanguage, setFilterLanguage] = useState("")
  useEffect(() => {
    fetchBugsList();
  }, [filterSeverity, filterStatus, filterCreator, sortOption]);

  useEffect(() => {
    const fetchUsersList = async () => {
      try {
        const usersData = await fetchUsers();
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsersList();
  }, []);

  const loadBugsFromStorage = () => {
    try {
      const storedBugs = JSON.parse(localStorage.getItem("bugs") || "[]");
      console.log("Loaded bugs from storage:", storedBugs);
      setBugs(storedBugs);
    } catch (error) {
      console.error("Error loading bugs from storage:", error);
      setBugs([]);
    }
  };


  const fetchBugsList = async () => {
    try {
      // First try to fetch from API
      const filters = { filterSeverity, filterStatus, filterCreator, sortOption };
      console.log("before function")
      const data = await fetchBugs();
      console.log("Fetched bugs:");
      console.log(data);
      if (data && data.length > 0) {
        setBugs(data);
      } else {
        // If no data from API, load from localStorage
        loadBugsFromStorage();
      }
    } catch (error) {
      console.error("Error fetching bugs:", error);
      // Fallback to localStorage if API fails
      loadBugsFromStorage();
    }
  };


  const getLanguageMatchScore = (bugLanguage, searchTerm) => {
    const normalizedBugLang = bugLanguage.toLowerCase()
    const normalizedSearch = searchTerm.toLowerCase()

    if (normalizedBugLang === normalizedSearch) return 3

    if (normalizedBugLang.startsWith(normalizedSearch)) return 2

    if (normalizedBugLang.includes(normalizedSearch)) return 1

    return 0
  }

  const filteredBugs = bugs
      .filter((bug) => !filterSeverity || bug.severity === filterSeverity)
      .filter((bug) => !filterStatus || bug.status === filterStatus)
      .filter((bug) =>
          !filterCreator ||
          (bug.creator && typeof bug.creator === "string" && bug.creator.toLowerCase().includes(filterCreator.toLowerCase())) ||
          (bug.creator && typeof bug.creator.username === "string" && bug.creator.username.toLowerCase().includes(filterCreator.toLowerCase()))
      )
      .filter((bug) => !filterLanguage || bug.language.toLowerCase().includes(filterLanguage.toLowerCase())) // Case insensitive language filter
      .sort((a, b) => {
        if (filterLanguage) {
          const scoreA = getLanguageMatchScore(a.language, filterLanguage)
          const scoreB = getLanguageMatchScore(b.language, filterLanguage)
          if (scoreA !== scoreB) return scoreB - scoreA
        }

        //   return sortOption === "language"
        //       ? a.language.localeCompare(b.language)
        //       : new Date(b.creationDate) - new Date(a.creationDate)
        // })
      })


  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center"
      case "medium":
        return "bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center"
      case "high":
        return "bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center"
      case "critical":
        return "bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center"
      default:
        return "bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center"
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center"
      case "in progress":
        return "bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center"
      case "open":
        return "bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center"
      default:
        return "bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center"
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case "in progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <HelpCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };


  return (
      <div className="relative flex-1 p-4 pt-16 ml-48"> {/* Added pt-16 & ml-48 */}
        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <select
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="p-2 border rounded hover:border-gray-400"
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border rounded hover:border-gray-400"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          {/*<input*/}
          {/*    type="text"*/}
          {/*    placeholder="Filter by Creator"*/}
          {/*    value={filterCreator}*/}
          {/*    onChange={(e) => setFilterCreator(e.target.value)}*/}
          {/*    className="p-2 border rounded hover:border-gray-400"*/}
          {/*/>*/}
          <input
              type="text"
              placeholder="Filter by Language"
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="p-2 border rounded hover:border-gray-400"
          />
          <select onChange={(e) => setSortOption(e.target.value)} className="p-2 border rounded hover:border-gray-400">
            <option value="creationDate">Sort by Creation Date</option>
            {/* <option value="language">Sort by Language</option> */}
          </select>

        </div>

        {/* Bug List */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Detected Bugs</h2>
          <div className="space-y-2">
            {filteredBugs.length === 0 ? (
                <p className="text-gray-500">No bugs found.</p>
            ) : (
                filteredBugs.map((bug) => (
                    <div key={bug.id} className="p-3 border rounded cursor-pointer hover:bg-gray-50 transition flex justify-between items-center">
                      {/* Left Section: Bug Title and Details */}
                      <div className="flex flex-col">
                        <h3 className="font-medium text-blue-500 hover:underline" onClick={() => navigate(`/bug-details/${bug.id}`, { state: { bug: bug, codeFilePath: "" } })}>
                          {bug.title}
                        </h3>
                        <p className="text-sm text-gray-500 flex flex-wrap gap-2 mt-1">
                          <span className={getSeverityColor(bug.severity)}>{capitalizeFirstLetter(bug.severity)}</span>
                          <span className={getStatusColor(bug.status)}>{capitalizeFirstLetter(bug.status)}</span>
                          <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium">
                {capitalizeFirstLetter(bug.language)}
              </span>
                        </p>
                      </div>

                      {/* Right Section: Status Icon (Aligned to the Right) */}
                      <div className="ml-auto">{getStatusIcon(bug.status)}</div>
                    </div>
                ))
            )}
          </div>
        </div>

        {/* Floating Plus Button (only if showAddButton is true) */}
        {showAddButton && (
            <button
                onClick={() => navigate("/new-bug")}
                className="fixed bottom-8 right-8 w-16 h-16 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              <Plus className="h-8 w-8" />
            </button>
        )}
      </div>
  );

};

export default BugListWithFilters;
