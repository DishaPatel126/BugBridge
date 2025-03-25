// import { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserDrafts } from "../services/auth";
import { Plus, AlertCircle, CheckCircle, Clock, HelpCircle } from "lucide-react";

const MyDraftWithFilter = ({ showAddButton = true }) => {
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [sortOption, setSortOption] = useState("created_at");
  const [drafts, setDrafts] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem("rememberMe");

  useEffect(() => {
    fetchDraftsList();
  }, [filterSeverity, filterStatus, filterLanguage, sortOption]);

  const fetchDraftsList = async () => {
    try {
      const response = await fetchUserDrafts(userId);
      if (response?.status === "success") {
        setDrafts(response.body);
      } else {
        console.error("Failed to fetch drafts.");
        setDrafts([]);
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
      setDrafts([]);
    }
  };

  const filteredDrafts = drafts
      ?.filter((draft) => !filterSeverity || draft?.bug?.severity === filterSeverity)
      .filter((draft) => !filterStatus || draft?.bug?.status === filterStatus)
      .filter((draft) => !filterLanguage || draft?.bug?.language?.toLowerCase().includes(filterLanguage.toLowerCase()))
      .sort((a, b) =>
          sortOption === "language"
              ? (a?.bug?.language || "").localeCompare(b?.bug?.language || "")
              : new Date(b?.bug?.creationDate || 0) - new Date(a?.bug?.creationDate || 0)
      );

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center";
      case "medium":
        return "bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center";
      case "high":
        return "bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center";
      case "critical":
        return "bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center";
      case "in progress":
        return "bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center";
      case "open":
        return "bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "in progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
      <div className="relative flex-1 p-4 pt-16 ml-48">
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
          <input
              type="text"
              placeholder="Filter by Language"
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="p-2 border rounded hover:border-gray-400"
          />
          <select onChange={(e) => setSortOption(e.target.value)} className="p-2 border rounded hover:border-gray-400">
            <option value="creationDate">Sort by Creation Date</option>
          </select>
        </div>

        {/* Draft List */}
        <div className="bg-white p-6 rounded shadow w-full">
          <h2 className="font-semibold mb-2">Saved Drafts</h2>
          <div className="space-y-2">
            {filteredDrafts.length === 0 ? (
                <p className="text-gray-500">No drafts found.</p>
            ) : (
                filteredDrafts.map((draft) => (
                    <div
                        key={draft?.id}
                        className="p-3 border rounded cursor-pointer hover:bg-gray-50 transition w-full flex justify-between items-center"
                    >
                      {/* Left Section: Draft Title and Details */}
                      <div className="flex flex-col">
                        <h3
                            className="font-medium text-blue-500 hover:underline"
                            onClick={() =>
                                navigate(`/bug-details/${draft?.id}`, { state: draft })
                            }
                        >
                          {draft?.bug?.title || "Untitled Draft"}
                        </h3>
                        <p className="text-sm text-gray-500 flex flex-wrap gap-2 mt-1">
                    <span className={getSeverityColor(draft?.bug?.severity)}>
                      {capitalizeFirstLetter(draft?.bug?.severity)}
                    </span>
                          <span className={getStatusColor(draft?.bug?.status)}>
                      {capitalizeFirstLetter(draft?.bug?.status)}
                    </span>
                          <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium">
                      {capitalizeFirstLetter(draft?.bug?.language) || "Unknown"}
                    </span>
                        </p>
                      </div>

                      {/* Right Section: Status Icon (Aligned to the Right) */}
                      <div className="ml-auto">{getStatusIcon(draft?.bug?.status)}</div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
  );
};

export default MyDraftWithFilter;
