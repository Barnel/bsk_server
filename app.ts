// @ts-ignore
import * as express from "express"
import * as http from "http"
import * as fs from "fs"
let bodyParser = require('body-parser')
const app = express();

const httpServer = new http.Server(app)

app.use(bodyParser({keepExtension: true}));


app.get('/:fileName', function(req, res){
    res.download(`./uploads/${req.params.fileName}`);
});

app.post('/:fileName', function(req, res){
    fs.writeFile(`./uploads/${req.params.fileName}`, JSON.stringify(req.body), (err) => {
        if(err) {
            console.log(err)
        }
    })
    res.sendStatus(200)
});

httpServer.listen(9000, function(){
    console.log('listening on *:9000');
});
