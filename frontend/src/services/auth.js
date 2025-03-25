import apiClient from "../utils/apiClient";

// Function for logging in
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.body && response.data.body.id) {
      sessionStorage.setItem("userId", response.data.body.id);
      sessionStorage.setItem("authToken", response.data.body.token);
    } else {
      console.error("User ID not found in login response.");
    }
    return response.data;  // Assuming the API returns the user data or token
  } catch (error) {
    console.error("Login Error:", error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : error.message;
  }
};

export const signup = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const forgot = async (userData) => {
  try {
    const response = await apiClient.post('/auth/forgot-password', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const validate_token = async (token) => {
  try {
    const response = await apiClient.get(`/auth/validate-reset-token?token=${token}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const reset_password = async (userData) => {
  try {
    const response = await apiClient.post('/auth/reset-password', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const logout = () => {
  console.log(localStorage.getItem("authToken"));
  localStorage.removeItem("authToken"); // Remove authentication token
  localStorage.clear();
};

export const runCode = async (code, language) => {
  try {
    const response = await apiClient.post("/api/run", { code, language });
    return response.data.body.output;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const fetchCodeFile = async (userId, username, language, filename) => {
  try {
    const response = await apiClient.get(`/api/bugs/file/${userId}/${username}/${language}/${filename}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const fetchSubCodeFile = async (userId, username, language, bugId, subId) => {
  try {
    const response = await apiClient.get(`/submissions/file/${userId}/${username}/${bugId}/${subId}/${language}`);
    console.log("sub code", response.data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const fetchDraftCodeFile = async (userId, username, language, filename) => {
  try {
    const response = await apiClient.get(`/drafts/file/${userId}/${username}/${language}/${filename}`);
    console.log(response)
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const fetchBugs = async () => {
  try {
    // First try to fetch from API
    const response = await apiClient.get("/api/bugs");
    // console.log(response.data)
    if (response.status == 200 || response.status == 201) {
      const data = response.data;
      console.log("Fetched bugs from API:");
      console.log(response);
      // Store the fetched data in localStorage
      localStorage.setItem("bugs", JSON.stringify(data));
      return data;
    }

    // If API fails, try to get from localStorage
    const storedBugs = localStorage.getItem("bugs");
    if (storedBugs) {
      const bugs = JSON.parse(storedBugs);
      return Array.isArray(bugs) ? bugs : [];
    }

    return []; // Return empty array if both API and localStorage fail
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const fetchUsers = async () => {
  try {
    const response = await apiClient.get("/api/users");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const updateBug = async (bug) => {
  try {
    const formData = new FormData();
    formData.append("title", bug.title);
    formData.append("severity", bug.severity);
    formData.append("status", bug.status);
    formData.append("creatorId", bug.creator.id);
    formData.append("language", bug.language);
    formData.append("description", bug.description);
    // Append file if provided
    if (bug.codeFilePath) {
      formData.append("codeFilePath", bug.codeFilePath);
    }

    const response = await apiClient.put(`/api/bugs/${bug.id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }

};

export const fetchComments = async (bugId) => {
  try {
    const response = await apiClient.get(`/api/comments?bugId=${bugId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const addComment = async (commentData) => {
  try {
    const response = await apiClient.post("/api/comments", commentData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const saveDraft = async (userData) => {
  try {
    const response = await apiClient.post('/drafts/save', userData);
    console.log(response.data);
    return response.data; // Return the response data from the backend (e.g., success message or saved draft details)
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await apiClient.delete(`/api/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const fetchUserDrafts = async (userId) => {
  try {
    const response = await apiClient.get(`/drafts/user/${userId}`);
    console.log(response.data);
    return response.data || []; // Ensure it always returns an array
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return []; // Return empty array instead of null
  }
};
  export const submitBug = async (formData) => {
    try {
      console.log("Tetsing subit bug")
      console.log(formData);
      const response = await apiClient.post("/api/bugs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Tetsing subit bug")
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  };
  export const submitCode = async (userData) => {
    try {
      console.log(userData);
      const response = await apiClient.post('/submissions/save', userData);
      console.log(response);
      return response.data; // Return the response data from the backend
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  };
  export const fetchUserSubmissionsByBug = async (userId, bugId) => {
    try {
      console.log(userId);
      const response = await apiClient.get(`/submissions/user/${userId}/bug/${bugId}`);
      console.log(response);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  };
  export const fetchSubmission = async (id) => {
    try {
      const response = await apiClient.get(`/submissions/${id}`);
      console.log(response);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  };
  export const fetchSolution = async (bugId) => {
    try {
      const response = await apiClient.get(`/submissions/approved/bug/${bugId}`);
      console.log(response);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  };
  export const fetchSubmissionByCreator = async (userId) => {
    try {
      const response = await apiClient.get(`/submissions/creator/${userId}`);
      console.log(response);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  };
  export const fetchSubmissionByUser = async (userId) => {
    try {
      const response = await apiClient.get(`/submissions/user/${userId}`);
      console.log(response);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  };

  export const approveSubmission = async (submissionId, approverId) => {
    try {
        const response = await apiClient.put(`/submissions/approve/${submissionId}`, {approverId});
        console.log(response);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};
export const rejectSubmission = async (submissionId, rejecterId) => {
  try {
      const approverId = rejecterId;
      const response = await apiClient.put(`/submissions/reject/${submissionId}`, {approverId});
      return response.data;
  } catch (error) {
      throw error.response ? error.response.data : error.message;
  }
};

  export const fetchSuggestionbyBug = async (bugId) => {
    try {
      const response = await apiClient.get(`/api/suggestions/bug/${bugId}`);
      console.log(response);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  };

export const getAuthenticatedUser = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required but not provided.");
    }

    const response = await apiClient.get(`/api/users/${userId}`);

    // console.log("Fetched User Data:", response.data); //Log response data
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error.response ? error.response.data : error.message); //Log errors
    throw error.response ? error.response.data : error.message;
  }
};

export const updateUser = async (userData) => {
  try {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    // console.log("Sending profile update request with token:", token);
    // console.log("User Data Being Sent:", userData);

    const response = await apiClient.put(`/api/users/update?userId=${userData.userId}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    // console.log("Profile Update Response:", response.data);
    // If backend asks to logout after email update, force re-login
    if (response.data.status === "logout") {
      console.warn("Email changed. Forcing re-login.");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userId");
      window.location.href = "/"; // Redirect to login page
    }
    return response.data;
  } catch (error) {
    console.error("updateUser Error:", error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : error.message;
  }
};

export const sendOtp = async (userId, email) => {
  try {
    // console.log("Calling send-verification-mail API with email:", email);
    const response = await apiClient.post("/api/users/send-verification-mail", null, {
      params: { userId, email },
    });
    // console.log("OTP Sent Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("sendOtp Error:", error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : error.message;
  }
};

export const verifyOtp = async (userId, otp) => {
  try {
    // console.log("Calling verify-email API with userId:", userId, "and otp:", otp);
    const response = await apiClient.post("/api/users/verify-email", null, {
      params: { userId, otp },
    });
    // console.log("OTP Verification Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("verifyOtp Error:", error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : error.message;
  }
};

  export const createSession = async (rememberMeId,bugId) => {
    try {
      // Make a call to your backend to create a session
      const response = await apiClient.post(`/session/create?ownerId=${rememberMeId}&bugId=${bugId}`, null, {
        params: { ownerId: rememberMeId,bugId:bugId },
      });
      // The backend should respond with a JSON object that contains sessionId
      return response.data;
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };
  