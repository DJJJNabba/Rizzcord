const input = document.getElementById('messageInput');
const display = document.getElementById('messageDisplay');

input.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    if (input.value.trim() !== '') {
      const newMessage = document.createElement('div');
      newMessage.textContent = input.value;
      display.appendChild(newMessage);
      input.value = ''; // Clear input box after sending message
    }
  }
});
