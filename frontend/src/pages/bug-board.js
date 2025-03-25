import Navbar from "../components/Navbar";
import SideNav from "../components/SideNav"; 
import BugListWithFilters from "../components/BugListWithFilters";
import ProfileNavbar from "../components/ProfileNavbar";

export default function BugBoardPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Left Sidebar Navigation */}
        <SideNav />

        {/* Bug List Section */}
        <main className="flex-1 bg-gray-100 p-4 overflow-auto">
          <BugListWithFilters showAddButton={true} />
        </main>
      </div>
    </div>
  );
}
