// =================================================================
// 🌐 API & Content Management (api.js)
// =================================================================

// ⚠️ Database URLs (Category အလိုက် Google Sheets မှ Web App URLs များ)
// 💡 အသစ် Deploy လုပ်တိုင်း သက်ဆိုင်ရာ နေရာတွင် လင့်ခ်များ လာရောက် အစားထိုးနိုင်ပါသည်။
const CONTENT_DBS = {
    'Home': "https://script.google.com/macros/s/AKfycbyPPCYnpCs4FuIlnmOP-Xfldqjq3NCr9wdEio96mtyg9Y0EuisM8Q6J9H9Gl1IJ1XGrqg/exec",
    'Excel': "URL_HERE",       // Excel အတွက် Deploy လုပ်ထားသော လင့်ခ်ထည့်ရန်
    'PowerQuery': "URL_HERE",  // Power Query အတွက် လင့်ခ်
    'PowerBI': "URL_HERE",     // Power BI အတွက် လင့်ခ်
    'SQL': "URL_HERE"          // SQL အတွက် လင့်ခ်
};

// 🎨 Theme Colors (Software အလိုက် အရောင်များ)
const THEMES = {
    'Home': { text: 'text-blue-600', border: 'border-blue-100', tag: 'bg-blue-50 text-blue-600' },
    'Excel': { text: 'text-green-700', border: 'border-green-200', tag: 'bg-green-50 text-green-700' },
    'PowerQuery': { text: 'text-orange-600', border: 'border-orange-200', tag: 'bg-orange-50 text-orange-600' },
    'PowerBI': { text: 'text-yellow-600', border: 'border-yellow-200', tag: 'bg-yellow-50 text-yellow-700' },
    'SQL': { text: 'text-sky-600', border: 'border-sky-200', tag: 'bg-sky-50 text-sky-600' }
};

let currentCategory = 'Home';

// --------------------------------------------------
// ၁။ Navbar မှ နှိပ်လိုက်သောအခါ သက်ဆိုင်ရာ Category ကို ခေါ်ယူခြင်း
// --------------------------------------------------
async function loadCategory(categoryName) {
    currentCategory = categoryName;
    const targetUrl = CONTENT_DBS[categoryName];
    const container = document.getElementById('content'); // အဓိက Content ပြသမည့်နေရာ
    
    // URL မချိတ်ရသေးပါက Placeholder ပြသမည်
    if (!targetUrl || targetUrl === "URL_HERE") {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                <div class="text-6xl mb-6 animate-bounce">🚧</div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">${categoryName} Content is Coming Soon!</h2>
                <p class="text-gray-500 max-w-sm mx-auto">အချက်အလက်များ ဖြည့်သွင်းနေဆဲဖြစ်ပါသည်။ Database ချိတ်ဆက်ပြီးပါက ဤနေရာတွင် ပေါ်လာပါမည်။</p>
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
    
    container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-10 font-bold">Data များ ဆွဲယူနေပါသည်... ⏳</div>';

    try {
        const response = await fetch(apiUrl);
        const result = await response.json();
        
        // API မှ data ကို array အဖြစ် တိုက်ရိုက်ပြန်ပေးလျှင် result ကိုသုံးမည်၊ သို့မဟုတ် result.data ကိုသုံးမည်
        const data = result.data ? result.data : result;

        if (data && data.length > 0) {
            container.className = "flex flex-col gap-6 w-full";
            
            container.innerHTML = data.map(item => {
                // =================================================================
                // 🎬 Media Logic (YouTube Video လား? ပုံလား? ခွဲခြားခြင်း)
                // =================================================================
                let mediaContent = '';
                const mediaVal = item.Media_URL ? item.Media_URL.trim() : '';

                if (mediaVal.includes('youtu.be/') || mediaVal.includes('youtube.com/')) {
                    // YouTube Video ဖြစ်လျှင်
                    let videoId = '';
                    if (mediaVal.includes('youtu.be/')) {
                        videoId = mediaVal.split('youtu.be/')[1].split('?')[0];
                    } else if (mediaVal.includes('v=')) {
                        videoId = mediaVal.split('v=')[1].split('&')[0];
                    }
                    mediaContent = `<iframe class="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
                
                } else if (mediaVal.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                    // Image File (Media_Files ဖိုဒါထဲမှ ပုံ) ဖြစ်လျှင်
                    mediaContent = `<img src="Media_Files/${mediaVal}" class="absolute top-0 left-0 w-full h-full object-cover" alt="${item.Title}">`;
                
                } else {
                    // မည်သည့် Link မှ မရှိလျှင် ပြသမည့် Placeholder
                    mediaContent = `<div class="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 font-bold">No Media Available</div>`;
                }

                // Premium & Login Check
                const isPremium = String(item.Is_Premium).toUpperCase() === 'TRUE';
                const isLoggedIn = typeof checkLoginStatus === 'function' ? checkLoginStatus() : false; 
                const isLocked = isPremium && !isLoggedIn;

                // Card အား Theme အရောင်များဖြင့် ဖန်တီးခြင်း
                return `
                <div class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden border ${theme.border} w-full relative overflow-hidden">
                    
                    <!-- 🎨 ဘယ်ဘက်ခြမ်းမှ အရောင်လိုင်းလေး -->
                    <div class="absolute left-0 top-0 bottom-0 w-1 ${theme.tag.split(' ')[0]}"></div>

                    <div class="aspect-video w-full bg-gray-900 relative">
                        ${isLocked ? `
                            <div class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-white z-10 backdrop-blur-sm">
                                <svg class="w-10 h-10 mb-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
                                <span class="font-bold text-sm tracking-wide">Premium Access</span>
                            </div>
                            <!-- Lock ဖြစ်နေလျှင် ပုံ (သို့) Iframe ကို Blur လုပ်ပြမည် -->
                            <div class="w-full h-full opacity-30 blur-sm pointer-events-none">${mediaContent}</div>
                        ` : `
                            ${mediaContent}
                        `}
                    </div>
                    
                    <div class="p-6 pl-8 flex flex-col flex-grow">
                        <span class="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider w-max mb-2 ${theme.tag}">${item.Category || categoryName}</span>
                        
                        <h3 class="font-bold text-xl mt-1 text-gray-800">${item.Title}</h3>
                        <p class="text-sm text-gray-600 mt-3 leading-relaxed border-l-2 border-gray-100 pl-3">${item.Body_Text || item.Description}</p>
                        
                        ${isLocked ? `
                            <div class="mt-5">
                                <button onclick="openLoginModal()" class="w-full block text-center bg-slate-100 text-slate-700 py-3 rounded-lg text-sm font-bold hover:bg-slate-200 transition">🔒 Login to access content</button>
                            </div>
                        ` : ``}
                    </div>
                </div>`;
            }).join(''); 
            
        } else {
            container.innerHTML = `
                <div class="p-10 text-center bg-white rounded-xl shadow-sm border border-gray-100">
                    <p class="text-gray-500 font-bold">No content available for ${categoryName} yet.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Fetch error:", error);
        container.innerHTML = '<p class="col-span-full text-center text-red-500 font-bold bg-red-50 p-4 rounded-xl border border-red-200">Failed to load content. Please check internet connection.</p>';
    }
}

// =================================================================
// 🌐 Website စတင်ချိန်တွင် Home Page ကို အလိုအလျောက် ခေါ်ယူရန်
// =================================================================
window.addEventListener('DOMContentLoaded', () => {
    loadCategory('Home');
});