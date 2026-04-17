CashFlow Chat API — Admin Dashboard Web Integration Guide
Base URL: http://10.10.7.106:5001/api/v1
Socket URL: http://10.10.7.106:5001
Auth: Authorization: Bearer <jwt_token> (HTTP) · { auth: { token } } (Socket.IO)

Table of Contents
Admin Role Overview
Data Models
REST API Endpoints
Socket.IO Integration
Complete JS Chat Manager
Admin UI Flow
Error Handling
1. Admin Role Overview
The admin interacts with the chat system differently from regular users:

Behaviour	User	Admin
GET /my-rooms	Returns own single room	Returns all rooms (admin is participant of all)
Create room	Creates own room	Assigned automatically when a user creates a room
Send message	In their own room only	In any room they are a participant of
senderRole in messages	"user"	"admin"
The admin sees all user support rooms in a list (like a helpdesk inbox).

2. Data Models
ChatRoom (JS object)
{
  _id: "64f1a2b3c4d5e6f7a8b9c0d1",   // Room ID — used in all room-scoped calls
  participants: ["userId123", "adminId456"],
  admin: { _id, name, image, avatar },
  user:  { _id, name, image, avatar }, // The customer
  lastMessage: { _id, messageType, content, createdAt },
  createdAt: "2026-04-17T03:00:00.000Z",
  updatedAt: "2026-04-17T03:00:00.000Z"
}
ChatMessage (JS object)
{
  _id: "msgId789",
  chatRoom: "64f1a2b3c4d5e6f7a8b9c0d1",
  sender: { _id, name, image, avatar },  // Populated user object
  senderRole: "user" | "admin",
  messageType: "text" | "image" | "pdf",
  content: "Hello!",          // Present for text messages
  fileUrl: "https://cdn...",  // CloudFront URL for image/pdf
  fileName: "report.pdf",
  fileSize: 204800,           // bytes (compressed)
  readBy: ["userId123", "adminId456"],
  createdAt: "2026-04-17T03:05:00.000Z"
}
3. REST API Endpoints
3.1 Get All User Rooms (Admin Inbox)
Returns all chat rooms where the admin is a participant — i.e. all user support rooms.

GET /chat/my-rooms?page=1&limit=20&sortOrder=desc
Authorization: Bearer <admin_jwt>
Response:

{
  "success": true,
  "statusCode": 200,
  "message": "Chat rooms retrieved successfully",
  "pagination": { "total": 12, "page": 1, "limit": 20, "totalPage": 1 },
  "data": [ /* array of ChatRoom objects */ ]
}
JS Fetch:

async function getAllRooms(page = 1, limit = 20) {
  const res = await fetch(`${BASE_URL}/chat/my-rooms?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return { rooms: data.data, pagination: data.pagination };
}
3.2 Get Messages in a Room
GET /chat/:chatRoomId/messages?page=1&limit=20&sortOrder=desc
Authorization: Bearer <admin_jwt>
Response:

{
  "success": true,
  "statusCode": 200,
  "message": "Chat messages retrieved successfully",
  "pagination": { "total": 42, "page": 1, "limit": 20, "totalPage": 3 },
  "data": [ /* array of ChatMessage objects */ ]
}
JS Fetch:

async function getMessages(chatRoomId, page = 1, limit = 20) {
  const res = await fetch(
    `${BASE_URL}/chat/${chatRoomId}/messages?page=${page}&limit=${limit}&sortOrder=desc`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return { messages: data.data, pagination: data.pagination };
}
Pagination / Infinite Scroll: Increment page on scroll-up and prepend older messages.

3.3 Send a Message (Admin Reply)
Text Message
POST /chat/send-message/:chatRoomId
Authorization: Bearer <admin_jwt>
Content-Type: application/json

{ "messageType": "text", "content": "Hi, how can I help you?" }
JS Fetch:

async function sendTextMessage(chatRoomId, content) {
  const res = await fetch(`${BASE_URL}/chat/send-message/${chatRoomId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messageType: 'text', content }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data; // saved ChatMessage
}
Image / PDF Message (multipart)
Field	Value
data	JSON string: {"messageType":"image"} or {"messageType":"pdf"}
file	Binary file (input type="file")
async function sendFileMessage(chatRoomId, file, messageType) {
  const form = new FormData();
  form.append('data', JSON.stringify({ messageType }));
  form.append('file', file); // File object from <input type="file">

  const res = await fetch(`${BASE_URL}/chat/send-message/${chatRoomId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    // Do NOT set Content-Type — browser sets it with boundary automatically
    body: form,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}
File constraints: - messageType: "text" → content required, no file - messageType: "image" → file required, no content - messageType: "pdf" → file required, no content

3.4 Mark Room Messages as Read
Marks all unread messages in a room as read by the admin. Does not affect messages the admin sent.

PATCH /chat/:chatRoomId/mark-read
Authorization: Bearer <admin_jwt>
Response:

{ "success": true, "statusCode": 200, "message": "Messages marked as read successfully" }
JS Fetch:

async function markAsRead(chatRoomId) {
  const res = await fetch(`${BASE_URL}/chat/${chatRoomId}/mark-read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
}
4. Socket.IO Integration
Install via CDN (vanilla JS dashboard):

<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
Or via npm (React/Vue/Next.js):

npm install socket.io-client
4.1 Connect with JWT Auth
const socket = io('http://10.10.7.106:5001', {
  transports: ['websocket'],
  auth: { token: adminJwtToken }, // JWT here — not in headers
});

socket.on('connect', () => console.log('✅ Socket connected:', socket.id));
socket.on('connect_error', (err) => console.error('❌ Auth failed:', err.message));
socket.on('disconnect', () => console.warn('🔌 Socket disconnected'));
The server rejects the connection if the token is invalid/missing.

4.2 Emit Events (Client → Server)
joinRoom — Join a user's chat room
// Call after socket connects and admin selects a room
socket.emit('joinRoom', chatRoomId);

socket.on('joinedRoom', (roomId) => {
  console.log('Joined room:', roomId);
});

socket.on('roomError', (msg) => {
  console.error('Room error:', msg);
});
sendMessage — Send text in real time
socket.emit('sendMessage', {
  chatRoomId: chatRoomId,
  messageType: 'text',
  content: 'Your issue has been resolved.',
});

socket.on('messageError', (msg) => console.error('Message error:', msg));
For image/pdf, use the REST endpoint and update the local list manually.

markMessagesAsRead — Mark room as read
socket.emit('markMessagesAsRead', chatRoomId);

socket.on('readError', (msg) => console.error('Read error:', msg));
4.3 Listen Events (Server → Client)
Event	Payload	When
joinedRoom	chatRoomId: string	Successfully joined a room
newMessage	ChatMessage object	New message in any joined room
messagesRead	{ chatRoomId, userId }	A participant marked messages as read
roomError	string	joinRoom failed
messageError	string	sendMessage failed
readError	string	markMessagesAsRead failed
socket.on('newMessage', (message) => {
  console.log('New message:', message);
  // message.chatRoom tells you which room it belongs to
  appendMessageToRoom(message.chatRoom, message);
  updateRoomLastMessage(message.chatRoom, message);
});

socket.on('messagesRead', ({ chatRoomId, userId }) => {
  // Update read indicators in the UI for that room
  markUIAsRead(chatRoomId, userId);
});
Multi-room tip: The admin must call socket.emit('joinRoom', id) for each room they want to receive live events from. Do this when loading the room list, or lazily when a room is opened.

5. Complete JS Chat Manager
const BASE_URL = 'http://10.10.7.106:5001/api/v1';
const SOCKET_URL = 'http://10.10.7.106:5001';

class AdminChatManager {
  constructor(token) {
    this.token = token;
    this.socket = null;
    this.activeRoomId = null;
  }

  // ── REST ────────────────────────────────────────────────────

  async getAllRooms(page = 1, limit = 20) {
    const res = await this._get(`/chat/my-rooms?page=${page}&limit=${limit}`);
    return { rooms: res.data, pagination: res.pagination };
  }

  async getMessages(chatRoomId, page = 1, limit = 20) {
    const res = await this._get(
      `/chat/${chatRoomId}/messages?page=${page}&limit=${limit}&sortOrder=desc`
    );
    return { messages: res.data, pagination: res.pagination };
  }

  async sendTextMessage(chatRoomId, content) {
    return this._post(`/chat/send-message/${chatRoomId}`, { messageType: 'text', content });
  }

  async sendFileMessage(chatRoomId, file, messageType) {
    const form = new FormData();
    form.append('data', JSON.stringify({ messageType }));
    form.append('file', file);
    const res = await fetch(`${BASE_URL}/chat/send-message/${chatRoomId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` },
      body: form,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  async markAsRead(chatRoomId) {
    return this._patch(`/chat/${chatRoomId}/mark-read`);
  }

  // ── Socket ──────────────────────────────────────────────────

  connectSocket({ onNewMessage, onMessagesRead }) {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token: this.token },
    });

    this.socket.on('connect', () => console.log('✅ Socket connected'));
    this.socket.on('connect_error', (e) => console.error('❌ Socket auth failed:', e.message));
    this.socket.on('disconnect', () => console.warn('🔌 Disconnected'));

    this.socket.on('newMessage', onNewMessage);
    this.socket.on('messagesRead', onMessagesRead);
    this.socket.on('messageError', (msg) => console.error('Message error:', msg));
    this.socket.on('roomError', (msg) => console.error('Room error:', msg));
  }

  joinRoom(chatRoomId) {
    if (!this.socket?.connected) return;
    this.socket.emit('joinRoom', chatRoomId);
    this.activeRoomId = chatRoomId;
  }

  sendSocketMessage(content) {
    if (!this.activeRoomId) return;
    this.socket.emit('sendMessage', {
      chatRoomId: this.activeRoomId,
      messageType: 'text',
      content,
    });
  }

  markReadSocket(chatRoomId) {
    this.socket?.emit('markMessagesAsRead', chatRoomId);
  }

  disconnect() {
    this.socket?.disconnect();
  }

  // ── HTTP Helpers ────────────────────────────────────────────

  async _get(path) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  }

  async _post(path, body) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  async _patch(path) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${this.token}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  }
}
Usage:

const chat = new AdminChatManager(adminJwtToken);

// 1. Connect socket
chat.connectSocket({
  onNewMessage: (msg) => {
    appendMessage(msg.chatRoom, msg);
    updateInboxLastMessage(msg);
  },
  onMessagesRead: ({ chatRoomId, userId }) => {
    updateReadIndicator(chatRoomId, userId);
  },
});

// 2. Load all user rooms
const { rooms } = await chat.getAllRooms();
renderRoomList(rooms);

// 3. Join all rooms so admin gets live events from everyone
rooms.forEach(r => chat.joinRoom(r._id));

// 4. Admin selects a room
async function openRoom(chatRoomId) {
  chat.activeRoomId = chatRoomId;
  const { messages } = await chat.getMessages(chatRoomId);
  renderMessages(messages.reverse()); // reverse: oldest first
  await chat.markAsRead(chatRoomId);
  chat.markReadSocket(chatRoomId);
}

// 5. Admin sends a reply
async function sendReply(content) {
  // Use socket for text (instant)
  chat.sendSocketMessage(content);
}

// 6. Admin sends a file
async function sendFile(file, type) {
  const msg = await chat.sendFileMessage(chat.activeRoomId, file, type);
  appendMessage(chat.activeRoomId, msg); // insert locally
}
6. Admin UI Flow
sequenceDiagram
    participant Admin as Admin Browser
    participant API as REST API
    participant WS as Socket.IO

    Admin->>WS: connect({ auth: { token } })
    WS-->>Admin: connect event

    Admin->>API: GET /chat/my-rooms
    API-->>Admin: [ all user rooms ]

    loop For each room
        Admin->>WS: emit joinRoom(roomId)
        WS-->>Admin: joinedRoom(roomId)
    end

    Note over Admin: Admin clicks a room
    Admin->>API: GET /chat/:id/messages
    API-->>Admin: messages[]
    Admin->>API: PATCH /chat/:id/mark-read

    Note over Admin: Admin types reply
    Admin->>WS: emit sendMessage({ chatRoomId, text })
    WS-->>Admin: newMessage (broadcast to room)

    Note over Admin: User sends message
    WS-->>Admin: newMessage (arrives live)
7. Error Handling
HTTP Error Shape
{ "success": false, "statusCode": 403, "message": "You are not a participant of this chat room" }
Code	Meaning
401	Token missing or expired — redirect to login
403	Admin not a participant of that room
404	Chat room not found
400	Validation failed (e.g. text message without content)
Socket Error Events
socket.on('connect_error', (err) => {
  // err.message === 'Authentication error: Token not provided'
  // err.message === 'Authentication error: Invalid token'
  redirectToLogin();
});

socket.on('roomError',    (msg) => showToast(`Room: ${msg}`));
socket.on('messageError', (msg) => showToast(`Message: ${msg}`));
socket.on('readError',    (msg) => console.warn(`Read: ${msg}`));
[!IMPORTANT] Join all rooms on load. The admin must emit('joinRoom', roomId) for every room in their inbox to receive real-time newMessage events from all users. Typically do this right after fetching the room list.

[!TIP] Production: Replace http:// with https:// and ws:// with wss://. The socket runs on the same port as the API — no separate socket port needed.