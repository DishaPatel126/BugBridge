import { Home, FileText, ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from "react";

const SideNav = () => {
  const navigate = useNavigate();

  return (
      <div className="w-48 bg-gray-800 text-white h-screen p-4 fixed top-0 left-0 z-10">
        <nav className="flex flex-col space-y-4 mt-16"> {/* mt-16 to prevent overlapping Navbar */}
          <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-700 transition"
          >
            <Home className="h-5 w-5" />
            <span className="text-sm">Home</span>
          </button>

          <button
              onClick={() => navigate("/saved-drafts")}
              className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-700 transition"
          >
            <FileText className="h-5 w-5" />
            <span className="text-sm">My Drafts</span>
          </button>

          <button
              onClick={() => navigate("/SubmissionsPage")}
              className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-700 transition"
          >
            <ClipboardCheck className="h-5 w-5" />
            <span className="text-sm">My Bug Activity</span>
          </button>
          <button
              onClick={() => navigate("/MySubmissions")}
              className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-700 transition"
          >
            <ClipboardCheck className="h-5 w-5" />
            <span className="text-sm">My Submissions</span>
          </button>
        </nav>
      </div>
  );
};

export default SideNav;
