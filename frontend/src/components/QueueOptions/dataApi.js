export default {
    users: [],
    queues: [],
    getUsers: function () {
        return this.users;
    },
    getQueues: function () {
        return this.queues;
    },
    setUsers: function (users) {
        this.users = users;
    },
    setQueues: function (queues) {
        this.queues = queues;
    }
}