const input = document.getElementById('messageInput');
const display = document.getElementById('messageDisplay');
const settingsBtn = document.getElementById('settingsBtn');
const roomsBtn = document.getElementById('roomsBtn');
const settingsPopup = document.getElementById('settingsPopup');
const roomsPopup = document.getElementById('roomsPopup');
const saveSettings = document.getElementById('saveSettings');
const closeSettings = document.getElementById('closeSettings');
const joinRoom = document.getElementById('joinRoom');
const closeRooms = document.getElementById('closeRooms');
const usernameInput = document.getElementById('username');
const nameColorInput = document.getElementById('nameColor');
const roomCodeInput = document.getElementById('roomCodeInput');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const inputArea = document.getElementById('inputArea');

let currentUsername = 'Anonymous';
let currentNameColor = '#FFFFFF'; // Default to white
let currentRoomCode = '';

settingsBtn.addEventListener('click', () => {
  settingsPopup.style.display = 'block';
});

closeSettings.addEventListener('click', () => {
  settingsPopup.style.display = 'none';
});

roomsBtn.addEventListener('click', () => {
  roomsPopup.style.display = 'block';
});

closeRooms.addEventListener('click', () => {
  roomsPopup.style.display = 'none';
});

joinRoom.addEventListener('click', () => {
  currentRoomCode = roomCodeInput.value || '';
  localStorage.setItem('roomCode', currentRoomCode);
  roomCodeDisplay.textContent = `Room Code: ${currentRoomCode}`;
  roomsPopup.style.display = 'none';
  inputArea.style.display = 'flex'; // Show the input area
  fetchData();
});

saveSettings.addEventListener('click', () => {
  currentUsername = usernameInput.value || 'Anonymous'; // Default to 'Anonymous' if empty
  currentNameColor = nameColorInput.value || '#FFFFFF'; // Default to white if empty

  // Save settings to local storage
  localStorage.setItem('username', currentUsername);
  localStorage.setItem('color', currentNameColor);

  settingsPopup.style.display = 'none';
});

input.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendData();
  }
});

roomCodeInput.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    joinRoom.click();
  }
});

async function sendData() {
  const message = input.value;
  const username = currentUsername;
  const color = currentNameColor;
  const roomCode = currentRoomCode;

  if (message.trim() !== '' && roomCode.trim() !== '') {
    const response = await fetch('https://mud-shimmer-fossa.glitch.me/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, color, message, roomCode })
    });
    const result = await response.json();
    console.log(result.message);
    fetchData();
    input.value = ''; // Clear input after sending
  }
}

async function fetchData() {
  const roomCode = currentRoomCode;

  if (roomCode.trim() !== '') {
    const response = await fetch(`https://mud-shimmer-fossa.glitch.me/?roomCode=${roomCode}`);
    const data = await response.json();
    display.innerHTML = ''; // Clear display before updating
    data.messages.forEach(msg => {
      const newMessage = document.createElement('div');
      const usernameSpan = document.createElement('span');
      usernameSpan.textContent = msg.username + ': ';
      usernameSpan.style.color = msg.color;
      usernameSpan.style.minWidth = '100px';
      usernameSpan.style.display = 'inline-block';
      newMessage.appendChild(usernameSpan);
      newMessage.appendChild(document.createTextNode(msg.message));
      display.appendChild(newMessage);
    });
  }
}

setInterval(fetchData, 2000); // Fetch data every 2 seconds
