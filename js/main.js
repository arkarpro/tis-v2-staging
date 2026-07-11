// =================================================================
// 🚀 Component Loader Engine
// =================================================================

// HTML Component များကို လှမ်းခေါ်သည့် Function
async function loadComponent(id, file) {
    try {
        const response = await fetch(`components/${file}.html`);
        if (!response.ok) throw new Error(`Could not load ${file}.html`);
        const html = await response.text();
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = html;
        }
    } catch (error) {
        console.warn(`Component load warning (${file}):`, error);
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
        loadComponent('login-container', 'login')
    ]);

    // =================================================================
    // 👤 UI ကို Login အခြေအနေအလိုက် ပြောင်းလဲပေးသည့် အပိုင်း
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

    // 💡 ပြင်ဆင်ချက်: URL မပါသော fetchArticles() အဟောင်းအစား စနစ်သစ် loadCategory ကို အသုံးပြုပါမည်
    if (typeof loadCategory === 'function') {
        loadCategory('Home');
    }
}
window.onload = initApp;

// =================================================================
// 📱 Mobile App-Like Navigation Logic
// =================================================================
function switchMobileTab(tabId) {
    // ဖုန်း Screen မဟုတ်ပါက (Computer ဆိုလျှင်) ဘာမှမလုပ်ဘဲ ကျော်သွားမည်
    if (window.innerWidth >= 768) return; 

    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const widgets = document.getElementById('widgets');

    // ၁။ မျက်နှာပြင် (၃) ခုလုံးကို အရင်ဖျောက်မည် (Computer တွင်မူ ပြန်ပေါ်ရန် md:block ထားမည်)
    sidebar.classList.add('hidden'); 
    sidebar.classList.remove('md:block'); // Tailwind default conflict မဖြစ်ရန်
    content.classList.add('hidden');
    widgets.classList.add('hidden');

    // ၂။ အောက်ခြေခလုတ်များ အားလုံးကို မီးခိုးရောင် (Inactive) ပြောင်းမည်
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-blue-600');
        btn.classList.add('text-gray-400');
    });

    // ၃။ ရွေးချယ်လိုက်သော Tab ကိုသာ ပြန်ဖော်မည်၊ ခလုတ်ကို အပြာရောင်ပြောင်းမည်
    if (tabId === 'profile') {
        sidebar.classList.remove('hidden');
        document.getElementById('nav-profile').classList.add('text-blue-600');
        document.getElementById('nav-profile').classList.remove('text-gray-400');
    } else if (tabId === 'home') {
        content.classList.remove('hidden');
        document.getElementById('nav-home').classList.add('text-blue-600');
        document.getElementById('nav-home').classList.remove('text-gray-400');
    } else if (tabId === 'tests') {
        widgets.classList.remove('hidden');
        document.getElementById('nav-tests').classList.add('text-blue-600');
        document.getElementById('nav-tests').classList.remove('text-gray-400');
    }
}

// 🌐 Website စစဖွင့်ချင်း (သို့မဟုတ်) Refresh လုပ်ချိန်တွင်
window.addEventListener('DOMContentLoaded', () => {
    // Mobile View ဖြစ်နေပါက Home Tab ကို တန်းပွင့်နေစေမည်
    if (window.innerWidth < 768) {
        switchMobileTab('home');
    }
});

// 💻 ဖုန်းမှ Desktop သို့ Window Size ပြန်ဆွဲချဲ့လိုက်ပါက အကုန်ပြန်ပေါ်စေရန်
window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
        document.getElementById('sidebar').classList.remove('hidden');
        document.getElementById('content').classList.remove('hidden');
        document.getElementById('widgets').classList.remove('hidden');
    } else {
        // Mobile Size သို့ ပြန်ကျုံ့သွားပါက Home သို့ ပြန်သွားမည်
        switchMobileTab('home');
    }
});
// =================================================================

// =================================================================
// 🖼️ Reviews Floating Gallery Logic
// =================================================================
function openReviewsModal() {
    const modal = document.getElementById('reviewsModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // ဖုန်းတွင် Back button နှိပ်ပါက ပြန်ပိတ်ရန် History တွင် မှတ်ထားမည်
    history.pushState({ modalOpen: true }, ""); 
}

function closeReviewsModal() {
    const modal = document.getElementById('reviewsModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// ဖုန်းတွင် Back ခလုတ် (သို့) Swipe လုပ်ပါက Modal ပိတ်ရန်
window.addEventListener('popstate', function(event) {
    const modal = document.getElementById('reviewsModal');
    if (!modal.classList.contains('hidden')) {
        closeReviewsModal();
    }
});
// =================================================================

// =================================================================
// 🚧 Coming Soon Placeholder Logic
// =================================================================
function showComingSoon(featureName, message) {
    // မျက်နှာပြင်ပြောင်းခြင်း
    document.getElementById('content').classList.add('hidden');
    document.getElementById('coming-soon-container').classList.remove('hidden');
    
    // စာသားများ အစားထိုးခြင်း
    document.getElementById('cs-title').innerText = `Your ${featureName} is Coming Soon!`;
    document.getElementById('cs-message').innerText = message;
    
    // မိုဘိုင်းတွင်ဆိုပါက အလယ် Pane သို့ အလိုအလျောက် ရွှေ့ပေးမည်
    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.add('hidden');
        document.getElementById('coming-soon-container').classList.remove('hidden');
        
        // အောက်ခြေခလုတ်များကိုပါ Inactive ပြောင်းမည်
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('text-blue-600');
            btn.classList.add('text-gray-400');
        });
    }
}

function closeComingSoon() {
    document.getElementById('coming-soon-container').classList.add('hidden');
    document.getElementById('content').classList.remove('hidden');
    
    if (window.innerWidth < 768) {
        switchMobileTab('home'); // Mobile တွင် Home (Video Feed) သို့ ပြန်သွားမည်
    }
}