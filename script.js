const playPauseBtn = document.querySelector(".play-pause-btn");
const fullScreenBtn = document.querySelector(".full-screen-btn");
const miniPlayerBtn = document.querySelector(".mini-player-btn");
const muteBtn = document.querySelector(".mute-btn");
const speedBtn = document.querySelector(".speed-btn");
const currentTimeElem = document.querySelector(".current-time");
const totalTimeElem = document.querySelector(".total-time");
const previewImg = document.querySelector(".preview-img");
const thumbnailImg = document.querySelector(".thumbnail-img");
const volumeSlider = document.querySelector(".volume-slider");
const videoContainer = document.querySelector(".video-container");
const timelineContainer = document.querySelector(".timeline-container");
const video = document.querySelector("video");
const inputFile = document.getElementById("formFileLg");
const options = document.getElementById("select");
const videoName = document.getElementById("videoName");
let videoList = [];

inputFile.addEventListener("change", function () {
  const file = inputFile.files[0];
  const videourl = URL.createObjectURL(file);
  video.setAttribute("src", videourl);
  UpdateVideo(file.name);

  videoList.push(file);
  let newoption = document.createElement("option");
  newoption.innerHTML = file.name;
  options.insertBefore(newoption, options[1]);
});

// If user select a video from the list then play it
options.addEventListener("change", function () {
  const fileno = videoList.length - options.selectedIndex;
  const file = videoList[fileno];
  const videourl = URL.createObjectURL(file);
  video.setAttribute("src", videourl);
  UpdateVideo(file.name);
});

function UpdateVideo(name) {
  videoName.innerHTML = name;
  video.autofocus = true;
}

// Run this function when the submit button is clicked

document.addEventListener("keydown", (e) => {
  const tagName = document.activeElement.tagName.toLowerCase();

  if (tagName === "input") return;

  switch (e.key.toLowerCase()) {
    case " ":
      if (tagName === "button") return;

    case "k":
      togglePlay();
      break;

    case "f":
      toggleFullScreenMode();
      break;

    case "i":
      toggleMiniPlayerMode();
      break;

    case "m":
      toggleMute();
      break;

    case "u":
    case "arrowup":
      increaseVolume();
      break;
      
    case "o":
    case "arrowdown":
      decreaseVolume();
      break;

    case "arrowleft":
      skip(-10);
      break;

    case "j":
      skip(-30);
      break;

    case "arrowright":
      skip(10);
      break;

    case "l":
      skip(30);
      break;

    case "s":
      decreasePlaybackSpeed();
      break;

    case "d":
      increasePlaybackSpeed();
      break;

    case "r":
      resetSpeed();
      break;
  }
});

// Timeline
timelineContainer.addEventListener("mousemove", handleTimelineUpdate);
timelineContainer.addEventListener("mousedown", toggleScrubbing);
document.addEventListener("mouseup", (e) => {
  if (isScrubbing) toggleScrubbing(e);
});
document.addEventListener("mousemove", (e) => {
  if (isScrubbing) handleTimelineUpdate(e);
});

let isScrubbing = false;
let wasPaused;
function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  isScrubbing = (e.buttons & 1) === 1;
  videoContainer.classList.toggle("scrubbing", isScrubbing);
  if (isScrubbing) {
    wasPaused = video.paused;
    video.pause();
  } else {
    video.currentTime = percent * video.duration;
    if (!wasPaused) video.play();
  }

  handleTimelineUpdate(e);
}

function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  timelineContainer.style.setProperty("--preview-position", percent);

  if (isScrubbing) {
    e.preventDefault();
    timelineContainer.style.setProperty("--progress-position", percent);
  }
}

// Playback Speed
speedBtn.addEventListener("click", changePlaybackSpeed);

function changePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate + 0.25;
  if (newPlaybackRate > 2) newPlaybackRate = 0.25;
  video.playbackRate = newPlaybackRate;
  speedBtn.textContent = `${newPlaybackRate}x`;
}

function increasePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate + 0.25;
  video.playbackRate = newPlaybackRate;
  speedBtn.textContent = `${newPlaybackRate}x`;
}

function decreasePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate - 0.25;
  if (newPlaybackRate < 0.25) newPlaybackRate = 1;
  video.playbackRate = newPlaybackRate;
  speedBtn.textContent = `${newPlaybackRate}x`;
}

function resetSpeed() {
  video.playbackRate = 1;
  speedBtn.textContent = "1x";
}

// Duration
video.addEventListener("loadeddata", () => {
  totalTimeElem.textContent = formatDuration(video.duration);
});

video.addEventListener("timeupdate", () => {
  currentTimeElem.textContent = formatDuration(video.currentTime);
  const percent = video.currentTime / video.duration;
  timelineContainer.style.setProperty("--progress-position", percent);
});

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
});
function formatDuration(time) {
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);
  if (hours === 0) {
    return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
  } else {
    return `${hours}:${leadingZeroFormatter.format(
      minutes
    )}:${leadingZeroFormatter.format(seconds)}`;
  }
}

function skip(duration) {
  video.currentTime += duration;
}

// Volume
muteBtn.addEventListener("click", toggleMute);
volumeSlider.addEventListener("input", (e) => {
  video.volume = e.target.value;
  video.muted = e.target.value === 0;
});

function toggleMute() {
  video.muted = !video.muted;
}

function increaseVolume() {
  let newVolume = video.volume + 0.1;
  if (newVolume > 1) newVolume = 1;
  video.volume = newVolume;
  volumeSlider.value = newVolume;

   volumeSlider.classList.add("show-volume-slider");
   setTimeout(function() {
    volumeSlider.classList.remove("show-volume-slider"); 
}, 500);
}

function decreaseVolume() {
  let newVolume = video.volume - 0.1;
  if (newVolume < 0) newVolume = 0;
  video.volume = newVolume;
  volumeSlider.value = newVolume;

  volumeSlider.classList.add("show-volume-slider");
   setTimeout(function() {
    volumeSlider.classList.remove("show-volume-slider"); 
}, 500);
}

video.addEventListener("volumechange", () => {
  volumeSlider.value = video.volume;
  let volumeLevel;
  if (video.muted || video.volume === 0) {
    volumeSlider.value = 0;
    volumeLevel = "muted";
  } else if (video.volume >= 0.5) {
    volumeLevel = "high";
  } else {
    volumeLevel = "low";
  }

  videoContainer.dataset.volumeLevel = volumeLevel;
});

// View Modes
fullScreenBtn.addEventListener("click", toggleFullScreenMode);
miniPlayerBtn.addEventListener("click", toggleMiniPlayerMode);

function toggleFullScreenMode() {
  if (document.fullscreenElement == null) {
    videoContainer.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function toggleMiniPlayerMode() {
  if (videoContainer.classList.contains("mini-player")) {
    document.exitPictureInPicture();
  } else {
    video.requestPictureInPicture();
  }
}

document.addEventListener("fullscreenchange", () => {
  videoContainer.classList.toggle("full-screen", document.fullscreenElement);
});

video.addEventListener("enterpictureinpicture", () => {
  videoContainer.classList.add("mini-player");
});

video.addEventListener("leavepictureinpicture", () => {
  videoContainer.classList.remove("mini-player");
});

// Play/Pause
playPauseBtn.addEventListener("click", togglePlay);
video.addEventListener("click", togglePlay);

function togglePlay() {
  video.paused ? video.play() : video.pause();
}

video.addEventListener("play", () => {
  videoContainer.classList.remove("paused");
  playPauseBtn.setAttribute("title", "Pause (k)");
});

video.addEventListener("pause", () => {
  videoContainer.classList.add("paused");
  playPauseBtn.setAttribute("title", "Play (k)");
});
