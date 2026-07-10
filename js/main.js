// =================================================================
// 🚀 Component Loader Engine
// =================================================================

// HTML Component များကို လှမ်းခေါ်သည့် Function
async function loadComponent(id, file) {
    try {
        const response = await fetch(`components/${file}.html`);
        if (!response.ok) throw new Error(`Could not load ${file}.html`);
        const html = await response.text();
        document.getElementById(id).innerHTML = html;
    } catch (error) {
        console.error("Error loading component:", error);
    }
}

// =================================================================
// 🏁 Page စတင်လည်ပတ်သည့် အဓိက Function (ဒီတစ်ခုတည်းကိုပဲ သုံးပါ)
// =================================================================
async function initApp() {
    await Promise.all([
        loadComponent('navbar', 'navbar'),
        loadComponent('sidebar', 'sidebar'),
        loadComponent('widgets', 'widgets'),
        loadComponent('content', 'content'),
        loadComponent('login-container', 'login')
    ]);

    // =================================================================
    // 👤 UI ကို Login အခြေအနေအလိုက် ပြောင်းလဲပေးသည့် အပိုင်း အသစ်
    // =================================================================
    const isLoggedIn = typeof checkLoginStatus === 'function' ? checkLoginStatus() : false;
    const userName = localStorage.getItem('tis_user_name');

    // နာမည်ပြောင်းခြင်း
    const nameSpan = document.getElementById('dynamic-username');
    if (nameSpan) {
        nameSpan.innerText = isLoggedIn && userName ? userName : "Data Enthusiast";
    }

    // Logout ခလုတ် အဖွင့်/အပိတ်
    const logoutSection = document.getElementById('logout-section');
    if (logoutSection) {
        logoutSection.style.display = isLoggedIn ? 'block' : 'none';
    }

    // Video များကို ခေါ်ယူခြင်း
    if (typeof fetchArticles === 'function') {
        fetchArticles();
    }
}
window.onload = initApp;