document.addEventListener('DOMContentLoaded', () => {
    const mainAudio = new Audio();
    let currentTrackIndex = 0;
    let isPlaying = false;

    const musicImg = document.getElementById('musicImg');
    const musicName = document.getElementById('musicName');
    const musicArtist = document.getElementById('musicArtist');
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

    const allMusic = [
        {
            name: "By Your Side",
            artist: "Jonas Blue",
            img: "by_your_side",
            src: "by_your_side"
        },
        // Add more tracks here
    ];

    const themes = {
        neon: {
            colors: ['#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#00ff00', '#ffff00'],
            opacity: '80',
            size: { min: 10, max: 50 }
        },
        darkPurple: {
            colors: ['#4B0082', '#8A2BE2', '#9400D3', '#9932CC', '#BA55D3'],
            opacity: '80',
            size: { min: 10, max: 50 }
        }
    };

    let currentTheme = themes.darkPurple;

    function isItemCached(key) {
        return localStorage.getItem(key) !== null;
    }

    function cacheItem(key, data) {
        try {
            localStorage.setItem(key, data);
        } catch (e) {
            console.error('Error caching item:', e);
            if (e.name === 'QuotaExceededError') {
                clearOldestCachedItem();
                localStorage.setItem(key, data);
            }
        }
    }

    function clearOldestCachedItem() {
        if (localStorage.length > 0) {
            const oldestKey = Object.keys(localStorage).reduce((a, b) => 
                localStorage.getItem(a) < localStorage.getItem(b) ? a : b
            );
            localStorage.removeItem(oldestKey);
        }
    }

    function loadMusic(indexNumb){
        console.log(`Loading music for index: ${indexNumb}`);
        musicName.innerText = allMusic[indexNumb - 1].name;
        musicArtist.innerText = allMusic[indexNumb - 1].artist;
        const imgSrc = `https://colddb.netlify.app/images/${allMusic[indexNumb - 1].src}.jpg`;
        const audioSrc = `https://colddb.netlify.app/audio/${allMusic[indexNumb - 1].src}.mp3`;
        
        console.log(`Setting music image source: ${imgSrc}`);
        musicImg.src = imgSrc;
        console.log(`Setting audio source: ${audioSrc}`);
        mainAudio.src = audioSrc;

        // Add error handling for image loading
        musicImg.onerror = () => {
            console.error(`Error loading image: ${imgSrc}`);
            musicImg.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
        };

        // Add error handling for audio loading
        mainAudio.onerror = () => {
            console.error(`Error loading audio: ${audioSrc}`);
            musicName.textContent = 'Error loading audio';
        };
    }

    function loadTrack(index) {
        console.log(`Loading track at index: ${index}`);
        if (index >= 0 && index < allMusic.length) {
            currentTrackIndex = index;
            console.log(`Current track index updated to: ${currentTrackIndex}`);
            loadMusic(index + 1);  // loadMusic uses 1-based index
            updatePlaylistHighlight();
            preloadNextTracks(index);

            const audioSrc = mainAudio.src;
            const imgSrc = musicImg.src;

            if (isItemCached(audioSrc)) {
                console.log(`Audio found in cache: ${audioSrc}`);
                mainAudio.src = localStorage.getItem(audioSrc);
            } else {
                console.log(`Fetching and caching audio: ${audioSrc}`);
                fetch(audioSrc)
                    .then(response => response.blob())
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onloadend = () => cacheItem(audioSrc, reader.result);
                        reader.readAsDataURL(blob);
                    });
            }

            if (isItemCached(imgSrc)) {
                console.log(`Image found in cache: ${imgSrc}`);
                musicImg.src = localStorage.getItem(imgSrc);
            } else {
                console.log(`Fetching and caching image: ${imgSrc}`);
                fetch(imgSrc)
                    .then(response => response.blob())
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onloadend = () => cacheItem(imgSrc, reader.result);
                        reader.readAsDataURL(blob);
                    });
            }
        } else {
            console.error(`Invalid track index: ${index}`);
        }
    }

    function preloadNextTracks(currentIndex) {
        const numTracksToPreload = 3;
        for (let i = 1; i <= numTracksToPreload; i++) {
            const nextIndex = (currentIndex + i) % allMusic.length;
            const nextTrack = allMusic[nextIndex];
            const audioSrc = `https://colddb.netlify.app/audio/${nextTrack.src}.mp3`;
            const imgSrc = `https://colddb.netlify.app/images/${nextTrack.img}.jpg`;

            if (!isItemCached(audioSrc)) {
                fetch(audioSrc)
                    .then(response => response.blob())
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onloadend = () => cacheItem(audioSrc, reader.result);
                        reader.readAsDataURL(blob);
                    });
            }

            if (!isItemCached(imgSrc)) {
                fetch(imgSrc)
                    .then(response => response.blob())
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onloadend = () => cacheItem(imgSrc, reader.result);
                        reader.readAsDataURL(blob);
                    });
            }
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
        console.log(`Play/Pause triggered. Current state: ${isPlaying ? 'Playing' : 'Paused'}`);
        if (mainAudio.paused) {
            console.log('Attempting to play audio');
            mainAudio.play()
                .then(() => {
                    console.log('Audio playback started successfully');
                    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    isPlaying = true;
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                    musicName.textContent = 'Error playing audio';
                });
        } else {
            console.log('Pausing audio');
            mainAudio.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            isPlaying = false;
        }
    }

    function playNext() {
        const nextIndex = (currentTrackIndex + 1) % allMusic.length;
        loadTrack(nextIndex);
        if (isPlaying) mainAudio.play();
    }

    function playPrevious() {
        const prevIndex = (currentTrackIndex - 1 + allMusic.length) % allMusic.length;
        loadTrack(prevIndex);
        if (isPlaying) mainAudio.play();
    }

    function createPlaylist() {
        allMusic.forEach((track, index) => {
            const li = document.createElement('li');
            li.textContent = `${track.name} - ${track.artist}`;
            li.addEventListener('click', () => {
                loadTrack(index);
                if (isPlaying) mainAudio.play();
            });
            playlist.appendChild(li);
        });
    }

    function togglePlaylist() {
        playlistContainer.classList.toggle('show');
        document.body.style.overflow = playlistContainer.classList.contains('show') ? 'hidden' : 'auto';
    }

    function updateProgressBar() {
        const progress = (mainAudio.currentTime / mainAudio.duration) * 100;
        progressBar.style.width = `${progress}%`;
        currentTimeDisplay.textContent = formatTime(mainAudio.currentTime);
        durationDisplay.textContent = formatTime(mainAudio.duration);
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

    playPauseBtn.addEventListener('click', playPause);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    togglePlaylistBtn.addEventListener('click', togglePlaylist);
    closePlaylistBtn.addEventListener('click', togglePlaylist);

    mainAudio.addEventListener('ended', playNext);
    mainAudio.addEventListener('timeupdate', updateProgressBar);
    mainAudio.addEventListener('loadedmetadata', () => {
        durationDisplay.textContent = formatTime(mainAudio.duration);
    });

    createPlaylist();
    loadTrack(0);

    setInterval(createBubble, 100);
});
