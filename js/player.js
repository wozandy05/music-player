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
    const closePlaylistBtn = document.getElementById('closePlaylist');
    const progressBar = document.getElementById('progressBar');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationDisplay = document.getElementById('duration');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeIcon = document.getElementById('volumeIcon');
    const themeSelect = document.getElementById('themeSelect');

    const tracks = [
        { title: 'Track 1', src: 'https://freesound.org/data/previews/612/612095_5674468-lq.mp3', img: 'https://via.placeholder.com/300' },
        { title: 'Track 2', src: 'https://freesound.org/data/previews/612/612095_5674468-lq.mp3', img: 'https://via.placeholder.com/300' },
        { title: 'Track 3', src: 'https://freesound.org/data/previews/612/612095_5674468-lq.mp3', img: 'https://via.placeholder.com/300' }
    ];

    const themes = {
        default: {
            colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
            opacity: '50',
            size: { min: 20, max: 70 }
        },
        neon: {
            colors: ['#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#00ff00', '#ffff00'],
            opacity: '80',
            size: { min: 10, max: 50 }
        },
        pastel: {
            colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'],
            opacity: '70',
            size: { min: 30, max: 80 }
        },
        monochrome: {
            colors: ['#FFFFFF', '#CCCCCC', '#999999', '#666666', '#333333'],
            opacity: '40',
            size: { min: 15, max: 60 }
        }
    };

    let currentTheme = themes.default;

    function loadTrack(index) {
        console.log(`Loading track at index: ${index}`);
        if (index >= 0 && index < tracks.length) {
            currentTrackIndex = index;
            audioPlayer.src = tracks[currentTrackIndex].src;
            playerImage.src = tracks[currentTrackIndex].img;
            trackTitle.textContent = tracks[currentTrackIndex].title;
            updatePlaylistHighlight();

            playerImage.onerror = () => {
                console.error('Error loading image for track:', tracks[currentTrackIndex].title);
                playerImage.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
            };

            audioPlayer.onerror = () => {
                console.error('Error loading audio for track:', tracks[currentTrackIndex].title);
                trackTitle.textContent = 'Error loading audio';
            };
        } else {
            console.error(`Invalid track index: ${index}`);
        }
    }

    function updatePlaylistHighlight() {
        console.log(`Updating playlist highlight for track: ${currentTrackIndex}`);
        const playlistItems = playlist.getElementsByTagName('li');
        for (let i = 0; i < playlistItems.length; i++) {
            playlistItems[i].classList.remove('active');
            if (i === currentTrackIndex) {
                playlistItems[i].classList.add('active');
            }
        }
    }

    function playPause() {
        console.log('Play/Pause button clicked');
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
        console.log('Next button clicked');
        loadTrack((currentTrackIndex + 1) % tracks.length);
        if (isPlaying) audioPlayer.play();
    }

    function playPrevious() {
        console.log('Previous button clicked');
        loadTrack((currentTrackIndex - 1 + tracks.length) % tracks.length);
        if (isPlaying) audioPlayer.play();
    }

    function createPlaylist() {
        console.log('Creating playlist');
        tracks.forEach((track, index) => {
            console.log(`Adding track to playlist: ${track.title}`);
            const li = document.createElement('li');
            li.textContent = track.title;
            li.addEventListener('click', () => {
                console.log(`Playlist item clicked: ${track.title}`);
                loadTrack(index);
                if (isPlaying) audioPlayer.play();
            });
            playlist.appendChild(li);
        });
    }

    function togglePlaylist() {
        console.log('Toggle playlist button clicked');
        playlistContainer.classList.toggle('show');
        document.body.style.overflow = playlistContainer.classList.contains('show') ? 'hidden' : 'auto';
    }

    function updateProgressBar() {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${progress}%`;
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function setVolume() {
        audioPlayer.volume = volumeSlider.value / 100;
        updateVolumeIcon();
    }

    function updateVolumeIcon() {
        if (audioPlayer.volume === 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (audioPlayer.volume < 0.5) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    }

    function toggleMute() {
        if (audioPlayer.volume === 0) {
            audioPlayer.volume = volumeSlider.value / 100;
        } else {
            audioPlayer.volume = 0;
        }
        updateVolumeIcon();
    }

    function createBubble() {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.style.left = `${Math.random() * 100}vw`;
        bubble.style.top = `${Math.random() * 100}vh`;
        
        const size = Math.random() * (currentTheme.size.max - currentTheme.size.min) + currentTheme.size.min;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;

        const randomColor = currentTheme.colors[Math.floor(Math.random() * currentTheme.colors.length)];
        bubble.style.backgroundColor = `${randomColor}${currentTheme.opacity}`;

        document.body.appendChild(bubble);

        setTimeout(() => {
            bubble.remove();
        }, 4000);
    }

    function changeTheme() {
        const selectedTheme = themeSelect.value;
        currentTheme = themes[selectedTheme];
        console.log(`Theme changed to: ${selectedTheme}`);
    }

    playPauseBtn.addEventListener('click', playPause);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    togglePlaylistBtn.addEventListener('click', togglePlaylist);
    closePlaylistBtn.addEventListener('click', togglePlaylist);
    volumeSlider.addEventListener('input', setVolume);
    volumeIcon.addEventListener('click', toggleMute);
    themeSelect.addEventListener('change', changeTheme);

    audioPlayer.addEventListener('ended', playNext);
    audioPlayer.addEventListener('timeupdate', updateProgressBar);
    audioPlayer.addEventListener('loadedmetadata', () => {
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    });

    // Initialize the player
    createPlaylist();
    loadTrack(0);
    setVolume();

    // Start bubble animation
    setInterval(createBubble, 100);
});
