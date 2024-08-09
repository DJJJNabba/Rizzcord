document.addEventListener('DOMContentLoaded', (event) => {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPopup = document.getElementById('settingsPopup');
  const saveSettings = document.getElementById('saveSettings');
  const closeSettings = document.getElementById('closeSettings');
  const usernameInput = document.getElementById('username');
  const nameColorInput = document.getElementById('nameColor');
  const chatLink = document.querySelector('nav a[href="index.html"]');

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

  // Call the hash handler initially and whenever the hash changes
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

function joinRoom() {
  const roomCode = document.getElementById('roomCodeInput').value.trim();
  if (roomCode !== '') {
    window.location.href = `#/rooms/${roomCode}`;
  } else {
    alert('Please enter a room code.');
  }
}


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

// Hash handler to determine what content to show based on the URL hash
function hashHandler() {
  const pathSegments = window.location.hash.split('/');
  if (pathSegments.length > 2 && pathSegments[1] === 'rooms') {
    roomCode = pathSegments[2];
    saveRecentRoom(roomCode);
    localStorage.setItem('recentRoomCode', roomCode);
    showChatRoom();
  } else {
    showRoomsPage();
  }
}

function saveRecentRoom(roomCode) {
  let recentRooms = JSON.parse(localStorage.getItem('recentRooms')) || [];
  recentRooms = recentRooms.filter(code => code !== roomCode);
  recentRooms.unshift(roomCode);
  if (recentRooms.length > 5) recentRooms.pop();
  localStorage.setItem('recentRooms', JSON.stringify(recentRooms));
}

// Function to show the chat room interface
function showChatRoom() {
  document.getElementById('messageDisplay').style.display = 'block';
  document.querySelector('.input-area').style.display = 'block';
  document.querySelector('.room-container').style.display = 'none';
}

// Function to show the rooms page interface
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
