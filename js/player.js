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
    const playlistSearch = document.getElementById('playlistSearch');

    let db;
    const dbName = 'MusicPlayerCache';
    const dbVersion = 1;
    const objectStoreName = 'tracks';

    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        console.log('IndexedDB opened successfully');
    };

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        const objectStore = db.createObjectStore(objectStoreName, { keyPath: 'src' });
        console.log('Object store created');
    };

    function cacheItem(key, data) {
        return new Promise((resolve, reject) => {
            if (!db) {
                console.warn('IndexedDB not initialized. Skipping caching.');
                resolve();
                return;
            }
            const transaction = db.transaction([objectStoreName], 'readwrite');
            const objectStore = transaction.objectStore(objectStoreName);
            const request = objectStore.put({ src: key, data: data });

            request.onerror = (event) => {
                console.error('Error caching item:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = () => {
                console.log('Item cached successfully');
                resolve();
            };
        });
    }

    function getCachedItem(key) {
        return new Promise((resolve, reject) => {
            if (!db) {
                console.warn('IndexedDB not initialized. Skipping cache retrieval.');
                resolve(null);
                return;
            }
            const transaction = db.transaction([objectStoreName], 'readonly');
            const objectStore = transaction.objectStore(objectStoreName);
            const request = objectStore.get(key);

            request.onerror = (event) => {
                console.error('Error getting cached item:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                if (event.target.result) {
                    resolve(event.target.result.data);
                } else {
                    resolve(null);
                }
            };
        });
    }

    async function loadMusic(indexNumb) {
        console.log(`Loading music for index: ${indexNumb}`);
        musicName.innerText = allMusic[indexNumb - 1].name;
        musicArtist.innerText = allMusic[indexNumb - 1].artist;
        const imgSrc = `https://colddb.netlify.app/images/${allMusic[indexNumb - 1].src}.jpg`;
        const audioSrc = `https://colddb.netlify.app/audio/${allMusic[indexNumb - 1].src}.mp3`;
        
        console.log(`Setting music image source: ${imgSrc}`);
        musicImg.src = imgSrc;
        console.log(`Setting audio source: ${audioSrc}`);
        mainAudio.src = audioSrc;

        musicImg.onerror = () => {
            console.error(`Error loading image: ${imgSrc}`);
            musicImg.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
        };

        mainAudio.onerror = () => {
            console.error(`Error loading audio: ${audioSrc}`);
            musicName.textContent = 'Error loading audio';
        };

        try {
            await preloadTrack(audioSrc, imgSrc);
        } catch (error) {
            console.error('Error preloading track:', error);
        }
    }

    async function loadTrack(index) {
        console.log(`Loading track at index: ${index}`);
        if (index >= 0 && index < allMusic.length) {
            currentTrackIndex = index;
            console.log(`Current track index updated to: ${currentTrackIndex}`);
            try {
                await loadMusic(index + 1);
                updatePlaylistHighlight();
                preloadNextTracks(index);
            } catch (error) {
                console.error(`Error in loadTrack for index ${index}:`, error);
                musicName.textContent = 'Error loading track';
            }
        } else {
            console.error(`Invalid track index: ${index}`);
        }
    }

    async function preloadTrack(audioSrc, imgSrc) {
        try {
            const cachedAudio = await getCachedItem(audioSrc);
            if (cachedAudio) {
                console.log(`Audio found in cache: ${audioSrc}`);
                mainAudio.src = cachedAudio;
            } else {
                console.log(`Fetching and caching audio: ${audioSrc}`);
                const audioBlob = await fetchAndCache(audioSrc);
                mainAudio.src = URL.createObjectURL(audioBlob);
            }

            const cachedImage = await getCachedItem(imgSrc);
            if (cachedImage) {
                console.log(`Image found in cache: ${imgSrc}`);
                musicImg.src = cachedImage;
            } else {
                console.log(`Fetching and caching image: ${imgSrc}`);
                await fetchAndCache(imgSrc);
            }
        } catch (error) {
            console.error('Error preloading track:', error);
            throw error;
        }
    }

    async function fetchAndCache(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    await cacheItem(url, reader.result);
                } catch (error) {
                    console.error('Error caching item:', error);
                }
            };
            reader.readAsDataURL(blob);
            return blob;
        } catch (error) {
            console.error('Error fetching and caching:', error);
            throw error;
        }
    }

    async function preloadNextTracks(currentIndex) {
        const numTracksToPreload = 3;
        for (let i = 1; i <= numTracksToPreload; i++) {
            const nextIndex = (currentIndex + i) % allMusic.length;
            const nextTrack = allMusic[nextIndex];
            const audioSrc = `https://colddb.netlify.app/audio/${nextTrack.src}.mp3`;
            const imgSrc = `https://colddb.netlify.app/images/${nextTrack.img}.jpg`;

            try {
                await preloadTrack(audioSrc, imgSrc);
            } catch (error) {
                console.error(`Error preloading track ${nextIndex}:`, error);
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
                console.log(`Clicked on track: ${track.name}`);
                try {
                    loadTrack(index);
                    mainAudio.play()
                        .then(() => {
                            console.log(`Successfully started playing: ${track.name}`);
                            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                            isPlaying = true;
                        })
                        .catch(error => {
                            console.error(`Error playing audio for ${track.name}:`, error);
                            musicName.textContent = `Error playing: ${track.name}`;
                        });
                } catch (error) {
                    console.error(`Error loading track ${track.name}:`, error);
                    musicName.textContent = `Error loading: ${track.name}`;
                }
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
        
        const size = Math.random() * (50 - 10) + 10;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;

        document.body.appendChild(bubble);

        setTimeout(() => {
            bubble.remove();
        }, 4000);
    }

    function searchPlaylist() {
        const searchTerm = playlistSearch.value.toLowerCase();
        const playlistItems = playlist.getElementsByTagName('li');
        
        for (let item of playlistItems) {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        }
    }

    playPauseBtn.addEventListener('click', playPause);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    togglePlaylistBtn.addEventListener('click', togglePlaylist);
    closePlaylistBtn.addEventListener('click', togglePlaylist);
    playlistSearch.addEventListener('input', searchPlaylist);

    mainAudio.addEventListener('ended', playNext);
    mainAudio.addEventListener('timeupdate', updateProgressBar);
    mainAudio.addEventListener('loadedmetadata', () => {
        durationDisplay.textContent = formatTime(mainAudio.duration);
    });

    createPlaylist();
    loadTrack(0);

    setInterval(createBubble, 100);
});