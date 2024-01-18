<template>
  <div class="home">
      <h1>Home</h1>
      <news-object
              v-for="newsItem in this.news.slice(0,10)"
              :key="newsItem.id"
              :id="newsItem.id"
              :title="newsItem.title"
              :category="getCategory(newsItem.categoryId)"
              :content="newsItem.content"
              :createdOn="formatDate(newsItem.createdOn)"
              :author="getAuthor(newsItem.userId)"
              :views="newsItem.views"
      />

  </div>
</template>

<script>
// // @ is an alias to /src
import NewsObject from "@/components/NewsObject.vue";

export default {
    name: 'Home',
    components: {
        NewsObject
    },
    data() {
        return {
            news: [],
            users: [],
            categories: [],
        };
    },
    created() {
        this.$axios.get('api/news').then((response) => {
            this.news = response.data;
            this.news = this.sort(this.news)
        })
        this.$axios.get('api/users').then((response) => {
            this.users = response.data;
        })
        this.$axios.get('api/categories').then((response) => {
            this.categories = response.data;
        })
    },
    methods: {
        getAuthor(id) {
            const user = this.users.find(user => user.id === id);
            if (user) {
                return `${user.firstName} ${user.lastName}`;
            } else {
                return '';
            }
        },
        getCategory(id) {
            const category = this.categories.find(category => category.id === id);
            if (category) {
                return `${category.name}`
            } else {
                return '';
            }
        },
        formatDate(date) {
            return  new Date(date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            })
        },
        sort(list) {
            list.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
            return list;
        }
    }

}
</script>
