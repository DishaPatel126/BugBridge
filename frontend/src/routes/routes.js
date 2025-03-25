import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/login";
import SignupPage from "../pages/register";
import ForgotPasswordPage from "../pages/forgot-password";
import ResetPasswordPage from "../pages/reset-password";
import ProtectedRoute from "../pages/ProtectedRoute";
import BugBoardPage from "../pages/bug-board";
import NewBugPage from "../pages/new-bug";
import BugDetails from "../pages/bug-details"; 
import Profile from "../pages/profiles";
import ProfileSettings from "../pages/profileSettings";
import SavedDraftsPage from "../pages/my-draft";
import MyDraftPagePage from "../pages/my-draft";
import SubmissionsPage from "../pages/SubmissionsPage";
import MySubs from "../pages/MySubmissions";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><BugBoardPage /></ProtectedRoute>} />
      {/* <Route path="/dashboard" element={<BugBoardPage />} /> */}
      <Route path="/new-bug" element={<ProtectedRoute><NewBugPage /></ProtectedRoute>} />
      {/* Add route for BugDetails page */}
      {/* <Route path="/bug/:id" element={<ProtectedRoute><BugDetails /></ProtectedRoute>} /> */}
      <Route path="/draft" element={<SavedDraftsPage />} />
      <Route path="/saved-drafts" element={<MyDraftPagePage />} />
      <Route path="/bug-details/:id" element={<ProtectedRoute><BugDetails /></ProtectedRoute>} />
        {/* <Route path="/bug-details/:id/solution" element={<BugDetails />} />
        <Route path="/bug-details/:id/submissions" element={<BugDetails />} /> */}
        <Route path="/SubmissionsPage" element={<ProtectedRoute><SubmissionsPage/></ProtectedRoute>} />
      {/* <Route path="/bug-details/:id" element={<BugDetails />} /> */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
      {/* <Route path="/SubmissionsPage" element={<SubmissionsPage />} /> */}
      <Route path="/MySubmissions" element={<ProtectedRoute><MySubs /></ProtectedRoute>} />


    </Routes>
  );
};

export default AppRoutes;
