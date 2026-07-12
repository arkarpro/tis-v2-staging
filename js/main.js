// =================================================================
// 🚀 Component Loader Engine
// =================================================================
async function loadComponent(id, file) {
    try {
        const response = await fetch(`components/${file}.html`);
        if (!response.ok) throw new Error(`Could not load ${file}.html`);
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = await response.text();
        }
    } catch (error) {
        console.warn(`Component load warning (${file}):`, error);
    }
}

// =================================================================
// 🏁 Page စတင်လည်ပတ်သည့် အဓိက Function
// =================================================================
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
        if (nameSpan) {
            nameSpan.innerText = isLoggedIn && userName ? userName : "Data Enthusiast";
        }
        const logoutSection = document.getElementById('logout-section');
        if (logoutSection) {
            logoutSection.style.display = isLoggedIn ? 'block' : 'none';
        }
    }, 50);

    // 💡 နောက်ကွယ်မှ Data များကို ကြိုတင်ဆွဲထားမည် (Background Caching)
    if (typeof preloadAllData === 'function') {
        preloadAllData();
    }

    if (typeof loadCategory === 'function') {
        loadCategory('Home');
    }

    if (window.innerWidth < 768) {
        switchMobileTab('home');
    }
}

window.addEventListener('DOMContentLoaded', initApp);

// =================================================================
// 📱 Mobile App-Like Navigation Logic
// =================================================================
function switchMobileTab(tabId) {
    if (window.innerWidth >= 768) return; 

    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const widgets = document.getElementById('widgets');

    [sidebar, content, widgets].forEach(el => {
        if(el) {
            el.classList.add('hidden');
            el.classList.remove('md:block', 'animate-fade-in'); 
        }
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-blue-600', 'scale-110');
        btn.classList.add('text-gray-400');
    });

    // 💡 Profile သို့မဟုတ် Tests ကို ရောက်ပါက အပေါ် Navbar အရောင်ကို ရိုးရိုး မီးခိုးရောင် ပြန်ပြောင်းမည်
    if (tabId === 'profile' || tabId === 'tests') {
        document.querySelectorAll('.nav-item').forEach(el => {
            el.className = "nav-item text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-3.5 py-2 rounded-full transition-all duration-300";
        });
    }

    let activeElement = null;
    let activeBtn = null;

    if (tabId === 'profile') {
        activeElement = sidebar;
        activeBtn = document.getElementById('nav-profile');
    } else if (tabId === 'home') {
        activeElement = content;
        activeBtn = document.getElementById('nav-home');
        const comingSoon = document.getElementById('coming-soon-container');
        if(comingSoon && !comingSoon.classList.contains('hidden')) {
            comingSoon.classList.add('hidden');
        }
    } else if (tabId === 'tests') {
        activeElement = widgets;
        activeBtn = document.getElementById('nav-tests');
    }

    if (activeElement) {
        activeElement.classList.remove('hidden');
        activeElement.classList.add('animate-fade-in'); 
    }
    
    if (activeBtn) {
        activeBtn.classList.add('text-blue-600', 'scale-110');
        activeBtn.classList.remove('text-gray-400');
    }
}

let lastWidth = window.innerWidth;
window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return; 
    lastWidth = window.innerWidth;
    if (window.innerWidth >= 768) {
        document.getElementById('sidebar')?.classList.remove('hidden');
        document.getElementById('content')?.classList.remove('hidden');
        document.getElementById('widgets')?.classList.remove('hidden');
    } else {
        switchMobileTab('home');
    }
});

// =================================================================
// 🖼️ Reviews & Coming Soon Modal Logic
// =================================================================
function openReviewsModal() {
    const modal = document.getElementById('reviewsModal');
    if(!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => modal.classList.add('opacity-100'), 10);
    history.pushState({ modalOpen: true }, ""); 
}

function closeReviewsModal() {
    const modal = document.getElementById('reviewsModal');
    if(!modal) return;
    modal.classList.remove('opacity-100');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
}

window.addEventListener('popstate', function(event) {
    const modal = document.getElementById('reviewsModal');
    if (modal && !modal.classList.contains('hidden')) {
        closeReviewsModal();
    }
});

function showComingSoon(featureName, message) {
    const content = document.getElementById('content');
    const comingSoon = document.getElementById('coming-soon-container');
    content.classList.add('hidden');
    comingSoon.classList.remove('hidden');
    comingSoon.classList.add('animate-fade-in');
    document.getElementById('cs-title').innerText = `Your ${featureName} is Coming Soon!`;
    document.getElementById('cs-message').innerText = message;
    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.add('hidden');
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('text-blue-600', 'scale-110');
            btn.classList.add('text-gray-400');
        });
    }
}

function closeComingSoon() {
    document.getElementById('coming-soon-container').classList.add('hidden');
    const content = document.getElementById('content');
    content.classList.remove('hidden');
    content.classList.add('animate-fade-in');
    if (window.innerWidth < 768) {
        switchMobileTab('home'); 
    }
}

function resetToMainContent() {
    const comingSoon = document.getElementById('coming-soon-container');
    if (comingSoon && !comingSoon.classList.contains('hidden')) {
        closeComingSoon();
    }
}

// =================================================================
// 👆 Mobile Swipe Navigation Logic & Auto-Scroll
// =================================================================
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

const swipeOrder = ['profile', 'Home', 'Excel', 'PowerQuery', 'PowerBI', 'SQL', 'Tech', 'tests'];

function navigateToSwipeState(state) {
    if (state === 'profile') {
        switchMobileTab('profile');
    } else if (state === 'tests') {
        switchMobileTab('tests');
    } else {
        switchMobileTab('home'); 
        if (typeof loadCategory === 'function') {
            loadCategory(state, true); // Smooth transition
        }
    }
}

function handleSwipe() {
    if (window.innerWidth >= 768) return; 
    const quizModal = document.getElementById('quizModal');
    const reviewsModal = document.getElementById('reviewsModal');
    if (quizModal && !quizModal.classList.contains('hidden')) return;
    if (reviewsModal && !reviewsModal.classList.contains('hidden')) return;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        let currentState = 'Home';
        if (!document.getElementById('sidebar')?.classList.contains('hidden')) {
            currentState = 'profile';
        } else if (!document.getElementById('widgets')?.classList.contains('hidden')) {
            currentState = 'tests';
        } else if (typeof currentCategory !== 'undefined') {
            currentState = currentCategory;
        }

        let currentIndex = swipeOrder.indexOf(currentState);
        if (currentIndex === -1) currentIndex = 1; 

        if (diffX > 0 && currentIndex > 0) {
            navigateToSwipeState(swipeOrder[currentIndex - 1]);
        } else if (diffX < 0 && currentIndex < swipeOrder.length - 1) {
            navigateToSwipeState(swipeOrder[currentIndex + 1]);
        }
    }
}

document.addEventListener('touchstart', e => {
    if (e.target.closest('.overflow-x-auto')) return;
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', e => {
    if (e.target.closest('.overflow-x-auto')) return;
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe(); 
}, { passive: true });

// Auto-Load Next Category on Scroll
let isFetchingNext = false;
window.addEventListener('scroll', () => {
    if (window.innerWidth >= 768) return;
    const contentDiv = document.getElementById('content');
    if (!contentDiv || contentDiv.classList.contains('hidden')) return;
    
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 80; 
    
    if (scrollPosition >= threshold && !isFetchingNext) {
        isFetchingNext = true;
        
        let currentState = typeof currentCategory !== 'undefined' ? currentCategory : 'Home';
        let currentIndex = swipeOrder.indexOf(currentState);
        
        if (currentIndex >= 1 && currentIndex < swipeOrder.length - 2) { 
            const nextCategory = swipeOrder[currentIndex + 1];
            navigateToSwipeState(nextCategory);
        }
        
        setTimeout(() => { isFetchingNext = false; }, 2000); 
    }
});