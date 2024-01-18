<template>
    <div>
        <div class="single-news">
            <h2>{{ this.news.title }}</h2>
            <p> {{ getCategory(this.news.categoryId) }} </p>
            <p class="single-news-content">{{ this.news.content }}</p>
            <p>Date: {{ formatDate(this.news.createdOn) }}</p>
            <p>Author: {{ getAuthor(this.news.userId) }}</p>
            <p>Views: {{ this.news.views }}</p>
        </div>

        <h3>Comments</h3>

        <div class="comment-input">
            <input type="text" v-model="newComment" placeholder="Enter your comment">
            <button @click="addComment">Submit</button>
        </div>

        <comment
            v-for="commentItem in this.comments"
            :key="commentItem.id"
            :id="commentItem.id"
            :author="getAuthor(commentItem.userId)"
            :authorId="commentItem.userId"
            :newsId="commentItem.newsId"
            :date="formatDate(commentItem.createdOn)"
            :content="commentItem.content"
            :canUpdate="isMyComment(commentItem.userId)"
            :canDelete="isMyComment(commentItem.userId)"
        />

    </div>
</template>

<script>
import Comment from "@/components/Comment.vue";
import NewsObject from "@/components/NewsObject.vue";

export default {
    name: "SingleNews",
    components: {NewsObject, Comment},
    data() {
        return{
            news: {
                id: '',
                title: '',
                categoryId: '',
                content: '',
                createdOn: '',
                userId: '',
                views: '',
            },
            comment: {
                content: '',
                createdOn: '',
                userId: '',
                newsId: '',
            },
            users: [],
            categories: [],
            comments: [],
            newComment: '',
            loggedUserId: ''
        }
    },
    created() {
        this.$axios.get(`api/news/${this.$route.params.id}`).then((response) => {
            this.news = response.data;
        })
        this.$axios.get('api/users').then((response) => {
            this.users = response.data;
        })
        this.$axios.get('api/categories').then((response) => {
            this.categories = response.data;
        })

        this.$axios.get(`api/comments/news/${this.$route.params.id}`).then((response) => {
            this.comments = response.data;
            this.comments = this.sort(this.comments)
        })

        this.getUserIdByEmail()

        this.$root.$on('deletedComment', this.handleDeletedComment)
        this.$root.$on('updatedComment', this.handleUpdatedComment)

    },
    methods: {
        getAuthor(id) {
            const user = this.users.find(user => user.id === id);
            if (user) {
                return `${user.firstName} ${user.lastName}`;
            } else {
                return "";
            }
        },
        getCategory(id) {
            const category = this.categories.find(category => category.id === id);
            if (category) {
                return `${category.name}`
            } else {
                return "";
            }
        },
        formatDate(date) {
            return  new Date(date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            })
        },
        formatDateToSend(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        sort(list) {
            list.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
            return list;
        },
        addComment() {
            const jwt = localStorage.getItem('jwt'); // Get the JWT from localStorage
            if (jwt) {
                const payload = JSON.parse(atob(jwt.split('.')[1])); // Decode the JWT

                this.$axios.get(`/api/users/email/${payload.sub}`)
                    .then((response) => {
                        this.comment.userId = response.data.id;
                        this.comment.content = this.newComment;
                        this.comment.createdOn = this.formatDateToSend(new Date());
                        this.comment.newsId = this.$route.params.id;

                        this.$axios.post('/api/comments', this.comment)
                            .then((comment) => {
                                this.comments.push(comment.data);
                                this.comments = this.sort(this.comments)
                                this.clearComment()
                            })
                            .catch((error) => {
                                console.error("Error creating comment:", error);
                            });


                    })
                    .catch((error) => {
                        console.error("Error getting userId:", error);
                    });
            } else {
                this.clearComment();

            }
        },
        isMyComment(commentUserId) {
            return commentUserId === this.loggedUserId;
        },
        getUserIdByEmail() {
            const jwt = localStorage.getItem('jwt'); // Get the JWT from localStorage

            if (jwt) {
                const payload = JSON.parse(atob(jwt.split('.')[1])); // Decode the JWT
                const userEmail = payload.sub;

                this.$axios.get(`/api/users/email/${userEmail}`).then((response) => {
                        this.loggedUserId = response.data.id;
                    });
            }
        },
        clearComment() {
            this.comment.content = "";
            this.comment.createdOn = "";
            this.comment.userId = "";
            this.comment.newsId = "";
            this.newComment = "";

        },
        handleDeletedComment(id) {
            this.comments = this.comments.filter(comment => comment.id !== id);

        },
        handleUpdatedComment(id, updatedComment) {
            const index = this.comments.findIndex((comment) => comment.id === id);
            if (index !== -1) {
                this.comments.splice(index, 1, { ...this.comments[index], ...updatedComment});
            }
        }
    }
}
</script>

<style scoped>

.comment-input {
    margin-bottom: 10px;
}

.comment-input input[type="text"] {
    width: 100%;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.comment-input button {
    padding: 5px 10px;
    background-color: #f2f2f2;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
</style>