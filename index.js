const express = require('express')

const app = express()
const port = 8080

const path = require('path');



app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static('public'));


app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

