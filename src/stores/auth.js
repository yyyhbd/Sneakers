import { ref, onMounted } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';

const apiKey = import.meta.env.VITE_API_KEY_FIREBASE;

export const useAuthStore = defineStore('auth', () => {
    const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')) || { 
        token: '', email: '', userid: '', refreshToken: '', expiresIn: '' 
    });
    const error = ref('');
    const loader = ref(false);
    const isAdmin = ref(JSON.parse(localStorage.getItem('isAdmin')) || false);

    const adminCredentials = {
        email: import.meta.env.VITE_ADMIN_EMAIL,
        password: import.meta.env.VITE_ADMIN_PASSWORD
    };

    onMounted(() => {
        if (userInfo.value.token) {
            isAdmin.value = JSON.parse(localStorage.getItem('isAdmin')) || false;
        }
    });

    const handleAuthResponse = (response, payload) => {
        userInfo.value = {
            token: response.data.idToken,
            email: response.data.email,
            userid: response.data.localId,
            refreshToken: response.data.refreshToken,
            expiresIn: response.data.expiresIn
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value));

        if (payload.email === adminCredentials.email && payload.password === adminCredentials.password) {
            isAdmin.value = true;
            localStorage.setItem('isAdmin', 'true');
        } else {
            isAdmin.value = false;
            localStorage.setItem('isAdmin', 'false');
        }
    };

    const auth = async (payload, type) => {
        const stringUrl = type === 'signup' ? 'signUp' : 'signInWithPassword';
        error.value = '';
        loader.value = true;

        try {
            const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:${stringUrl}?key=${apiKey}`, {
                ...payload,
                returnSecureToken: true
            });
            handleAuthResponse(response, payload);
        } catch (err) {
            error.value = err.response?.data?.error?.message || 'Network error or server unavailable';
        } finally {
            loader.value = false;
        }
    };
const handleLogout = () => {
    authStore.logout();
    selectedItems.value = []; // Очистка состояния выбранных товаров в приложении
    localStorage.removeItem('selectedItems'); // Удаление сохраненных выбранных товаров из localStorage
    router.push('/');
};
const logout = () => {
    userInfo.value = { token: '', email: '', userid: '', refreshToken: '', expiresIn: '' };
    isAdmin.value = false;
    localStorage.removeItem('userInfo');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('selectedItems'); // Удаление выбранных товаров из localStorage
    selectedItems.value = []; // Очистка состояния в приложении
};

    return { auth, userInfo, error, loader, isAdmin, logout ,handleLogout};
});