"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Menu } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { logout } from "../services/auth"
import apiClient from "../utils/apiClient"

const ProfileNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const menuRef = useRef(null)
  const notificationRef = useRef(null)
  const navigate = useNavigate()

  // Load notifications from API on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get the current user ID from localStorage
        const userId = localStorage.getItem("rememberMe")
        if (!userId) return

        console.log(`Fetching notifications for user ${userId}`)

        try {
          // Use the same apiClient as other API calls in the application
          const response = await apiClient.get(`/notifications/user/${userId}`)
          console.log("Notifications response:", response)

          // Check if the response has data
          if (response && response.data) {
            console.log("Notifications data:", response.data)

            // Check if the response is wrapped in a body property or is a direct array
            const notificationsArray = Array.isArray(response.data) ? response.data : response.data.body || []

            // Process notifications to ensure they have bugId and improve message wording
            const processedNotifications = notificationsArray.map((notification) => {
              // Improve notification message wording
              let message = notification.message || ""

              // Replace "submission" with "solution" in the message
              message = message.replace(/submission has been submitted/gi, "solution has been submitted")
              message = message.replace(/submission has been approved/gi, "solution has been approved")
              message = message.replace(/submission/gi, "solution")

              // If notification already has a bugId property, use it
              let bugId = notification.bugId
              if (!bugId) {
                // Try to extract bugId from message using multiple patterns
                // Pattern 1: "Bug #123"
                const bugHashPattern = message.match(/bug #(\d+)/i)
                if (bugHashPattern) {
                  bugId = Number.parseInt(bugHashPattern[1])
                }

                // Pattern 2: "BugID: 123" or "Bug ID: 123"
                const bugIdPattern = message.match(/bug\s*id:?\s*(\d+)/i)
                if (!bugId && bugIdPattern) {
                  bugId = Number.parseInt(bugIdPattern[1])
                }

                // Pattern 3: Just look for any number in the message as a last resort
                const anyNumberPattern = message.match(/\b(\d+)\b/)
                if (!bugId && anyNumberPattern) {
                  bugId = Number.parseInt(anyNumberPattern[1])
                }
              }

              return {
                ...notification,
                message: message,
                bugId: bugId,
              }
            })

            // Sort notifications by createdAt date (most recent first)
            const sortedNotifications = processedNotifications.sort((a, b) => {
              const dateA = new Date(a.createdAt || 0)
              const dateB = new Date(b.createdAt || 0)
              return dateB - dateA // Descending order (newest first)
            })

            // Try to get read status from localStorage
            const savedReadStatus = JSON.parse(localStorage.getItem("notificationReadStatus") || "{}")

            // Apply saved read status to notifications
            const notificationsWithSavedStatus = sortedNotifications.map((notification) => ({
              ...notification,
              read: savedReadStatus[notification.id] || notification.read,
            }))

            setNotifications(notificationsWithSavedStatus)
          } else {
            console.log("No notifications data in response")
            setNotifications([])
          }
        } catch (error) {
          console.error("API request failed:", error)
          throw error
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
        setError("Failed to load notifications")
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Set up polling to check for new notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000)
    return () => clearInterval(intervalId)
  }, [])

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const markNotificationAsRead = async (id) => {
    try {
      console.log("Marking notification as read:", id)

      // Call the API to mark notification as read using apiClient
      const response = await apiClient.put(`/notifications/read/${id}`)
      console.log("Mark as read response:", response)

      // Update notifications state
      setNotifications(
        notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )

      // Update localStorage
      const savedReadStatus = JSON.parse(localStorage.getItem("notificationReadStatus") || "{}")
      savedReadStatus[id] = true
      localStorage.setItem("notificationReadStatus", JSON.stringify(savedReadStatus))
    } catch (error) {
      console.error("Error marking notification as read:", error)

      // Update UI state even if API call fails
      setNotifications(
        notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )

      // Update localStorage
      const savedReadStatus = JSON.parse(localStorage.getItem("notificationReadStatus") || "{}")
      savedReadStatus[id] = true
      localStorage.setItem("notificationReadStatus", JSON.stringify(savedReadStatus))
    }
  }

  const markAllNotificationsAsRead = async () => {
    try {
      // Get the current user ID from localStorage
      const userId = localStorage.getItem("rememberMe")
      if (!userId) return

      console.log("Marking all notifications as read for user:", userId)

      // Call the API to mark all notifications as read using apiClient
      const response = await apiClient.post(`/notifications/read/${userId}`)
      console.log("Mark all as read response:", response)

      // Update notifications state
      setNotifications(notifications.map((notification) => ({ ...notification, read: true })))

      // Update localStorage
      const savedReadStatus = {}
      notifications.forEach((notification) => {
        savedReadStatus[notification.id] = true
      })
      localStorage.setItem("notificationReadStatus", JSON.stringify(savedReadStatus))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)

      // Update UI state even if API call fails
      setNotifications(notifications.map((notification) => ({ ...notification, read: true })))

      // Update localStorage
      const savedReadStatus = {}
      notifications.forEach((notification) => {
        savedReadStatus[notification.id] = true
      })
      localStorage.setItem("notificationReadStatus", JSON.stringify(savedReadStatus))
    }
  }

  const handleNotificationClick = async (notification) => {
    console.log("Notification clicked:", notification)

    // Mark notification as read
    await markNotificationAsRead(notification.id)

    // Extract bug ID from notification message if not already present
    let bugId = notification.bugId
    if (!bugId && notification.message) {
      const bugIdMatch = notification.message.match(/bug #(\d+)/i)
      if (bugIdMatch) {
        bugId = Number.parseInt(bugIdMatch[1])
      }
    }

    // Navigate to bug details page if bugId exists
    if (bugId) {
      console.log("Navigating to bug details:", bugId)

      try {
        // First try to fetch the bug details to get complete data
        try {
          const response = await apiClient.get(`/api/bugs/${bugId}`)
          console.log("Bug details response:", response)

          if (response && response.data) {
            // Navigate with complete bug data
            navigate(`/bug-details/${bugId}`, {
              state: {
                bug: response.data,
                codeFilePath: "",
              },
            })
          } else {
            throw new Error("No bug data returned")
          }
        } catch (fetchError) {
          console.error("Error fetching bug details:", fetchError)

          // Fallback: Navigate with minimal bug data
          navigate(`/bug-details/${bugId}`, {
            state: {
              bug: {
                id: bugId,
                title: "Bug Details",
                description: "",
                severity: "",
                status: "",
                language: "",
                creator: { id: 0, username: "" },
              },
              codeFilePath: "",
            },
          })
        }

        setNotificationsOpen(false)
      } catch (error) {
        console.error("Error navigating to bug details:", error)
      }
    } else {
      console.warn("Notification does not have a bugId:", notification)
    }
  }

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return "Just now"

    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffMs = now - notificationTime
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`

    return notificationTime.toLocaleDateString()
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <nav className="h-16 w-full bg-white shadow-md fixed top-0 left-0 z-20 flex justify-between items-center px-8">
    <h1 className="text-xl font-semibold" onClick={() => navigate("/dashboard")}>Bug Board</h1>
    <div className="flex space-x-6">
      {/* Notifications */}
      <div className="relative" ref={notificationRef}>

          <button
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition relative"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-lg overflow-hidden z-30">
              <div className="p-3 border-b flex justify-between items-center">
                <h3 className="font-medium">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      markAllNotificationsAsRead()
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Loading notifications...</div>
                ) : error ? (
                  <div className="p-4 text-center text-red-500">
                    <p>Error: {error}</p>
                    <p className="text-xs mt-1">Check console for details</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b hover:bg-gray-50 ${notification.read ? "" : "bg-blue-50"} cursor-pointer`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start">
                        {!notification.read && (
                          <span className="h-2 w-2 mt-1.5 mr-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                        )}
                        <div className={`flex-1 ${notification.read ? "ml-4" : ""}`}>
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatNotificationTime(notification.createdAt)}</p>
                          {notification.bugId && (
                            <p className="text-xs text-blue-600 mt-1">Bug #{notification.bugId}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t text-center">
                <button
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    navigate("/all-notifications")
                    setNotificationsOpen(false)
                  }}
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {menuOpen && (
            <div
              style={{ zIndex: "30" }}
              className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-lg p-3"
            >
              <p className="p-3 hover:bg-gray-100 cursor-pointer" onClick={handleDashboardClick}>Dashboard</p>
              <p className="p-3 hover:bg-gray-100 cursor-pointer">Settings</p>
              <p
                onClick={() => {
                  logout()
                  navigate("/")
                }}
                className="p-3 hover:bg-gray-100 cursor-pointer"
              >
                Log Out
              </p>
            </div>
          )}
        </div></div>
    </nav>
  )
}

export default ProfileNavbar