// Job Notification Tracker

class JobTracker {
    constructor() {
        this.jobs = jobsData;
        this.filteredJobs = [...this.jobs];
        this.savedJobs = this.loadSavedJobs();
        this.filters = { keyword: '', location: '', mode: '', experience: '', source: '', sort: 'latest' };
    }
    
    loadSavedJobs() {
        const saved = localStorage.getItem('savedJobs');
        return saved ? JSON.parse(saved) : [];
    }
    
    saveJob(jobId) {
        if (!this.savedJobs.includes(jobId)) {
            this.savedJobs.push(jobId);
            localStorage.setItem('savedJobs', JSON.stringify(this.savedJobs));
        }
    }
    
    unsaveJob(jobId) {
        this.savedJobs = this.savedJobs.filter(id => id !== jobId);
        localStorage.setItem('savedJobs', JSON.stringify(this.savedJobs));
    }
    
    isJobSaved(jobId) {
        return this.savedJobs.includes(jobId);
    }
    
    applyFilters() {
        this.filteredJobs = this.jobs.filter(job => {
            const matchesKeyword = !this.filters.keyword || 
                job.title.toLowerCase().includes(this.filters.keyword.toLowerCase()) ||
                job.company.toLowerCase().includes(this.filters.keyword.toLowerCase());
            const matchesLocation = !this.filters.location || 
                job.location.toLowerCase().includes(this.filters.location.toLowerCase());
            const matchesMode = !this.filters.mode || job.mode === this.filters.mode;
            const matchesExperience = !this.filters.experience || job.experience === this.filters.experience;
            const matchesSource = !this.filters.source || job.source === this.filters.source;
            return matchesKeyword && matchesLocation && matchesMode && matchesExperience && matchesSource;
        });
        if (this.filters.sort === 'latest') {
            this.filteredJobs.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
        }
    }
    
    formatPostedDate(daysAgo) {
        if (daysAgo === 0) return 'Today';
        if (daysAgo === 1) return '1 day ago';
        return `${daysAgo} days ago`;
    }
}

class Router {
    constructor() {
        this.tracker = new JobTracker();
        this.routes = {
            'landing': this.renderLanding, 'dashboard': this.renderDashboard,
            'saved': this.renderSaved, 'digest': this.renderDigest,
            'settings': this.renderSettings, 'proof': this.renderProof
        };
        this.init();
    }
    
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        document.addEventListener('DOMContentLoaded', () => {
            this.setupNavigation();
            this.setupHamburger();
            this.handleRoute();
        });
        if (document.readyState !== 'loading') {
            this.setupNavigation();
            this.setupHamburger();
            this.handleRoute();
        }
    }
    
    setupNavigation() {
        document.querySelectorAll('.top-nav__link').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
    }
    
    setupHamburger() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
            });
        }
    }
    
    closeMenu() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');
        if (hamburger && navLinks) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    }
    
    handleRoute() {
        const hash = window.location.hash.slice(2);
        const route = hash || 'landing';
        const topNav = document.getElementById('topNav');
        if (route === 'landing') {
            topNav.style.display = 'none';
        } else {
            topNav.style.display = 'block';
            this.updateActiveLink(route);
        }
        const renderFunction = this.routes[route] || this.renderLanding;
        renderFunction.call(this);
    }
    
    updateActiveLink(currentRoute) {
        document.querySelectorAll('.top-nav__link').forEach(link => {
            const route = link.getAttribute('data-route');
            link.classList.toggle('active', route === currentRoute);
        });
    }
    
    renderLanding() {
        document.getElementById('appContent').innerHTML = `
            <div class="landing">
                <h1 class="landing__headline">Stop Missing The Right Jobs.</h1>
                <p class="landing__subtext">Precision-matched job discovery delivered daily at 9AM.</p>
                <a href="#/settings" class="landing__cta">Start Tracking</a>
            </div>
        `;
    }
    
    renderFilterBar() {
        return `
            <div class="filter-bar">
                <div class="filter-bar__row">
                    <input type="text" class="filter-input" id="keywordFilter" placeholder="Search by title or company">
                    <input type="text" class="filter-input" id="locationFilter" placeholder="Location">
                    <select class="filter-input" id="modeFilter">
                        <option value="">All Modes</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Onsite">Onsite</option>
                    </select>
                </div>
                <div class="filter-bar__row">
                    <select class="filter-input" id="experienceFilter">
                        <option value="">All Experience Levels</option>
                        <option value="Fresher">Fresher</option>
                        <option value="0-1">0-1 Years</option>
                        <option value="1-3">1-3 Years</option>
                        <option value="3-5">3-5 Years</option>
                    </select>
                    <select class="filter-input" id="sourceFilter">
                        <option value="">All Sources</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Naukri">Naukri</option>
                        <option value="Indeed">Indeed</option>
                    </select>
                    <select class="filter-input" id="sortFilter">
                        <option value="latest">Latest First</option>
                    </select>
                </div>
            </div>
        `;
    }
    
    renderJobCard(job) {
        const isSaved = this.tracker.isJobSaved(job.id);
        return `
            <div class="job-card">
                <div class="job-card__header">
                    <h3 class="job-card__title">${job.title}</h3>
                    <div class="job-card__company">${job.company}</div>
                </div>
                <div class="job-card__meta">
                    <span>${job.location}</span> • <span>${job.mode}</span> • <span>${this.tracker.formatPostedDate(job.postedDaysAgo)}</span>
                </div>
                <div class="job-card__badges">
                    <span class="badge badge--source">${job.source}</span>
                    <span class="badge badge--experience">${job.experience}</span>
                    <span class="badge badge--mode">${job.mode}</span>
                </div>
                <div class="job-card__salary">${job.salaryRange}</div>
                <div class="job-card__actions">
                    <button class="button button--secondary button--small" onclick="router.showJobModal(${job.id})">View</button>
                    <button class="button ${isSaved ? 'button--warning' : 'button--secondary'} button--small" onclick="router.toggleSaveJob(${job.id})">${isSaved ? 'Unsave' : 'Save'}</button>
                    <button class="button button--primary button--small" onclick="window.open('${job.applyUrl}', '_blank')">Apply</button>
                </div>
            </div>
        `;
    }
    
    renderDashboard() {
        this.tracker.applyFilters();
        document.getElementById('appContent').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-header__title">Dashboard</h1>
                <p class="dashboard-header__count">${this.tracker.filteredJobs.length} jobs available</p>
            </div>
            ${this.renderFilterBar()}
            <div class="jobs-grid">
                ${this.tracker.filteredJobs.map(job => this.renderJobCard(job)).join('')}
            </div>
            <div id="jobModal" class="modal"><div class="modal__content"><div id="modalBody"></div></div></div>
        `;
        this.setupFilters();
    }
    
    setupFilters() {
        const applyFilters = () => {
            this.tracker.filters.keyword = document.getElementById('keywordFilter').value;
            this.tracker.filters.location = document.getElementById('locationFilter').value;
            this.tracker.filters.mode = document.getElementById('modeFilter').value;
            this.tracker.filters.experience = document.getElementById('experienceFilter').value;
            this.tracker.filters.source = document.getElementById('sourceFilter').value;
            this.tracker.filters.sort = document.getElementById('sortFilter').value;
            this.renderDashboard();
        };
        document.getElementById('keywordFilter').addEventListener('input', applyFilters);
        document.getElementById('locationFilter').addEventListener('input', applyFilters);
        document.getElementById('modeFilter').addEventListener('change', applyFilters);
        document.getElementById('experienceFilter').addEventListener('change', applyFilters);
        document.getElementById('sourceFilter').addEventListener('change', applyFilters);
        document.getElementById('sortFilter').addEventListener('change', applyFilters);
    }
    
    showJobModal(jobId) {
        const job = this.tracker.jobs.find(j => j.id === jobId);
        if (!job) return;
        const modal = document.getElementById('jobModal');
        const isSaved = this.tracker.isJobSaved(job.id);
        document.getElementById('modalBody').innerHTML = `
            <div class="modal__header">
                <div><h2 class="modal__title">${job.title}</h2><div class="modal__company">${job.company}</div></div>
                <button class="modal__close" onclick="router.closeModal()">&times;</button>
            </div>
            <div class="modal__section">
                <div class="job-card__meta">${job.location} • ${job.mode} • ${job.experience} • ${this.tracker.formatPostedDate(job.postedDaysAgo)}</div>
            </div>
            <div class="modal__section"><div class="job-card__salary">${job.salaryRange}</div></div>
            <div class="modal__section">
                <div class="modal__section-title">Description</div>
                <p class="modal__description">${job.description}</p>
            </div>
            <div class="modal__section">
                <div class="modal__section-title">Required Skills</div>
                <div class="modal__skills">${job.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
            </div>
            <div class="modal__section">
                <div class="modal__section-title">Source</div>
                <span class="badge badge--source">${job.source}</span>
            </div>
            <div class="modal__actions">
                <button class="button ${isSaved ? 'button--warning' : 'button--secondary'}" onclick="router.toggleSaveJob(${job.id}); router.showJobModal(${job.id})">${isSaved ? 'Unsave' : 'Save'}</button>
                <button class="button button--primary" onclick="window.open('${job.applyUrl}', '_blank')">Apply Now</button>
            </div>
        `;
        modal.classList.add('active');
        modal.onclick = (e) => { if (e.target === modal) this.closeModal(); };
    }
    
    closeModal() {
        const modal = document.getElementById('jobModal');
        if (modal) modal.classList.remove('active');
    }
    
    toggleSaveJob(jobId) {
        if (this.tracker.isJobSaved(jobId)) {
            this.tracker.unsaveJob(jobId);
        } else {
            this.tracker.saveJob(jobId);
        }
        const route = window.location.hash.slice(2) || 'landing';
        if (route === 'dashboard') this.renderDashboard();
        else if (route === 'saved') this.renderSaved();
    }
    
    renderSettings() {
        document.getElementById('appContent').innerHTML = `
            <div class="settings">
                <div class="settings__header">
                    <h1 class="settings__title">Settings</h1>
                    <p class="settings__subtitle">Configure your job tracking preferences</p>
                </div>
                <form class="settings__form">
                    <div class="form-group">
                        <label class="form-label">Role Keywords</label>
                        <input type="text" class="form-input" placeholder="e.g. Frontend Developer, React Engineer">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Preferred Locations</label>
                        <input type="text" class="form-input" placeholder="e.g. San Francisco, New York, Remote">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Work Mode</label>
                        <select class="form-input">
                            <option value="">Select mode</option>
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="onsite">Onsite</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Experience Level</label>
                        <select class="form-input">
                            <option value="">Select level</option>
                            <option value="entry">Entry Level</option>
                            <option value="mid">Mid Level</option>
                            <option value="senior">Senior Level</option>
                            <option value="lead">Lead / Principal</option>
                        </select>
                    </div>
                    <div class="button-group">
                        <button type="button" class="button button--primary">Save Preferences</button>
                        <button type="button" class="button button--secondary">Cancel</button>
                    </div>
                </form>
            </div>
        `;
    }
    
    renderSaved() {
        const savedJobsData = this.tracker.jobs.filter(job => this.tracker.isJobSaved(job.id));
        if (savedJobsData.length === 0) {
            document.getElementById('appContent').innerHTML = `
                <div class="empty-state">
                    <h1 class="empty-state__title">No saved jobs yet.</h1>
                    <p class="empty-state__text">Jobs you save will appear here for easy access.</p>
                </div>
            `;
        } else {
            document.getElementById('appContent').innerHTML = `
                <div class="dashboard-header">
                    <h1 class="dashboard-header__title">Saved Jobs</h1>
                    <p class="dashboard-header__count">${savedJobsData.length} saved jobs</p>
                </div>
                <div class="jobs-grid">
                    ${savedJobsData.map(job => this.renderJobCard(job)).join('')}
                </div>
                <div id="jobModal" class="modal"><div class="modal__content"><div id="modalBody"></div></div></div>
            `;
        }
    }
    
    renderDigest() {
        document.getElementById('appContent').innerHTML = `
            <div class="empty-state">
                <h1 class="empty-state__title">No digest available.</h1>
                <p class="empty-state__text">Your daily job digest will be delivered at 9AM.</p>
            </div>
        `;
    }
    
    renderProof() {
        document.getElementById('appContent').innerHTML = `
            <div class="proof">
                <div class="proof__header">
                    <h1 class="proof__title">Proof</h1>
                    <p class="proof__subtitle">Artifact collection and validation</p>
                </div>
                <div class="proof__placeholder">
                    <p class="proof__placeholder-text">Proof artifacts will be collected here in future steps.</p>
                </div>
            </div>
        `;
    }
}

const router = new Router();
