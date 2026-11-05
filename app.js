// ============================================================
// © SUCHI 24/7 - https://discord.gg/pvtBvKUKC8
// Replace with your Discord Application ID
// ============================================================
const CLIENT_ID = '1567812331554209862';
const SCOPES = ['openid', 'sdk.social_layer_presence'];
const REDIRECT_URI = window.location.origin + window.location.pathname; 

// ⚠️ IMPORTANT: REPLACE THIS WITH YOUR DEPLOYED BACKEND URL
const BACKEND_URL = 'https://your-app-name.deplexo.com'; 

// UI Elements
const loginBtn = document.getElementById('loginBtn');
const authStatus = document.getElementById('authStatus');
const authSection = document.getElementById('auth-section');
const editorSection = document.getElementById('editor-section');
const rpcForm = document.getElementById('rpcForm');
const updateStatus = document.getElementById('updateStatus');

// Preview Elements
const previewType = document.getElementById('previewType');
const previewDetails = document.getElementById('previewDetails');
const previewState = document.getElementById('previewState');
const previewLargeImg = document.getElementById('previewLargeImg');

let rpcClient = null;
let startTime = Date.now();

// --- 1. Authentication Check ---
const hashParams = new URLSearchParams(window.location.search);
const code = hashParams.get('code');
const storedToken = localStorage.getItem('discord_rpc_token');

if (code) {
    exchangeCodeForToken(code);
} else if (storedToken) {
    initApp(storedToken);
} else {
    loginBtn.style.display = 'block';
}

// --- 2. OAuth2 Login Flow ---
loginBtn.addEventListener('click', () => {
    const authUrl = `https://discord.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPES.join(' '))}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&prompt=consent`;
    window.location.href = authUrl;
});

// --- 3. Securely Exchange Code for Token via Backend ---
async function exchangeCodeForToken(code) {
    updateStatus.textContent = 'Verifying with Discord...';
    updateStatus.className = 'status-text text-center';

    try {
        const response = await fetch(`${BACKEND_URL}/token.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error_description || data.error);

        localStorage.setItem('discord_rpc_token', data.access_token);
        window.history.replaceState({}, document.title, window.location.pathname);
        initApp(data.access_token);

    } catch (err) {
        console.error('Token exchange failed:', err);
        updateStatus.textContent = `❌ Backend error: ${err.message}. Please try again.`;
        updateStatus.className = 'status-text error text-center';
        loginBtn.style.display = 'block';
    }
}

// --- 4. Connect to Local Discord Client ---
function initApp(token) {
    authSection.classList.add('hidden');
    editorSection.classList.remove('hidden');

    rpcClient = new RPC.Client({ transport: 'websocket' });

    rpcClient.on('ready', () => {
        updateStatus.textContent = '✅ Connected to Discord! Make sure the desktop app is open.';
        updateStatus.className = 'status-text success';
        setTimeout(() => updateStatus.textContent = '', 5000);
    });

    rpcClient.on('error', () => {
        updateStatus.textContent = '❌ Error: Is the Discord desktop app open?';
        updateStatus.className = 'status-text error';
    });

    rpcClient.login({ clientId: CLIENT_ID, accessToken: token, scopes: SCOPES })
        .catch(() => {
            updateStatus.textContent = '❌ Auth expired. Please re-link your account.';
            updateStatus.className = 'status-text error';
            localStorage.removeItem('discord_rpc_token');
            setTimeout(() => window.location.reload(), 3000);
        });
}

// --- 5. Presets & Form Logic ---
const presets = {
    gaming: { type: 0, details: 'Surviving in a new world', state: 'Building a house', largeImage: 'minecraft_logo', largeText: 'Minecraft' },
    coding: { type: 0, details: 'Writing a script', state: 'Workspace: app.js', largeImage: 'vscode_icon', largeText: 'Visual Studio Code' },
    music: { type: 2, details: 'Listening to Spotify', state: 'Blinding Lights - The Weeknd', largeImage: 'spotify_logo', largeText: 'Spotify' }
};

document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const p = presets[btn.dataset.preset];
        document.getElementById('activityType').value = p.type;
        document.getElementById('detailsInput').value = p.details;
        document.getElementById('stateInput').value = p.state;
        document.getElementById('largeImageInput').value = p.largeImage;
        document.getElementById('largeTextInput').value = p.largeText;
        updatePreview();
    });
});

function updatePreview() {
    const typeMap = { "0": "Playing", "2": "Listening to", "3": "Watching", "5": "Competing in" };
    previewType.textContent = typeMap[document.getElementById('activityType').value];
    previewDetails.textContent = document.getElementById('detailsInput').value || 'Details...';
    previewState.textContent = document.getElementById('stateInput').value || 'State...';
    const largeKey = document.getElementById('largeImageInput').value;
    previewLargeImg.textContent = largeKey ? '🖼️' : '?';
}

document.querySelectorAll('input, select').forEach(el => el.addEventListener('input', updatePreview));

// --- 6. Update Presence ---
rpcForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!rpcClient) return;

    const activity = {
        type: parseInt(document.getElementById('activityType').value),
        details: document.getElementById('detailsInput').value || undefined,
        state: document.getElementById('stateInput').value || undefined,
        startTimestamp: startTime,
        largeImageKey: document.getElementById('largeImageInput').value || undefined,
        largeImageText: document.getElementById('largeTextInput').value || undefined,
        instance: false
    };

    try {
        await rpcClient.setActivity(activity);
        updateStatus.textContent = '🎮 Rich Presence updated successfully!';
        updateStatus.className = 'status-text success text-center';
    } catch (err) {
        updateStatus.textContent = '❌ Failed to update. Is Discord open?';
        updateStatus.className = 'status-text error text-center';
    }
});

// --- 7. Clear Presence ---
document.getElementById('clearBtn').addEventListener('click', async () => {
    if (!rpcClient) return;
    await rpcClient.clearActivity();
    updateStatus.textContent = '🧹 Status cleared.';
    updateStatus.className = 'status-text text-center';
});
