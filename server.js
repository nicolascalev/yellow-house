const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const query = require('./appointments.js');

app.use(express.static('public'))

app.get('/api/appointments', async (req, res) => {
  try {
    var results = await query();
    return res.status(200).json(results)
  } catch (err) {
    return res.status(500).json(err)
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})