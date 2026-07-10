// =================================================================
// 🔐 အကောင့်ဝင်ခြင်းနှင့် ထွက်ခြင်းဆိုင်ရာ လုပ်ဆောင်ချက်များ (Auth Logic)
// =================================================================

// ⚠️ Database နှင့် ချိတ်ဆက်မည့် URL (TIS_Users_DB မှ Web App URL ကို ဤနေရာတွင် ထည့်ပါ)
const USERS_DB_URL = "YOUR_TIS_USERS_DB_WEB_APP_URL";

// --------------------------------------------------
// ၁။ Modal ကို ဖွင့်/ပိတ် လုပ်မည့် Function များ
// --------------------------------------------------
function openLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
    document.getElementById('loginModal').classList.add('flex');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
    document.getElementById('loginModal').classList.remove('flex');
    document.getElementById('loginMessage').innerText = ""; // အမှားပြစာသားများကို ရှင်းလင်းရန်
}

// --------------------------------------------------
// ၂။ Login ခလုတ်နှိပ်သောအခါ အလုပ်လုပ်မည့် Function
// --------------------------------------------------
async function submitLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const msgBox = document.getElementById('loginMessage');
    const btn = document.getElementById('loginBtn');

    // Data ပြည့်စုံမှု ရှိ/မရှိ စစ်ဆေးခြင်း
    if (!email || !password) {
        msgBox.innerText = "အီးမေးလ် နှင့် စကားဝှက်ကို ပြည့်စုံစွာ ထည့်ပေးပါ။";
        msgBox.className = "mt-4 text-center text-sm font-bold text-red-500";
        return;
    }

    // Loading အခြေအနေပြောင်းခြင်း
    btn.innerText = "စစ်ဆေးနေပါသည်... ⏳";
    btn.disabled = true;
    msgBox.innerText = "";

    try {
        // TIS_Users_DB သို့ Data ပို့၍ စစ်ဆေးခြင်း (POST Request)
        const response = await fetch(USERS_DB_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'login',
                email: email,
                password: password
            })
        });

        const result = await response.json();

        // ဝင်ရောက်ခြင်း အောင်မြင်ပါက
        if (result.status === "success") {
            // Browser ထဲတွင် မှတ်သားထားမည် (Local Storage)
            localStorage.setItem('tis_user_email', email);
            localStorage.setItem('tis_user_name', result.userName);
            localStorage.setItem('tis_is_logged_in', 'true');

            msgBox.innerText = "အောင်မြင်စွာ ဝင်ရောက်သွားပါပြီ!";
            msgBox.className = "mt-4 text-center text-sm font-bold text-green-600";
            
            // မျက်နှာပြင်ကို အသစ်ပြန်ခေါ်မည် (Premium Content များ ပွင့်သွားစေရန်)
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            // မှားယွင်းပါက Error ပြမည်
            msgBox.innerText = result.message || "အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။";
            msgBox.className = "mt-4 text-center text-sm font-bold text-red-500";
            btn.innerText = "ဝင်မည် (Login)";
            btn.disabled = false;
        }
    } catch (error) {
        msgBox.innerText = "စနစ်ချို့ယွင်းမှုဖြစ်ပွားနေပါသည်။ ခဏနေမှ ထပ်စမ်းကြည့်ပါ။";
        msgBox.className = "mt-4 text-center text-sm font-bold text-red-500";
        btn.innerText = "ဝင်မည် (Login)";
        btn.disabled = false;
    }
}

// --------------------------------------------------
// ၃။ Login ဝင်ထားခြင်း ရှိ/မရှိ စစ်ဆေးမည့် Function (Page Load တိုင်း စစ်မည်)
// --------------------------------------------------
function checkLoginStatus() {
    return localStorage.getItem('tis_is_logged_in') === 'true';
}

// --------------------------------------------------
// ၄။ Logout ထွက်မည့် Function
// --------------------------------------------------
function logoutUser() {
    localStorage.clear(); // မှတ်သားထားသမျှ အကုန်ဖျက်မည်
    window.location.reload(); // Page ပြန်ခေါ်မည်
}