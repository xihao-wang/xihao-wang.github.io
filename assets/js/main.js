document.getElementById('year')?.appendChild(document.createTextNode(new Date().getFullYear()));

const DEFAULT_RATE = 2;

// === Hero 视频轮播（show1 -> show2 -> … 循环） ===
document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("heroVideo");
  const image = document.getElementById("heroImage");
  if (!video || !image) return;

  // 播放列表：type= 'video' 或 'image'
  const playlist = [
    { type: 'video', src: 'assets/videos/cloud1.mp4', rate: 1.25, poster: 'assets/images/show1.jpg' },
    { type: 'video', src: 'assets/videos/cloud2.mp4', rate: 1.25, poster: 'assets/images/show2.jpg' },
    { type: 'image', src: 'assets/images/p2.png', duration: 3000 },
    { type: 'image', src: 'assets/images/p3.png', duration: 3000 },
    { type: 'image', src: 'assets/images/p0.png', duration: 3000 },
    { type: 'image', src: 'assets/images/p1.png', duration: 3000 },
    { type: 'video', src: 'assets/videos/show3.mp4', rate: 1.25 }
  ];

  let idx = 0;
  let imgTimer = null;

  function clearTimers() {
    if (imgTimer) { clearTimeout(imgTimer); imgTimer = null; }
  }

  function hideAll() {
    video.classList.remove('is-active');
    image.classList.remove('is-active');
    try { video.pause(); } catch {}
  }

  function playAt(i) {
    clearTimers();
    hideAll();

    const item = playlist[i % playlist.length];

    if (item.type === 'image') {
      // 显示图片一段时间
      image.src = item.src;
      image.classList.add('is-active');
      const stay = Math.max(1000, item.duration || 4000); // 默认 4 秒
      imgTimer = setTimeout(() => {
        idx = (idx + 1) % playlist.length;
        playAt(idx);
      }, stay);
    } else {
      // 播放视频
      if (item.poster) video.poster = item.poster; else video.removeAttribute('poster');
      video.src = item.src;
      video.load();
      video.playbackRate = item.rate || 1.0;
      video.classList.add('is-active');
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
  }

  // 视频结束后播下一个
  video.addEventListener('ended', () => {
    idx = (idx + 1) % playlist.length;
    playAt(idx);
  });

  // 标签页不可见时暂停视频 / 停止图片计时；可见时继续
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      try { video.pause(); } catch {}
      clearTimers();
    } else {
      // 重新开始当前项（简单稳妥）
      playAt(idx);
    }
  });

  // 仅当在视口内时播放（可选）
    const io = new IntersectionObserver(([e]) => {
    if (!e) return;
    if (e.isIntersecting) {
        // 回到视口：如果当前是视频就继续播；如果是图片就让它继续倒计时
        if (video.classList.contains('is-active')) {
        video.play().catch(()=>{});
        }
        // 图片的计时器我们不清理，由 playAt() 自己管理
    } else {
        // 离开视口：暂停视频，但不要清掉图片的计时器（避免卡住）
        try { video.pause(); } catch {}
    }
    }, { threshold: 0.25 });

    // ★ 改这里：观察外层容器（或 figure）
    const heroRight = document.querySelector('.hero-right');
    if (heroRight) io.observe(heroRight);

  // 启动
  video.muted = true;
  video.setAttribute('playsinline', '');
  playAt(idx);
});