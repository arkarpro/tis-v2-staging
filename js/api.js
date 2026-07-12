// =================================================================
// 🌐 API & Content Management Engine (with Caching & Random Feed)
// =================================================================

const CONTENT_DBS = {
    'Home': "https://script.google.com/macros/s/AKfycbyPPCYnpCs4FuIlnmOP-Xfldqjq3NCr9wdEio96mtyg9Y0EuisM8Q6J9H9Gl1IJ1XGrqg/exec",
    'Excel': "https://script.google.com/macros/s/AKfycby4sTVq6cFMH7YovaqO5Wa6PcIgchWlWkIxEoORN-jPG_iH41Rimfg0t9aN-npl4SG5TQ/exec",       
    'PowerQuery': "https://script.google.com/macros/s/AKfycbxbBHgpL6tKsw5waEi7ZW5VGgN0bQKDdRj0WPqA99135iDZevfZjZMHxUmfNWsjYD-d/exec",  
    'PowerBI': "https://script.google.com/macros/s/AKfycbxMtcuWUCfD4bci7P3ICK01p5AsoGPOw99Gp1SRWlIWqVJaI5CTAXsWYXFG_XuljKu0/exec",    
    'SQL': "https://script.google.com/macros/s/AKfycbz-wNDbALMpxtuHKe9PGUUb3zlSof-HEuh_IUDG7cu5DhUOWXwMDsqPlEa5f-fNpVYVcw/exec",
    'Tech': "URL_HERE" // 👈 Tech Tab အတွက် Google Sheet URL ချိတ်ရန်
};

const THEMES = {
    'Home': { text: 'text-blue-600', tag: 'bg-blue-50 text-blue-700' },
    'Excel': { text: 'text-green-600', tag: 'bg-green-50 text-green-700' },
    'PowerQuery': { text: 'text-orange-600', tag: 'bg-orange-50 text-orange-700' },
    'PowerBI': { text: 'text-yellow-600', tag: 'bg-yellow-50 text-yellow-700' },
    'SQL': { text: 'text-sky-600', tag: 'bg-sky-50 text-sky-700' },
    'Tech': { text: 'text-purple-600', tag: 'bg-purple-50 text-purple-700' }
};

// ⚡ Global State & Caching Engine
let currentCategory = 'Home';
const API_CACHE = {}; 
let isPreloading = false;

// --------------------------------------------------
// Background Caching Function
// --------------------------------------------------
function preloadAllData() {
    if (isPreloading) return;
    isPreloading = true;
    
    Object.keys(CONTENT_DBS).forEach(async (cat) => {
        if (CONTENT_DBS[cat] !== "URL_HERE") {
            try {
                const res = await fetch(CONTENT_DBS[cat]);
                const json = await res.json();
                API_CACHE[cat] = json.data ? json.data : json;
                
                // User သည် Home တွင်ရှိနေပါက Data များရလာပြီဖြစ်၍ ချက်ချင်း Refresh လုပ်ပေးမည်
                if (currentCategory === 'Home') {
                    renderHomeFeed();
                }
            } catch(e) { console.warn("Cache fail:", cat); }
        }
    });
}

// --------------------------------------------------
// Tab ပြောင်းလဲခြင်း စီမံခန့်ခွဲသည့် Function
// --------------------------------------------------
async function loadCategory(categoryName, isSmoothLoad = false) {
    if (window.innerWidth < 768 && typeof switchMobileTab === 'function') {
        switchMobileTab('home');
    }

    currentCategory = categoryName;

    // Navbar အရောင်များ Uniform ဖြစ်အောင် ပြောင်းမည်
    document.querySelectorAll('.nav-item').forEach(el => {
        if (el.getAttribute('data-category') === categoryName) {
            el.className = "nav-item text-[15px] font-extrabold text-blue-800 bg-blue-50 px-4 py-2 rounded-full transition-all duration-300 shadow-sm";
        } else {
            el.className = "nav-item text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-3.5 py-2 rounded-full transition-all duration-300";
        }
    });

    const container = document.getElementById('content'); 

    if (categoryName === 'Home') {
        renderHomeFeed();
        if (isSmoothLoad) window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    const targetUrl = CONTENT_DBS[categoryName];
    if (!targetUrl || targetUrl === "URL_HERE") {
        container.className = "md:col-span-6 w-full";
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-16 text-center min-h-[50vh] animate-fade-in">
                <div class="text-6xl mb-6 animate-pulse">🚧</div>
                <h2 class="text-2xl font-extrabold text-gray-800 mb-2">${categoryName} Content is Coming Soon!</h2>
                <p class="text-gray-500 max-w-sm mx-auto text-sm">အချက်အလက်များ ဖြည့်သွင်းနေဆဲဖြစ်ပါသည်။ Database ချိတ်ဆက်ပြီးပါက ဤနေရာတွင် ပေါ်လာပါမည်။</p>
            </div>
        `;
        return;
    }

    // Cache တွင် Data ရှိနေပါက API ထပ်မခေါ်တော့ဘဲ ချက်ချင်း (Instant) ဖွင့်ပေးမည်
    if (API_CACHE[categoryName]) {
        renderArticles(API_CACHE[categoryName], categoryName);
        if (isSmoothLoad) window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        await fetchArticles(targetUrl, categoryName, isSmoothLoad);
    }
}

// --------------------------------------------------
// Home Tab သီးသန့်: Vision + Random Mixed Feed ပြသခြင်း
// --------------------------------------------------
function renderHomeFeed() {
    const container = document.getElementById('content');
    container.className = "md:col-span-6 flex flex-col gap-8 w-full";
    
    // 💡 အပေါ်ဆုံး Hero Section
    let finalHTML = `
        <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 shadow-lg text-white mb-2 animate-fade-in">
            <h2 class="text-2xl sm:text-3xl font-extrabold mb-6 tracking-tight flex items-center gap-3">
                <span class="text-yellow-400">⚡</span> Empowering Decisions
            </h2>
            <div class="grid sm:grid-cols-2 gap-8">
                <div>
                    <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Our Vision</h4>
                    <p class="text-gray-200 text-sm leading-relaxed">Empowering smarter decisions through data-driven insights.</p>
                </div>
                <div>
                    <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Our Mission</h4>
                    <p class="text-gray-200 text-sm leading-relaxed">Helping professionals unlock the power of data with practical Excel & Power BI training.</p>
                </div>
            </div>
            
            <div class="mt-8 pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <div class="w-16 h-16 rounded-full bg-white p-1 overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                    <img src="Media_Files/tis_logo.webp" class="w-full h-full rounded-full object-cover">
                </div>
                <div>
                    <h3 class="font-extrabold text-lg text-white">Arkar Linn</h3>
                    <p class="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1">Senior Executive & Founder</p>
                    <p class="text-gray-400 text-xs leading-relaxed max-w-sm">Advising CEO and Board on nationwide operational strategy. Trained over 300+ students in advanced data skills.</p>
                </div>
            </div>
        </div>

        <div class="flex items-center w-full my-4 animate-fade-in">
            <div class="flex-grow border-t border-gray-200"></div>
            <span class="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-extrabold uppercase tracking-widest">Random Insights Feed</span>
            <div class="flex-grow border-t border-gray-200"></div>
        </div>
    `;

    // 💡 Cache ထဲရှိ အခြား Tab မှ Data များအား ရောမွှေမည်
    let allPosts = [];
    Object.keys(API_CACHE).forEach(key => {
        if(key !== 'Home' && Array.isArray(API_CACHE[key])) {
            const posts = API_CACHE[key].map(p => ({...p, OriginCategory: key})); 
            allPosts = allPosts.concat(posts);
        }
    });

    if (allPosts.length > 0) {
        allPosts = allPosts.sort(() => 0.5 - Math.random());
        const randomFeed = allPosts.slice(0, 20); // Post အခု ၂၀ သာ ယူပြမည်
        finalHTML += generateCardsHTML(randomFeed, 'Home');
    } else {
        finalHTML += `
            <div class="p-16 text-center bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] w-full flex flex-col items-center justify-center animate-pulse min-h-[40vh]">
                <div class="w-8 h-8 border-[3px] border-gray-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p class="text-gray-400 text-sm font-medium">Generating your random feed...</p>
            </div>
        `;
    }

    container.innerHTML = finalHTML;
}

// --------------------------------------------------
// API ခေါ်ယူခြင်း
// --------------------------------------------------
async function fetchArticles(apiUrl, categoryName, isSmoothLoad = false) {
    const container = document.getElementById('content');
    
    if (!isSmoothLoad) {
        container.className = "md:col-span-6 w-full";
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] opacity-80 min-h-[50vh]">
                <div class="w-10 h-10 border-[3px] border-gray-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p class="text-sm font-semibold text-gray-400 tracking-wide uppercase">Data များ ဆွဲယူနေပါသည်...</p>
            </div>
        `;
    } else {
        container.classList.add('opacity-50', 'pointer-events-none');
        if (!document.getElementById('bottom-loader')) {
            container.innerHTML += `<div id="bottom-loader" class="py-6 flex justify-center"><div class="w-6 h-6 border-[3px] border-gray-200 border-t-blue-600 rounded-full animate-spin"></div></div>`;
        }
    }

    try {
        const response = await fetch(apiUrl);
        const result = await response.json();
        const data = result.data ? result.data : result;
        
        API_CACHE[categoryName] = data; // Save to cache
        
        renderArticles(data, categoryName);
        if (isSmoothLoad) window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error("Fetch error:", error);
        container.classList.remove('opacity-50', 'pointer-events-none');
        container.innerHTML = `<div class="text-center text-red-500 font-bold bg-red-50 p-6 rounded-3xl w-full">Failed to load content. Please check internet connection.</div>`;
    }
}

// --------------------------------------------------
// UI Render & HTML Cards ထုတ်ပေးခြင်း
// --------------------------------------------------
function renderArticles(data, categoryName) {
    const container = document.getElementById('content');
    container.className = "md:col-span-6 flex flex-col gap-8 w-full";
    let finalHTML = '';

    // =================================================================
    // 💡 SQL Tab အတွက် သီးသန့် Static Section
    // =================================================================
    if (categoryName === 'SQL') {
        finalHTML += `
            <div class="bg-slate-900 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden text-white flex flex-col w-full animate-fade-in">
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
            <div class="flex items-center w-full my-2 animate-fade-in"><div class="flex-grow border-t border-gray-200"></div><span class="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-extrabold uppercase tracking-widest">Recent SQL Posts</span><div class="flex-grow border-t border-gray-200"></div></div>
        `;
    } 
    // =================================================================
    // 💡 Tech (Python & Dev) Tab အတွက် သီးသန့် Static Section အသစ်
    // =================================================================
    else if (categoryName === 'Tech') {
        finalHTML += `
            <div class="w-full flex flex-col gap-8 animate-fade-in">
                <!-- Section Header -->
                <div class="text-center mb-2">
                    <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">🚀 Project Portfolio</h2>
                    <p class="text-gray-500 text-sm mt-2">Interactive tools and data systems built to solve real-world problems.</p>
                </div>
                
                <!-- Grid of 4 Smaller Projects -->
                <div class="grid md:grid-cols-2 gap-8">
                    <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
                        <img src="Media_Files/proj-population.jpg" alt="Population" class="w-full aspect-video object-cover object-top">
                        <div class="p-6 md:p-8 flex flex-col flex-grow">
                            <div class="mb-3"><span class="bg-red-50 text-red-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">Streamlit</span></div>
                            <h3 class="font-bold text-lg text-slate-900 mb-2 leading-snug">Myanmar Population Analytics</h3>
                            <p class="text-gray-600 text-[13px] mb-6 flex-grow leading-relaxed">An interactive dashboard allowing users to filter census data by State, District, and Township to analyze demographics dynamically.</p>
                            <a href="https://dynamic-dashboard-filters.streamlit.app/" target="_blank" class="inline-flex items-center text-blue-600 font-bold text-sm hover:text-blue-800 transition">View Live App <span class="ml-1">&rarr;</span></a>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
                        <img src="Media_Files/proj-titanic.jpg" alt="Titanic" class="w-full aspect-video object-cover object-top">
                        <div class="p-6 md:p-8 flex flex-col flex-grow">
                            <div class="mb-3"><span class="bg-red-50 text-red-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">Streamlit</span></div>
                            <h3 class="font-bold text-lg text-slate-900 mb-2 leading-snug">Titanic EDA Dashboard</h3>
                            <p class="text-gray-600 text-[13px] mb-6 flex-grow leading-relaxed">Comprehensive exploratory data analysis of the Titanic dataset, visualizing survival rates by class, gender, and age groups.</p>
                            <a href="https://titanic-eda-dashboard-dkd68fsawayaumwjkkow85.streamlit.app/" target="_blank" class="inline-flex items-center text-blue-600 font-bold text-sm hover:text-blue-800 transition">View Live App <span class="ml-1">&rarr;</span></a>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
                        <img src="Media_Files/proj-target.jpg" alt="Target" class="w-full aspect-video object-cover object-top">
                        <div class="p-6 md:p-8 flex flex-col flex-grow">
                            <div class="mb-3"><span class="bg-red-50 text-red-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">Streamlit</span></div>
                            <h3 class="font-bold text-lg text-slate-900 mb-2 leading-snug">Target vs Actual KPI Tracker</h3>
                            <p class="text-gray-600 text-[13px] mb-6 flex-grow leading-relaxed">Performance tracking dashboard comparing Target vs Actual sales across different regions with achievement percentages.</p>
                            <a href="https://targetvsactual-arkarpro.streamlit.app/" target="_blank" class="inline-flex items-center text-blue-600 font-bold text-sm hover:text-blue-800 transition">View Live App <span class="ml-1">&rarr;</span></a>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
                        <img src="Media_Files/proj-pass.jpg" alt="Password" class="w-full aspect-video object-cover object-top">
                        <div class="p-6 md:p-8 flex flex-col flex-grow">
                            <div class="mb-3"><span class="bg-blue-50 text-blue-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">Web Tool</span></div>
                            <h3 class="font-bold text-lg text-slate-900 mb-2 leading-snug">Secure Password Generator</h3>
                            <p class="text-gray-600 text-[13px] mb-6 flex-grow leading-relaxed">A handy utility tool built to generate strong, randomized passwords with customizable options for symbols and numbers.</p>
                            <a href="https://arkarpro.github.io/password_generator/" target="_blank" class="inline-flex items-center text-blue-600 font-bold text-sm hover:text-blue-800 transition">View Live Tool <span class="ml-1">&rarr;</span></a>
                        </div>
                    </div>
                </div>
                
                <!-- SQL Data Warehouse Hero Card (Reused) -->
                <div class="bg-slate-900 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden text-white flex flex-col w-full">
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
                
                <!-- GitHub Chart -->
                <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 p-8 w-full text-center">
                    <h4 class="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-6">My Coding Activity</h4>
                    <img src="https://ghchart.rshah.org/3b82f6/arkarpro" alt="Arkar's Github Chart" class="mx-auto w-full md:w-3/4 opacity-90 hover:opacity-100 transition-opacity duration-300">
                </div>
                
                <!-- Divider for Google Sheet Posts -->
                <div class="flex items-center w-full my-2">
                    <div class="flex-grow border-t border-gray-200"></div>
                    <span class="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-extrabold uppercase tracking-widest">Recent Python & Dev Posts</span>
                    <div class="flex-grow border-t border-gray-200"></div>
                </div>
            </div>
        `;
    }

    if (data && data.length > 0) {
        finalHTML += generateCardsHTML(data, categoryName);
    } else {
        finalHTML += `<div class="p-16 text-center bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] w-full min-h-[50vh] flex items-center justify-center animate-fade-in"><p class="text-gray-400 font-medium">No posts available yet.</p></div>`;
    }

    container.innerHTML = finalHTML;
    container.classList.remove('opacity-50', 'pointer-events-none');
}

function generateCardsHTML(dataArray, fallbackCategory) {
    return dataArray.map(item => {
        let mediaContent = '';
        const mediaVal = item.Media_URL ? item.Media_URL.trim() : '';

        if (mediaVal.includes('youtu.be/') || mediaVal.includes('youtube.com/')) {
            let videoId = '';
            if (mediaVal.includes('youtu.be/')) { videoId = mediaVal.split('youtu.be/')[1].split('?')[0]; } 
            else if (mediaVal.includes('v=')) { videoId = mediaVal.split('v=')[1].split('&')[0]; }
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
                ${isLocked ? `<div class="mt-6"><button onclick="openLoginModal()" class="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3.5 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>Login to Access</button></div>` : ``}
            </div>
        </div>`;
    }).join(''); 
}