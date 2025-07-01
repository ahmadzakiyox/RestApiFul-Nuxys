document.addEventListener('DOMContentLoaded', () => {
    // === DOM ELEMENTS ===
    const userTableBody = document.getElementById('user-table-body');
    const apikeyTableBody = document.getElementById('apikey-table-body');
    const userModal = document.getElementById('edit-user-modal');
    const apikeyModal = document.getElementById('edit-apikey-modal');
    const editUserForm = document.getElementById('edit-user-form');
    const editApiKeyForm = document.getElementById('edit-apikey-form');
    const maintenanceToggle = document.getElementById('maintenance-toggle');
    const backupBtn = document.getElementById('backup-btn');

    // === HELPER FUNCTION ===
    const authenticatedFetch = (url, options = {}) => {
        // Karena kita menggunakan cookie HttpOnly, browser akan otomatis mengirim token.
        // Jika Anda menggunakan localStorage, Anda harus menambahkan header Authorization di sini.
        return fetch(url, options);
    };

    // === DATA FETCHING & RENDERING ===

    const fetchAndRenderStats = async () => {
        try {
            const res = await authenticatedFetch('/api/admin/stats');
            const { data } = await res.json();
            document.getElementById('stats-total-users').textContent = data.totalUsers;
            document.getElementById('stats-total-keys').textContent = data.totalApiKeys;
            document.getElementById('stats-premium-keys').textContent = data.premiumKeys;
            document.getElementById('stats-requests-today').textContent = data.requestsToday;
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchAndRenderUsers = async () => {
        try {
            const res = await authenticatedFetch('/api/admin/users');
            if (!res.ok) throw new Error('Failed to fetch users');
            const { data } = await res.json();
            userTableBody.innerHTML = '';
            data.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.name}</td><td>${user.email}</td><td>${user.role}</td>
                    <td>${user.isVerified ? 'Yes' : 'No'}</td><td>${user.isBlocked ? 'Yes' : 'No'}</td>
                    <td>
                        <button class="action-btn edit-user" data-id="${user._id}"><i data-feather="edit"></i></button>
                        <button class="action-btn delete-user" data-id="${user._id}"><i data-feather="trash-2"></i></button>
                    </td>
                `;
                userTableBody.appendChild(tr);
            });
            feather.replace();
        } catch (error) {
            console.error(error);
            userTableBody.innerHTML = `<tr><td colspan="6">Error loading users.</td></tr>`;
        }
    };

    const fetchAndRenderApiKeys = async () => {
        try {
            const res = await authenticatedFetch('/api/admin/apikeys');
            if (!res.ok) throw new Error('Failed to fetch API keys');
            const { data } = await res.json();
            apikeyTableBody.innerHTML = '';
            data.forEach(key => {
                const tr = document.createElement('tr');
                const userName = key.user ? key.user.name : 'N/A';
                const userEmail = key.user ? key.user.email : 'N/A';
                tr.innerHTML = `
                    <td>${userName}</td><td>${userEmail}</td>
                    <td>${key.key.substring(0, 10)}...</td><td>${key.tier}</td><td>${key.requestCount}</td>
                    <td>
                        <button class="action-btn edit-apikey" data-id="${key._id}" data-tier="${key.tier}"><i data-feather="edit"></i></button>
                        <button class="action-btn delete-apikey" data-id="${key._id}"><i data-feather="trash-2"></i></button>
                    </td>
                `;
                apikeyTableBody.appendChild(tr);
            });
            feather.replace();
        } catch (error) {
            console.error(error);
            apikeyTableBody.innerHTML = `<tr><td colspan="6">Error loading API keys.</td></tr>`;
        }
    };
    
    const fetchAndRenderSettings = async () => {
        try {
            const res = await authenticatedFetch('/api/admin/settings');
            const { data } = await res.json();
            maintenanceToggle.checked = data.maintenanceMode || false;
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };
    
    // === EVENT LISTENERS & ACTIONS ===

    document.addEventListener('click', e => {
        const btn = e.target.closest('.action-btn');
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.classList.contains('edit-user')) openUserModal(id);
        if (btn.classList.contains('delete-user')) deleteUser(id);
        if (btn.classList.contains('edit-apikey')) openApiKeyModal(id, btn.dataset.tier);
        if (btn.classList.contains('delete-apikey')) deleteApiKey(id);
    });

    const openUserModal = async (id) => {
        const res = await authenticatedFetch('/api/admin/users');
        const { data } = await res.json();
        const user = data.find(u => u._id === id);
        if (!user) return;
        document.getElementById('edit-user-id').value = user._id;
        document.getElementById('edit-role').value = user.role;
        document.getElementById('edit-verified').value = user.isVerified;
        document.getElementById('edit-blocked').value = user.isBlocked;
        userModal.style.display = 'block';
    };

    const openApiKeyModal = (id, currentTier) => {
        document.getElementById('edit-apikey-id').value = id;
        document.getElementById('edit-tier').value = currentTier;
        apikeyModal.style.display = 'block';
    };

    const deleteUser = async (id) => {
        if (!confirm('Delete user? This is irreversible.')) return;
        await authenticatedFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        fetchAndRenderUsers();
        fetchAndRenderApiKeys();
    };

    const deleteApiKey = async (id) => {
        if (!confirm('Delete this API Key?')) return;
        await authenticatedFetch(`/api/admin/apikeys/${id}`, { method: 'DELETE' });
        fetchAndRenderApiKeys();
    };

    const setupModals = () => {
        const closeButtons = document.querySelectorAll('.close-button');
        closeButtons.forEach(btn => btn.onclick = () => {
            userModal.style.display = 'none';
            apikeyModal.style.display = 'none';
        });
        window.onclick = e => {
            if (e.target == userModal) userModal.style.display = 'none';
            if (e.target == apikeyModal) apikeyModal.style.display = 'none';
        };

        editUserForm.addEventListener('submit', async e => {
            e.preventDefault();
            const id = document.getElementById('edit-user-id').value;
            const body = JSON.stringify({
                role: document.getElementById('edit-role').value,
                isVerified: document.getElementById('edit-verified').value === 'true',
                isBlocked: document.getElementById('edit-blocked').value === 'true',
            });
            await authenticatedFetch(`/api/admin/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body });
            userModal.style.display = 'none';
            fetchAndRenderUsers();
        });

        editApiKeyForm.addEventListener('submit', async e => {
            e.preventDefault();
            const id = document.getElementById('edit-apikey-id').value;
            const body = JSON.stringify({ tier: document.getElementById('edit-tier').value });
            await authenticatedFetch(`/api/admin/apikeys/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body });
            apikeyModal.style.display = 'none';
            fetchAndRenderApiKeys();
        });
    };

    maintenanceToggle.addEventListener('change', async (e) => {
        const value = e.target.checked;
        await authenticatedFetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'maintenanceMode', value })
        });
        alert(`Maintenance mode turned ${value ? 'ON' : 'OFF'}.`);
    });

    backupBtn.addEventListener('click', async () => {
        backupBtn.disabled = true;
        backupBtn.textContent = 'Backing up...';
        const res = await authenticatedFetch('/api/admin/backup', { method: 'POST' });
        const result = await res.json();
        alert(result.message);
        backupBtn.disabled = false;
        backupBtn.textContent = 'Create Backup';
    });

    document.getElementById('logout-button').addEventListener('click', () => {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = '/';
    });

    // === INITIALIZE DASHBOARD ===
    const initializeDashboard = () => {
        fetchAndRenderStats();
        fetchAndRenderUsers();
        fetchAndRenderApiKeys();
        fetchAndRenderSettings();
    };
    
    setupModals();
    initializeDashboard();
});