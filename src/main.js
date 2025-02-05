import { createApp } from 'vue';
import { initializeApp } from 'firebase/app';
import { createPinia } from 'pinia'; // Импортируем createPinia
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import App from './App.vue';
import router from './router';


const firebaseConfig = {
  apiKey: "AIzaSyC3rSBHg2JGyHcSeNv52go3ehYR4RC8TeI",
  authDomain: "vue0-5ab93.firebaseapp.com",
  projectId: "vue0-5ab93",
  storageBucket: "vue0-5ab93.firebasestorage.app",
  messagingSenderId: "190032097588",
  appId: "1:190032097588:web:98ad56b6b9fe9bd4e7f561",
  measurementId: "G-PR9GDVSX95"
};

initializeApp(firebaseConfig);

const app = createApp(App);
const pinia = createPinia(); // Создаем экземпляр Pinia
app.use(pinia); // Используем Pinia
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.mount('#app');