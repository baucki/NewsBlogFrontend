<template>
    <div class="news-object" @click="handleClick" :class="{ 'hovered': isHovered }">
        <h2>{{ title }}</h2>
        <p> {{category}} </p>
        <p class="news-content">{{ content }}</p>
        <p>Date: {{ createdOn }}</p>
        <p>Author: {{ author }}</p>
        <p>Views: {{ views }}</p>
    </div>
</template>

<script>
export default {
    name: "NewsObject",
    props: {
        id: {
            type: Number,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        createdOn: {
            type: String,
            required: true
        },
        author: {
            type: String,
            required: true
        },
        views: {
            type: Number,
            required: true
        },

    },
    data() {
        return {
            isHovered: false
        };
    },
    methods: {
        handleClick() {
            this.$axios
                .put(`/api/news/views/${this.id}`) // Use the appropriate endpoint and HTTP method for updating the news
                .then(() => {
                    this.$router.push(`/single-news/${this.id}`)
                })
                .catch((error) => {
                    console.error("Error updating news:", error);
                });

        }
    }
}
</script>

<style scoped>
.news-object {
    width: 70%; /* Set the width of the news box to 70% of the screen */
    border: 1px solid #ccc; /* Add a border to the news box */
    padding: 10px; /* Add some padding inside the news box */
    margin: 10px auto; /* Add some margin outside the news box */
}

.news-object:hover {
    background-color: #f2f2f2; /* Change the background color on hover */
    cursor: pointer; /* Show a pointer cursor on hover */
}

.news-content {
    overflow: hidden; /* Hide any overflow of the content */
    text-overflow: ellipsis; /* Add ellipsis (...) for truncated text */
    white-space: nowrap; /* Prevent line breaks */
}
</style>