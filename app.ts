let net = require('net');
const xml2js = require('xml2js');
const fs = require('fs');
// Start a TCP Server
const Sequelize = require('sequelize');
const sequelize = new Sequelize('postgres://localhost:5432/bsk');

const parser = new xml2js.Parser();

export class File extends Sequelize.Model {}

File.init({
    session_key: Sequelize.STRING,
    content: Sequelize.STRING,
    cipher_mode: Sequelize.STRING,
}, { sequelize, modelName: 'file' });


net.createServer(function (socket) {
    // Handle incoming messages from clients.
    socket.on('data', function (data) {
        let xmlObject
        parser.parseString(data, function(error, result) {
            if(error === null) {
                xmlObject = result
                // console.log(xmlObject.toString())
                if(xmlObject) {
                    const json = JSON.parse(JSON.stringify(xmlObject))
                    if(json) {
                        // console.log(Object.keys(json["EncryptedFile"]["EncryptedFileHeader"][0]))
                        // console.log(json["EncryptedFile"]["Content"], json["EncryptedFile"]["Content"][0])
                        // console.log(json["EncryptedFile"]["EncryptedFileHeader"][0])
                        const content = json["EncryptedFile"]["Content"][0]
                        const sessionKey = json["EncryptedFile"]["EncryptedFileHeader"][0]["SessionKey"][0]
                        const cipherMode = json["EncryptedFile"]["EncryptedFileHeader"][0]["CipherMode"][0]
                        sequelize.sync()
                            .then(() => File.create({
                                session_key: sessionKey,
                                content: content,
                                cipher_mode: cipherMode
                            }))
                            .then(file => {
                                console.log(file.toJSON());
                            });
                        socket.write("THE DATA\n" + content + "\n" + sessionKey + "\n" + cipherMode + "\n END")
                    }
                }
            }
            else {
                console.log("error start\n" + error + "\nerror end");
            }
        });

    });

    socket.on('end', function () {
        socket.write("FINISHED UPLOADING")
    });
}).listen(5000);

console.log("server running at port 5000\n");