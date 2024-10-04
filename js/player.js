// DOM Elements
const playerContainer = document.querySelector(".player-container");
const musicImg = document.querySelector("#musicImg");
const musicName = document.querySelector("#musicName");
const musicArtist = document.querySelector("#musicArtist");
const playPauseBtn = document.querySelector("#playPauseBtn");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const mainAudio = document.createElement("audio");
const progressBar = document.querySelector("#progressBar");
const currentTimeEl = document.querySelector("#currentTime");
const durationEl = document.querySelector("#duration");
const togglePlaylistBtn = document.querySelector("#togglePlaylist");
const playlistContainer = document.querySelector("#playlistContainer");
const playlistEl = document.querySelector("#playlist");
const playlistSearchInput = document.querySelector("#playlistSearch");

let musicIndex = 0;
let isPlaying = false;

function loadMusic(index) {
    if (index < 0 || index >= allMusic.length) {
        console.error("Invalid music index");
        return;
    }
    
    const music = allMusic[index];
    console.log(`Loading music: ${music.name} by ${music.artist}`);
    
    musicName.textContent = music.name;
    musicArtist.textContent = music.artist;
    
    const imgSrc = `https://colddb.netlify.app/images/${music.src}.jpg`;
    const audioSrc = `https://colddb.netlify.app/audio/${music.src}.mp3`;
    
    musicImg.src = imgSrc;
    mainAudio.src = audioSrc;
    
    musicImg.onerror = () => {
        console.error(`Error loading image: ${imgSrc}`);
        musicImg.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
    };
    
    mainAudio.onerror = (e) => {
        console.error(`Error loading audio: ${audioSrc}`, e);
        musicName.textContent = 'Error loading audio';
        playNext();
    };
    
    document.title = `${music.name} - ${music.artist}`;
}

function playMusic() {
    playerContainer.classList.add("playing");
    playPauseBtn.querySelector("i").className = "fas fa-pause";
    mainAudio.play();
    isPlaying = true;
}

function pauseMusic() {
    playerContainer.classList.remove("playing");
    playPauseBtn.querySelector("i").className = "fas fa-play";
    mainAudio.pause();
    isPlaying = false;
}

function prevMusic() {
    musicIndex = (musicIndex - 1 + allMusic.length) % allMusic.length;
    loadMusic(musicIndex);
    playMusic();
    updatePlaylist();
}

function nextMusic() {
    musicIndex = (musicIndex + 1) % allMusic.length;
    loadMusic(musicIndex);
    playMusic();
    updatePlaylist();
}

function updateProgress(e) {
    const { currentTime, duration } = e.target;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    
    currentTimeEl.textContent = formatTime(currentTime);
    durationEl.textContent = formatTime(duration);
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = mainAudio.duration;
    mainAudio.currentTime = (clickX / width) * duration;
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updatePlaylist() {
    playlistEl.innerHTML = '';
    allMusic.forEach((music, index) => {
        const li = document.createElement('li');
        li.textContent = `${music.name} - ${music.artist}`;
        li.classList.toggle('active', index === musicIndex);
        li.addEventListener('click', () => {
            musicIndex = index;
            loadMusic(musicIndex);
            playMusic();
            updatePlaylist();
        });
        playlistEl.appendChild(li);
    });
}

function togglePlaylist() {
    playlistContainer.classList.toggle('show');
}

function filterPlaylist() {
    const searchTerm = playlistSearchInput.value.toLowerCase();
    const playlistItems = playlistEl.querySelectorAll('li');
    playlistItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Event Listeners
playPauseBtn.addEventListener("click", () => isPlaying ? pauseMusic() : playMusic());
prevBtn.addEventListener("click", prevMusic);
nextBtn.addEventListener("click", nextMusic);
mainAudio.addEventListener("timeupdate", updateProgress);
mainAudio.addEventListener("ended", nextMusic);
progressBar.parentElement.addEventListener("click", setProgress);
togglePlaylistBtn.addEventListener("click", togglePlaylist);
playlistSearchInput.addEventListener("input", filterPlaylist);

// Restore close menu button functionality
document.querySelector("#closePlaylist").addEventListener("click", () => {
    playlistContainer.classList.remove('show');
});

// Initialize
window.addEventListener("load", () => {
    loadMusic(musicIndex);
    updatePlaylist();
});
