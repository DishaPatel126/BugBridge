import Navbar from "../components/Navbar";
import SideNav from "../components/SideNav";
import BugListWithFilters from "../components/BugListWithFilters";
import MyDraftWithFilter from "../components/MyDraftWithFilter";

export default function MyDraft() {
    return (
        <div className="flex flex-col h-screen ">
            {/* Fixed Sidebar */}
            <SideNav />

            {/* Main Content Wrapper */}
            <div className="flex flex-1">
                <Navbar />

                {/* Scrollable Content Area */}
                <main className="flex-1 bg-gray-100 p-4 overflow-auto">
                    <MyDraftWithFilter showAddButton={false} />
                </main>
            </div>
        </div>
    );
}
