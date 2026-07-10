// =================================================================
// 🌐 API ချိတ်ဆက်မှုနှင့် Data ခေါ်ယူသည့် အပိုင်း (api.js)
// =================================================================

// ⚠️ Database နှင့် ချိတ်ဆက်မည့် URL (TIS_Content_DB မှ Web App URL)
const CONTENT_DB_URL = "https://script.google.com/macros/s/AKfycbyPPCYnpCs4FuIlnmOP-Xfldqjq3NCr9wdEio96mtyg9Y0EuisM8Q6J9H9Gl1IJ1XGrqg/exec";

async function fetchArticles() {
    const container = document.getElementById('content-container');
    
    // Data မရောက်လာခင် Loading ပြသထားရန်
    container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-10">Loading modules...</div>';

    try {
        // Content DB မှ Data များ လှမ်းခေါ်ခြင်း
        const response = await fetch(CONTENT_DB_URL);
        const data = await response.json();

        // Data ရရှိပါက အောက်ပါအတိုင်း ဆက်လုပ်မည်
        if (data && data.length > 0) {
            // Layout ပုံစံ သတ်မှတ်ခြင်း (Desktop တွင် ၂ ခုတန်း၊ Mobile တွင် ၁ ခုတန်း)
            container.className = "grid grid-cols-1 md:grid-cols-2 gap-6";
            
            // ရရှိလာသော Data များကို Card များအဖြစ် ပြောင်းလဲခြင်း
            container.innerHTML = data.map(item => {
                let videoId = '';
                
                // YouTube URL မှ Video ID ကို ခွဲထုတ်ခြင်း
                if (item.Media_URL.includes('youtu.be/')) {
                    videoId = item.Media_URL.split('/').pop();
                } else if (item.Media_URL.includes('v=')) {
                    videoId = item.Media_URL.split('v=')[1].split('&')[0];
                }

                // =================================================================
                // 🎬 Premium Logic နှင့် Video ခေါ်ယူသည့် အပိုင်း
                // =================================================================
                // Is_Premium ကော်လံမှ တန်ဖိုးကို TRUE/FALSE စစ်ဆေးခြင်း
                const isPremium = String(item.Is_Premium).toUpperCase() === 'TRUE';
                
                // auth.js မှ Login အခြေအနေကို စစ်ဆေးခြင်း 
                // (typeof ဖြင့် စစ်ဆေးထားသောကြောင့် Error မတက်အောင် ကာကွယ်ထားပါသည်)
                const isLoggedIn = typeof checkLoginStatus === 'function' ? checkLoginStatus() : false; 

                // 🔒 Premium လည်းဖြစ်တယ်၊ Login လည်း မဝင်ရသေးဘူး ဆိုရင် Lock ချပါမည်
                const isLocked = isPremium && !isLoggedIn;

                return `
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col">
                    <div class="aspect-video w-full bg-gray-900 relative">
                        ${isLocked ? `
                            <!-- 🚫 Lock ကျနေသည့် အခြေအနေ (Login ဝင်ရန်လိုအပ်သည်) -->
                            <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="Premium Content" class="w-full h-full object-cover opacity-60 blur-[3px]">
                            <div class="absolute inset-0 flex flex-col items-center justify-center text-white">
                                <svg class="w-10 h-10 mb-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
                                <span class="font-bold text-sm tracking-wide">Premium Video</span>
                            </div>
                        ` : `
                            <!-- 🎥 ကြည့်ရှုခွင့်ရှိသည့် အခြေအနေ (YouTube Player တိုက်ရိုက်ပေါ်မည်) -->
                            <iframe class="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/${videoId}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        `}
                    </div>
                    
                    <div class="p-4 flex flex-col flex-grow">
                        <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">${item.Category}</span>
                        <h3 class="font-bold text-base mt-1 text-gray-800 line-clamp-2">${item.Title}</h3>
                        <p class="text-sm text-gray-600 mt-2 line-clamp-2 flex-grow">${item.Description}</p>
                        
                        ${isLocked ? `
                            <!-- 🔑 Lock ကျနေပါက Login Modal ဖွင့်မည့် ခလုတ်ပေါ်မည် -->
                            <div class="mt-4">
                                <button onclick="openLoginModal()" class="w-full block text-center bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition">🔒 Login to access</button>
                            </div>
                        ` : ``}
                    </div>
                </div>`;
            }).join(''); // 👈 ဒီနေရာမှာ .join('') ဖြင့် Array များကို HTML အဖြစ် ပေါင်းစည်းပါသည်
            
        } else {
            // Data မရှိပါက ပြသမည့် စာသား
            container.innerHTML = '<p class="col-span-full text-center text-gray-500">No content available.</p>';
        }
    } catch (error) {
        // ချိတ်ဆက်မှု အမှားအယွင်းရှိပါက ပြသမည့် စာသား
        console.error("Fetch error:", error);
        container.innerHTML = '<p class="col-span-full text-center text-red-500">Failed to load content.</p>';
    }
}