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
    // ၁။ Static Component များကို အရင်တင်ပါ
    await Promise.all([
        loadComponent('navbar', 'navbar'),
        loadComponent('sidebar', 'sidebar'),
        loadComponent('widgets', 'widgets'),
        loadComponent('content', 'content'), // Content container ကို အရင်ဆောက်
        loadComponent('login-container', 'login') // 👈 ဤတစ်ကြောင်း အသစ်ထပ်ထည့်ပေးပါ
    ]);

    // ၂။ Container ဆောက်ပြီးမှ Google Sheet ထဲက Article များကို လှမ်းခေါ်ပါ
    // ကိုကိုအာကာ့ api.js ထဲက fetchArticles function ကို ခေါ်ခြင်းဖြစ်ပါတယ်
    if (typeof fetchArticles === 'function') {
        fetchArticles();
    } else {
        console.error("fetchArticles function မတွေ့ရှိပါ");
    }
}

// Window load ဖြစ်ရင် initApp ကို တစ်ကြိမ်တည်း ခေါ်ပါ
window.onload = initApp;