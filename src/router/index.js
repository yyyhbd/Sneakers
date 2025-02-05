import { createRouter, createWebHistory } from 'vue-router'
import SignUp from '../views/SingUp.vue'
import SignIn from '../views/SignIn.vue'
import Sneakers from '../views/Sneakers.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
      {
    path: '/',
    redirect: '/sneakers',
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUp,
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignIn,
    },
    {
      path: '/sneakers',
      name: 'sneakers',
      component: Sneakers,
    },
  ]
})

export default router
