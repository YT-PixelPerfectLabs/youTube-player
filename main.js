window.addEventListener("DOMContentLoaded", () => {
  let player;
  let duration = 0;
  let lastVolume = 0;
  let seekBar, volumeSlider;

  // 1. Define YouTube API callback
  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player("player", {
      videoId: "2FrCsScQ1-g",
      playerVars: {
        controls: 0,
        modestbranding: 0,
        rel: 0,
        showinfo: 0,
        autoplay: 1,
        mute: 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  };

  // 2. Inject YouTube API script
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);

  function onPlayerReady() {
    // Fallback for browsers blocking volume methods
    try {
      player.setVolume(lastVolume);
    } catch (e) {
      console.warn("Volume API not allowed in this environment");
    }

    player.playVideo();

    duration = player.getDuration();
    document.getElementById("duration").textContent = formatTime(duration);

    seekBar = document.getElementById("seekBar");
    volumeSlider = document.getElementById("volumeSlider");

    volumeSlider.value = lastVolume;
    updateSliderFill(seekBar);
    updateSliderFill(volumeSlider);

    document
      .getElementById("playPauseBtn")
      .addEventListener("click", togglePlayPause);
    document
      .getElementById("overlayPlay")
      .addEventListener("click", togglePlayPause);
    document.getElementById("muteBtn").addEventListener("click", toggleMute);
    volumeSlider.addEventListener("input", handleVolume);
    seekBar.addEventListener("input", handleSeek);
    document
      .getElementById("playbackSpeed")
      .addEventListener("change", handleSpeedChange);
    document
      .getElementById("fullscreenBtn")
      .addEventListener("click", toggleFullscreen);

    document.addEventListener("keydown", (e) => {
      if (e.key === " ") togglePlayPause();
      if (e.key === "ArrowRight")
        player.seekTo(player.getCurrentTime() + 5, true);
      if (e.key === "ArrowLeft")
        player.seekTo(player.getCurrentTime() - 5, true);
      if (e.key === "m") toggleMute.call(document.getElementById("muteBtn"));
      if (e.key === "f") toggleFullscreen();
    });

    setInterval(updateProgress, 1000);
  }

  function togglePlayPause() {
    const state = player.getPlayerState();
    const overlay = document.getElementById("overlayPlay");
    const btn = document.getElementById("playPauseBtn");

    if (state === YT.PlayerState.PLAYING) {
      player.pauseVideo();
      overlay.style.opacity = "1";
      btn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
      player.playVideo();
      overlay.style.opacity = "0";
      btn.innerHTML = '<i class="fas fa-pause"></i>';
    }
  }

  function toggleMute() {
    const btn = this;

    try {
      if (player.isMuted()) {
        player.unMute();
        btn.innerHTML = '<i class="fas fa-volume-high"></i>';
        volumeSlider.value = lastVolume;
        player.setVolume(lastVolume);
      } else {
        lastVolume = volumeSlider.value;
        player.mute();
        btn.innerHTML = '<i class="fas fa-volume-xmark"></i>';
        volumeSlider.value = 0;
      }
    } catch (e) {
      console.warn("Mute/unmute failed due to autoplay policy");
    }

    updateSliderFill(volumeSlider);
  }

  function handleVolume(e) {
    const newVolume = parseInt(e.target.value);
    lastVolume = newVolume;

    try {
      if (newVolume === 0) {
        player.mute();
        document.getElementById("muteBtn").innerHTML =
          '<i class="fas fa-volume-xmark"></i>';
      } else {
        player.unMute();
        player.setVolume(newVolume);
        document.getElementById("muteBtn").innerHTML =
          '<i class="fas fa-volume-high"></i>';
      }
    } catch (e) {
      console.warn("Volume change blocked");
    }

    updateSliderFill(volumeSlider);
  }

  function handleSeek(e) {
    player.seekTo((e.target.value / 100) * duration, true);
    updateSliderFill(seekBar);
  }

  function handleSpeedChange(e) {
    player.setPlaybackRate(parseFloat(e.target.value));
  }

  function toggleFullscreen() {
    const elem = document.querySelector(".player-card");
    const btn = document.getElementById("fullscreenBtn");

    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => {
        btn.innerHTML = '<i class="fas fa-compress"></i>';
      });
    } else {
      document.exitFullscreen().then(() => {
        btn.innerHTML = '<i class="fas fa-expand"></i>';
      });
    }
  }

  function updateProgress() {
    const current = player.getCurrentTime();
    document.getElementById("currentTime").textContent = formatTime(current);
    seekBar.value = (current / duration) * 100;
    updateSliderFill(seekBar);
  }

  function updateSliderFill(slider) {
    const percentage =
      ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(to right, #ffffff ${
      percentage ? percentage : 0
    }%, rgba(255, 255, 255, 0.1) ${percentage ? percentage : 0}%)`;
  }

  function onPlayerStateChange(event) {
    const playPauseBtn = document.getElementById("playPauseBtn");
    const overlayPlay = document.getElementById("overlayPlay");

    if (event.data === YT.PlayerState.PLAYING) {
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      overlayPlay.style.opacity = "0";
    } else if (event.data === YT.PlayerState.PAUSED) {
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      overlayPlay.style.opacity = "1";
    }
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }
});
