const input = document.getElementById('messageInput');
const display = document.getElementById('messageDisplay');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPopup = document.getElementById('settingsPopup');
const saveSettings = document.getElementById('saveSettings');
const closeSettings = document.getElementById('closeSettings');
const usernameInput = document.getElementById('username');
const nameColorInput = document.getElementById('nameColor');

let currentUsername = 'Anonymous';
let currentNameColor = '#FFFFFF'; // Default to white

settingsBtn.addEventListener('click', () => {
  settingsPopup.style.display = 'block';
});

closeSettings.addEventListener('click', () => {
  settingsPopup.style.display = 'none';
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

async function sendData() {
  const message = input.value;
  const username = currentUsername;
  const color = currentNameColor;

  if (message.trim() !== '') {
    const response = await fetch('https://mud-shimmer-fossa.glitch.me/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, color, message })
    });
    const result = await response.json();
    console.log(result.message);
    fetchData();
    input.value = ''; // Clear input after sending
  }
}

async function fetchData() {
  const response = await fetch('https://mud-shimmer-fossa.glitch.me/');
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

setInterval(fetchData, 1000); // Fetch data every 2 seconds