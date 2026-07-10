// =================================================================
// 🔐 အကောင့်ဆိုင်ရာ လုပ်ဆောင်ချက်များ (Login, Register, Google, Forgot)
// =================================================================

// ⚠️ အရေးကြီး - အောက်ပါ URL နှင့် Client ID ကို ဆရာ့အချက်အလက်များနှင့် အစားထိုးပါ
const USERS_DB_URL = "https://script.google.com/macros/s/AKfycbwKjSsZdC1B1_ciKrxO48btuP9HF5-XiPWOKaaS2MAWIaeVVgyNIdsHloMtc8DCiatd8A/exec"; // TIS_Users_DB ၏ Web App URL (ဥပမာပြထားခြင်းဖြစ်သည်)
const GOOGLE_CLIENT_ID = "http://710420508887-aekrb2bugfeeaa3hnhv71o5etts76gnn.apps.googleusercontent.com"; // Google Client ID

// --------------------------------------------------
// UI အဖွင့်/အပိတ် နှင့် Form အပြောင်းအလဲများ
// --------------------------------------------------
function openLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
    document.getElementById('loginModal').classList.add('flex');
    switchForm('form-login'); // ဖွင့်တိုင်း Login Form ကိုအရင်ပြမည်
    renderGoogleButton(); // Google ခလုတ်ကို ဆွဲတင်မည်
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
    document.getElementById('loginModal').classList.remove('flex');
    showMessage("", ""); // စာသားများဖျက်မည်
}

function switchForm(formId) {
    document.getElementById('form-login').classList.add('hidden');
    document.getElementById('form-register').classList.add('hidden');
    document.getElementById('form-forgot').classList.add('hidden');
    document.getElementById(formId).classList.remove('hidden');
    showMessage("", ""); 
}

function showMessage(text, type) {
    const msgBox = document.getElementById('authMessage');
    msgBox.innerText = text;
    if (type === 'error') msgBox.className = "mb-4 text-center text-sm font-bold text-red-500";
    else if (type === 'success') msgBox.className = "mb-4 text-center text-sm font-bold text-green-600";
    else msgBox.className = "hidden";
}

// --------------------------------------------------
// API လှမ်းခေါ်မည့် Helper Function (CORS Error မတက်အောင် ပြင်ဆင်ထားသည်)
// --------------------------------------------------
async function fetchAuthAPI(payload) {
    try {
        const response = await fetch(USERS_DB_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // GAS အတွက် text/plain သုံးရပါမည်
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        return { status: "error", message: "စနစ်ချို့ယွင်းမှုဖြစ်ပွားနေပါသည်။ ခဏနေမှ ထပ်စမ်းကြည့်ပါ။" };
    }
}

// --------------------------------------------------
// ၁။ သာမန် Login ဝင်ခြင်း
// --------------------------------------------------
async function submitLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('btn-login');

    if (!email || !password) return showMessage("အီးမေးလ် နှင့် စကားဝှက် ထည့်ပါ။", "error");

    btn.innerText = "စစ်ဆေးနေပါသည်... ⏳"; btn.disabled = true;
    
    const result = await fetchAuthAPI({ action: 'login', email: email, password: password });
    
    if (result.status === "success") {
        saveLoginSession(email, result.userName);
    } else {
        showMessage(result.message, "error");
        btn.innerText = "ဝင်မည် (Login)"; btn.disabled = false;
    }
}

// --------------------------------------------------
// ၂။ အကောင့်သစ် ဖွင့်ခြင်း (Sign Up)
// --------------------------------------------------
async function submitRegister() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const btn = document.getElementById('btn-register');

    if (!name || !email || !password) return showMessage("အချက်အလက်များ ပြည့်စုံစွာ ထည့်ပါ။", "error");

    btn.innerText = "ဖွင့်နေပါသည်... ⏳"; btn.disabled = true;

    const result = await fetchAuthAPI({ action: 'register', name: name, email: email, phone: phone, password: password });
    
    if (result.status === "success") {
        showMessage("အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။ Login ဝင်နိုင်ပါပြီ!", "success");
        setTimeout(() => switchForm('form-login'), 2000);
    } else {
        showMessage(result.message, "error");
    }
    btn.innerText = "အကောင့်ဖွင့်မည် (Sign Up)"; btn.disabled = false;
}

// --------------------------------------------------
// ၃။ Google ဖြင့် ဝင်ခြင်း
// --------------------------------------------------
function renderGoogleButton() {
    if (typeof google === 'undefined') return; // Google script မတက်လာသေးရင် ကျော်မည်
    
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse
    });
    
    google.accounts.id.renderButton(
        document.getElementById("googleButtonDiv"),
        { theme: "outline", size: "large", width: "100%" } 
    );
}

async function handleGoogleCredentialResponse(response) {
    showMessage("Google အကောင့် စစ်ဆေးနေပါသည်...", "success");
    const result = await fetchAuthAPI({ action: 'google_login', token: response.credential });
    
    if (result.status === "success") {
        saveLoginSession(result.email, result.userName);
    } else {
        showMessage(result.message, "error");
    }
}

// --------------------------------------------------
// ၄။ Forgot Password (OTP လှမ်းတောင်းခြင်း)
// --------------------------------------------------
async function submitForgotPassword() {
    const email = document.getElementById('forgotEmail').value;
    const btn = document.getElementById('btn-forgot');

    if (!email) return showMessage("အီးမေးလ် ထည့်ပေးပါ။", "error");

    btn.innerText = "ပို့နေပါသည်... ⏳"; btn.disabled = true;

    const result = await fetchAuthAPI({ action: 'forgot_password', email: email });
    
    if (result.status === "success") {
        showMessage("OTP ကုဒ်ကို အီးမေးလ်သို့ ပို့လိုက်ပါပြီ။ (Reset လုပ်ရန် စနစ်ကို ဆက်လက်ပြင်ဆင်ပါမည်)", "success");
    } else {
        showMessage(result.message, "error");
    }
    btn.innerText = "OTP ပို့ရန် (Send OTP)"; btn.disabled = false;
}

// --------------------------------------------------
// Session သိမ်းခြင်း နှင့် စစ်ဆေးခြင်း
// --------------------------------------------------
function saveLoginSession(email, name) {
    localStorage.setItem('tis_user_email', email);
    localStorage.setItem('tis_user_name', name);
    localStorage.setItem('tis_is_logged_in', 'true');
    showMessage("အောင်မြင်စွာ ဝင်ရောက်သွားပါပြီ!", "success");
    setTimeout(() => window.location.reload(), 1000);
}

function checkLoginStatus() {
    return localStorage.getItem('tis_is_logged_in') === 'true';
}

function logoutUser() {
    localStorage.clear();
    window.location.reload();
}