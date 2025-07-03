console.log("Lets write");

let currentAudio = null;
let isPlaying = false;
let showTimeLeft = false;
let currentSongIndex = 0;
let songs = [];

async function getSongs() {
    let a = await fetch("http://127.0.0.1:3000/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songsArray = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            let ele = element.href.split("/songs/")[1];
            let art = ele.split("-")[1];
            ele = ele.split("-")[0];
            art = decodeURIComponent(art);
            art = art.replace(".mp3", "");
            ele = decodeURIComponent(ele);
            ele = ele.replace(".mp3", "");
            songsArray.push({
                song: ele.trim(),
                artist: art?.trim() || "Unknown"
            });
        }
    }
    return songsArray;
}

function updatePlayPauseIcon() {
    const icon = document.getElementById('playPauseIcon');
    if (isPlaying) {
        
        icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="#121212" />';
    } else {
       
        icon.innerHTML = '<path d="M8 5v14l11-7z" fill="#121212" />';
    }
}

function togglePlayPause() {
    if (!currentAudio) return;
    
    if (isPlaying) {
        currentAudio.pause();
        isPlaying = false;
    } else {
        currentAudio.play();
        isPlaying = true;
    }
    updatePlayPauseIcon();
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateSeekbar() {
    if (!currentAudio) return;
    
    const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
    const progressBar = document.getElementById('seekbarProgress');
    const thumb = document.getElementById('seekbarThumb');
    
    progressBar.style.width = progress + '%';
    thumb.style.left = progress + '%';
    
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    
    if (showTimeLeft) {
        const timeLeft = currentAudio.duration - currentAudio.currentTime;
        currentTimeEl.textContent = '-' + formatTime(timeLeft);
    } else {
        currentTimeEl.textContent = formatTime(currentAudio.currentTime);
    }
    
    totalTimeEl.textContent = formatTime(currentAudio.duration);
}

function seek(event) {
    if (!currentAudio) return;
    
    const seekbar = event.currentTarget;
    const rect = seekbar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const seekbarWidth = rect.width;
    const seekPercentage = clickX / seekbarWidth;
    
    currentAudio.currentTime = seekPercentage * currentAudio.duration;
}

function toggleTimeDisplay() {
    showTimeLeft = !showTimeLeft;
    updateSeekbar();
}
function playNext() {
    if (songs.length === 0) return;
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
}

function playPrevious() {
    if (songs.length === 0) return;
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
}

function playSong(index) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.removeEventListener('timeupdate', updateSeekbar);
        currentAudio.removeEventListener('ended', () => {
            isPlaying = false;
            updatePlayPauseIcon();
        });
    }
    
    currentSongIndex = index;
    const song = songs[index];
    currentAudio = new Audio(`http://127.0.0.1:3000/songs/${encodeURIComponent(song.song)}-${encodeURIComponent(song.artist)}.mp3`);
    
    currentAudio.addEventListener('loadedmetadata', () => {
        updateSeekbar();
    });
    
    currentAudio.addEventListener('timeupdate', updateSeekbar);
    
    currentAudio.addEventListener('ended', () => {
        currentAudio.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayPauseIcon();
    playNext(); // Automatically play next song
});
    });
    
    currentAudio.play();
    isPlaying = true;
    updatePlayPauseIcon();
    
document.querySelector(".song-title").innerText = `Song: ${song.song}`;
document.querySelector(".song-artist").innerText = `Artist: ${song.artist}`;
const marqueeContent = document.getElementById("marqueeContent");
const fullText = `${song.song} - ${song.artist}`;
marqueeContent.innerHTML = `<span class="song-title">${song.song}</span><span class="song-artist"> - ${song.artist}</span>`;
// Reset animation
marqueeContent.style.animation = 'none';
marqueeContent.offsetHeight; // Trigger reflow
marqueeContent.style.animation = null;
    
    console.log(`Now playing: ${song.song} by ${song.artist}`);
}

async function main() {
    songs = await getSongs();
    console.log(songs);
    let songsUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songsUL.innerHTML = "";

    songs.forEach((song, index) => {
        songsUL.innerHTML += `
            <li data-index="${index}">
                <div class="x">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <circle cx="6.5" cy="18.5" r="3.5" stroke="white" stroke-width="1.5" />
                        <circle cx="18" cy="16" r="3" stroke="white" stroke-width="1.5" />
                        <path d="M10 18.5L10 7C10 6.07655 10 5.61483 10.2635 5.32794C10.5269 5.04106 11.0175 4.9992 11.9986 4.91549C16.022 4.57222 18.909 3.26005 20.3553 2.40978C20.6508 2.236 20.7986 2.14912 20.8993 2.20672C21 2.26432 21 2.4315 21 2.76587V16"
                            stroke="white" stroke-width="1.5" stroke-linecap="round"
                            stroke-linejoin="round" />
                        <path d="M10 10C15.8667 10 19.7778 7.66667 21 7"
                            stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <div class="songname">${song.song} <p>Artist: ${song.artist}</p></div>
                </div>
            </li>`;
    });

    const liElements = Array.from(document.querySelector(".songList ul").getElementsByTagName("li"));
    liElements.forEach(li => {
        li.addEventListener("click", () => {
            const index = parseInt(li.getAttribute("data-index"));
            playSong(index);
        });
    });

   
if (songs.length > 0) {
    currentSongIndex = 0;
    const song = songs[0];
    currentAudio = new Audio(`http://127.0.0.1:3000/songs/${encodeURIComponent(song.song)}-${encodeURIComponent(song.artist)}.mp3`);
    
    currentAudio.addEventListener('loadedmetadata', () => {
        updateSeekbar();
    });
    
    currentAudio.addEventListener('timeupdate', updateSeekbar);
    
    currentAudio.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayPauseIcon();
    });
    
    
    document.querySelector(".song-title").innerText = `Song: ${song.song}`;
    document.querySelector(".song-artist").innerText = `Artist: ${song.artist}`;
    document.getElementById("marqueeSongTitle").innerText = song.song;
    document.getElementById("marqueeArtist").innerText = song.artist;
    
    
    isPlaying = false;
    updatePlayPauseIcon();
}
// Add event listeners for next/previous buttons
document.addEventListener('click', (e) => {
    // Next button (right arrow in playbar)
    if (e.target.closest('svg path[d="M16 5v14h-2V5h2zm-3.5 7L6 6v12l6.5-6z"]')) {
        playNext();
    }
    // Previous button (left arrow in playbar)  
    if (e.target.closest('svg path[d="M6 19V5h2v14H6zm3.5-7L18 18V6l-8.5 6z"]')) {
        playPrevious();
    }
});
}

main();