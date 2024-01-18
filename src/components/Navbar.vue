<template>
    <div>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Web programiranje</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <router-link to="/" tag="a" class="nav-link" :class="{active: this.$router.currentRoute.name === 'Home'}">Home</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link :to="{name: 'News'}" tag="a" class="nav-link" :class="{active: this.$router.currentRoute.name === 'News'}">News</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link :to="{name: 'Popular'}" tag="a" class="nav-link" :class="{active: this.$router.currentRoute.name === 'Popular'}">Popular</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link v-if="isAdmin" :to="{name: 'TableUsers'}" tag="a" class="nav-link" :class="{active: this.$router.currentRoute.name === 'TableUsers'}">TableUsers</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link :to="{name: 'TableCategories'}" tag="a" class="nav-link" :class="{active: this.$router.currentRoute.name === 'TableCategories'}">TableCategories</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link :to="{name: 'TableNews'}" tag="a" class="nav-link" :class="{active: this.$router.currentRoute.name === 'TableNews'}">TableNews</router-link>
                        </li>
                    </ul>
                    <form v-if="canLogout" class="d-flex" @submit.prevent="logout">
                        <button class="btn btn-outline-secondary" type="submit">Logout</button>
                    </form>
                    <form v-if="canLogin" class="d-flex" @submit.prevent="login">
                        <button class="btn btn-outline-secondary" type="submit">Login</button>
                    </form>

                </div>
            </div>
        </nav>
    </div>

</template>

<script>

export default {
    name: "Navbar",
    data() {
        return {
            userType: ''
        }
    },
    created() {
        this.$root.$on('loggedIn', this.handleLoggedIn)
        this.$root.$on('loggedOut', this.handleLoggedOut)
    },
    computed: {
        canLogout() {
            return this.userType !== 'NOT_LOGGED_IN'
        },
        canLogin() {
            return this.userType === 'NOT_LOGGED_IN'
        },
        isAdmin() {
            return this.userType === 'ADMIN'
        }
    },
    mounted() {
        this.handleLoggedIn()
    },
    methods: {
        logout() {
            localStorage.removeItem("jwt");
            this.$router.push({name: 'Login'})
            this.$root.$emit('loggedOut')
        },
        login() {
            if (this.$route.name !== 'Login')
            this.$router.push({name: 'Login'})
        },
        handleLoggedIn() {
            const jwt = localStorage.getItem('jwt'); // Get the JWT from localStorage
            if (jwt) {
                const decodedJwt = JSON.parse(atob(jwt.split('.')[1])); // Decode the JWT
                if (decodedJwt.type === 'ADMIN') {
                    this.userType =  'ADMIN'
                } else {
                    this.userType =  'CONTENT_CREATOR'
                }
            } else {
                this.userType = 'NOT_LOGGED_IN'
            }
        },
        handleLoggedOut() {
            this.userType =  'NOT_LOGGED_IN'
        }

    }
}
</script>

<style scoped>

</style>