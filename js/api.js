const CONTENT_DB_URL = "https://script.google.com/macros/s/AKfycbyPPCYnpCs4FuIlnmOP-Xfldqjq3NCr9wdEio96mtyg9Y0EuisM8Q6J9H9Gl1IJ1XGrqg/exec";

async function fetchArticles() {
    const container = document.getElementById('content-container');
    container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-10">Loading modules...</div>';

    try {
        const response = await fetch(CONTENT_DB_URL);
        const data = await response.json();

        if (data && data.length > 0) {
            container.className = "grid grid-cols-1 md:grid-cols-2 gap-6";
            
            container.innerHTML = data.map(item => {
                let videoId = '';
                if (item.Media_URL.includes('youtu.be/')) {
                    videoId = item.Media_URL.split('/').pop();
                } else if (item.Media_URL.includes('v=')) {
                    videoId = item.Media_URL.split('v=')[1].split('&')[0];
                }

                // Premium Logic: TRUE ဆိုလျှင် Login ဝင်မှ ကြည့်ရမည်
                const isPremium = String(item.Is_Premium).toUpperCase() === 'TRUE';

                return `
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col">
                    <div class="aspect-video w-full bg-gray-900 relative">
                        ${isPremium ? `
                            <!-- Premium ဖြစ်နေလျှင် - ပုံကိုဝါးထားပြီး Lock ပြမည် -->
                            <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="Premium Content" class="w-full h-full object-cover opacity-60 blur-[3px]">
                            <div class="absolute inset-0 flex flex-col items-center justify-center text-white">
                                <svg class="w-10 h-10 mb-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
                                <span class="font-bold text-sm tracking-wide">Premium Video</span>
                            </div>
                        ` : `
                            <!-- Premium မဟုတ်လျှင် - YouTube Player တိုက်ရိုက်ပေါ်မည် -->
                            <iframe class="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/${videoId}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        `}
                    </div>
                    
                    <div class="p-4 flex flex-col flex-grow">
                        <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">${item.Category}</span>
                        <h3 class="font-bold text-base mt-1 text-gray-800 line-clamp-2">${item.Title}</h3>
                        <p class="text-sm text-gray-600 mt-2 line-clamp-2 flex-grow">${item.Description}</p>
                        
                        ${isPremium ? `
                            <!-- Premium ဖြစ်လျှင် Login ဝင်ရန် ခလုတ်ပေါ်မည် -->
                            <div class="mt-4">
                                <button onclick="alert('ဒီသင်ခန်းစာကို ကြည့်ရှုရန် Login ဝင်ပေးပါ။')" class="w-full block text-center bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition">🔒 Login to access</button>
                            </div>
                        ` : ``}
                    </div>
                </div>`;
            }).join('');
        } else {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500">No content available.</p>';
        }
    } catch (error) {
        console.error("Fetch error:", error);
        container.innerHTML = '<p class="col-span-full text-center text-red-500">Failed to load content.</p>';
    }
}