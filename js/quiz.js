// =================================================================
// 🎓 Quiz & Mock Test System (PL-300 & Excel)
// =================================================================

// ⚠️ API URLs
const PL300_API_URL = "https://script.google.com/macros/s/AKfycbxzOG_B4J9cX-MJAhDdNzJHMcCNFYOfVoNQcxkjx31XKEGIBR9zPXbt324JScLuBgki/exec";
const EXCEL_API_URL = "https://script.google.com/macros/s/AKfycbxMCcQCXzK-aiPrw5ZFGNUQ2mSFO4eRuNvyjkAJsfRuZJMXb4U2PcNXALFc-sWCAdHf/exec";

// Global Variables
let currentApiUrl = "";
let currentTestName = "";
let currentTestNo = "1";
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {}; 
let quizTimer;
let secondsElapsed = 0;

// --------------------------------------------------
// ၁။ Quiz စတင်ခြင်း (Trigger Functions)
// --------------------------------------------------

// Level နာမည်များ Mapping
const levelNames = {
    '1': 'Elementary',
    '2': 'Intermediate',
    '3': 'Upper Intermediate',
    '4': 'Advanced',
    '5': 'Professional Master'
};

// PL-300 ခလုတ်နှိပ်လျှင်
async function startMockTest(sheetName = "1") {
    currentApiUrl = PL300_API_URL;
    currentTestName = "PL-300 Mock Test";
    currentTestNo = sheetName;
    await initializeQuiz();
}

// Excel Quiz ခလုတ်နှိပ်လျှင်
async function startExcelQuiz(sheetName = "1") {
    currentApiUrl = EXCEL_API_URL;
    currentTestName = "Excel Daily Quiz";
    currentTestNo = sheetName;
    await initializeQuiz();
}

// အဓိက Data လှမ်းဆွဲမည့် Function
async function initializeQuiz() {
    if (!checkLoginStatus()) {
        alert("စာမေးပွဲဖြေဆိုရန် Login အရင်ဝင်ပေးပါခင်ဗျာ။");
        openLoginModal();
        return;
    }

    document.getElementById('quizModal').classList.remove('hidden');
    document.getElementById('quizModal').classList.add('flex');
    
    // Loading ပြမည်
    const loadingDiv = document.getElementById('quizLoading');
    loadingDiv.classList.remove('hidden');
    loadingDiv.innerHTML = `
        <div class="flex flex-col items-center justify-center mt-20 opacity-80">
            <div class="w-10 h-10 border-[3px] border-gray-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p class="text-sm font-semibold text-gray-400 tracking-wide uppercase">မေးခွန်းများ ဆွဲယူနေပါသည်...</p>
        </div>
    `;
    
    document.getElementById('questionContainer').classList.add('hidden');
    document.getElementById('quizResults').classList.add('hidden');
    
    const displayLevel = levelNames[currentTestNo] || currentTestNo;
    document.getElementById('quizTitle').innerText = `${currentTestName} (${displayLevel})`;
    
    questions = [];
    currentQuestionIndex = 0;
    userAnswers = {};
    secondsElapsed = 0;
    clearInterval(quizTimer);
    document.getElementById('quizTimer').innerText = "00:00";
    document.getElementById('quizTimer').classList.remove('text-red-600', 'animate-pulse');

    try {
        const response = await fetch(`${currentApiUrl}?action=get_questions&sheetName=${currentTestNo}`);
        const result = await response.json();
        
        // 🔴 Data ရှိ/မရှိ စစ်ဆေးခြင်း
        if (result.status === "success" && result.data && result.data.length > 0) {
            questions = result.data;
            loadingDiv.classList.add('hidden');
            document.getElementById('questionContainer').classList.remove('hidden');
            
            // 💡 Timer စတင်ခြင်း (Excel Quiz ဆိုလျှင် 30 min limit, အခြားဆိုလျှင် ပုံမှန်)
            if (currentTestName === "Excel Daily Quiz") {
                startTimer(); // 30 မိနစ် Limit ပါဝင်သော Timer
            } else {
                startTimerStandard(); // PL-300 အတွက် ပုံမှန် Timer
            }
            
            renderQuestion(); 
        } else {
            // Data မရှိပါက ပြသမည့် စာသား
            loadingDiv.innerHTML = `
                <div class="flex flex-col items-center justify-center mt-20 p-10 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center">
                    <div class="text-6xl mb-6 animate-pulse">🚧</div>
                    <h3 class="text-2xl font-extrabold text-gray-800 mb-2">We're Preparing for this Test!</h3>
                    <p class="text-gray-500 text-sm">မကြာမီ လာမည်... ဤစာမေးပွဲ မေးခွန်းများကို ပြင်ဆင်နေဆဲဖြစ်ပါသည်။</p>
                </div>
            `;
        }
    } catch (error) {
        loadingDiv.innerHTML = `
            <div class="flex flex-col items-center justify-center mt-20 p-8 bg-red-50 rounded-3xl text-center">
                <p class="font-bold text-red-500">ချိတ်ဆက်မှု ချို့ယွင်းနေပါသည်။ (Internet Connection စစ်ဆေးပါ)</p>
            </div>
        `;
    }
}

// --------------------------------------------------
// ၂။ မေးခွန်း ဖော်ပြခြင်း (Render)
// --------------------------------------------------
function renderQuestion() {
    const q = questions[currentQuestionIndex];
    
    // Multi-Select ဟုတ်/မဟုတ် စစ်ဆေးခြင်း (အဖြေမှန်တွင် ကော်မာ ပါ/မပါ စစ်မည်)
    const correctAnsStr = String(q['Correct Answer (အဖြေမှန်)']).trim();
    const isMultiSelect = correctAnsStr.includes(',');
    
    document.getElementById('qNumber').innerText = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    document.getElementById('qId').innerText = q['Question ID'] || `Q-${currentQuestionIndex + 1}`;
    
    // 💡 Multi-select ဖြစ်ပါက မေးခွန်းဘေးတွင် "အဖြေမှန် ၂ ခု ရွေးပါ" ဟု အရိပ်အမြွက် (Hint) ပြပေးမည်
    let questionText = q['Question Text (မေးခွန်း)'];
    if (isMultiSelect) {
        const requiredCount = correctAnsStr.split(',').length;
        questionText += ` <br><span class="inline-block mt-2 bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">(အဖြေမှန် ${requiredCount} ခု ရွေးချယ်ပါ)</span>`;
    }
    document.getElementById('qText').innerHTML = questionText; 
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = ''; // အဟောင်းများ ဖျက်မည်

    const options = [
        { key: 'A', text: q['Option A'] },
        { key: 'B', text: q['Option B'] },
        { key: 'C', text: q['Option C'] },
        { key: 'D', text: q['Option D'] }
    ];

    options.forEach(opt => {
        if (!opt.text) return; 
        
        // 💡 လက်ရှိ Option ကို User ရွေးထားခြင်း ရှိ/မရှိ စစ်ဆေးမည်
        let isSelected = false;
        if (userAnswers[currentQuestionIndex]) {
            if (isMultiSelect) {
                // "A, B" ထဲတွင် လက်ရှိ opt.key ပါ/မပါ စစ်မည်
                isSelected = userAnswers[currentQuestionIndex].split(',').map(s => s.trim()).includes(opt.key);
            } else {
                isSelected = userAnswers[currentQuestionIndex] === opt.key;
            }
        }
        
        const bgClass = isSelected 
            ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500 shadow-md' 
            : 'bg-slate-50 border-transparent hover:bg-slate-100 hover:border-gray-200 shadow-sm';
            
        // 💡 Multi-select ဆိုလျှင် အထောင့် (Checkbox ပုံစံ)၊ Single ဆိုလျှင် အဝိုင်း (Radio ပုံစံ) ပြမည်
        const shapeClass = isMultiSelect ? 'rounded-md' : 'rounded-full';
            
        const circleClass = isSelected 
            ? `bg-blue-600 text-white shadow-sm ${shapeClass}` 
            : `bg-white text-gray-500 shadow-sm border border-gray-200 ${shapeClass}`;

        optionsContainer.innerHTML += `
            <div onclick="selectOption('${opt.key}')" class="cursor-pointer border ${bgClass} rounded-2xl p-4 transition-all duration-200 flex items-center group">
                <div class="w-9 h-9 flex-shrink-0 flex items-center justify-center font-bold text-sm mr-4 transition-colors ${circleClass}">${opt.key}</div>
                <div class="text-gray-800 font-medium text-[15px] leading-relaxed">${opt.text}</div>
            </div>
        `;
    });

    updateNavigationButtons();
}

// --------------------------------------------------
// ၃။ အဖြေရွေးချယ်ခြင်း နှင့် ခလုတ်များ ထိန်းချုပ်ခြင်း
// --------------------------------------------------
function selectOption(optionKey) {
    const q = questions[currentQuestionIndex];
    const correctAnsStr = String(q['Correct Answer (အဖြေမှန်)']).trim();
    const isMultiSelect = correctAnsStr.includes(',');

    if (isMultiSelect) {
        // Multi-Select ဖြစ်ပါက အဖြေများကို Array အဖြစ် ခွဲထုတ်မည်
        let currentAnswers = userAnswers[currentQuestionIndex] ? userAnswers[currentQuestionIndex].split(',').map(s => s.trim()) : [];
        
        if (currentAnswers.includes(optionKey)) {
            // ရွေးပြီးသားကို ထပ်နှိပ်ပါက ပြန်ဖျက်မည် (Toggle Off)
            currentAnswers = currentAnswers.filter(k => k !== optionKey);
        } else {
            // မရွေးရသေးပါက အသစ်ထည့်မည် (Toggle On)
            currentAnswers.push(optionKey);
            // အက္ခရာစဉ်အတိုင်း ပြန်စီမည် (A, B, C)
            currentAnswers.sort();
        }
        // "A, B" ပုံစံဖြင့် ပြန်သိမ်းမည်
        userAnswers[currentQuestionIndex] = currentAnswers.join(', ');
    } else {
        // Single Select ဖြစ်ပါက ယခင်အတိုင်း တစ်ခုတည်းသာ မှတ်မည်
        userAnswers[currentQuestionIndex] = optionKey;
    }
    
    renderQuestion(); // UI Update လုပ်ရန် ပြန်ခေါ်မည်
}

// --------------------------------------------------
// ၄။ အဖြေလွှာ တင်ခြင်း နှင့် အမှတ်တွက်ခြင်း (Submit)
// --------------------------------------------------
async function submitQuiz() {
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < questions.length) {
        const confirmSubmit = confirm(`မေးခွန်း ${questions.length} ခုတွင် ${answeredCount} ခုသာ ဖြေဆိုရပါသေးသည်။ တကယ် Submit လုပ်မှာ သေချာပါသလား?`);
        if (!confirmSubmit) return;
    }

    clearInterval(quizTimer); 
    document.getElementById('questionContainer').classList.add('hidden');
    
    // Button Container ကိုပါ ဖျောက်မည်
    const actionButtons = document.getElementById('btnPrev').parentElement.parentElement;
    if(actionButtons) actionButtons.classList.add('hidden');
    
    const resultsDiv = document.getElementById('quizResults');
    resultsDiv.classList.remove('hidden');
    
    // Premium Loading UI
    resultsDiv.innerHTML = `
        <div class="flex flex-col items-center justify-center mt-10">
            <div class="w-10 h-10 border-[3px] border-gray-100 border-t-green-500 rounded-full animate-spin mb-4"></div>
            <div class="text-sm font-bold text-gray-500 uppercase tracking-widest">အမှတ်တွက်ချက်နေပါသည်...</div>
        </div>
    `;

    let score = 0;
    let maxPossibleScore = 0; // မေးခွန်းအားလုံး မှန်ခဲ့လျှင် ရမည့် အမှတ်ပေါင်း
    
    questions.forEach((q, index) => {
        const correctAnsStr = String(q['Correct Answer (အဖြေမှန်)']).trim().toUpperCase();
        const userAnsStr = String(userAnswers[index] || '').trim().toUpperCase();
        const questionPoints = Number(q['Points'] || 1);
        
        maxPossibleScore += questionPoints;
        
        // ကော်မာ (,) ကို အခြေခံပြီး Array အဖြစ် ခွဲထုတ်မည် (ဥပမာ 'A, B' -> ['A', 'B'])
        const correctArr = correctAnsStr.split(',').map(s => s.trim()).filter(s => s);
        const userArr = userAnsStr.split(',').map(s => s.trim()).filter(s => s);
        
        if (correctArr.length === 1) {
            // 💡 အဖြေ (၁) ခုတည်း ရွေးရမည့် မေးခွန်းများအတွက် (ယခင်အတိုင်း)
            if (userArr[0] === correctArr[0] || q[`Option ${userArr[0]}`] === q['Correct Answer (အဖြေမှန်)']) {
                score += questionPoints;
            }
        } else {
            // 💡 Multi-Select: အဖြေ (၂) ခုနှင့်အထက် ရွေးရမည့် မေးခွန်းများအတွက် (Partial Scoring)
            let correctMatches = 0;
            let wrongMatches = 0;
            
            userArr.forEach(ans => {
                if (correctArr.includes(ans)) {
                    correctMatches++; // မှန်ကန်သော Option ရွေးမိလျှင်
                } else {
                    wrongMatches++;   // မှားယွင်းသော Option ရွေးမိလျှင်
                }
            });
            
            // အမှတ်တွက်နည်း: အဖြေမှန် (၂) ခုရှိပြီး (၁) ခုသာ ရွေးမိပါက အမှတ်တစ်ဝက် (0.5) ရမည်။
            // (အဖြေမှားပါ ရွေးမိပါက User အား အကုန်ရွေးချယ်ခြင်းမှ ကာကွယ်ရန် အမှတ် ပြန်လျှော့မည်)
            let pointPerOption = questionPoints / correctArr.length;
            let earned = (correctMatches - wrongMatches) * pointPerOption;
            
            // အနုတ်ပြအမှတ် မဖြစ်စေရန် 0 ထက်ကြီးမှသာ ပေါင်းထည့်မည်
            if (earned > 0) {
                score += earned;
            }
        }
    });

    // 💡 Percentage တွက်ရာတွင် မေးခွန်းအရေအတွက်အစား ရနိုင်သမျှ အမှတ်ပေါင်း (maxPossibleScore) ဖြင့် တွက်ပါမည်
    const percentage = Math.round((score / maxPossibleScore) * 100);
    const status = percentage >= 70 ? 'Pass' : 'Fail';
    
    let takenM = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
    let takenS = (secondsElapsed % 60).toString().padStart(2, '0');
    const timeTaken = `${takenM}:${takenS}`;

    try {
        await fetch(currentApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'submit_report',
                email: localStorage.getItem('tis_user_email'),
                name: localStorage.getItem('tis_user_name'),
                testNo: currentTestNo, 
                attemptCount: 1, 
                score: score,
                totalQuestions: questions.length,
                percentage: `${percentage}%`,
                status: status,
                timeTaken: timeTaken
            })
        });
    } catch (e) {
        console.error("Report Save Error", e);
    }

    // 💡 ပြင်ဆင်ချက်: Results UI ကို Premium & Clean Design သို့ ပြောင်းလဲထားသည်
    resultsDiv.innerHTML = `
        <div class="bg-white p-8 md:p-10 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 max-w-lg mx-auto animate-fade-in">
            <h2 class="text-3xl font-extrabold mb-2 ${status === 'Pass' ? 'text-green-600' : 'text-red-500'}">
                ${status === 'Pass' ? '🎉 Congratulations!' : '💪 Keep Practicing!'}
            </h2>
            <p class="text-gray-500 mb-8 text-sm font-medium">You have completed the <strong>${currentTestName} (${levelNames[currentTestNo] || 'Part ' + currentTestNo})</strong>.</p>
            
            <div class="grid grid-cols-2 gap-3 mb-8 text-left">
                <div class="bg-slate-50 p-5 rounded-2xl">
                    <div class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Your Score</div>
                    <div id="finalScore" class="text-2xl font-extrabold text-gray-800">${score} <span class="text-lg text-gray-400">/ ${questions.length}</span></div>
                </div>
                <div class="bg-slate-50 p-5 rounded-2xl">
                    <div class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Percentage</div>
                    <div class="text-2xl font-extrabold text-gray-800">${percentage}%</div>
                </div>
                <div class="bg-slate-50 p-5 rounded-2xl col-span-2 flex justify-between items-center">
                    <div class="text-xs text-gray-400 font-bold uppercase tracking-wider">Time Taken</div>
                    <div class="text-xl font-extrabold text-gray-800">${timeTaken}</div>
                </div>
            </div>
            
            <div class="space-y-3">
                ${currentTestName === "Excel Daily Quiz" && status === 'Pass' ? `
                    <button id="btn-cert" onclick="downloadCertificate()" class="w-full bg-blue-900 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
                        📥 Download Certificate
                    </button>
                ` : ``}
                
                <button onclick="closeQuiz()" class="w-full bg-slate-100 text-slate-700 font-bold py-3.5 px-4 rounded-xl hover:bg-slate-200 transition-all duration-200">
                    စာမေးပွဲမှ ထွက်မည်
                </button>
            </div>
        </div>
    `;
}

// --------------------------------------------------
// ၅။ Timer Functions များ
// --------------------------------------------------
function startTimerStandard() {
    secondsElapsed = 0;
    quizTimer = setInterval(() => {
        secondsElapsed++;
        let m = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        let s = (secondsElapsed % 60).toString().padStart(2, '0');
        document.getElementById('quizTimer').innerText = `${m}:${s}`;
    }, 1000);
}

function startTimer() {
    let timeLeft = 30 * 60; 
    secondsElapsed = 0; 
    
    quizTimer = setInterval(() => {
        timeLeft--;
        secondsElapsed++; 
        
        let m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        let s = (timeLeft % 60).toString().padStart(2, '0');
        
        let timerDisplay = document.getElementById('quizTimer');
        timerDisplay.innerText = `${m}:${s}`;

        if (timeLeft <= 300) {
            timerDisplay.classList.add('text-red-600', 'animate-pulse');
        }

        if (timeLeft <= 0) {
            clearInterval(quizTimer);
            alert("အချိန်စေ့သွားပါပြီ။ အဖြေလွှာကို အလိုအလျောက် ပို့ပေးပါမည်။");
            submitQuiz(); 
        }
    }, 1000);
}

// --------------------------------------------------
// ၆။ Modal ပိတ်ရန် Function
// --------------------------------------------------
function closeQuiz() {
    clearInterval(quizTimer);
    
    // ခလုတ် Container များကို ပြန်ဖော်ရန် Reset လုပ်မည်
    const actionButtons = document.getElementById('btnPrev')?.parentElement?.parentElement;
    if(actionButtons) actionButtons.classList.remove('hidden');

    document.getElementById('quizModal').classList.add('hidden');
    document.getElementById('quizModal').classList.remove('flex');
    
    document.getElementById('questionContainer').classList.add('hidden');
    document.getElementById('quizResults').classList.add('hidden');
}

// --------------------------------------------------
// ၇။ Certificate Download လုပ်ရန် Function
// --------------------------------------------------
function downloadCertificate() {
    const certBtn = document.getElementById('btn-cert');
    if(certBtn) {
        certBtn.disabled = true;
        certBtn.innerHTML = `Downloading... ⏳`;
        certBtn.classList.add('opacity-80', 'cursor-not-allowed');
    }

    const userName = localStorage.getItem('tis_user_name') || 'Student';
    const displayLevel = levelNames[currentTestNo] || currentTestNo;
    const testName = currentTestName; 

    const percentageElements = document.querySelectorAll('#quizResults .text-2xl');
    let finalPercentage = "100%";
    if(percentageElements.length >= 2) {
        finalPercentage = percentageElements[1].innerText;
    }

    const dateStr = new Date().toISOString().slice(2,10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const certId = `TIS-EX-${dateStr}-${randomNum}`;

    const certNode = document.getElementById('certificate');
    if (!certNode) {
        alert("Certificate template ကို ရှာမတွေ့ပါ။ index.html ထဲတွင် ထည့်သွင်းထားရန် လိုအပ်ပါသည်။");
        if(certBtn) { certBtn.disabled = false; certBtn.innerHTML = `📥 Download Certificate`; certBtn.classList.remove('opacity-80', 'cursor-not-allowed'); }
        return;
    }

    document.getElementById('cert-student-name').innerText = userName;
    document.getElementById('cert-level-name').innerText = `${testName} (${displayLevel})`;
    document.getElementById('cert-score').innerText = finalPercentage;
    document.getElementById('cert-id').innerText = `ID: ${certId}`;

    html2canvas(certNode, { scale: 2, useCORS: true }).then(canvas => {
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = `${userName}_TIS_Certificate.png`;
        link.href = image;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if(certBtn) {
            certBtn.disabled = false;
            certBtn.innerHTML = `✅ Downloaded Successfully`;
            certBtn.classList.remove('opacity-80', 'cursor-not-allowed', 'bg-blue-900');
            certBtn.classList.add('bg-green-600');
        }
        
    }).catch(error => {
        console.error("Certificate Generation Error:", error);
        alert("Certificate ထုတ်ပေးရာတွင် အခက်အခဲရှိနေပါသည်။");
        if(certBtn) { certBtn.disabled = false; certBtn.innerHTML = `📥 Try Again`; certBtn.classList.remove('opacity-80', 'cursor-not-allowed'); }
    });
}

// --------------------------------------------------
// ၈။ Home သို့ ပြန်သွားရန် Function 
// --------------------------------------------------
function goHome() {
    closeQuiz();
}