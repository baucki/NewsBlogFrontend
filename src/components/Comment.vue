<template>
    <div class="comment">
        <p>Author: {{ author }}</p>
        <p>Date: {{ date }}</p>
        <p>{{ content }}</p>

        <button v-if="canUpdate" @click="openUpdatePopup">Update</button>
        <button v-if="canDelete" @click="deleteComment()">Delete</button>

        <div v-if="showUpdatePopup" class="popup">
            <div class="popup-content">
                <textarea v-model="updatedContent" placeholder="Enter updated comment"></textarea>
                <div class="popup-buttons">
                    <button @click="updateComment">Save</button>
                    <button @click="closeUpdatePopup">Cancel</button>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
export default {
    name: "Comment",
    props: {
        id: {
            type: Number,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        author: {
            type: String,
            required: true
        },
        authorId: {
            type: Number,
            required: true
        },
        newsId: {
            type: Number,
            required: true
        },
        canUpdate: {
            type: Boolean,
            required: true,
        },
        canDelete: {
            type: Boolean,
            required: true,
        }
    },
    data() {
        return {
            showUpdatePopup: false,
            updatedContent: ''
        };
    },
    methods: {
        openUpdatePopup() {
            this.showUpdatePopup = true;
            this.updatedContent = this.content;
        },
        closeUpdatePopup() {
            this.showUpdatePopup = false;
            this.updatedContent = '';
        },
        updateComment() {

            const updatedComment = {
                userId: this.authorId,
                newsId: this.newsId,
                createdOn: this.formatDateToSend(new Date(this.date)),
                content: this.updatedContent
            }

            this.$axios.put(`/api/comments/${this.id}`, updatedComment)
                .then(() => {
                    this.$root.$emit("updatedComment", this.id, updatedComment);
                })
                .catch((error) => {
                    console.error("Error deleting user:", error);
                });



            this.closeUpdatePopup(); // Close the popup after updating
        },
        deleteComment() {

            this.$axios.delete(`/api/comments/${this.id}`)
                .then(() => {
                    this.$root.$emit("deletedComment", this.id);
                })
                .catch((error) => {
                    console.error("Error deleting user:", error);
                });

        },
        formatDateToSend(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
    }
}
</script>

<style scoped>
.comment {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 10px;
    background-color: #f2f2f2;
}
.popup {
    width: 600px;
    max-width: 90%;
    border: 1px solid #ccc;
    border-radius: 4px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
.popup-content {
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 40px;
    max-width: 600px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.popup textarea {
    width: 100%;
    height: 150px;
    resize: vertical;
    margin-bottom: 10px;
}

.popup-buttons {
    text-align: right;
    margin-top: 10px;
}

.popup button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background-color: #f2f2f2;
    color: #333;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.popup button:first-child {
    margin-right: 8px;
}

.popup button:hover {
    background-color: #ccc;
}

</style>