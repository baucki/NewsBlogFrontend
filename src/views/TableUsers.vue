<template>
    <div>
      <h1>Users</h1>
      <div>
          <b-table striped hover :items="paginatedUsers" :fields="tableFields">
            <template v-slot:cell(actions)="row">
                <b-button @click="updateUser(row.item)" variant="primary">Update</b-button>
                <b-button @click="deleteUser(row.item.id)" variant="danger">Delete</b-button>
            </template>
          </b-table>
          <b-button @click="showCreatedModal" variant="primary">Create</b-button>
      </div>

      <b-modal v-model="showCreateModal" title="Create New User"  @ok="handleFormSubmit" @cancel="cancelCreate" >
          <form ref="createForm" @submit.prevent="handleFormSubmit">
              <label>Email:</label>
              <b-form-input v-model="newUser.email" required></b-form-input>

              <label>First Name:</label>
              <b-form-input v-model="newUser.firstName" required></b-form-input>

              <label>Last Name:</label>
              <b-form-input v-model="newUser.lastName" required></b-form-input>

              <label>Type:</label>
              <b-form-select class="select" v-model="newUser.type" :options="userTypes" required></b-form-select>

              <label>Password:</label>
              <b-form-input v-model="newUser.password" type="password" required></b-form-input>

              <label>Status:</label>
              <b-form-select class="select" v-model="newUser.status" :options="userStatuses" required></b-form-select>
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
    name: "Users",
    data() {
        return {
            users: [],
            tableFields: [
                { key: "id", label: "Id" },
                { key: "email", label: "Email" },
                { key: "firstName", label: "First Name" },
                { key: "lastName", label: "Last Name" },
                { key: "type", label: "Type" },
                { key: "password", label: "Password" },
                { key: "status", label: "Status" },
                { key: "actions", label: "Actions" },
            ],
            showCreateModal: false,
            modalTitle: 'Create New User',
            hasValidationError: false,
            newUser: {
                email: "",
                firstName: "",
                lastName: "",
                type: "",
                password: "",
                status: "",
            },
            userTypes: ["ADMIN", "CONTENT_CREATOR"], // Example user types
            userStatuses: ["ACTIVE", "INACTIVE"], // Example user statuses
            isUpdateMode: false,
            itemsPerPage: 10,
            currentPage: 1
        }
    },
    computed: {
        totalPages() {
            return Math.ceil(this.users.length / this.itemsPerPage);
        },
        paginatedUsers() {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            return this.users.slice(startIndex, endIndex);
        }
    },
    created() {
        this.$axios.get('/api/users').then((response) => {
            this.users = response.data;
        });
    },
    methods: {
        handleFormSubmit(evt) {
            if (this.$refs.createForm.checkValidity()) {
                if (this.isUpdateMode) {
                    this.updateUserRequest();
                } else {
                    this.createUserRequest();
                }
                this.closeCreateModal();
            } else {
                this.hasValidationError = true;
                evt.preventDefault();
            }
        },
        updateUserRequest() {
            const { id, ...updatedUser } = this.newUser; // Exclude the 'id' field from the updated user object

            updatedUser.password = this.hashStringWithSHA256(updatedUser.password)

            this.$axios
                .put(`/api/users/${id}`, updatedUser) // Use the appropriate endpoint and HTTP method for updating the user
                .then(() => {
                    // Update the user in the local users list
                    const index = this.users.findIndex((user) => user.id === id);
                    if (index !== -1) {
                        this.users.splice(index, 1, { ...this.users[index], ...updatedUser });
                    }
                })
                .catch((error) => {
                    console.error("Error updating user:", error);
                });
        },
        createUserRequest() {
            this.$axios.post('/api/users', this.newUser)
                .then((user) => {
                    console.log(user.data.password)
                    this.users.push(user.data);
                })
                .catch((error) => {
                    console.error("Error creating user:", error);
                });
        },
        updateUser(user) {
            this.newUser = {...user};
            this.newUser.password = ''
            this.isUpdateMode = true;
            this.showCreateModal = true;
            this.modalTitle = "Update User"
        },
        deleteUser(id) {
            this.$axios.delete(`/api/users/${id}`)
                .then(() => {
                    // Remove the deleted user from the local users list
                    this.users = this.users.filter(user => user.id !== id);
                })
                .catch((error) => {
                    console.error("Error deleting user:", error);
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
            this.resetNewUser();
        },
        resetNewUser() {
            this.newUser = {
                email: "",
                firstName: "",
                lastName: "",
                type: "",
                password: "",
                status: "",
            };
            this.isUpdateMode = false;
        },
        hashStringWithSHA256(string) {
            const SHA256 = require('crypto-js/sha256');

            const hashedString = SHA256(string).toString();
            return hashedString;
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
    },
}
</script>

<style scoped>

.select {
    display: block;
}

</style>