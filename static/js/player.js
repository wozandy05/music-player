document.addEventListener('DOMContentLoaded', () => {
    const baseUrl = document.body.dataset.baseUrl;
    const audioPlayer = new Audio();
    let currentTrack = 0;
    let tracks = [];

    const playerImage = document.getElementById('playerImage');
    const trackTitle = document.getElementById('trackTitle');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Fetch tracks from andy.largent.org
    fetch(`${baseUrl}/music.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            tracks = data;
            loadTrack(currentTrack);
        })
        .catch(error => {
            console.error('Error fetching tracks:', error);
            trackTitle.textContent = 'Error loading tracks. Please try again later.';
        });

    function loadTrack(trackIndex) {
        if (tracks.length === 0) {
            return;
        }
        const track = tracks[trackIndex];
        audioPlayer.src = `${baseUrl}${track.url}`;
        playerImage.src = `${baseUrl}${track.image}`;
        trackTitle.textContent = track.title;
        playPauseBtn.innerHTML = '&#9658;'; // Play icon
    }

    function playPause() {
        if (tracks.length === 0) {
            return;
        }
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseBtn.innerHTML = '&#10074;&#10074;'; // Pause icon
        } else {
            audioPlayer.pause();
            playPauseBtn.innerHTML = '&#9658;'; // Play icon
        }
    }

    function nextTrack() {
        if (tracks.length === 0) {
            return;
        }
        currentTrack = (currentTrack + 1) % tracks.length;
        loadTrack(currentTrack);
        playPause();
    }

    function prevTrack() {
        if (tracks.length === 0) {
            return;
        }
        currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrack);
        playPause();
    }

    playPauseBtn.addEventListener('click', playPause);
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);

    // Bubble animation
    function createBubble() {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.style.left = `${Math.random() * 100}vw`;
        bubble.style.top = `${Math.random() * 100}vh`;
        bubble.style.width = `${Math.random() * 50 + 20}px`;
        bubble.style.height = bubble.style.width;
        document.body.appendChild(bubble);

        setTimeout(() => {
            bubble.remove();
        }, 4000);
    }

    // Create bubbles more frequently
    setInterval(createBubble, 100);
});
