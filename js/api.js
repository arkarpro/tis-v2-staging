// ကိုကိုအာကာ့ TIS_Content_DB ရဲ့ Web App URL
const CONTENT_DB_URL = "https://script.google.com/macros/s/AKfycbyPPCYnpCs4FuIlnmOP-Xfldqjq3NCr9wdEio96mtyg9Y0EuisM8Q6J9H9Gl1IJ1XGrqg/exec";

async function fetchArticles() {
    const container = document.getElementById('content-container');
    try {
        // Data လှမ်းခေါ်ခြင်း (Parameter မလိုတော့ပါ)
        const response = await fetch(CONTENT_DB_URL);
        const data = await response.json();

        // Data ရှိရင် Card များအဖြစ် ပြောင်းလဲခြင်း
        if (data.length > 0) {
            container.innerHTML = data.map(item => `
                <div class="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                    <!-- Category လေးကို ခေါင်းစဉ်အပေါ်မှာ ပြမယ် -->
                    <span class="text-xs font-bold text-tis-primary uppercase tracking-wider">${item.Category}</span>
                    
                    <h3 class="font-bold text-lg text-gray-800 mt-1">${item.Title}</h3>
                    <p class="text-sm text-gray-600 mt-2">${item.Description}</p>
                    
                    <!-- YouTube Video Link ကို ခလုတ်အနေနဲ့ ပြမယ် -->
                    <div class="mt-4">
                        <a href="${item.Media_URL}" target="_blank" class="text-sm bg-gray-100 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition">
                            ▶ ဗီဒီယိုကြည့်ရန်
                        </a>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `<p class="text-center text-gray-500">လက်ရှိတွင် သင်ခန်းစာများ မရှိသေးပါ။</p>`;
        }
    } catch (error) {
        console.error("Error loading articles:", error);
        container.innerHTML = `<p class="text-center text-red-500">Data ဆွဲယူရာတွင် အမှားအယွင်းရှိနေပါသည်။</p>`;
    }
}