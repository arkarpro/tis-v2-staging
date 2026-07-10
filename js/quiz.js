// =================================================================
// 🎓 PL-300 Mock Test Logic
// =================================================================

// ကိုကိုအာကာ ပေးထားသော PL-300 API လင့်ခ်
const QUIZ_API_URL = "https://script.google.com/macros/s/AKfycbxzOG_B4J9cX-MJAhDdNzJHMcCNFYOfVoNQcxkjx31XKEGIBR9zPXbt324JScLuBgki/exec";

let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {}; // ကျောင်းသားဖြေထားသော အဖြေများ မှတ်ရန်
let quizTimer;
let secondsElapsed = 0;

// --------------------------------------------------
// ၁။ Quiz စတင်ခြင်း
// --------------------------------------------------
async function startMockTest(sheetName = "1") {
    // Login ဝင်ထားခြင်း ရှိ/မရှိ အရင်စစ်မည်
    if (!checkLoginStatus()) {
        alert("စာမေးပွဲဖြေဆိုရန် Login အရင်ဝင်ပေးပါခင်ဗျာ။");
        openLoginModal();
        return;
    }

    // Modal ဖွင့်မည်၊ UI ရှင်းလင်းမည်
    document.getElementById('quizModal').classList.remove('hidden');
    document.getElementById('quizModal').classList.add('flex');
    document.getElementById('quizLoading').classList.remove('hidden');
    document.getElementById('questionContainer').classList.add('hidden');
    document.getElementById('quizResults').classList.add('hidden');
    document.getElementById('quizTitle').innerText = `PL-300 Mock Test (${sheetName})`;
    
    // Variables များ Reset ချမည်
    questions = [];
    currentQuestionIndex = 0;
    userAnswers = {};
    secondsElapsed = 0;
    clearInterval(quizTimer);

    try {
        // API မှ မေးခွန်းများ လှမ်းခေါ်မည်
        const response = await fetch(`${QUIZ_API_URL}?action=get_questions&sheetName=${sheetName}`);
        const result = await response.json();
        
        if (result.status === "success" && result.data.length > 0) {
            questions = result.data;
            document.getElementById('quizLoading').classList.add('hidden');
            document.getElementById('questionContainer').classList.remove('hidden');
            
            startTimer(); // အချိန်စမှတ်မည်
            renderQuestion(); // ပထမဆုံး မေးခွန်းကို ပြမည်
        } else {
            document.getElementById('quizLoading').innerText = "မေးခွန်းများ ရှာမတွေ့ပါ။";
        }
    } catch (error) {
        document.getElementById('quizLoading').innerText = "ချိတ်ဆက်မှု ချို့ယွင်းနေပါသည်။";
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
    const timeTaken = document.getElementById('quizTimer').innerText;

    // Report Database သို့ လှမ်းပို့ခြင်း (POST Request)
    try {
        await fetch(QUIZ_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'submit_report',
                email: localStorage.getItem('tis_user_email'),
                name: localStorage.getItem('tis_user_name'),
                testNo: "1",
                attemptCount: 1, // နောင်တွင် စနစ်တကျ ပြန်ရေတွက်နိုင်ရန် ပြင်ဆင်နိုင်သည်
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
            <p class="text-gray-600 mb-6">You have completed the PL-300 Mock Test.</p>
            
            <div class="grid grid-cols-2 gap-4 mb-6 text-left">
                <div class="bg-gray-50 p-4 rounded-xl border">
                    <div class="text-sm text-gray-500">Your Score</div>
                    <div class="text-2xl font-bold text-gray-800">${score} / ${questions.length}</div>
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
            
            <button onclick="closeQuiz()" class="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
                စာမေးပွဲမှ ထွက်မည်
            </button>
        </div>
    `;
}

// --------------------------------------------------
// ၅။ အခြား Utilities (Timer နှင့် အပိတ်လုပ်ဆောင်ချက်)
// --------------------------------------------------
function startTimer() {
    document.getElementById('quizTimer').innerText = "00:00";
    quizTimer = setInterval(() => {
        secondsElapsed++;
        const m = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
        const s = String(secondsElapsed % 60).padStart(2, '0');
        document.getElementById('quizTimer').innerText = `${m}:${s}`;
    }, 1000);
}

function closeQuiz() {
    clearInterval(quizTimer);
    document.getElementById('quizModal').classList.add('hidden');
    document.getElementById('quizModal').classList.remove('flex');
}