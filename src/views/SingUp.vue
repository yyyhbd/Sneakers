<script setup>
import {useAuthStore} from '../stores/auth';
import { ref } from "vue";
import {useRouter} from 'vue-router';
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Message from "primevue/message"
import Loader from '../components/Loader.vue'

const authStore = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");

const signup = async () => {
    await authStore.auth({ email: email.value, password: password.value }, 'signup');
     if (!authStore.error) {
        router.push('/sneakers'); // Переход только в случае успешного входа
    }
};
</script>

<template>
    <div class="signup-container">
        <h2>Sign Up</h2>
        <form class="flex flex-column gap-3">
            <Message  class="messag" v-if="authStore.error" severity="warn">{{ authStore.error }}</Message>
            <InputText type="email" v-model="email" placeholder="Your Email" class="input-field"/>
            <InputText type="password" v-model="password" placeholder="Password" class="input-field"/>
            <div class="loader-wrapper" v-if="authStore.loader">
                <Loader />
            </div>
                <div  v-if="!authStore.loader" class="flex flex-column gap-3" >
                <Button label="Sign Up" @click="signup" class="submit-button"/>
                <span class="login-link">
                    Are you already registered? <router-link to="/signin"  class="custom-link">Sign in</router-link>
                </span>
                </div>
        </form>
    </div>
</template>

<style scoped>
.loader-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
}
.custom-link {
  color: white; 
  transition: opacity 0.3s;
   opacity: 0.5; 
}

.custom-link:hover {
  opacity: 1;
}
.messag{
 margin-bottom: 10px;
}
.signup-container {
    max-width: 400px;
    max-height: 350px;
    margin: auto;
    margin-top: 50px;
    padding: 20px;
    background-color: #1a1a1a; /* Черный фон */
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    color: white; /* Белый текст */
    display: flex; /* Используем Flexbox */
    flex-direction: column; /* Вертикальное направление */
    align-items: center; /* Центрируем по горизонтали */
    justify-content: center; /* Центрируем по вертикали */
    height: 100vh; /* Занимаем всю высоту экрана */
}

h2 {
    text-align: center;
    margin-bottom: 20px;
    font-family: Arial, sans-serif;
}

.input-field {
    width: 100%;
    margin-bottom: 15px;
    background-color: #333; /* Темный фон для полей ввода */
    border: 1px solid #555; /* Темные границы */
    color: white; /* Белый текст в полях */
}

.input-field:focus {
    border-color: #007bff; /* Цвет рамки при фокусе */
    outline: none;
}

.submit-button {
    width: 100%;
    margin-top: 10px;
    background-color: #28a745; /* Зеленый фон для кнопки */
    border: none;
    color: white;
    border-radius: 4px;
}

.submit-button:hover {
    background-color: #218838; /* Темнее при наведении */
}

.login-link {
    display: block;
    text-align: center;
    justify-content: center;
    margin-top: 10px;
    color: #ffffff; /* Цвет для ссылки */
}

</style>