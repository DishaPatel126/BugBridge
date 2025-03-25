import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update, off, remove, get } from "firebase/database";

// Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5cQ4v4KQ2VhnfJB_XmehvIYAmNpvrISU",
  authDomain: "bug-board.firebaseapp.com",
  databaseURL: "https://bug-board-default-rtdb.firebaseio.com/",
  projectId: "bug-board",
  storageBucket: "bug-board.firebasestorage.app",
  messagingSenderId: "740182956919",
  appId: "1:740182956919:web:0025b4b818b087650f5f72",
  measurementId: "G-JCQPYCDJHL"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const CollabService = {
  firebaseRef: null,

  // Initialize the Firebase reference based on the sessionId
  init(sessionId) {
    this.firebaseRef = ref(database, `collabSessions/${sessionId}`);
  },

  // Connect and listen for updates
  connect(sessionId,bugId,isOwner,code, onUpdate) {
    this.init(sessionId);
    if(isOwner){
        get(this.firebaseRef)
        .then((snapshot) => {
        const data = snapshot.val();
        //onUpdate(data);
        // If bugId is not set, update it along with createdAt.
        if (!data || !data.bugId) {
            update(this.firebaseRef, {
            createdAt: new Date().toISOString(),
            bugId: bugId,
            code:code
            });
        }
        })
        .catch((error) => {
        console.error("Error getting initial data:", error);
        });
    }

    onValue(this.firebaseRef, (snapshot) => {
      const data = snapshot.val();
      if (data && onUpdate) {
        onUpdate(data);
      }
    });
  },

  // Disconnect the listener
  disconnect() {
    if (this.firebaseRef) {
      off(this.firebaseRef);
      this.firebaseRef = null;
    }
  },

  // Send a code update to Firebase using update() to merge changes without deleting joinRequests.
  sendCodeUpdate(sessionId, updateData) {
    if (!this.firebaseRef) {
      this.init(sessionId);
    }
    update(this.firebaseRef, updateData);
  },

  // Send a join request from a non-owner.
  sendJoinRequest(sessionId, joinerId) {
    const joinRequestRef = ref(database, `collabSessions/${sessionId}/joinRequests/${joinerId}`);
    const joinRequest = {
      status: "pending",
      timestamp: new Date().toISOString(),
      joinerId,
    };
    update(joinRequestRef, joinRequest);
  },

  // Listen for join requests (for owner).
listenForJoinRequests(sessionId, callback) {
    const joinRequestsRef = ref(database, `collabSessions/${sessionId}/joinRequests`);
    const listener = (snapshot) => {
      const data = snapshot.val();
      callback(data);
    };
    onValue(joinRequestsRef, listener);
    // Return an unsubscribe function that removes only this listener
    return () => off(joinRequestsRef, 'value', listener);
  },

  // Owner responds to a join request by updating its status.
  respondToJoinRequest(sessionId, joinerId, response) {
    const joinRequestRef = ref(database, `collabSessions/${sessionId}/joinRequests/${joinerId}`);
    const joinRequest = {
      status: response,
      timestamp: new Date().toISOString(),
      joinerId,
    };
    update(joinRequestRef, joinRequest);
  },

 // Joiner listens for updates to its own join request status.
listenForJoinRequestForJoiner(sessionId, joinerId, callback) {
    const joinRequestRef = ref(database, `collabSessions/${sessionId}/joinRequests/${joinerId}`);
    const listener = (snapshot) => {
      const data = snapshot.val();
      callback(data);
    };
    onValue(joinRequestRef, listener);
    // Return an unsubscribe function that removes only this listener
    return () => off(joinRequestRef, 'value', listener);
  },
  endSession(sessionId) {
    const sessionRef = ref(database, `collabSessions/${sessionId}`);
    // Remove the session node from the database.
    remove(sessionRef);
  },
    sendCursorUpdate(sessionId, cursorData) {
        if (!this.firebaseRef) {
            this.init(sessionId);
        }
        const cursorRef = ref(database, `collabSessions/${sessionId}/cursors/${cursorData.userId}`);
        update(cursorRef, {
            position: cursorData.position,
            timestamp: new Date().toISOString()
        });
    },

    // Listen for all users' cursor updates
    listenForCursorUpdates(sessionId, callback) {
        const cursorsRef = ref(database, `collabSessions/${sessionId}/cursors`);
        const listener = (snapshot) => {
            const data = snapshot.val();
            callback(data || {});
        };
        onValue(cursorsRef, listener);
        return () => off(cursorsRef, 'value', listener);
    },
};

export default CollabService;
