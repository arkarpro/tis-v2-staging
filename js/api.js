// =================================================================
// 🌐 TIS Master API & Single-Page Render Engine
// =================================================================

// 💡 သင်ပေးပို့ထားသော API လင့်ခ်အသစ်
const MASTER_API = "https://script.google.com/macros/s/AKfycbxtl1Si4Sq9BVBeY8HAtj14jl4QytHMODvHE9KdsRzypfor73icEFDa-SJuks8BffIQzw/exec";

const THEMES = {
    'Home': { text: 'text-blue-600', tag: 'bg-blue-50 text-blue-700' },
    'Excel': { text: 'text-green-600', tag: 'bg-green-50 text-green-700' },
    'PowerQuery': { text: 'text-orange-600', tag: 'bg-orange-50 text-orange-700' },
    'PowerBI': { text: 'text-yellow-600', tag: 'bg-yellow-50 text-yellow-700' },
    'SQL': { text: 'text-sky-600', tag: 'bg-sky-50 text-sky-700' },
    'Tech': { text: 'text-purple-600', tag: 'bg-purple-50 text-purple-700' }
};

let APP_DATA = null;
let currentCategory = 'Home';

// --------------------------------------------------
// 1. Data တစ်ခါတည်း ဆွဲယူခြင်း (One-time Fetch)
// --------------------------------------------------
async function fetchMasterData() {
    const container = document.getElementById('content');
    
    // Loading State
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-32 h-screen">
            <div class="w-12 h-12 border-[4px] border-gray-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <h2 class="text-xl font-extrabold text-gray-800 mb-1 tracking-tight">TIS Learning</h2>
            <p class="text-xs font-bold text-gray-400 tracking-widest uppercase">Building your workspace...</p>
        </div>
    `;

    try {
        const response = await fetch(MASTER_API);
        APP_DATA = await response.json();
        
        // Data ရပြီဆိုပါက HTML အားလုံးကို တစ်ခါတည်း တည်ဆောက်မည်
        renderAllContent();
        
    } catch (error) {
        console.error("Fetch error:", error);
        container.innerHTML = `<div class="text-center text-red-500 font-bold bg-red-50 p-6 rounded-3xl w-full mt-10">Failed to load workspace. Please check your connection.</div>`;
    }
}

// --------------------------------------------------
// 2. HTML အပိုင်းအားလုံးကို အစဉ်လိုက် တည်ဆောက်ခြင်း
// --------------------------------------------------
function renderAllContent() {
    const container = document.getElementById('content');
    container.className = "md:col-span-6 w-full pb-32"; // pb-32 for bottom scrolling space
    let finalHTML = '';

    // ==========================================
    // Section 1: HOME (Hero + Random Feed)
    // ==========================================
    finalHTML += `<div id="section-Home" class="scroll-section scroll-mt-20 flex flex-col gap-8 w-full pt-4">`;
    finalHTML += getHomeHeroHTML();
    
    // Mix all posts for Home Feed
    let allPosts = [];
    ['Excel', 'PowerQuery', 'PowerBI', 'SQL', 'Tech'].forEach(key => {
        if(APP_DATA[key] && Array.isArray(APP_DATA[key])) {
            allPosts = allPosts.concat(APP_DATA[key].map(p => ({...p, OriginCategory: key})));
        }
    });
    if (allPosts.length > 0) {
        allPosts = allPosts.sort(() => 0.5 - Math.random()).slice(0, 15); // Show 15 random posts
        finalHTML += generateCardsHTML(allPosts, 'Home');
    }
    finalHTML += `</div>`;

    // ==========================================
    // Section 2: EXCEL
    // ==========================================
    finalHTML += `<div id="section-Excel" class="scroll-section scroll-mt-24 mt-16 pt-10 border-t border-gray-100 flex flex-col gap-8 w-full">`;
    finalHTML += `<div class="flex items-center gap-3 mb-2"><span class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">E</span><h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Excel Insights</h2></div>`;
    if (APP_DATA['Excel'] && APP_DATA['Excel'].length > 0) finalHTML += generateCardsHTML(APP_DATA['Excel'], 'Excel');
    else finalHTML += getEmptyStateHTML('Excel');
    finalHTML += `</div>`;

    // ==========================================
    // Section 3: POWER QUERY
    // ==========================================
    finalHTML += `<div id="section-PowerQuery" class="scroll-section scroll-mt-24 mt-16 pt-10 border-t border-gray-100 flex flex-col gap-8 w-full">`;
    finalHTML += `<div class="flex items-center gap-3 mb-2"><span class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">PQ</span><h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Power Query</h2></div>`;
    if (APP_DATA['PowerQuery'] && APP_DATA['PowerQuery'].length > 0) finalHTML += generateCardsHTML(APP_DATA['PowerQuery'], 'PowerQuery');
    else finalHTML += getEmptyStateHTML('Power Query');
    finalHTML += `</div>`;

    // ==========================================
    // Section 4: POWER BI
    // ==========================================
    finalHTML += `<div id="section-PowerBI" class="scroll-section scroll-mt-24 mt-16 pt-10 border-t border-gray-100 flex flex-col gap-8 w-full">`;
    finalHTML += `<div class="flex items-center gap-3 mb-2"><span class="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold">BI</span><h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Power BI</h2></div>`;
    if (APP_DATA['PowerBI'] && APP_DATA['PowerBI'].length > 0) finalHTML += generateCardsHTML(APP_DATA['PowerBI'], 'PowerBI');
    else finalHTML += getEmptyStateHTML('Power BI');
    finalHTML += `</div>`;

    // ==========================================
    // Section 5: SQL (Static + Data)
    // ==========================================
    finalHTML += `<div id="section-SQL" class="scroll-section scroll-mt-24 mt-16 pt-10 border-t border-gray-100 flex flex-col gap-8 w-full">`;
    finalHTML += `<div class="flex items-center gap-3 mb-2"><span class="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold">DB</span><h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">SQL Server</h2></div>`;
    finalHTML += getSQLStaticHTML();
    if (APP_DATA['SQL'] && APP_DATA['SQL'].length > 0) finalHTML += generateCardsHTML(APP_DATA['SQL'], 'SQL');
    finalHTML += `</div>`;

    // ==========================================
    // Section 6: TECH (Static + Data)
    // ==========================================
    finalHTML += `<div id="section-Tech" class="scroll-section scroll-mt-24 mt-16 pt-10 border-t border-gray-100 flex flex-col gap-8 w-full">`;
    finalHTML += `<div class="flex items-center gap-3 mb-2"><span class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">Dev</span><h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Python & Dev</h2></div>`;
    finalHTML += getTechStaticHTML();
    if (APP_DATA['Tech'] && APP_DATA['Tech'].length > 0) finalHTML += generateCardsHTML(APP_DATA['Tech'], 'Tech');
    finalHTML += `</div>`;

    // Add everything to DOM
    container.innerHTML = finalHTML;
    
    // Initialize ScrollSpy to track where user is reading
    if (typeof setupScrollSpy === 'function') setupScrollSpy();
}

// --------------------------------------------------
// 3. Navigation (Scroll to Anchor)
// --------------------------------------------------
function loadCategory(categoryName) {
    if (window.innerWidth < 768 && typeof switchMobileTab === 'function') {
        switchMobileTab('home');
    }
    
    const targetSection = document.getElementById('section-' + categoryName);
    if (targetSection) {
        // Smooth scroll to the specific section
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function updateTopNavbarUI(categoryName) {
    currentCategory = categoryName;
    document.querySelectorAll('.nav-item').forEach(el => {
        if (el.getAttribute('data-category') === categoryName) {
            el.className = "nav-item text-[15px] font-extrabold text-blue-800 bg-blue-50 px-4 py-2 rounded-full transition-all duration-300 shadow-sm";
        } else {
            el.className = "nav-item text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-3.5 py-2 rounded-full transition-all duration-300";
        }
    });
}

// --------------------------------------------------
// 4. HTML Generators
// --------------------------------------------------
function generateCardsHTML(dataArray, fallbackCategory) {
    return dataArray.map(item => {
        let mediaContent = '';
        const mediaVal = item.Media_URL ? item.Media_URL.trim() : '';

        if (mediaVal.includes('youtu.be/') || mediaVal.includes('youtube.com/')) {
            let videoId = '';
            if (mediaVal.includes('youtu.be/')) videoId = mediaVal.split('youtu.be/')[1].split('?')[0];
            else if (mediaVal.includes('v=')) videoId = mediaVal.split('v=')[1].split('&')[0];
            mediaContent = `<iframe class="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
        } else if (mediaVal.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
            mediaContent = `<img src="Media_Files/${mediaVal}" class="absolute top-0 left-0 w-full h-full object-cover" alt="${item.Title}">`;
        } else {
            mediaContent = `<div class="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400 font-medium text-sm">No Media Available</div>`;
        }

        const isPremium = String(item.Is_Premium).toUpperCase() === 'TRUE';
        const isLoggedIn = typeof checkLoginStatus === 'function' ? checkLoginStatus() : false; 
        const isLocked = isPremium && !isLoggedIn;

        const activeCategoryName = item.OriginCategory || item.Category || fallbackCategory;
        const theme = THEMES[activeCategoryName] || THEMES['Home'];

        return `
        <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col overflow-hidden w-full relative animate-fade-in">
            <div class="aspect-video w-full bg-slate-900 relative">
                ${isLocked ? `
                    <div class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md text-white z-10">
                        <div class="p-3 bg-white/10 rounded-full mb-3 backdrop-blur-lg"><svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></div>
                        <span class="font-extrabold text-sm tracking-widest uppercase">Premium Access</span>
                    </div>
                    <div class="w-full h-full opacity-40 pointer-events-none">${mediaContent}</div>
                ` : `${mediaContent}`}
            </div>
            <div class="p-6 md:p-8 flex flex-col flex-grow">
                <span class="inline-block px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest w-max mb-3 ${theme.tag}">${activeCategoryName}</span>
                <h3 class="font-bold text-lg sm:text-xl mt-1 text-gray-900 tracking-tight leading-snug">${item.Title}</h3>
                <p class="text-[13px] text-gray-600 mt-3 leading-relaxed">${item.Body_Text || item.Description}</p>
            </div>
        </div>`;
    }).join(''); 
}

function getEmptyStateHTML(cat) {
    return `<div class="p-10 text-center bg-gray-50 border border-gray-100 rounded-3xl w-full flex items-center justify-center"><p class="text-gray-400 text-sm font-medium">Content for ${cat} will appear here soon.</p></div>`;
}

function getHomeHeroHTML() {
    return `
        <!-- 💡 အမည်းရောင်အစား မျက်စိအေးပြီး လင်းလက်သော Education Light Theme သို့ ပြောင်းထားသည် -->
        <div class="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl p-8 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-blue-100 mb-2 animate-fade-in">
            <h2 class="text-2xl sm:text-3xl font-extrabold mb-6 tracking-tight flex items-center gap-3 text-slate-900">
                <span class="text-yellow-500">⚡</span> Empowering Decisions
            </h2>
            <div class="grid sm:grid-cols-2 gap-8">
                <div>
                    <h4 class="text-xs font-extrabold text-blue-600 uppercase tracking-widest mb-2">Our Vision</h4>
                    <p class="text-slate-600 text-[13px] leading-relaxed font-medium">Empowering smarter decisions through data-driven insights.</p>
                </div>
                <div>
                    <h4 class="text-xs font-extrabold text-blue-600 uppercase tracking-widest mb-2">Our Mission</h4>
                    <p class="text-slate-600 text-[13px] leading-relaxed font-medium">Helping professionals unlock the power of data with practical Excel & Power BI training.</p>
                </div>
            </div>
            
            <div class="mt-8 pt-8 border-t border-blue-100 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <div class="w-16 h-16 rounded-full bg-white p-1 overflow-hidden flex-shrink-0 mx-auto sm:mx-0 shadow-sm border border-gray-100">
                    <img src="Media_Files/tis_logo.webp" class="w-full h-full rounded-full object-cover">
                </div>
                <div>
                    <h3 class="font-extrabold text-lg text-slate-900">Arkar Linn</h3>
                    <p class="text-blue-600 text-[10px] font-extrabold uppercase tracking-widest mb-1">Senior Executive & Founder</p>
                    <p class="text-slate-500 text-xs leading-relaxed max-w-sm font-medium">Advising CEO and Board on nationwide operational strategy. Trained over 300+ students in advanced data skills.</p>
                </div>
            </div>
        </div>
    `;
}

function getSQLStaticHTML() {
    return `
        <div class="bg-slate-900 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden text-white flex flex-col w-full mb-2">
            <div class="w-full bg-slate-950">
                <img src="Media_Files/proj-sql.jpg" alt="SQL Data Warehouse" class="w-full aspect-video object-cover object-top opacity-80 hover:opacity-100 transition-opacity duration-300">
            </div>
            <div class="p-8 md:p-10 w-full flex flex-col justify-center">
                <div class="mb-4"><span class="bg-yellow-500 text-slate-900 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">Data Engineering</span></div>
                <h3 class="font-extrabold text-2xl sm:text-3xl mb-4 tracking-tight leading-snug text-white">SQL Data Warehouse & Analytics</h3>
                <p class="text-gray-300 text-[13px] mb-8 leading-relaxed">A complete end-to-end data engineering project demonstrating <strong>Medallion Architecture</strong>. Includes ETL pipelines, data modeling, and reporting with SQL Server.</p>
                <div class="flex">
                    <a href="https://github.com/arkarpro/sql-data-warehouse-project" target="_blank" class="bg-white text-slate-900 font-bold py-3.5 px-6 rounded-xl hover:bg-gray-100 transition-all duration-300 text-sm flex items-center gap-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> View Repository
                    </a>
                </div>
            </div>
        </div>
    `;
}

function getTechStaticHTML() {
    return `
        <!-- Project Grid -->
        <div class="grid md:grid-cols-2 gap-8 mb-2">
            <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
                <img src="Media_Files/proj-population.jpg" alt="Population" class="w-full aspect-video object-cover object-top">
                <div class="p-6 flex flex-col flex-grow">
                    <div class="mb-3"><span class="bg-red-50 text-red-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">Streamlit</span></div>
                    <h3 class="font-bold text-lg text-slate-900 mb-2 leading-snug">Myanmar Population Analytics</h3>
                    <p class="text-gray-600 text-[12px] mb-4 flex-grow">Interactive dashboard allowing users to filter census data by State, District, and Township.</p>
                    <a href="https://dynamic-dashboard-filters.streamlit.app/" target="_blank" class="inline-flex items-center text-blue-600 font-bold text-sm hover:text-blue-800">View Live App &rarr;</a>
                </div>
            </div>
            <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
                <img src="Media_Files/proj-titanic.jpg" alt="Titanic" class="w-full aspect-video object-cover object-top">
                <div class="p-6 flex flex-col flex-grow">
                    <div class="mb-3"><span class="bg-red-50 text-red-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">Streamlit</span></div>
                    <h3 class="font-bold text-lg text-slate-900 mb-2 leading-snug">Titanic EDA Dashboard</h3>
                    <p class="text-gray-600 text-[12px] mb-4 flex-grow">Comprehensive EDA of the Titanic dataset, visualizing survival rates by demographic.</p>
                    <a href="https://titanic-eda-dashboard-dkd68fsawayaumwjkkow85.streamlit.app/" target="_blank" class="inline-flex items-center text-blue-600 font-bold text-sm hover:text-blue-800">View Live App &rarr;</a>
                </div>
            </div>
            <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
                <img src="Media_Files/proj-target.jpg" alt="Target" class="w-full aspect-video object-cover object-top">
                <div class="p-6 flex flex-col flex-grow">
                    <div class="mb-3"><span class="bg-red-50 text-red-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">Streamlit</span></div>
                    <h3 class="font-bold text-lg text-slate-900 mb-2 leading-snug">Target vs Actual KPI Tracker</h3>
                    <p class="text-gray-600 text-[12px] mb-4 flex-grow">Performance tracking dashboard comparing Target vs Actual sales across regions.</p>
                    <a href="https://targetvsactual-arkarpro.streamlit.app/" target="_blank" class="inline-flex items-center text-blue-600 font-bold text-sm hover:text-blue-800">View Live App &rarr;</a>
                </div>
            </div>
            <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
                <img src="Media_Files/proj-pass.jpg" alt="Password" class="w-full aspect-video object-cover object-top">
                <div class="p-6 flex flex-col flex-grow">
                    <div class="mb-3"><span class="bg-blue-50 text-blue-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">Web Tool</span></div>
                    <h3 class="font-bold text-lg text-slate-900 mb-2 leading-snug">Secure Password Generator</h3>
                    <p class="text-gray-600 text-[12px] mb-4 flex-grow">A handy utility tool built to generate strong, randomized passwords.</p>
                    <a href="https://arkarpro.github.io/password_generator/" target="_blank" class="inline-flex items-center text-blue-600 font-bold text-sm hover:text-blue-800">View Live Tool &rarr;</a>
                </div>
            </div>
        </div>
        
        <!-- Github Chart -->
        <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 p-8 w-full text-center mb-2">
            <h4 class="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-6">My Coding Activity</h4>
            <img src="https://ghchart.rshah.org/3b82f6/arkarpro" alt="Arkar's Github Chart" class="mx-auto w-full md:w-3/4 opacity-90">
        </div>
    `;
}