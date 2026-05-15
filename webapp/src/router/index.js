import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/home/Home.vue'
import Study from '@/views/study/Study.vue'
import What from '@/views/what/What.vue'
import Mine from '@/views/mine/Mine.vue'
// 吃
import FoodList from '@/views/food/FoodList.vue'
import FoodDetail from '@/views/food/FoodDetail.vue'
import FoodCreate from '@/views/food/FoodCreate.vue'
// 喝
import Drink from '@/views/drink/DrinkList.vue'
// 玩
import EnjoyList from '@/views/enjoy/EnjoyList.vue'
import EnjoyDetail from '@/views/enjoy/EnjoyDetail.vue'
import EnjoyCreate from '@/views/enjoy/EnjoyCreate.vue'
// 乐
import Fun from '@/views/fun/FunList.vue'
// AI聊天
import AIChat from '@/views/study/AIChat.vue'
// Coconut Bridge 测试
import CoconutTest from '@/views/study/CoconutTest.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/study',
      name: 'study',
      component: Study,
    },
    {
      path: '/what',
      name: 'what',
      component: What,
    },
    {
      path: '/mine',
      name: 'mine',
      component: Mine,
    },
    // 吃
    {
      path: '/food',
      name: 'food',
      component: FoodList,
    },
    {
      path: '/food/detail/:id',
      name: 'foodDetail',
      component: FoodDetail,
    },
    {
      path: '/food/create',
      name: 'FoodCreate',
      component: FoodCreate,
      meta: {
        title: '新增美食'
      }
    },
    {
      path: '/food/edit/:id',
      name: 'FoodEdit',
      component: FoodCreate,
      meta: {
        title: '编辑美食'
      }
    },
    // 喝
    {
      path: '/drink',
      name: 'drink',
      component: Drink,
    },
    // 玩
    {
      path: '/enjoy',
      name: 'enjoy',
      component: EnjoyList,
    },
    {
      path: '/enjoy/detail/:id',
      name: 'enjoyDetail',
      component: EnjoyDetail,
    },
    {
      path: '/enjoy/create',
      name: 'EnjoyCreate',
      component: EnjoyCreate,
      meta: {
        title: '新增'
      }
    },
    // 乐
    {
      path: '/fun',
      name: 'fun',
      component: Fun,
    },
    // AI聊天
    {
      path: '/large-language-model',
      name: 'largeLanguageModel',
      component: AIChat,
    },
    // Coconut Bridge 测试
    {
      path: '/coconut-test',
      name: 'coconutTest',
      component: CoconutTest,
    },
  ],
})

export default router
