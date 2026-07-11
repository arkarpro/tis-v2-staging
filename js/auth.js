// =================================================================
// 🔐 Auth Flow Logic (Login, Register+OTP, Forgot+OTP+Reset, Google)
// =================================================================

const USERS_DB_URL = "https://script.google.com/macros/s/AKfycbwKjSsZdC1B1_ciKrxO48btuP9HF5-XiPWOKaaS2MAWIaeVVgyNIdsHloMtc8DCiatd8A/exec"; // 👈 ပြောင်းရန်
const GOOGLE_CLIENT_ID = "710420508887-aekrb2bugfeeaa3hnhv71o5etts76gnn.apps.googleusercontent.com"; // 👈 ပြောင်းရန်

let tempEmail = ""; 
let otpFlowType = ""; // 'register' သို့မဟုတ် 'forgot' ဟု မှတ်သားထားမည်

function openLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
    document.getElementById('loginModal').classList.add('flex');
    
    // 💡 အနည်းငယ် နှောင့်နှေးပြီးမှ scale ကြီးလာစေရန် (Animation အတွက်)
    setTimeout(() => {
        document.querySelector('#loginModal > div').classList.remove('scale-95', 'opacity-0');
        document.querySelector('#loginModal > div').classList.add('scale-100', 'opacity-100');
    }, 10);
    
    switchForm('form-login');
    renderGoogleButton();
}

function closeLoginModal() {
    // 💡 အပိတ် Animation
    document.querySelector('#loginModal > div').classList.remove('scale-100', 'opacity-100');
    document.querySelector('#loginModal > div').classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('loginModal').classList.remove('flex');
        showMessage("", ""); 
    }, 200);
}

function switchForm(formId) {
    const forms = ['form-login', 'form-register', 'form-forgot', 'form-otp', 'form-reset'];
    forms.forEach(f => document.getElementById(f).classList.add('hidden'));
    document.getElementById(formId).classList.remove('hidden');
    showMessage("", ""); 

    // 🧹 Form ပြောင်းတိုင်း Password နှင့် OTP အကွက်များကို အလွတ် (Blank) ဖြစ်စေမည်
    document.getElementById('loginPassword').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('otpCode').value = ''; 
}

// 💡 ပြင်ဆင်ချက်: Message များကို ပိုမို သပ်ရပ်သော Alert Box ပုံစံဖြင့် ပြသမည်
function showMessage(text, type) {
    const msgBox = document.getElementById('authMessage');
    msgBox.innerText = text;
    if (type === 'error') {
        msgBox.className = "mb-5 text-center text-sm font-bold text-red-600 bg-red-50 py-3 px-4 rounded-xl border border-red-100 animate-pulse";
    } else if (type === 'success') {
        msgBox.className = "mb-5 text-center text-sm font-bold text-green-700 bg-green-50 py-3 px-4 rounded-xl border border-green-100";
    } else {
        msgBox.className = "hidden";
    }
}

// 💡 အသစ်ထည့်သွင်းချက်: Loading ချိန်တွင် ခလုတ်ကို Disable လုပ်၍ Double Click ကာကွယ်မည်
function setButtonState(btnId, isLoading, defaultText) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (isLoading) {
        btn.disabled = true;
        btn.innerText = "လုပ်ဆောင်နေပါသည်... ⏳";
        btn.classList.add('opacity-70', 'cursor-not-allowed');
    } else {
        btn.disabled = false;
        btn.innerText = defaultText;
        btn.classList.remove('opacity-70', 'cursor-not-allowed');
    }
}

async function fetchAuthAPI(payload) {
    try {
        const response = await fetch(USERS_DB_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (error) {
        return { status: "error", message: "စနစ်ချို့ယွင်းနေပါသည်။ ထပ်စမ်းကြည့်ပါ။" };
    }
}

// --------------------------------------------------
// ၁။ Login
// --------------------------------------------------
async function submitLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) return showMessage("အချက်အလက်များ ထည့်ပါ။", "error");

    setButtonState('btn-login', true);
    const result = await fetchAuthAPI({ action: 'login', email, password });
    
    if (result.status === "success") saveLoginSession(email, result.userName);
    else {
        showMessage(result.message, "error");
        setButtonState('btn-login', false, "ဝင်ရောက်မည် (Login)");
    }
}

// --------------------------------------------------
// ၂။ Register -> OTP တောင်းခြင်း
// --------------------------------------------------
async function submitRegister() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    if (!name || !email || !password) return showMessage("အချက်အလက်ပြည့်စုံစွာ ထည့်ပါ။", "error");

    setButtonState('btn-register', true);
    const result = await fetchAuthAPI({ action: 'request_register', name, email, phone, password });
    
    if (result.status === "success") {
        tempEmail = email;
        otpFlowType = 'register';
        document.getElementById('otpDisplayEmail').innerText = email;
        switchForm('form-otp');
        showMessage("သင့် Email သို့ OTP ပို့လိုက်ပါပြီ။", "success");
    } else showMessage(result.message, "error");
    
    setButtonState('btn-register', false, "အတည်ပြုမည် (Sign Up)");
}

// --------------------------------------------------
// ၃။ Forgot Password -> OTP တောင်းခြင်း
// --------------------------------------------------
async function submitForgotPassword() {
    const email = document.getElementById('forgotEmail').value;
    if (!email) return showMessage("အီးမေးလ် ထည့်ပေးပါ။", "error");

    setButtonState('btn-forgot', true);
    const result = await fetchAuthAPI({ action: 'forgot_password', email });
    
    if (result.status === "success") {
        tempEmail = email;
        otpFlowType = 'forgot';
        document.getElementById('otpDisplayEmail').innerText = email;
        switchForm('form-otp');
        showMessage("OTP ကို Email သို့ ပို့လိုက်ပါပြီ။", "success");
    } else showMessage(result.message, "error");
    
    setButtonState('btn-forgot', false, "OTP ပို့မည်");
}

// --------------------------------------------------
// ၄။ OTP စစ်ဆေးခြင်း (Register နှင့် Forgot ၂ ခုလုံးအတွက်)
// --------------------------------------------------
async function submitOTP() {
    const otp = document.getElementById('otpCode').value;
    if (!otp) return showMessage("OTP ကုဒ် ထည့်ပါ။", "error");

    setButtonState('btn-otp', true);
    const result = await fetchAuthAPI({ action: 'verify_otp', email: tempEmail, otp });
    
    if (result.status === "success") {
        if (otpFlowType === 'register') {
            const finalResult = await fetchAuthAPI({ action: 'finalize_register', email: tempEmail });
            if (finalResult.status === 'success') {
                showMessage("အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။ Login ဝင်နိုင်ပါပြီ!", "success");
                setTimeout(() => switchForm('form-login'), 2000);
            }
        } 
        else if (otpFlowType === 'forgot') {
            switchForm('form-reset');
            showMessage("OTP မှန်ကန်ပါသည်။ စကားဝှက်အသစ် ထည့်ပါ။", "success");
        }
    } else showMessage(result.message, "error");
    
    setButtonState('btn-otp', false, "ကုဒ်အတည်ပြုမည်");
}

// --------------------------------------------------
// ၅။ စကားဝှက်အသစ် ပြောင်းလဲခြင်း
// --------------------------------------------------
async function submitNewPassword() {
    const newPassword = document.getElementById('newPassword').value;
    if (!newPassword) return showMessage("စကားဝှက်အသစ် ထည့်ပါ။", "error");

    setButtonState('btn-reset', true);
    const result = await fetchAuthAPI({ action: 'reset_password', email: tempEmail, password: newPassword });
    
    if (result.status === "success") {
        showMessage("စကားဝှက် ပြောင်းလဲခြင်း အောင်မြင်ပါသည်။ Login ဝင်ပါ။", "success");
        setTimeout(() => switchForm('form-login'), 2000);
    } else showMessage(result.message, "error");
    
    setButtonState('btn-reset', false, "စကားဝှက် ပြောင်းမည်");
}

// --------------------------------------------------
// ၆။ Google Login 
// --------------------------------------------------
function renderGoogleButton() {
    if (typeof google === 'undefined') return;
    google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCredentialResponse });
    google.accounts.id.renderButton(document.getElementById("googleButtonDiv"), { theme: "outline", size: "large", width: "100%" });
}

async function handleGoogleCredentialResponse(response) {
    showMessage("Google အကောင့် စစ်ဆေးနေပါသည်...", "success");
    const result = await fetchAuthAPI({ action: 'google_login', token: response.credential });
    if (result.status === "success") saveLoginSession(result.email, result.userName);
    else showMessage(result.message, "error");
}

function saveLoginSession(email, name) {
    localStorage.setItem('tis_user_email', email);
    localStorage.setItem('tis_user_name', name);
    localStorage.setItem('tis_is_logged_in', 'true');
    showMessage("အောင်မြင်စွာ ဝင်ရောက်သွားပါပြီ!", "success");
    setTimeout(() => window.location.reload(), 1000);
}

function checkLoginStatus() { return localStorage.getItem('tis_is_logged_in') === 'true'; }
function logoutUser() { localStorage.clear(); window.location.reload(); }