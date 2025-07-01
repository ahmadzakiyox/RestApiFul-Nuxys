document.addEventListener('DOMContentLoaded', () => {
    // --- UTILS ---
    // Since the JWT is in an HttpOnly cookie, fetch will automatically send it.
    // We don't need to manually set Authorization headers. This is more secure.
    const authenticatedFetch = async (url, options = {}) => {
        const response = await fetch(url, options);
        if (response.status === 401) {
            // If unauthorized, redirect to login
            window.location.href = '/login.html'; // Create a login.html or redirect to main page
            return null;
        }
        return response;
    };

    // --- WIDGET LOGIC ---

    // 1. Welcome Message & Profile
    const loadProfile = async () => {
        const response = await authenticatedFetch('/api/user/profile');
        if (!response) return;
        const { data } = await response.json();
        document.getElementById('welcome-message').textContent = `Welcome, ${data.name}`;
        document.getElementById('ip-address').textContent = data.ipAddress;
    };
    
    // 2. Battery API
    const loadBatteryWidget = async () => {
        if ('getBattery' in navigator) {
            const battery = await navigator.getBattery();
            const updateBattery = () => {
                const level = Math.floor(battery.level * 100);
                document.getElementById('battery-level').textContent = `${level}%`;
                const visualLevel = document.getElementById('battery-visual-level');
                visualLevel.style.width = `${level}%`;
                visualLevel.style.backgroundColor = level < 20 ? 'var(--secondary-color)' : 'var(--primary-color)';
            };
            battery.addEventListener('levelchange', updateBattery);
            updateBattery();
        } else {
            document.getElementById('battery-widget').innerHTML += '<p>Battery API not supported</p>';
        }
    };
    
    // 3. Visitor Count
    const loadVisitorCount = () => {
        let count = localStorage.getItem('visitCount') || 0;
        count++;
        localStorage.setItem('visitCount', count);
        document.getElementById('visitor-count').textContent = count;
    };

    // 4. Countdown Timer
    const loadCountdown = () => {
        const targetDate = new Date('2026-01-01T00:00:00');
        const timer = document.getElementById('countdown-timer');
        setInterval(() => {
            const now = new Date();
            const diff = targetDate - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);
            timer.textContent = `${days}d ${hours}h ${mins}m ${secs}s`;
        }, 1000);
    };

    // 5. API Key Management
    const apiKeyInfoDiv = document.getElementById('api-key-info');
    const generateKeyBtn = document.getElementById('generate-key-btn');

    const loadApiKey = async () => {
        const response = await authenticatedFetch('/api/user/apikey');
        if (!response) return;

        if (response.status === 404) {
            apiKeyInfoDiv.innerHTML = `<p>You don't have an API key yet.</p>`;
            generateKeyBtn.style.display = 'block';
        } else {
            const { apiKey } = await response.json();
            apiKeyInfoDiv.innerHTML = `
                <p><strong>Your Key:</strong> ${apiKey.key}</p>
                <p><strong>Tier:</strong> ${apiKey.tier}</p>
                <p><strong>Today's Usage:</strong> ${apiKey.requestCount} / ${apiKey.requestLimit}</p>
            `;
            generateKeyBtn.style.display = 'none';
        }
    };
    
    generateKeyBtn.addEventListener('click', async () => {
        generateKeyBtn.disabled = true;
        generateKeyBtn.textContent = 'Generating...';
        const response = await authenticatedFetch('/api/user/apikey', { method: 'POST' });
        if(response && response.ok) {
            loadApiKey(); // Refresh the key display
        } else {
             alert('Failed to generate API Key.');
        }
        generateKeyBtn.disabled = false;
        generateKeyBtn.textContent = 'Generate Key';
    });

    // Logout button
    document.getElementById('logout-button').addEventListener('click', (e) => {
        e.preventDefault();
        // This is a simple approach. A more robust way would be to call a
        // /logout endpoint on the backend that clears the cookie.
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = '/';
    });


    // --- INITIALIZE ALL WIDGETS ---
    loadProfile();
    loadBatteryWidget();
    loadVisitorCount();
    loadCountdown();
    loadApiKey();
});