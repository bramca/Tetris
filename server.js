import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

const app = express();
app.use(bodyParser.json());
const port = 8080;

app.use(express.static(__dirname));
app.use(express.static(__dirname + "/libraries"));

app.post("/sendscore", function (req, res) {
    var score = req.body.score;
    var ai = req.body.ai;
    var date = new Date();
    console.log(score + (ai ? " ai " : " player ") + date);
    var data = fs.readFileSync("scores.txt").toString().split("\n");
    var index = -1;
    var i = 0;
    while (i < data.length && index < 0) {
        var datascore = data[i].split(" ")[0];
        if (score > datascore) {
            index = i;
        }
        i++;
    }
    if (index >= 0) {
        data.splice(index, 0, score + (ai ? " ai " : " player ") + date);
        var text = data.join("\n");
        fs.writeFile("scores.txt", text, function (err) {
            if (err) throw err;
            console.log("saved");
        });
    } else {
        fs.appendFile("scores.txt", score + (ai ? " ai " : " player ") + date + "\n", function (err) {
            if (err) throw err;
            console.log("saved");
        });
    }
    res.end("saved");
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
