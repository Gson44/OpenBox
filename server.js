if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require("express")
const axios = require("axios")
const path = require("path")
const app = express()

app.get('/products/search/:query', async (request, response) => {
  try {
    const {data} = await axios.get(`https://api.bestbuy.com/v1/products((search=${request.params.query}))?apiKey=cT9N372Gg0B8FaFxQ295ewPv&sort=sku.asc&show=sku&pageSize=75&format=json`)
    console.log(data)
    if(data && data.products && data.products.length > 0) {
      const skuList = data.products.map(product => product.sku).join(",")
      const openBox = await axios.get(`https://api.bestbuy.com/beta/products/openBox(sku%20in(${skuList}))?apiKey=cT9N372Gg0B8FaFxQ295ewPv&pageSize=24`)  
      console.log(openBox.data.results)
      response.send(openBox.data.results)  
    } else {
      response.send([])
    }
  } catch (e) {
    console.log(e)
    response.send([])
  }
})

app.get('/products/:sku', async (request, response) => {
  try {
    const {data} = await axios.get(`https://api.bestbuy.com/beta/products/${request.params.sku}/openBox?apiKey=cT9N372Gg0B8FaFxQ295ewPv`)
    response.send(data.results[0] || {})  
  } catch (e) {
    console.log(e)
    response.send({})
  }
})

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')))
  // Handle React routing, return all requests to React app
  app.get('*', (request, response) => {
    response.sendFile(path.join(__dirname, 'client/build', 'index.html'))
  })
}

const port = process.env.PORT || 8080
app.listen(
  port,
  () => { console.log(`API listening on port ${port}...`) }
)
