/**
 * SPORTIX v2 FINAL - Master Application Script
 * Features: Dynamic Firebase/Admin Ready Data, Interactive Canvas, Dynamic Search, FB Unlock Popup, Custom Video Player
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DYNAMIC DATA STRUCTURE (EMPTY FOR FIREBASE / ADMIN PANEL FEED) ---
    let MATCHES_DATA = [];
    let LEAGUES_DATA = [];
    let HIGHLIGHTS_DATA = [];
    let SCHEDULE_DATA = [];

    let pendingMatchToWatch = null;
    let fbUnlocked = false;

    // Window object-e expose kora holo jeno Firebase/Admin script theke easily data update & render kora jay
    window.SPORTIX_DATA = {
        matches: MATCHES_DATA,
        leagues: LEAGUES_DATA,
        highlights: HIGHLIGHTS_DATA,
        schedule: SCHEDULE_DATA,
        renderAll: () => {
            renderLiveMatches();
            renderLeagues();
            renderHighlights();
            renderSchedule();
        }
    };

    // --- 2. CANVAS STADIUM PARTICLES BG ---
    const canvas = document.getElementById('stadium-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedY = Math.random() * 0.5 + 0.1;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.y -= this.speedY;
                if (this.y < 0) this.reset();
            }
            draw() {
                ctx.fillStyle = `rgba(0, 240, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < 60; i++) particles.push(new Particle());

        function animateCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateCanvas);
        }
        animateCanvas();
    }

    // --- 3. LOADER FADE OUT ---
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loader = document.getElementById('loader');
            if (loader) loader.classList.add('fade-out');
        }, 600);
    });

    // --- 4. RENDER TICKER BAR ---
    const tickerTrack = document.getElementById('tickerTrack');
    if (tickerTrack) {
        const tickerItems = [
            'Welcome to <strong>SPORTIX</strong> Live Sports',
            'Stay tuned for upcoming live streams',
            'Follow our official Facebook page for live updates'
        ];
        tickerTrack.innerHTML = tickerItems.concat(tickerItems).map(item => `<div class="ticker-item">${item}</div>`).join('');
    }

    // --- 5. RENDER DYNAMIC SECTIONS ---
    function renderLiveMatches(filter = 'all') {
        const grid = document.getElementById('liveMatchesGrid');
        if (!grid) return;

        const filtered = filter === 'all' ? MATCHES_DATA : MATCHES_DATA.filter(m => m.category === filter);
        
        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8; background: rgba(15,23,42,0.6); border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px;">
                    <p style="font-size: 1rem; font-weight: 600;">No live matches available right now.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(match => `
            <div class="match-card" data-match-id="${match.id}">
                <div class="card-thumb-wrap">
                    <img src="${match.thumb}" class="card-thumb-img" alt="${match.homeTeam} vs ${match.awayTeam}" onerror="this.src='images/match1.jpg'">
                    <div class="card-league-badge">
                        <img src="${match.leagueIcon}" alt="League" onerror="this.style.display='none'">
                        <span>${match.league}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-teams-row">
                        <div class="card-team">
                            <img src="${match.homeLogo}" class="card-team-logo" alt="${match.homeTeam}" onerror="this.src='https://via.placeholder.com/40'">
                            <span class="card-team-name">${match.homeTeam}</span>
                        </div>
                        <span class="card-vs">VS</span>
                        <div class="card-team">
                            <img src="${match.awayLogo}" class="card-team-logo" alt="${match.awayTeam}" onerror="this.src='https://via.placeholder.com/40'">
                            <span class="card-team-name">${match.awayTeam}</span>
                        </div>
                    </div>
                    <div class="card-meta-bar">
                        <span class="card-time">${match.time}</span>
                        <span class="card-status-badge">${match.status}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Attach Click Listeners
        document.querySelectorAll('.match-card').forEach(card => {
            card.addEventListener('click', () => {
                const matchId = card.getAttribute('data-match-id');
                triggerMatchClick(matchId);
            });
        });
    }

    function renderLeagues() {
        const grid = document.getElementById('leaguesGrid');
        if (!grid) return;

        if (LEAGUES_DATA.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 20px;">No leagues added yet.</div>`;
            return;
        }

        grid.innerHTML = LEAGUES_DATA.map(l => `
            <div class="league-card">
                <img src="${l.icon}" class="league-icon" alt="${l.name}" onerror="this.style.display='none'">
                <span class="league-card-title">${l.name}</span>
            </div>
        `).join('');
    }

    function renderHighlights() {
        const grid = document.getElementById('highlightsGrid');
        if (!grid) return;

        if (HIGHLIGHTS_DATA.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 20px;">No highlights available.</div>`;
            return;
        }

        grid.innerHTML = HIGHLIGHTS_DATA.map(h => `
            <div class="highlight-card">
                <div class="highlight-thumb">
                    <img src="${h.thumb}" alt="${h.title}" onerror="this.src='images/match1.jpg'">
                    <span class="highlight-duration">${h.duration}</span>
                </div>
                <div class="highlight-title">${h.title}</div>
            </div>
        `).join('');
    }

    function renderSchedule() {
        const list = document.getElementById('scheduleList');
        if (!list) return;

        if (SCHEDULE_DATA.length === 0) {
            list.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 20px;">No upcoming schedules.</div>`;
            return;
        }

        list.innerHTML = SCHEDULE_DATA.map(s => `
            <div class="schedule-row">
                <div class="schedule-league-info">
                    <img src="${s.leagueIcon}" class="schedule-league-icon" alt="${s.league}" onerror="this.style.display='none'">
                    <span class="schedule-league-name">${s.league}</span>
                </div>
                <div class="schedule-teams">
                    <span class="schedule-team-name">${s.home}</span>
                    <span class="schedule-vs">VS</span>
                    <span class="schedule-team-name">${s.away}</span>
                </div>
                <div class="schedule-time-btn">
                    <button class="btn btn-glass" style="padding: 6px 16px; font-size: 0.8rem;">${s.time}</button>
                </div>
            </div>
        `).join('');
    }

    renderLiveMatches();
    renderLeagues();
    renderHighlights();
    renderSchedule();

    // --- 6. FILTER BUTTONS ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderLiveMatches(btn.getAttribute('data-filter'));
        });
    });

    // --- 7. FEATURED MATCH CLICK ---
    const featuredCard = document.getElementById('featuredMatchCard');
    if (featuredCard) {
        featuredCard.addEventListener('click', () => {
            if (MATCHES_DATA.length > 0) {
                triggerMatchClick(MATCHES_DATA[0].id);
            }
        });
    }

    // --- 8. MATCH CLICK FLOW (FACEBOOK GATEWAY) ---
    const facebookModal = document.getElementById('facebookModal');
    const closeFbModal = document.getElementById('closeFbModal');
    const followFbBtn = document.getElementById('followFbBtn');
    const continueWatchBtn = document.getElementById('continueWatchBtn');

    function triggerMatchClick(matchId) {
        pendingMatchToWatch = MATCHES_DATA.find(m => m.id === matchId) || (MATCHES_DATA.length > 0 ? MATCHES_DATA[0] : null);

        if (!pendingMatchToWatch) return;

        if (fbUnlocked) {
            openVideoPlayer(pendingMatchToWatch);
        } else {
            if (facebookModal) facebookModal.classList.add('active');
        }
    }

    if (followFbBtn) {
        followFbBtn.addEventListener('click', () => {
            setTimeout(() => {
                if (continueWatchBtn) continueWatchBtn.classList.add('show');
            }, 1000);
        });
    }

    if (continueWatchBtn) {
        continueWatchBtn.addEventListener('click', () => {
            fbUnlocked = true;
            if (facebookModal) facebookModal.classList.remove('active');
            if (pendingMatchToWatch) {
                openVideoPlayer(pendingMatchToWatch);
            }
        });
    }

    if (closeFbModal) {
        closeFbModal.addEventListener('click', () => {
            if (facebookModal) facebookModal.classList.remove('active');
        });
    }

    // --- 9. VIDEO PLAYER CONTROLS ---
    const videoModal = document.getElementById('videoPlayerModal');
    const closeVideoModal = document.getElementById('closeVideoModal');
    const video = document.getElementById('sportixVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const iconPlay = playPauseBtn ? playPauseBtn.querySelector('.icon-play') : null;
    const iconPause = playPauseBtn ? playPauseBtn.querySelector('.icon-pause') : null;
    const progressBarFilled = document.getElementById('progressBarFilled');
    const progressBarContainer = document.getElementById('progressBarContainer');
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const timeDisplay = document.getElementById('timeDisplay');
    const pipBtn = document.getElementById('pipBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    function openVideoPlayer(match) {
        if (!match || !video) return;
        const titleElem = document.getElementById('videoTitleText');
        if (titleElem) titleElem.textContent = `${match.homeTeam} vs ${match.awayTeam}`;
        
        video.src = match.streamUrl;
        if (videoModal) videoModal.classList.add('active');
        video.play().catch(e => console.log("Autoplay prevented:", e));
        updatePlayIcons(true);
    }

    function closeVideoPlayer() {
        if (video) video.pause();
        if (videoModal) videoModal.classList.remove('active');
    }

    if (closeVideoModal) closeVideoModal.addEventListener('click', closeVideoPlayer);

    function togglePlay() {
        if (!video) return;
        if (video.paused) {
            video.play();
            updatePlayIcons(true);
        } else {
            video.pause();
            updatePlayIcons(false);
        }
    }

    function updatePlayIcons(isPlaying) {
        if (!iconPlay || !iconPause) return;
        if (isPlaying) {
            iconPlay.classList.add('hidden');
            iconPause.classList.remove('hidden');
        } else {
            iconPlay.classList.remove('hidden');
            iconPause.classList.add('hidden');
        }
    }

    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
    if (video) {
        video.addEventListener('click', togglePlay);

        video.addEventListener('timeupdate', () => {
            if (!video.duration) return;
            const percent = (video.currentTime / video.duration) * 100;
            if (progressBarFilled) progressBarFilled.style.width = `${percent}%`;

            if (timeDisplay) {
                const curMin = Math.floor(video.currentTime / 60);
                const curSec = Math.floor(video.currentTime % 60);
                const durMin = Math.floor(video.duration / 60) || 0;
                const durSec = Math.floor(video.duration % 60) || 0;

                timeDisplay.textContent = `${curMin.toString().padStart(2, '0')}:${curSec.toString().padStart(2, '0')} / ${durMin.toString().padStart(2, '0')}:${durSec.toString().padStart(2, '0')}`;
            }
        });
    }

    if (progressBarContainer) {
        progressBarContainer.addEventListener('click', (e) => {
            if (!video || !video.duration) return;
            const rect = progressBarContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            video.currentTime = pos * video.duration;
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            if (!video) return;
            video.volume = e.target.value;
            video.muted = e.target.value === '0';
        });
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            if (!video) return;
            video.muted = !video.muted;
            if (volumeSlider) volumeSlider.value = video.muted ? 0 : video.volume;
        });
    }

    if (pipBtn) {
        pipBtn.addEventListener('click', async () => {
            if (!video) return;
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (document.pictureInPictureEnabled) {
                await video.requestPictureInPicture();
            }
        });
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            const wrapper = document.getElementById('videoPlayerWrapper');
            if (!wrapper) return;
            if (!document.fullscreenElement) {
                wrapper.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });
    }

    // --- 10. SEARCH BAR INTERACTION ---
    const searchBtn = document.getElementById('searchBtn');
    const searchDropdown = document.getElementById('searchDropdown');
    const matchSearchInput = document.getElementById('matchSearchInput');
    const searchResults = document.getElementById('searchResults');

    if (searchBtn && searchDropdown) {
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchDropdown.classList.toggle('active');
            if (searchDropdown.classList.contains('active') && matchSearchInput) {
                matchSearchInput.focus();
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchDropdown.contains(e.target) && e.target !== searchBtn) {
                searchDropdown.classList.remove('active');
            }
        });
    }

    if (matchSearchInput && searchResults) {
        matchSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (!query) {
                searchResults.innerHTML = '';
                return;
            }

            const filtered = MATCHES_DATA.filter(m => 
                (m.homeTeam && m.homeTeam.toLowerCase().includes(query)) || 
                (m.awayTeam && m.awayTeam.toLowerCase().includes(query)) ||
                (m.league && m.league.toLowerCase().includes(query))
            );

            searchResults.innerHTML = filtered.length ? filtered.map(m => `
                <div class="search-result-item" data-id="${m.id}">
                    <span>${m.homeTeam} vs ${m.awayTeam}</span>
                    <span class="highlight">${m.league}</span>
                </div>
            `).join('') : '<div style="padding:8px; font-size:0.8rem; color:#94a3b8;">No matches found.</div>';

            document.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.getAttribute('data-id');
                    if (searchDropdown) searchDropdown.classList.remove('active');
                    triggerMatchClick(id);
                });
            });
        });
    }

    // --- 11. MOBILE MENU TOGGLE ---
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // --- 12. DYNAMIC YEAR ---
    const yearElem = document.getElementById('currentYear');
    if (yearElem) yearElem.textContent = new Date().getFullYear();
});
