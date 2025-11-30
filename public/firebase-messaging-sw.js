// public/firebase-messaging-sw.js

// Import the Firebase app and messaging scripts
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

// Your web app's Firebase configuration (from your .env file)
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title || "Clinic Line";
  const notificationOptions = {
    body: payload.notification.body || "You have an update from the clinic.",
    icon: "/icon-192x192.png", // Make sure you have an icon file here
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
