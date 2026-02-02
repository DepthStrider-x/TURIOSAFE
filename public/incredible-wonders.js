document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('iwVideo');
    const buttons = document.querySelectorAll('.iw-btn');
    const muteBtn = document.getElementById('iwMute');
    const pauseBtn = document.getElementById('iwPause');
  
    // Switch videos on category click
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
  
        const mp4 = btn.dataset.mp4;
        const webm = btn.dataset.webm;
  
        // Replace sources
        while (video.firstChild) video.removeChild(video.firstChild);
        if (webm) {
          const s1 = document.createElement('source');
          s1.src = webm;
          s1.type = 'video/webm';
          video.appendChild(s1);
        }
        if (mp4) {
          const s2 = document.createElement('source');
          s2.src = mp4;
          s2.type = 'video/mp4';
          video.appendChild(s2);
        }
        video.load();
        video.play().catch(() => {});
      });
    });
  
    // Mute / unmute
    muteBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      muteBtn.textContent = video.muted ? '🔇' : '🔊';
    });
  
    // Pause / play
    pauseBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        pauseBtn.textContent = '⏸️';
      } else {
        video.pause();
        pauseBtn.textContent = '▶️';
      }
    });
  });
  