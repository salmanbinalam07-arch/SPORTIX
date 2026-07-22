/**
 * SPORTIX v2 FINAL - Master Application Script
 * Features: Interactive Canvas, Live Data Mock, Dynamic Search, FB Unlock Popup, Custom Video Player
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DYNAMIC MATCH DATA (JSON MOCK) ---
    const MATCHES_DATA = [
        {
            id: 'm1',
            league: 'Premier League',
            leagueIcon: 'images/league1.png',
            homeTeam: 'Arsenal',
            awayTeam: 'Chelsea',
            homeLogo: 'images/team1.png',
            awayLogo: 'images/team2.png',
            time: '82\'',
            status: 'LIVE',
            category: 'football',
            thumb: 'images/match1.jpg',
            streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        },
        {
            id: 'm2',
            league: 'UEFA Champions League',
            leagueIcon: 'images/league2.png',
            homeTeam: 'Barcelona',
            awayTeam: 'Bayern Munich',
            homeLogo: 'images/team2.png',
            awayLogo: 'images/team1.png',
            time: '45+2\'',
            status: 'LIVE',
            category: 'football',
            thumb: 'images/match2.jpg',
            streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
        },
        {
            id: 'm3',
            league: 'NBA Finals',
            leagueIcon: 'images/league1.png',
            homeTeam: 'Lakers',
            awayTeam: 'Celtics',
            homeLogo: 'images/team1.png',
            awayLogo: 'images/team2.png',
            time: 'Q3 - 04:12',
            status: 'LIVE',
            category: 'basketball',
            thumb: 'images/match3.jpg',
            streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        },
        {
            id: 'm4',
            league: 'IPL Cricket',
            leagueIcon: 'images/league2.png',
            homeTeam: 'CSK',
            awayTeam: 'RCB',
            homeLogo: 'images/team2.png',
            awayLogo: 'images/team1.png',
            time: '14.2 Overs',
            status: 'LIVE',
            category: 'cricket',
            thumb: 'images/match1.jpg',
            streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
        }
    ];

    const LEAGUES_DATA = [
        { name: 'Premier League', icon: 'images/league1.png' },
        { name: 'Champions League', icon: 'images/league2.png' },
        { name: 'La Liga', icon: 'images/league1.png' },
        { name: 'Serie A', icon: 'images/league2.png' },
        { name: 'Bundesliga', icon: 'images/league1.png' },
        { name: 'Ligue 1', icon: 'images/league2.png' },
        { name: 'IPL Cricket', icon: 'images/league1.png' },
        { name: 'NBA', icon: 'images/league2.png' }
    ];

    const HIGHLIGHTS_DATA = [
        { title: 'Real Madrid vs Man City [4-3] All Goals & Highlights', duration: '10:45', thumb: 'images/match1.jpg' },
        { title: 'Lakers vs Celtics Game 7 Clutch Moments', duration: '08:20', thumb: 'images/match3.jpg' },
        { title: 'Barcelona 3-2 Bayern Munich Epic Comeback', duration: '12:15', thumb: 'images/match2.jpg' }
    ];

    const SCHEDULE_DATA = [
        { league: 'Premier League', leagueIcon: 'images/league1.png', home: 'Liverpool', away: 'Man City', time: '18:30 UTC' },
        { league: 'La Liga', leagueIcon: 'images/league2.png', home: 'Real Madrid', away: 'Atlético', time: '20:00 UTC' },
        { league: 'Serie A', leagueIcon: 'images/league1.png', home: 'Inter', away: 'AC Milan', time: '21:45 UTC' }
    ];

    let pendingMatchToWatch = null;
    let fbUnlocked = false;

    // --- 2. CANVAS STADIUM PARTICLES BG ---
    const canvas = document.getElementById('stadium-canvas');
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

    // --- 3. LOADER FADE OUT ---
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loader = document.getElementById('loader');
            loader.classList.add('fade-out');
        }, 600);
    });

    // --- 4. RENDER TICKER BAR ---
    const tickerTrack = document.getElementById('tickerTrack');
    const tickerItems = [
        '<strong>RMA 2 - 1 MCI</strong> (74\')',
        '<strong>ARS 1 - 0 CHE</strong> (82\')',
        '<strong>LAK 108 - 104 CEL</strong> (Q4)',
        '<strong>CSK 165/4 - RCB 120/6</strong> (15.2 Ov)'
    ];
    tickerTrack.innerHTML = tickerItems.concat(tickerItems).map(item => `<div class="ticker-item">${item}</div>`).join('');

    // --- 5. RENDER DYNAMIC SECTIONS ---
    function renderLiveMatches(filter = 'all') {
        const grid = document.getElementById('liveMatchesGrid');
        const filtered = filter === 'all' ? MATCHES_DATA : MATCHES_DATA.filter(m => m.category === filter);
        
        grid.innerHTML = filtered.map(match => `
            <div class="match-card" data-match-id="${match.id}">
                <div class="card-thumb-wrap">
                    <img src="${match.thumb}" class="card-thumb-img" alt="${match.homeTeam} vs ${match.awayTeam}">
                    <div class="card-league-badge">
                        <img src="${match.leagueIcon}" alt="League">
                        <span>${match.league}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-teams-row">
                        <div class="card-team">
                            <img src="${match.homeLogo}" class="card-team-logo" alt="${match.homeTeam}">
                            <span class="card-team-name">${match.homeTeam}</span>
                        </div>
                        <span class="card-vs">VS</span>
                        <div class="card-team">
                            <img src="${match.awayLogo}" class="card-team-logo" alt="${match.awayTeam}">
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
        grid.innerHTML = LEAGUES_DATA.map(l => `
            <div class="league-card">
                <img src="${l.icon}" class="league-icon" alt="${l.name}">
                <span class="league-card-title">${l.name}</span>
            </div>
        `).join('');
    }

    function renderHighlights() {
        const grid = document.getElementById('highlightsGrid');
        grid.innerHTML = HIGHLIGHTS_DATA.map(h => `
            <div class="highlight-card">
                <div class="highlight-thumb">
                    <img src="${h.thumb}" alt="${h.title}">
                    <span class="highlight-duration">${h.duration}</span>
                </div>
                <div class="highlight-title">${h.title}</div>
            </div>
        `).join('');
    }

    function renderSchedule() {
        const list = document.getElementById('scheduleList');
        list.innerHTML = SCHEDULE_DATA.map(s => `
            <div class="schedule-row">
                <div class="schedule-league-info">
                    <img src="${s.leagueIcon}" class="schedule-league-icon" alt="${s.league}">
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
    featuredCard.addEventListener('click', () => {
        triggerMatchClick('m1');
    });

    // --- 8. MATCH CLICK FLOW (FACEBOOK GATEWAY) ---
    const facebookModal = document.getElementById('facebookModal');
    const closeFbModal = document.getElementById('closeFbModal');
    const followFbBtn = document.getElementById('followFbBtn');
    const continueWatchBtn = document.getElementById('continueWatchBtn');

    function triggerMatchClick(matchId) {
        pendingMatchToWatch = MATCHES_DATA.find(m => m.id === matchId) || MATCHES_DATA[0];

        if (fbUnlocked) {
            openVideoPlayer(pendingMatchToWatch);
        } else {
            facebookModal.classList.add('active');
        }
    }

    followFbBtn.addEventListener('click', () => {
        // Show continue button after clicking FB link
        setTimeout(() => {
            continueWatchBtn.classList.add('show');
        }, 1000);
    });

    continueWatchBtn.addEventListener('click', () => {
        fbUnlocked = true;
        facebookModal.classList.remove('active');
        if (pendingMatchToWatch) {
            openVideoPlayer(pendingMatchToWatch);
        }
    });

    closeFbModal.addEventListener('click', () => {
        facebookModal.classList.remove('active');
    });

    // --- 9. VIDEO PLAYER CONTROLS ---
    const videoModal = document.getElementById('videoPlayerModal');
    const closeVideoModal = document.getElementById('closeVideoModal');
    const video = document.getElementById('sportixVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const iconPlay = playPauseBtn.querySelector('.icon-play');
    const iconPause = playPauseBtn.querySelector('.icon-pause');
    const progressBarFilled = document.getElementById('progressBarFilled');
    const progressBarContainer = document.getElementById('progressBarContainer');
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const timeDisplay = document.getElementById('timeDisplay');
    const pipBtn = document.getElementById('pipBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    function openVideoPlayer(match) {
        document.getElementById('videoTitleText').textContent = `${match.homeTeam} vs ${match.awayTeam}`;
        video.src = match.streamUrl;
        videoModal.classList.add('active');
        video.play();
        updatePlayIcons(true);
    }

    function closeVideoPlayer() {
        video.pause();
        videoModal.classList.remove('active');
    }

    closeVideoModal.addEventListener('click', closeVideoPlayer);

    function togglePlay() {
        if (video.paused) {
            video.play();
            updatePlayIcons(true);
        } else {
            video.pause();
            updatePlayIcons(false);
        }
    }

    function updatePlayIcons(isPlaying) {
        if (isPlaying) {
            iconPlay.classList.add('hidden');
            iconPause.classList.remove('hidden');
        } else {
            iconPlay.classList.remove('hidden');
            iconPause.classList.add('hidden');
        }
    }

    playPauseBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);

    video.addEventListener('timeupdate', () => {
        const percent = (video.currentTime / video.duration) * 100;
        progressBarFilled.style.width = `${percent}%`;

        // Time display
        const curMin = Math.floor(video.currentTime / 60);
        const curSec = Math.floor(video.currentTime % 60);
        const durMin = Math.floor(video.duration / 60) || 0;
        const durSec = Math.floor(video.duration % 60) || 0;

        timeDisplay.textContent = `${curMin.toString().padStart(2, '0')}:${curSec.toString().padStart(2, '0')} / ${durMin.toString().padStart(2, '0')}:${durSec.toString().padStart(2, '0')}`;
    });

    progressBarContainer.addEventListener('click', (e) => {
        const rect = progressBarContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
    });

    volumeSlider.addEventListener('input', (e) => {
        video.volume = e.target.value;
        video.muted = e.target.value === '0';
    });

    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        volumeSlider.value = video.muted ? 0 : video.volume;
    });

    pipBtn.addEventListener('click', async () => {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else if (document.pictureInPictureEnabled) {
            await video.requestPictureInPicture();
        }
    });

    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.getElementById('videoPlayerWrapper').requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    // --- 10. SEARCH BAR INTERACTION ---
    const searchBtn = document.getElementById('searchBtn');
    const searchDropdown = document.getElementById('searchDropdown');
    const matchSearchInput = document.getElementById('matchSearchInput');
    const searchResults = document.getElementById('searchResults');

    searchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        searchDropdown.classList.toggle('active');
        if (searchDropdown.classList.contains('active')) {
            matchSearchInput.focus();
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchDropdown.contains(e.target) && e.target !== searchBtn) {
            searchDropdown.classList.remove('active');
        }
    });

    matchSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
            searchResults.innerHTML = '';
            return;
        }

        const filtered = MATCHES_DATA.filter(m => 
            m.homeTeam.toLowerCase().includes(query) || 
            m.awayTeam.toLowerCase().includes(query) ||
            m.league.toLowerCase().includes(query)
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
                searchDropdown.classList.remove('active');
                triggerMatchClick(id);
            });
        });
    });

    // --- 11. MOBILE MENU TOGGLE ---
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // --- 12. DYNAMIC YEAR ---
    document.getElementById('currentYear').textContent = new Date().getFullYear();
});