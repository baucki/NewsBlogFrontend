<template>
  <div>
      <h1>News</h1>
      <div class="dropdown">
          <select v-model="selectedCategory" @change="filterByCategory">
              <option value="">All</option>
              <option v-for="category in categories" :value="category.id" :key="category.id">
                  {{ category.name }}
              </option>
          </select>
      </div>
      <news-object
              v-for="newsItem in filterByCategory(this.news)"
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
    name: "News",
    components: {
        NewsObject
    },
    data() {
        return {
            news: [],
            users: [],
            categories: [],
            selectedCategory: ''
        };
    },
    created() {
        this.$axios.get('api/news').then((response) => {
            this.news = response.data;
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
        filterByCategory() {
            const selectedCategory = this.categories.find(category => category.id === this.selectedCategory);

            if (selectedCategory) {
                const filteredNews = this.news.filter(newsItem => newsItem.categoryId === selectedCategory.id);
                // Use the filteredNews as needed
                return filteredNews
            } else {
                // No category selected
                return this.news
            }
        }
    }
}
</script>

<style scoped>

</style>