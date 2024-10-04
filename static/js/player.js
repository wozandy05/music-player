document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = new Audio();

    const playerImage = document.getElementById('playerImage');
    const trackTitle = document.getElementById('trackTitle');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    function loadTrack() {
        audioPlayer.src = 'https://flacdb.netlify.app/audio/jb_ghost.mp3';
        playerImage.src = 'https://flacdb.netlify.app/img/jb_ghost.jpg';
        trackTitle.textContent = 'Ghost';
        playPauseBtn.innerHTML = '&#9658;'; // Play icon

        audioPlayer.onerror = function() {
            console.error('Error loading audio:', audioPlayer.error);
            trackTitle.textContent = 'Error loading audio';
        };
    }

    function playPause() {
        if (audioPlayer.paused) {
            audioPlayer.play().catch(error => {
                console.error('Error playing audio:', error);
                trackTitle.textContent = 'Error playing audio';
            });
            playPauseBtn.innerHTML = '&#10074;&#10074;'; // Pause icon
        } else {
            audioPlayer.pause();
            playPauseBtn.innerHTML = '&#9658;'; // Play icon
        }
    }

    playPauseBtn.addEventListener('click', playPause);
    prevBtn.addEventListener('click', () => console.log('Previous track'));
    nextBtn.addEventListener('click', () => console.log('Next track'));

    // Load the track when the page loads
    loadTrack();

    // Bubble animation
    function createBubble() {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.style.left = `${Math.random() * 100}vw`;
        bubble.style.top = `${Math.random() * 100}vh`;
        bubble.style.width = `${Math.random() * 50 + 20}px`;
        bubble.style.height = bubble.style.width;

        // Create an array of colors
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        
        // Randomly select a color from the array
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Apply the selected color to the bubble's background-color with transparency
        bubble.style.backgroundColor = `${randomColor}50`;  // 50 is for 31% opacity in hex

        document.body.appendChild(bubble);

        setTimeout(() => {
            bubble.remove();
        }, 4000);
    }

    // Create bubbles more frequently
    setInterval(createBubble, 100);
});
