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
    '3': 'Advanced Intermediate',
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
    loadingDiv.innerHTML = "မေးခွန်းများ ဆွဲယူနေပါသည်... ⏳";
    
    document.getElementById('questionContainer').classList.add('hidden');
    document.getElementById('quizResults').classList.add('hidden');
    
    // 💡 ပြင်ဆင်ထားသည့် Level Name ကို သုံးထားပါသည်
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
                <div class="flex flex-col items-center justify-center mt-10">
                    <div class="text-5xl mb-4">🚧</div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">We're Preparing for this Test!</h3>
                    <p class="text-gray-500">မကြာမီ လာမည်... ဤစာမေးပွဲ မေးခွန်းများကို ပြင်ဆင်နေဆဲဖြစ်ပါသည်။</p>
                </div>
            `;
        }
    } catch (error) {
        loadingDiv.innerHTML = "ချိတ်ဆက်မှု ချို့ယွင်းနေပါသည်။ (Internet Connection စစ်ဆေးပါ)";
    }
}

// --------------------------------------------------
// ၂။ မေးခွန်း ဖော်ပြခြင်း (Render)
// --------------------------------------------------
function renderQuestion() {
    const q = questions[currentQuestionIndex];
    
    document.getElementById('qNumber').innerText = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    document.getElementById('qId').innerText = q['Question ID'] || `Q-${currentQuestionIndex + 1}`;
    document.getElementById('qText').innerText = q['Question Text (မေးခွန်း)'];
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = ''; // အဟောင်းများ ဖျက်မည်

    // ရွေးချယ်စရာ (၄) ခုကို ထုတ်မည်
    const options = [
        { key: 'A', text: q['Option A'] },
        { key: 'B', text: q['Option B'] },
        { key: 'C', text: q['Option C'] },
        { key: 'D', text: q['Option D'] }
    ];

    options.forEach(opt => {
        if (!opt.text) return; // စာသားမရှိပါက ကျော်မည်
        
        // ယခင်က ရွေးချယ်ထားခဲ့ပါက အရောင်ပြောင်းထားမည်
        const isSelected = userAnswers[currentQuestionIndex] === opt.key;
        const bgClass = isSelected ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100';

        optionsContainer.innerHTML += `
            <div onclick="selectOption('${opt.key}')" class="cursor-pointer border-2 ${bgClass} rounded-xl p-4 transition duration-200 flex items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 ${isSelected ? 'bg-blue-600 text-white' : 'bg-white border-2 text-gray-500'}">${opt.key}</div>
                <div class="text-gray-700 font-medium">${opt.text}</div>
            </div>
        `;
    });

    updateNavigationButtons();
}

// --------------------------------------------------
// ၃။ အဖြေရွေးချယ်ခြင်း နှင့် ခလုတ်များ ထိန်းချုပ်ခြင်း
// --------------------------------------------------
function selectOption(optionKey) {
    userAnswers[currentQuestionIndex] = optionKey;
    renderQuestion(); // UI Update လုပ်ရန် ပြန်ခေါ်မည်
}

function updateNavigationButtons() {
    document.getElementById('btnPrev').style.display = currentQuestionIndex > 0 ? 'block' : 'none';
    
    if (currentQuestionIndex === questions.length - 1) {
        document.getElementById('btnNext').style.display = 'none';
        document.getElementById('btnSubmitQuiz').style.display = 'block';
    } else {
        document.getElementById('btnNext').style.display = 'block';
        document.getElementById('btnSubmitQuiz').style.display = 'none';
    }
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

// --------------------------------------------------
// ၄။ အဖြေလွှာ တင်ခြင်း နှင့် အမှတ်တွက်ခြင်း (Submit)
// --------------------------------------------------
async function submitQuiz() {
    // အားလုံးဖြေပြီး/မပြီး စစ်ဆေးမည်
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < questions.length) {
        const confirmSubmit = confirm(`မေးခွန်း ${questions.length} ခုတွင် ${answeredCount} ခုသာ ဖြေဆိုရပါသေးသည်။ တကယ် Submit လုပ်မှာ သေချာပါသလား?`);
        if (!confirmSubmit) return;
    }

    clearInterval(quizTimer); // အချိန်ရပ်မည်
    document.getElementById('questionContainer').classList.add('hidden');
    document.getElementById('btnPrev').style.display = 'none';
    document.getElementById('btnSubmitQuiz').style.display = 'none';
    
    const resultsDiv = document.getElementById('quizResults');
    resultsDiv.classList.remove('hidden');
    resultsDiv.innerHTML = `<div class="text-xl font-bold text-gray-700">အမှတ်တွက်ချက်နေပါသည်... ⏳</div>`;

    let score = 0;
    
    // အမှတ်တွက်ချက်ခြင်း
    questions.forEach((q, index) => {
        const correctAns = String(q['Correct Answer (အဖြေမှန်)']).trim().toUpperCase();
        const userAns = String(userAnswers[index]).trim().toUpperCase();
        
        // Correct Answer က 'A' လို့ပေးထားတာလား၊ Option ရဲ့ စာသားအပြည့်အစုံလား စစ်ဆေးမည်
        if (userAns === correctAns || q[`Option ${userAns}`] === q['Correct Answer (အဖြေမှန်)']) {
            score += Number(q['Points'] || 1);
        }
    });

    const percentage = Math.round((score / questions.length) * 100);
    const status = percentage >= 70 ? 'Pass' : 'Fail';
    
    // 💡 ပြင်ဆင်ချက်: Screen ပေါ်က ကျန်တဲ့အချိန်ကို မယူဘဲ၊ တကယ်ကြာခဲ့တဲ့ စက္ကန့် (secondsElapsed) ကို ပြန်ဖွဲ့ပြီး ယူပါမည်
    let takenM = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
    let takenS = (secondsElapsed % 60).toString().padStart(2, '0');
    const timeTaken = `${takenM}:${takenS}`;

    // Report Database သို့ လှမ်းပို့ခြင်း (POST Request - သက်ဆိုင်ရာ Database သို့ ပို့မည်)
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

// ရလဒ်ပြသခြင်း UI
    resultsDiv.innerHTML = `
        <div class="bg-white p-8 rounded-2xl shadow-sm border max-w-lg mx-auto">
            <h2 class="text-3xl font-bold mb-2 ${status === 'Pass' ? 'text-green-600' : 'text-red-500'}">
                ${status === 'Pass' ? '🎉 Congratulations!' : '💪 Keep Practicing!'}
            </h2>
            <p class="text-gray-600 mb-6">You have completed the <strong>${currentTestName} (${levelNames[currentTestNo] || 'Part ' + currentTestNo})</strong>.</p>
            
            <div class="grid grid-cols-2 gap-4 mb-6 text-left">
                <div class="bg-gray-50 p-4 rounded-xl border">
                    <div class="text-sm text-gray-500">Your Score</div>
                    <div id="finalScore" class="text-2xl font-bold text-gray-800">${score} / ${questions.length}</div>
                </div>
                <div class="bg-gray-50 p-4 rounded-xl border">
                    <div class="text-sm text-gray-500">Percentage</div>
                    <div class="text-2xl font-bold text-gray-800">${percentage}%</div>
                </div>
                <div class="bg-gray-50 p-4 rounded-xl border col-span-2">
                    <div class="text-sm text-gray-500">Time Taken</div>
                    <div class="text-xl font-bold text-gray-800">${timeTaken}</div>
                </div>
            </div>
            
            <div class="space-y-3">
                ${currentTestName === "Excel Daily Quiz" && status === 'Pass' ? `
                    <button onclick="downloadCertificate()" class="w-full bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition flex items-center justify-center gap-2">
                        📥 Download Certificate
                    </button>
                ` : ``}
                
                <button onclick="closeQuiz()" class="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
                    စာမေးပွဲမှ ထွက်မည်
                </button>
            </div>
        </div>
    `;
}

// --------------------------------------------------
// ၅။ Timer Functions များ
// --------------------------------------------------

// PL-300 အတွက် ပုံမှန် အချိန်ရေတွက်သော Timer (Count Up)
function startTimerStandard() {
    secondsElapsed = 0;
    quizTimer = setInterval(() => {
        secondsElapsed++;
        let m = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        let s = (secondsElapsed % 60).toString().padStart(2, '0');
        document.getElementById('quizTimer').innerText = `${m}:${s}`;
    }, 1000);
}

// Excel Quiz အတွက် မိနစ် ၃၀ ကန့်သတ်ထားသော Timer (Count Down)
function startTimer() {
    let timeLeft = 30 * 60; // 30 Minutes in seconds
    secondsElapsed = 0; // 💡 ပြင်ဆင်ချက်: အစကတည်းက 0 ပြန်ထားမည်
    
    quizTimer = setInterval(() => {
        timeLeft--;
        secondsElapsed++; // 💡 ပြင်ဆင်ချက်: တကယ်သုံးလိုက်တဲ့ အချိန်ကို ၁ စက္ကန့်စီ တိုးမှတ်ထားမည်
        
        let m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        let s = (timeLeft % 60).toString().padStart(2, '0');
        
        let timerDisplay = document.getElementById('quizTimer');
        timerDisplay.innerText = `${m}:${s}`;

        // ၅ မိနစ်ပဲကျန်တော့ရင် အနီရောင်ပြောင်းပြီး သတိပေးရန် (Optional)
        if (timeLeft <= 300) {
            timerDisplay.classList.add('text-red-600', 'animate-pulse');
        }

        if (timeLeft <= 0) {
            clearInterval(quizTimer);
            alert("အချိန်စေ့သွားပါပြီ။ အဖြေလွှာကို အလိုအလျောက် ပို့ပေးပါမည်။");
            submitQuiz(); // အချိန်ပြည့်ရင် အလိုအလျောက် Submit လုပ်မည်
        }
    }, 1000);
}

// --------------------------------------------------
// ၆။ Modal ပိတ်ရန် Function
// --------------------------------------------------
function closeQuiz() {
    // Timer အလုပ်လုပ်နေတာရှိရင် ရပ်ပါမည်
    clearInterval(quizTimer);
    
    // Quiz Modal ကို ဖျောက်ပါမည်
    document.getElementById('quizModal').classList.add('hidden');
    document.getElementById('quizModal').classList.remove('flex');
    
    // နောက်တစ်ကြိမ် ဝင်လာရင် အသစ်ပြန်စရန် မျက်နှာပြင်များကို Reset လုပ်ပါမည်
    document.getElementById('questionContainer').classList.add('hidden');
    document.getElementById('quizResults').classList.add('hidden');
}

// --------------------------------------------------
// ၇။ Certificate Download လုပ်ရန် Function
// --------------------------------------------------
function downloadCertificate() {
    // ၁။ User Data များ ဆွဲယူခြင်း
    const userName = localStorage.getItem('tis_user_name') || 'Student';
    const displayLevel = levelNames[currentTestNo] || currentTestNo;
    const testName = currentTestName; 

    // Result စာမျက်နှာမှ ရမှတ်ရာခိုင်နှုန်းကို လှမ်းယူခြင်း (DOM ထဲမှ ယူသည်)
    // Percentage ပြထားသော div ကို အတိအကျလှမ်းဖမ်းခြင်း
    const percentageElements = document.querySelectorAll('#quizResults .text-2xl');
    let finalPercentage = "100%";
    if(percentageElements.length >= 2) {
        finalPercentage = percentageElements[1].innerText; // ဒုတိယမြောက် div သည် Percentage ဖြစ်သည်
    }

    // Certificate ID အသစ်ထုတ်ပေးခြင်း (TIS-EX-ခုနှစ်လရက်-ကျပန်းနံပါတ်)
    const dateStr = new Date().toISOString().slice(2,10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const certId = `TIS-EX-${dateStr}-${randomNum}`;

    // ၂။ Template ထဲသို့ Data များ ထည့်သွင်းခြင်း
    const certNode = document.getElementById('certificate');
    if (!certNode) {
        alert("Certificate template ကို ရှာမတွေ့ပါ။ index.html ထဲတွင် ထည့်သွင်းထားရန် လိုအပ်ပါသည်။");
        return;
    }

    document.getElementById('cert-student-name').innerText = userName;
    document.getElementById('cert-level-name').innerText = `${testName} (${displayLevel})`;
    document.getElementById('cert-score').innerText = finalPercentage;
    document.getElementById('cert-id').innerText = `ID: ${certId}`;

    // ၃။ ပုံအဖြစ်ပြောင်းပြီး Download ဆွဲခြင်း
    // Loading သိသာစေရန် Alert ပြခြင်း (သို့မဟုတ် Button စာသားပြောင်းနိုင်သည်)
    alert("Certificate ကို Download လုပ်နေပါသည်။ ခေတ္တစောင့်ဆိုင်းပေးပါ... ⏳");

    // html2canvas အသုံးပြု၍ `#certificate` div ကို ပုံပြောင်းခြင်း
    html2canvas(certNode, { scale: 2, useCORS: true }).then(canvas => {
        // Canvas မှ Data URL (PNG) အဖြစ်ပြောင်းခြင်း
        const image = canvas.toDataURL("image/png");
        
        // Download ချရန် <a> tag ဖန်တီး၍ နှိပ်စေခြင်း
        const link = document.createElement('a');
        link.download = `${userName}_TIS_Certificate.png`;
        link.href = image;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    }).catch(error => {
        console.error("Certificate Generation Error:", error);
        alert("Certificate ထုတ်ပေးရာတွင် အခက်အခဲရှိနေပါသည်။");
    });
}

// --------------------------------------------------
// ၈။ Home သို့ ပြန်သွားရန် Function 
// --------------------------------------------------
function goHome() {
    // Quiz ပိတ်ပြီး မူလစာမျက်နှာကို ပြန်ပြမည်
    closeQuiz();
    // (သို့) တခြား Page ကို သွားချင်ပါက အောက်ပါကုတ်ကို သုံးပါ
    // window.location.href = 'index.html';
}