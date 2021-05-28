var app = new Vue({
  el: '#app',
  data() {
    return {
      data: {
        "queryTime": "",
        "report": {}
      },
      loading: false,
    }
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    fetchData: async function () {
      this.loading = true
      try {
        var response = await fetch('/api/appointments')
        var data = await response.json()
        this.data = data
        this.loading = false
      } catch (err) {
        console.error(err)
      }
    },

    hasSomething: function (value) {
      if (typeof value !== 'string') {
        return true
      }
      if (value !== 'No hay espacio disponible.' && value !== 'Ya esta hora pasó.') {
        return true
      }
      return false
    }
  },
})
