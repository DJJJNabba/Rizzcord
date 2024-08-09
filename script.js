document.addEventListener('DOMContentLoaded', (event) => {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPopup = document.getElementById('settingsPopup');
  const saveSettings = document.getElementById('saveSettings');
  const closeSettings = document.getElementById('closeSettings');
  const usernameInput = document.getElementById('username');
  const nameColorInput = document.getElementById('nameColor');
  const chatLink = document.querySelector('nav a[href="#/chat"]');
  const roomsLink = document.querySelector('nav a[href="#/rooms"]');
  const aboutLink = document.querySelector('nav a[href="#/about"]');

  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      settingsPopup.style.display = 'block';
    });
  }

  if (closeSettings) {
    closeSettings.addEventListener('click', () => {
      settingsPopup.style.display = 'none';
    });
  }

  if (saveSettings) {
    saveSettings.addEventListener('click', () => {
      currentUsername = usernameInput.value || 'Anonymous';
      currentNameColor = nameColorInput.value || '#FFFFFF';

      localStorage.setItem('username', currentUsername);
      localStorage.setItem('color', currentNameColor);

      settingsPopup.style.display = 'none';
    });
  }

  // Function to handle navigation based on the hash
  function hashHandler() {
    const pathSegments = window.location.hash.split('/');
    const mainContent = document.getElementById('mainContent');
    const roomContainer = document.querySelector('.room-container');
  
    if (!mainContent) {
      console.error('mainContent element not found');
      return;
    }
  
    switch (pathSegments[1]) {
      case 'chat':
        mainContent.innerHTML = '<h1>Chat</h1><div id="messageDisplay" class="message-display"></div><div class="input-area"><input type="text" id="messageInput" class="message-input" placeholder="Type your message here..." /></div>';
        showChatRoom();
        break;
      case 'rooms':
        mainContent.innerHTML = '<div class="room-container"><h2>Join a Room</h2><input type="text" id="roomCodeInput" placeholder="Enter Room Code"><button onclick="joinRoom()">Join Room</button><h2>Create a Room</h2><button onclick="createRoom()">Create Room</button><h2>Recent Rooms</h2><div id="recentRooms"></div></div>';
        displayRecentRooms();
        showRoomsPage();
        break;
      case 'about':
        mainContent.innerHTML = '<h1>About Rizzcord</h1><p>Free instant messaging service for sigmas.</p>';
        break;
      default:
        window.location.hash = '#/rooms';
        break;
    }
  }
  

  window.addEventListener('hashchange', hashHandler);
  hashHandler();

  loadSettings();
  fetchData();
  setInterval(fetchData, 2000);

  const messageInput = document.getElementById('messageInput');
  if (messageInput) {
    messageInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        sendData();
      }
    });

    messageInput.addEventListener('input', function(event) {
      checkForEmojiInput(event.target);
    });
  }

  displayRecentRooms();
});

let currentUsername = 'Anonymous';
let currentNameColor = '#FFFFFF';
let roomCode = '';

function loadSettings() {
  const savedUsername = localStorage.getItem('username');
  const savedColor = localStorage.getItem('color');
  if (savedUsername) {
    currentUsername = savedUsername;
    document.getElementById('username').value = savedUsername;
  }
  if (savedColor) {
    currentNameColor = savedColor;
    document.getElementById('nameColor').value = savedColor;
  }
}

function joinRoom() {
  const roomCode = document.getElementById('roomCodeInput').value.trim();
  if (roomCode !== '') {
    window.location.href = `#/rooms/${roomCode}`;
  } else {
    alert('Please enter a room code.');
  }
}

function showChatRoom() {
  document.getElementById('messageDisplay').style.display = 'block';
  document.querySelector('.input-area').style.display = 'block';
  if (document.querySelector('.room-container')) {
    document.querySelector('.room-container').style.display = 'none';
  }
}

function showRoomsPage() {
  const messageDisplay = document.getElementById('messageDisplay');
  const inputArea = document.querySelector('.input-area');
  const roomContainer = document.querySelector('.room-container');

  if (messageDisplay && inputArea && roomContainer) {
    messageDisplay.style.display = 'none';
    inputArea.style.display = 'none';
    roomContainer.style.display = 'block';
  } else {
    console.error("One or more elements are missing on the page.");
  }
}

async function sendData() {
  const message = document.getElementById('messageInput').value;
  if (message.trim() !== '') {
    try {
      const response = await fetch(`/Rizzcord/api/rooms/${roomCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: currentUsername, color: currentNameColor, message })
      });
      const result = await response.json();
      console.log(result.message);
      fetchData();
      document.getElementById('messageInput').value = '';
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}

async function fetchData() {
  try {
    const response = await fetch(`/Rizzcord/api/rooms/${roomCode}`);
    const data = await response.json();
    const display = document.getElementById('messageDisplay');
    if (display) {
      display.innerHTML = '';
      let lastUsername = null;
      data.messages.forEach((msg, index) => {
        const newMessage = document.createElement('div');
        newMessage.className = 'message';
        if (msg.username !== lastUsername) {
          if (index > 0) {
            const gap = document.createElement('div');
            gap.style.marginTop = '20px';
            display.appendChild(gap);
          }
          const usernameSpan = document.createElement('span');
          usernameSpan.textContent = msg.username;
          usernameSpan.style.color = msg.color;
          newMessage.appendChild(usernameSpan);
          lastUsername = msg.username;
        }
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = parseMarkup(msg.message);
        newMessage.appendChild(messageContent);
        display.appendChild(newMessage);
      });
      twemoji.parse(display);
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
}

function parseMarkup(text) {
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  text = text.replace(/_(.*?)_/g, '<em>$1</em>');

  text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');

  text = text.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  text = text.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  text = text.replace(/^\* (.*?)$/gm, '<ul><li>$1</li></ul>');
  text = text.replace(/^- (.*?)$/gm, '<ul><li>$1</li></ul>');
  text = text.replace(/<\/ul>\n<ul>/g, '');

  text = text.replace(/^\d+\. (.*?)$/gm, '<ol><li>$1</li></ol>');
  text = text.replace(/<\/ol>\n<ol>/g, '');

  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

  text = text.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;">');

  text = text.replace(/:smile:/g, '😊');
  text = text.replace(/:sob:/g, '😭');
  text = text.replace(/:pensive:/g, '😔');
  text = text.replace(/:heart:/g, '❤️');
  return text;
}
