import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/news',
    name: 'News',
    component: () => import(/* webpackChunkName: "news" */ '../views/News.vue')
  },
  {
    path: '/popular',
    name: 'Popular',
    component: () => import(/* webpackChunkName: "popular" */ '../views/Popular.vue')
  },
  {
    path: '/table-users',
    name: 'TableUsers',
    meta: {
      authRequired: true,
    },
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "tableUsers" */ '../views/TableUsers.vue')
  },
  {
    path: '/table-categories',
    name: 'TableCategories',
    meta: {
      authRequired: true,
    },
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "tableCategories" */ '../views/TableCategories.vue')
  },
  {
    path: '/table-news',
    name: 'TableNews',
    meta: {
      authRequired: true,
    },
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "tableNews" */ '../views/TableNews.vue')
  },
  {
    path: '/single-news/:id',
    name: 'SingleNews',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "singleNews" */ '../views/SingleNews.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName "login" */ '../views/Login.vue')
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.authRequired) {
    const jwt = localStorage.getItem('jwt');

    if (!jwt) {
      next({name: 'Login'});
      return;
    }

    // check if payload of user has status inactive
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    const status = payload.status;
    if (status === 'INACTIVE') {
      next({name: 'Login'});
      return;
    }

  }

  next();

});

export default router
