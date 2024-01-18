<template>
  <div>
      <h1>Categories</h1>
      <div>
          <div>
              <b-table striped hover :items="paginatedCategories" :fields="tableFields">
                  <template v-slot:cell(actions)="row">
                      <b-button @click="updateCategory(row.item)" variant="primary">Update</b-button>
                      <b-button @click="deleteCategory(row.item.id)" variant="danger">Delete</b-button>
                  </template>
              </b-table>
              <b-button @click="showCreatedModal" variant="primary">Create</b-button>
          </div>

          <b-modal v-model="showCreateModal" title="Create New Category"  @ok="handleFormSubmit" @cancel="cancelCreate" >
              <form ref="createForm" @submit.prevent="handleFormSubmit">
                  <label>Name:</label>
                  <b-form-input v-model="newCategory.name" required></b-form-input>

                  <label>Description:</label>
                  <b-form-textarea v-model="newCategory.description" required></b-form-textarea>

              </form>
              <p v-if="hasValidationError" class="text-danger">Please fill in all required fields.</p>
          </b-modal>

          <div class="pagination">
              <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
              <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
          </div>

      </div>
  </div>
</template>

<script>
export default {
    name: "TableCategories",
    data() {
        return {
            categories: [],
            tableFields: [
                {key: "id", label: "Id"},
                {key: "name", label: "Name"},
                {key: "description", label: "Description"},
                {key: "actions", label: "Actions"}
            ],
            showCreateModal: false,
            modalTitle: 'Create New Category',
            hasValidationError: false,
            newCategory: {
                name: "",
                description: "",
            },
            isUpdateMode: false,
            itemsPerPage: 10,
            currentPage: 1


        }
    },
    computed: {
        totalPages() {
            return Math.ceil(this.categories.length / this.itemsPerPage);
        },
        paginatedCategories() {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            return this.categories.slice(startIndex, endIndex);
        }
    },
    created() {
        this.$axios.get('/api/categories').then((response) => {
            this.categories = response.data;
        });
    },
    methods: {
        handleFormSubmit(evt) {
            if (this.$refs.createForm.checkValidity()) {
                if (this.isUpdateMode) {
                    this.updateCategoryRequest();
                } else {
                    this.createCategoryRequest();
                }
                this.closeCreateModal();
            } else {
                this.hasValidationError = true;
                evt.preventDefault();
            }
        },
        updateCategoryRequest() {
            const { id, ...updatedCategory } = this.newCategory; // Exclude the 'id' field from the updated category object



            this.$axios
                .put(`/api/categories/${id}`, updatedCategory) // Use the appropriate endpoint and HTTP method for updating the category
                .then(() => {
                    // Update the category in the local categories list
                    const index = this.categories.findIndex((category) => category.id === id);
                    if (index !== -1) {
                        this.categories.splice(index, 1, { ...this.categories[index], ...updatedCategory });
                    }
                })
                .catch((error) => {
                    console.error("Error updating category:", error);
                });
        },
        createCategoryRequest() {
            this.$axios.post('/api/categories', this.newCategory)
                .then((category) => {
                    this.categories.push(category.data);
                })
                .catch((error) => {
                    console.error("Error creating category:", error);
                });
        },
        updateCategory(category) {
            this.newCategory = {...category};
            this.isUpdateMode = true;
            this.showCreateModal = true;
            this.modalTitle = "Update Category"
        },
        deleteCategory(id) {
            this.$axios.delete(`/api/categories/${id}`)
                .then(() => {
                    // Remove the deleted category from the local category list
                    this.categories = this.categories.filter(category => category.id !== id);
                })
                .catch((error) => {
                    console.error("Error deleting category:", error);
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
            this.resetNewCategory();
        },
        resetNewCategory() {
            this.newCategory = {
                name: "",
                description: "",
            };
            this.isUpdateMode = false;
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