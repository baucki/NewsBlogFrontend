<template>
  <div>
      <h1>Popular</h1>
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

import NewsObject from "@/components/NewsObject.vue";

export default {
    name: "Popular",
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
            this.news = this.lastMonth(this.news)
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
            list.sort((a, b) => b.views - a.views);
            return list;
        },
        lastMonth(list) {
            const currentDate = new Date();
            const oneMonthAgo = new Date().setMonth(currentDate.getMonth() - 1);

            return list.filter(newsItem => {
                const newsDate = new Date(newsItem.createdOn);
                return newsDate >= oneMonthAgo;
            });
        }
    }
}
</script>

<style scoped>

</style>