const socket = io();
socket.on('connect', () => console.log('coba bisa ga'));

// when the game starts, display the current letter and remaining time
socket.on('game-started', ({ currentLetter, remainingTime }) => {
  $('#current-letter').text(currentLetter);
  $('#remaining-time').text(remainingTime);
});

// when a word is submitted, validate it and add it to the list of submitted words
socket.on('word-submitted', ({ word, score }) => {
  const submittedWords = $('#submitted-words');

  if (!word || word.charAt(0).toLowerCase() !== $('#current-letter').text()) {
    alert('Invalid word!');
    return;
  }

  if (submittedWords.find(`li:contains(${word})`).length > 0) {
    alert('Word already submitted!');
    return;
  }

  const li = $('<li></li>').text(`${word} (${score} points)`);
  submittedWords.append(li);
});

// when the game ends, display the total score
socket.on('game-ended', (totalScore) => {
  $('#scores').text(`Total score: ${totalScore}`);
});

// when the word form is submitted, send the word to the server to validate
$('#word-form').submit((event) => {
  event.preventDefault();

  const word = $('#word-input').val();

  socket.emit('submit-word', { word });
});
