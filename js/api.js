// =================================================================
// 🌐 API & Content Management (api.js)
// =================================================================

// ⚠️ Database URLs
const CONTENT_DBS = {
    'Home': "https://script.google.com/macros/s/AKfycbyPPCYnpCs4FuIlnmOP-Xfldqjq3NCr9wdEio96mtyg9Y0EuisM8Q6J9H9Gl1IJ1XGrqg/exec",
    'Excel': "https://script.google.com/macros/s/AKfycby4sTVq6cFMH7YovaqO5Wa6PcIgchWlWkIxEoORN-jPG_iH41Rimfg0t9aN-npl4SG5TQ/exec",       
    'PowerQuery': "https://script.google.com/macros/s/AKfycbxbBHgpL6tKsw5waEi7ZW5VGgN0bQKDdRj0WPqA99135iDZevfZjZMHxUmfNWsjYD-d/exec",  
    'PowerBI': "https://script.google.com/macros/s/AKfycbxMtcuWUCfD4bci7P3ICK01p5AsoGPOw99Gp1SRWlIWqVJaI5CTAXsWYXFG_XuljKu0/exec",    
    'SQL': "https://script.google.com/macros/s/AKfycbz-wNDbALMpxtuHKe9PGUUb3zlSof-HEuh_IUDG7cu5DhUOWXwMDsqPlEa5f-fNpVYVcw/exec"          
};

// 🎨 Theme Colors (Borders အစား Soft Tags များဖြင့် ပြင်ဆင်ထားသည်)
const THEMES = {
    'Home': { text: 'text-blue-600', tag: 'bg-blue-50 text-blue-700' },
    'Excel': { text: 'text-green-600', tag: 'bg-green-50 text-green-700' },
    'PowerQuery': { text: 'text-orange-600', tag: 'bg-orange-50 text-orange-700' },
    'PowerBI': { text: 'text-yellow-600', tag: 'bg-yellow-50 text-yellow-700' },
    'SQL': { text: 'text-sky-600', tag: 'bg-sky-50 text-sky-700' }
};

let currentCategory = 'Home';

// 💡 ရောက်နေသော Category ကို အရောင်ရင့်ပြပြီး ကျန်တာကို အရောင်ဖျော့ပေးမည့် အပိုင်း
    document.querySelectorAll('.nav-item').forEach(el => {
        if (el.getAttribute('data-category') === categoryName) {
            // ရောက်နေသော နေရာ (Dark Blue + Background)
            el.className = "nav-item text-sm font-extrabold text-blue-800 bg-blue-50 px-3.5 py-2 rounded-full transition-all";
        } else {
            // မရောက်သော နေရာများ (Gray ဖျော့ဖျော့)
            el.className = "nav-item text-sm font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50 px-3.5 py-2 rounded-full transition-all";
        }
    });

// --------------------------------------------------
// ၁။ Navbar မှ နှိပ်လိုက်သောအခါ သက်ဆိုင်ရာ Category ကို ခေါ်ယူခြင်း
// --------------------------------------------------
async function loadCategory(categoryName) {
    // 💡 Mobile တွင် Menu နှိပ်လိုက်ပါက Content (Home Tab) ဆီသို့ အလိုအလျောက် သွားပေးမည်
    if (window.innerWidth < 768 && typeof switchMobileTab === 'function') {
        switchMobileTab('home');
    }

    currentCategory = categoryName;
    const targetUrl = CONTENT_DBS[categoryName];
    const container = document.getElementById('content'); 
    
    // URL မချိတ်ရသေးပါက Placeholder ပြသမည်
    if (!targetUrl || targetUrl === "URL_HERE") {
        container.className = "md:col-span-6 w-full";
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-16 text-center">
                <div class="text-6xl mb-6 animate-pulse">🚧</div>
                <h2 class="text-2xl font-extrabold text-gray-800 mb-2">${categoryName} Content is Coming Soon!</h2>
                <p class="text-gray-500 max-w-sm mx-auto text-sm">အချက်အလက်များ ဖြည့်သွင်းနေဆဲဖြစ်ပါသည်။ Database ချိတ်ဆက်ပြီးပါက ဤနေရာတွင် ပေါ်လာပါမည်။</p>
            </div>
        `;
        return;
    }

    await fetchArticles(targetUrl, categoryName);
}

// --------------------------------------------------
// ၂။ Data လှမ်းဆွဲခြင်း နှင့် UI Render လုပ်ခြင်း
// --------------------------------------------------
async function fetchArticles(apiUrl, categoryName) {
    const container = document.getElementById('content');
    const theme = THEMES[categoryName] || THEMES['Home'];
    
    // Loading State
    container.className = "md:col-span-6 w-full";
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] opacity-80">
            <div class="w-10 h-10 border-[3px] border-gray-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p class="text-sm font-semibold text-gray-400 tracking-wide uppercase">Data များ ဆွဲယူနေပါသည်...</p>
        </div>
    `;

    try {
        const response = await fetch(apiUrl);
        const result = await response.json();
        const data = result.data ? result.data : result;

        if (data && data.length > 0) {
            // Cards များကြား Spacing အနည်းငယ် ချဲထားပါသည် (gap-8)
            container.className = "md:col-span-6 flex flex-col gap-8 w-full";
            
            container.innerHTML = data.map(item => {
                let mediaContent = '';
                const mediaVal = item.Media_URL ? item.Media_URL.trim() : '';

                if (mediaVal.includes('youtu.be/') || mediaVal.includes('youtube.com/')) {
                    let videoId = '';
                    if (mediaVal.includes('youtu.be/')) {
                        videoId = mediaVal.split('youtu.be/')[1].split('?')[0];
                    } else if (mediaVal.includes('v=')) {
                        videoId = mediaVal.split('v=')[1].split('&')[0];
                    }
                    mediaContent = `<iframe class="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
                } else if (mediaVal.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                    mediaContent = `<img src="Media_Files/${mediaVal}" class="absolute top-0 left-0 w-full h-full object-cover" alt="${item.Title}">`;
                } else {
                    mediaContent = `<div class="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400 font-medium text-sm">No Media Available</div>`;
                }

                const isPremium = String(item.Is_Premium).toUpperCase() === 'TRUE';
                const isLoggedIn = typeof checkLoginStatus === 'function' ? checkLoginStatus() : false; 
                const isLocked = isPremium && !isLoggedIn;

                return `
                <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col overflow-hidden w-full relative">
                    
                    <div class="aspect-video w-full bg-slate-900 relative">
                        ${isLocked ? `
                            <div class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md text-white z-10">
                                <div class="p-3 bg-white/10 rounded-full mb-3 backdrop-blur-lg">
                                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                </div>
                                <span class="font-extrabold text-sm tracking-widest uppercase">Premium Access</span>
                            </div>
                            <div class="w-full h-full opacity-40 pointer-events-none">${mediaContent}</div>
                        ` : `
                            ${mediaContent}
                        `}
                    </div>
                    
                    <div class="p-6 md:p-8 flex flex-col flex-grow">
                        <span class="inline-block px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest w-max mb-3 ${theme.tag}">${item.Category || categoryName}</span>
                        
                        <h3 class="font-bold text-lg sm:text-xl mt-1 text-gray-900 tracking-tight leading-snug">${item.Title}</h3>
                        
                        <p class="text-[13px] text-gray-600 mt-3 leading-relaxed">${item.Body_Text || item.Description}</p>
                        
                        ${isLocked ? `
                            <div class="mt-6">
                                <button onclick="openLoginModal()" class="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3.5 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                                    Login to Access
                                </button>
                            </div>
                        ` : ``}
                    </div>
                </div>`;
            }).join(''); 
            
        } else {
            container.innerHTML = `
                <div class="p-16 text-center bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] w-full">
                    <p class="text-gray-400 font-medium">No content available for ${categoryName} yet.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Fetch error:", error);
        container.innerHTML = `
            <div class="text-center text-red-500 font-bold bg-red-50 p-6 rounded-3xl w-full">
                Failed to load content. Please check internet connection.
            </div>
        `;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadCategory('Home');
});