// import { useNavigate, useLocation } from "react-router-dom";
//
// const HorizontalNav = () => {
//     const navigate = useNavigate();
//     const location = useLocation();
//
//     return (
//         <div className="w-full flex justify-center bg-gray-200 shadow-md rounded-md p-1.5 mt-2">
//             <button
//                 onClick={() => navigate("/bug-details/:id")}
//                 className={`px-5 py-1.5 text-sm font-medium transition duration-300 ease-in-out ${
//                     location.pathname === "/bug-details/:id"
//                         ? "bg-blue-500 text-white rounded-md shadow-md"
//                         : "text-gray-700 hover:text-blue-500 hover:bg-gray-300 rounded-md"
//                 }`}
//             >
//                 Description
//             </button>
//             <button
//                 onClick={() => navigate("/bug-details/:id/solution")}
//                 className={`px-5 py-1.5 text-sm font-medium transition duration-300 ease-in-out ${
//                     location.pathname === "/bug-details/:id/solution"
//                         ? "bg-blue-500 text-white rounded-md shadow-md"
//                         : "text-gray-700 hover:text-blue-500 hover:bg-gray-300 rounded-md"
//                 }`}
//             >
//                 Solution
//             </button>
//             <button
//                 onClick={() => navigate("/bug-details/:id/submissions")}
//                 className={`px-5 py-1.5 text-sm font-medium transition duration-300 ease-in-out ${
//                     location.pathname === "/bug-details/:id/submissions"
//                         ? "bg-blue-500 text-white rounded-md shadow-md"
//                         : "text-gray-700 hover:text-blue-500 hover:bg-gray-300 rounded-md"
//                 }`}
//             >
//                 Submissions
//             </button>
//         </div>
//     );
// };
//
// export default HorizontalNav;
