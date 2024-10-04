document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = new Audio();
    let currentTrackIndex = 0;
    let isPlaying = false;

    const playerImage = document.getElementById('playerImage');
    const trackTitle = document.getElementById('trackTitle');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const playlist = document.getElementById('playlist');
    const togglePlaylistBtn = document.getElementById('togglePlaylist');
    const playlistContainer = document.getElementById('playlistContainer');

    const tracks = [
        { title: 'Ghost', src: 'https://flacdb.netlify.app/audio/jb_ghost.mp3', img: 'https://flacdb.netlify.app/img/jb_ghost.jpg' },
        { title: 'Track 2', src: 'https://example.com/track2.mp3', img: 'https://example.com/track2.jpg' },
        { title: 'Track 3', src: 'https://example.com/track3.mp3', img: 'https://example.com/track3.jpg' }
    ];

    function loadTrack(index) {
        if (index >= 0 && index < tracks.length) {
            currentTrackIndex = index;
            audioPlayer.src = tracks[currentTrackIndex].src;
            playerImage.src = tracks[currentTrackIndex].img;
            trackTitle.textContent = tracks[currentTrackIndex].title;
            updatePlaylistHighlight();
        }
    }

    function updatePlaylistHighlight() {
        const playlistItems = playlist.getElementsByTagName('li');
        for (let i = 0; i < playlistItems.length; i++) {
            playlistItems[i].classList.remove('active');
            if (i === currentTrackIndex) {
                playlistItems[i].classList.add('active');
            }
        }
    }

    function playPause() {
        if (audioPlayer.paused) {
            audioPlayer.play().catch(error => {
                console.error('Error playing audio:', error);
                trackTitle.textContent = 'Error playing audio';
            });
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            isPlaying = true;
        } else {
            audioPlayer.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            isPlaying = false;
        }
    }

    function playNext() {
        loadTrack((currentTrackIndex + 1) % tracks.length);
        if (isPlaying) audioPlayer.play();
    }

    function playPrevious() {
        loadTrack((currentTrackIndex - 1 + tracks.length) % tracks.length);
        if (isPlaying) audioPlayer.play();
    }

    function createPlaylist() {
        tracks.forEach((track, index) => {
            const li = document.createElement('li');
            li.textContent = track.title;
            li.addEventListener('click', () => {
                loadTrack(index);
                if (isPlaying) audioPlayer.play();
            });
            playlist.appendChild(li);
        });
    }

    function togglePlaylist() {
        playlistContainer.classList.toggle('show');
        togglePlaylistBtn.textContent = playlistContainer.classList.contains('show') ? 'Hide Playlist' : 'Show Playlist';
    }

    playPauseBtn.addEventListener('click', playPause);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    togglePlaylistBtn.addEventListener('click', togglePlaylist);

    audioPlayer.addEventListener('ended', playNext);

    // Initialize the player
    createPlaylist();
    loadTrack(0);

    // Bubble animation (unchanged)
    function createBubble() {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.style.left = `${Math.random() * 100}vw`;
        bubble.style.top = `${Math.random() * 100}vh`;
        bubble.style.width = `${Math.random() * 50 + 20}px`;
        bubble.style.height = bubble.style.width;

        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        bubble.style.backgroundColor = `${randomColor}50`;

        document.body.appendChild(bubble);

        setTimeout(() => {
            bubble.remove();
        }, 4000);
    }

    setInterval(createBubble, 100);
});
