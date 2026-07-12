// =================================================================
// 🚀 Main Application Logic & Single-Page Scroll Routing
// =================================================================

async function loadComponent(id, file) {
    try {
        const response = await fetch(`components/${file}.html`);
        if (!response.ok) throw new Error(`Could not load ${file}.html`);
        const element = document.getElementById(id);
        if (element) element.innerHTML = await response.text();
    } catch (error) { console.warn(`Component load warning:`, error); }
}

async function initApp() {
    await Promise.all([
        loadComponent('navbar', 'navbar'),
        loadComponent('sidebar', 'sidebar'),
        loadComponent('widgets', 'widgets'),
        loadComponent('login-container', 'login')
    ]);

    const isLoggedIn = typeof checkLoginStatus === 'function' ? checkLoginStatus() : false;
    const userName = localStorage.getItem('tis_user_name');

    setTimeout(() => {
        const nameSpan = document.getElementById('dynamic-username');
        if (nameSpan) nameSpan.innerText = isLoggedIn && userName ? userName : "Data Enthusiast";
        const logoutSection = document.getElementById('logout-section');
        if (logoutSection) logoutSection.style.display = isLoggedIn ? 'block' : 'none';
    }, 50);

    // 💡 အစပိုင်းတွင် Master Data ကို တစ်ခါတည်း ဆွဲယူမည် (From api.js)
    if (typeof fetchMasterData === 'function') {
        fetchMasterData();
    }

    if (window.innerWidth < 768) switchMobileTab('home');
}
window.addEventListener('DOMContentLoaded', initApp);


// --------------------------------------------------
// Mobile Bottom Navigation
// --------------------------------------------------
function switchMobileTab(tabId) {
    if (window.innerWidth >= 768) return; 

    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const widgets = document.getElementById('widgets');

    [sidebar, content, widgets].forEach(el => {
        if(el) { el.classList.add('hidden'); el.classList.remove('md:block', 'animate-fade-in'); }
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-blue-600', 'scale-110');
        btn.classList.add('text-gray-400');
    });

    let activeElement = null;
    let activeBtn = null;

    if (tabId === 'profile') {
        activeElement = sidebar; activeBtn = document.getElementById('nav-profile');
    } else if (tabId === 'home') {
        activeElement = content; activeBtn = document.getElementById('nav-home');
        
        // 💡 Home ကိုနှိပ်လိုက်ပါက အပေါ်ဆုံးသို့ ပြန်တက်မည် (Loop effect)
        if (!content.classList.contains('hidden')) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
    } else if (tabId === 'tests') {
        activeElement = widgets; activeBtn = document.getElementById('nav-tests');
    }

    if (activeElement) { activeElement.classList.remove('hidden'); activeElement.classList.add('animate-fade-in'); }
    if (activeBtn) { activeBtn.classList.add('text-blue-600', 'scale-110'); activeBtn.classList.remove('text-gray-400'); }
}


// --------------------------------------------------
// ScrollSpy - ကိုယ်ဖတ်နေသည့်နေရာကို လိုက်ပြီး Navbar အရောင်ပြောင်းခြင်း
// --------------------------------------------------
function setupScrollSpy() {
    const sections = document.querySelectorAll('.scroll-section');
    
    // မျက်နှာပြင်ရဲ့ အပေါ် ၃၀% နားကို ရောက်လာတာနဲ့ Active ဖြစ်ကြောင်း သတ်မှတ်မည်
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentCat = entry.target.id.replace('section-', '');
                if (typeof updateTopNavbarUI === 'function') {
                    updateTopNavbarUI(currentCat);
                }
            }
        });
    }, { rootMargin: '-20% 0px -70% 0px' });
    
    sections.forEach(sec => observer.observe(sec));
}


// --------------------------------------------------
// Mobile Horizontal Swipe Logic
// --------------------------------------------------
let touchStartX = 0; let touchEndX = 0;
let touchStartY = 0; let touchEndY = 0;
const swipeOrder = ['profile', 'Home', 'Excel', 'PowerQuery', 'PowerBI', 'SQL', 'Tech', 'tests'];

function handleSwipe() {
    if (window.innerWidth >= 768) return; 

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        let currentState = 'Home';
        if (!document.getElementById('sidebar')?.classList.contains('hidden')) currentState = 'profile';
        else if (!document.getElementById('widgets')?.classList.contains('hidden')) currentState = 'tests';
        else if (typeof currentCategory !== 'undefined') currentState = currentCategory;

        let currentIndex = swipeOrder.indexOf(currentState);
        if (currentIndex === -1) currentIndex = 1; 

        if (diffX > 0 && currentIndex > 0) {
            // Swipe Right
            if (swipeOrder[currentIndex - 1] === 'profile') switchMobileTab('profile');
            else loadCategory(swipeOrder[currentIndex - 1]);
        } else if (diffX < 0 && currentIndex < swipeOrder.length - 1) {
            // Swipe Left
            if (swipeOrder[currentIndex + 1] === 'tests') switchMobileTab('tests');
            else loadCategory(swipeOrder[currentIndex + 1]);
        }
    }
}

document.addEventListener('touchstart', e => {
    if (e.target.closest('.overflow-x-auto') || e.target.closest('.overflow-y-auto')) return;
    touchStartX = e.changedTouches[0].screenX; touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', e => {
    if (e.target.closest('.overflow-x-auto') || e.target.closest('.overflow-y-auto')) return;
    touchEndX = e.changedTouches[0].screenX; touchEndY = e.changedTouches[0].screenY;
    handleSwipe(); 
}, { passive: true });


// --------------------------------------------------
// Auto-Loop to Top on Scroll Bottom
// --------------------------------------------------
window.addEventListener('scroll', () => {
    if (window.innerWidth >= 768) return;
    const contentDiv = document.getElementById('content');
    if (!contentDiv || contentDiv.classList.contains('hidden')) return;
    
    const scrollPosition = window.innerHeight + window.scrollY;
    
    // အောက်ဆုံးသို့ရောက်သွားပါက Home (အပေါ်ဆုံး) သို့ ပြန်ကန်တက်မည်
    if (scrollPosition >= document.body.offsetHeight - 10) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Modal Logic (No changes)
function openReviewsModal() { const m = document.getElementById('reviewsModal'); if(m) { m.classList.remove('hidden'); m.classList.add('flex'); setTimeout(() => m.classList.add('opacity-100'), 10); history.pushState({ modalOpen: true }, ""); } }
function closeReviewsModal() { const m = document.getElementById('reviewsModal'); if(m) { m.classList.remove('opacity-100'); setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300); } }
window.addEventListener('popstate', function() { closeReviewsModal(); });