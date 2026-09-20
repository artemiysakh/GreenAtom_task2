const app = require('./app')
require('dotenv/config')

const port =  Number(process.env.PORT) || 3000

app.listen(port, ()=>{
    console.log(`App listening on port ${port}`)
})