<template>
  <div>
      <h1>News</h1>
      <div>
          <b-table striped hover :items="paginatedNews" :fields="tableFields">
              <template v-slot:cell(actions)="row">
                  <b-button @click="updateNews(row.item)" variant="primary">Update</b-button>
                  <b-button @click="deleteNews(row.item.id)" variant="danger">Delete</b-button>
              </template>
          </b-table>
          <b-button @click="showCreatedModal" variant="primary">Create</b-button>
      </div>

      <b-modal v-model="showCreateModal" title="Create New News"  @ok="handleFormSubmit" @cancel="cancelCreate" >
          <form ref="createForm" @submit.prevent="handleFormSubmit">
              <label>Title:</label>
              <b-form-input v-model="newNews.title" required></b-form-input>

              <label>Content:</label>
              <b-form-textarea v-model="newNews.content" required></b-form-textarea>

              <label>Category:</label>
              <b-form-select v-model="categoryName" :options="categoryNames" required></b-form-select>

          </form>
          <p v-if="hasValidationError" class="text-danger">Please fill in all required fields.</p>
      </b-modal>

      <div class="pagination">
          <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
          <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>

  </div>
</template>

<script>
export default {
    name: "TableNews",
    data() {
        return {
            news: [],
            categoryNames: [],
            tableFields: [
                { key: "id", label: "Id" },
                { key: "title", label: "Title"},
                { key: "content", label: "Content"},
                { key: "createdOn", label: "Created On"},
                { key: "views", label: "Views" },
                { key: "userId", label: "AuthorId"},
                { key: "categoryId", label: "CategoryId"},
                { key: "actions", label: "Actions"},
            ],
            showCreateModal: false,
            modalTitle: "Create New News",
            hasValidationError: false,
            categoryName: '',
            newNews: {
                title: "",
                content: "",
                createdOn: "",
                views: "",
                userId: "",
                categoryId: ""
            },
            isUpdateMode: false,
            itemsPerPage: 10,
            currentPage: 1

        }
    },
    created() {
        this.$axios.get('/api/news').then((response) => {

            this.news = response.data;
            this.news.forEach(news => {
                news.createdOn = new Date(news.createdOn).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })
            })
        });

        this.$axios.get('/api/categories').then((response) => {
            this.categoryNames = response.data.map(category => category.name);
        });

    },
    computed: {
        totalPages() {
            return Math.ceil(this.news.length / this.itemsPerPage);
        },
        paginatedNews() {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            return this.news.slice(startIndex, endIndex);
        }
    },
    methods: {

        handleFormSubmit(evt) {
            if (this.$refs.createForm.checkValidity()) {
                if (this.isUpdateMode) {
                    this.updateNewsRequest();
                } else {
                    this.setNewsAttributes(this.categoryName)
                        .then(() => {
                            this.createNewsRequest();
                        });
                }
            } else {
                this.hasValidationError = true;
                evt.preventDefault();
            }
        },
        updateNewsRequest() {
            const { id, ...updatedNews } = this.newNews; // Exclude the 'id' field from the updated news object

            console.log(updatedNews)

            this.$axios
                .put(`/api/news/${id}`, updatedNews) // Use the appropriate endpoint and HTTP method for updating the news
                .then(() => {
                    // Update the news in the local news list
                    const index = this.news.findIndex((news) => news.id === id);
                    if (index !== -1) {
                        this.news.splice(index, 1, { ...this.news[index], ...updatedNews });
                    }
                    this.closeCreateModal()
                })
                .catch((error) => {
                    console.error("Error updating news:", error);
                });
        },
        createNewsRequest() {
            console.log(this.newNews)
            this.$axios.post('/api/news', this.newNews)
                .then((news) => {
                    this.news.push(news.data);
                    this.news.forEach(news => {
                        news.createdOn = new Date(news.createdOn).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })
                    })
                    this.closeCreateModal()
                })
                .catch((error) => {
                    console.error("Error creating news:", error);
                });
            return true;
        },
        setNewsAttributes(categoryName) {
            return new Promise((resolve, reject) => {

                const currentDate = new Date();
                const year = currentDate.getFullYear();
                const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
                const day = currentDate.getDate().toString().padStart(2, '0');

                this.newNews.createdOn = `${year}-${month}-${day}`;
                this.newNews.views = 0;

                const currentUserEmail = this.getEmail();

                this.$axios.get(`/api/users/email/${currentUserEmail}`)
                    .then((response) => {
                        this.newNews.userId = response.data.id;

                        this.$axios.get(`/api/categories/name/${categoryName}`)
                            .then((response) => {
                                this.newNews.categoryId = response.data.id;


                                resolve(); // Resolve the Promise once data is set

                            })
                            .catch((error) => {
                                console.error("Error getting category:", error);
                                reject(error); // Reject the Promise if there is an error
                            });

                    })
                    .catch((error) => {
                        console.error("Error getting category:", error);
                        reject(error); // Reject the Promise if there is an error
                    });
            });
        },
        getEmail() {
            const jwt = localStorage.getItem('jwt'); // Get the JWT from localStorage
            if (jwt) {
                const decodedJwt = JSON.parse(atob(jwt.split('.')[1])); // Decode the JWT
                return decodedJwt.sub;
            }
        },
        updateNews(news) {
            this.newNews = {...news};
            this.formatDate()
            this.isUpdateMode = true;
            this.showCreateModal = true;
            this.modalTitle = "Update News"
        },
        deleteNews(id) {
            this.$axios.delete(`/api/news/${id}`)
                .then(() => {
                    // Remove the deleted category from the local news list
                    this.news = this.news.filter(news => news.id !== id);
                })
                .catch((error) => {
                    console.error("Error deleting news:", error);
                });
        },
        showCreatedModal() {
            this.showCreateModal = true;
        },
        cancelCreate() {
            this.closeCreateModal();
        },
        closeCreateModal() {
            this.showCreateModal = false;
            this.resetNewNews();
        },
        resetNewNews() {
            this.newNews = {
                title: "",
                content: "",
                createdOn: "",
                views: "",
                userId: "",
                categoryId: ""
            },
            this.categoryName = '';
            this.isUpdateMode = false;
        },
        formatDate() {
            const dateObj = new Date(this.newNews.createdOn);
            const year = dateObj.getFullYear();
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const day = dateObj.getDate().toString().padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            this.newNews.createdOn = formattedDate
        },
        previousPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        }
    }
}
</script>

<style scoped>

</style>