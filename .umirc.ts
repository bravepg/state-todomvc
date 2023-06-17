import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'TodoMVC',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    {
      name: 'TodoRedux',
      path: '/todo-redux',
      component: './TodoRedux',
    },
    {
      name: 'TodoContext',
      path: '/todo-context',
      component: './TodoHooks/TodoContext',
    },
    {
      name: 'TodoReducer',
      path: '/todo-reducer',
      component: './TodoHooks/TodoReducer',
    },
    {
      name: 'TodoMobx',
      path: '/todo-mobx',
      component: './TodoMobx',
    },
    {
      name: 'TodoValtio',
      path: '/todo-valtio',
      component: './TodoValtio',
    },
    {
      name: 'TodoZustand',
      path: '/todo-zustand',
      component: './TodoZustand',
    },
  ],
  npmClient: 'pnpm',
});
