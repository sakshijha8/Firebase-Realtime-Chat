# 🔥 Firebase Chat App

A real-time chat application built with **React.js** and **Firebase**, supporting:

- 🔐 Firebase Authentication (Email/Password)
- 💬 Direct 1-on-1 Chat
- 👥 Group Chat with multiple members
- ✏️ Edit/Delete Messages (for both direct & group)
- ⚡ Real-time Sync across users

---

## 🚀 Features

### 🔐 Authentication
- User sign-up and login using **Firebase Auth**
- Email/password based authentication
- Persistent login session with auth state handling

### 💬 Direct Chat
- Real-time messaging between two users
- Shows last message preview
- Supports edit & delete operations
- Message timestamps

### 👥 Group Chat
- Create group with custom name
- Add/remove members during group creation
- Initial message support
- Group listing for all members
- Edit & delete messages within group

### 🛠️ Message Operations
- ✅ Edit sent messages
- 🗑️ Delete single or multiple messages
- ⏱️ Timestamps for all messages
- 🔁 Real-time updates without refresh

---

## 🧰 Tech Stack

| Tech           | Description                     |
|----------------|---------------------------------|
| React.js       | Front-end UI                    |
| Firebase       | Backend (Auth + Realtime DB)    |
| React Router   | Routing for login/dashboard     |
| Tailwind CSS   | UI styling                      |
| React Icons    | Icons for UI                    |

---

## 🔧 Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/your-username/firebase-chat-app.git
cd firebase-chat-app
```
### 2. Firebase Config Setup
- Go to Firebase Console
- Create a new Firebase project
- Enable Email/Password Authentication under Authentication
- Create a Realtime Database (start in test mode)
- Copy your Firebase config and paste it inside firebase.js

