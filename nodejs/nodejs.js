/**
 * NodeJs Server-Side Example for Fine Uploader (traditional endpoints).
 * Maintained by Widen Enterprises.
 *
 * This example:
 *  - handles non-CORS environments
 *  - handles delete file requests assuming the method is DELETE
 *  - Ensures the file size does not exceed the max
 *  - Handles chunked upload requests
 *  - Returns a public URL to allow Fine Uploader to display the image
 *    in the browser if the browser is not capable of generating previews
 *    pre-upload client-side.
 *
 * Requirements:
 *  - express (for handling requests)
 *  - rimraf (for "rm -rf" support)
 *  - mkdirp (for "mkdir -p" support)
 */

var //dependencies
    express = require("express"),
    fs = require("fs"),
    rimraf = require("rimraf"),
    mkdirp = require("mkdirp"),
    app = express(),

// paths/constants
    fileInputName = "qqfile",
    assetsPath = __dirname + "/assets/",
    placeholdersPath = assetsPath + "placeholders/",
    uploadedFilesPath = assetsPath + "uploadedFiles/",
    chunkDirName = "chunks",
    maxFileSize = 10000000; // in bytes


app.use(express.bodyParser());
app.listen(8000);

// routes
app.use(express.static(__dirname));
app.use("/fineuploader", express.static(assetsPath));
app.use("/placeholders", express.static(placeholdersPath));
app.use("/uploads", express.static(uploadedFilesPath));
app.post("/uploads", onUpload);
app.delete("/uploads/:uuid", onDeleteFile);


function onUpload(req, res) {
    var partIndex = req.body.qqpartindex;

    // text/plain is required to ensure support for IE9 and older
    res.set("Content-Type", "text/plain");

    if (partIndex == null) {
        onSimpleUpload(req, res);
    }
    else {
        onChunkedUpload(req, res);
    }
}

function onSimpleUpload(req, res) {
    var file = req.files[fileInputName],
        uuid = req.body.qquuid,
        sendThumbnailUrl = req.body.sendThumbnailUrl == "true",
        responseData = {
            success: false
        };

    file.name = req.body.qqfilename;

    if (isValid(file.size)) {
        moveUploadedFile(file, uuid, function() {
                responseData.success = true;

                if (sendThumbnailUrl) {
                    responseData.thumbnailUrl = "/uploads/" + uuid + "/" + file.name;
                }

                res.send(responseData);
            },
            function() {
                responseData.error = "Problem copying the file!";
                res.send(responseData);
            });
    }
    else {
        failWithTooBigFile(responseData, res);
    }
}

function onChunkedUpload(req, res) {
    var file = req.files[fileInputName],
        size = parseInt(req.body.qqtotalfilesize),
        uuid = req.body.qquuid,
        index = req.body.qqpartindex,
        totalParts = parseInt(req.body.qqtotalparts),
        sendThumbnailUrl = req.body.sendThumbnailUrl == "true",
        responseData = {
            success: false
        };

    file.name = req.body.qqfilename;

    if (isValid(size)) {
        storeChunk(file, uuid, index, totalParts, function() {
                if (index < totalParts-1) {
                    responseData.success = true;
                    res.send(responseData);
                }
                else {
                    combineChunks(file, uuid, function() {
                            responseData.success = true;

                            if (sendThumbnailUrl) {
                                responseData.thumbnailUrl = "/uploads/" + uuid + "/" + file.name;
                            }

                            res.send(responseData);
                        },
                        function() {
                            responseData.error = "Problem conbining the chunks!";
                            res.send(responseData);
                        });
                }
            },
            function(reset) {
                responseData.error = "Problem storing the chunk!";
                res.send(responseData);
            });
    }
    else {
        failWithTooBigFile(responseData, res);
    }
}

function onDeleteFile(req, res) {
    var uuid = req.params.uuid,
        dirToDelete = uploadedFilesPath + uuid;

    rimraf(dirToDelete, function(error) {
        if (error) {
            console.error("Problem deleting file! " + error);
            res.status(500);
        }

        res.send();
    });
}

function failWithTooBigFile(responseData, res) {
    responseData.error = "Too big!";
    responseData.preventRetry = true;
    res.send(responseData);
}

function isValid(size) {
    return size < maxFileSize;
}

function moveFile(destinationDir, sourceFile, destinationFile, success, failure) {
    mkdirp(destinationDir, function(error) {
        var sourceStream, destStream;

        if (error) {
            console.error("Problem creating directory " + destinationDir + ": " + error);
            failure();
        }
        else {
            sourceStream = fs.createReadStream(sourceFile);
            destStream = fs.createWriteStream(destinationFile);

            sourceStream
                .on("error", function(error) {
                    console.error("Problem copying file: " + error.stack);
                    failure();
                })
                .on("end", success)
                .pipe(destStream);
        }
    });
}

function moveUploadedFile(file, uuid, success, failure) {
    var destinationDir = uploadedFilesPath + uuid + "/",
        fileDestination = destinationDir + file.name;

    moveFile(destinationDir, file.path, fileDestination, success, failure);
}

function storeChunk(file, uuid, index, numChunks, success, failure) {
    var destinationDir = uploadedFilesPath + uuid + "/" + chunkDirName + "/",
        chunkFilename = getChunkFilename(index, numChunks),
        fileDestination = destinationDir + chunkFilename;

    moveFile(destinationDir, file.path, fileDestination, success, failure);
}

function combineChunks(file, uuid, success, failure) {
    var chunksDir = uploadedFilesPath + uuid + "/" + chunkDirName + "/",
        destinationDir = uploadedFilesPath + uuid + "/",
        fileDestination = destinationDir + file.name;


    fs.readdir(chunksDir, function(err, fileNames) {
        var destFileStream;

        if (err) {
            console.error("Problem listing chunks! " + err);
            failure();
        }
        else {
            fileNames.sort();
            destFileStream = fs.createWriteStream(fileDestination, {flags: "a"});

            appendToStream(destFileStream, chunksDir, fileNames, 0, function() {
                    rimraf(chunksDir, function(rimrafError) {
                        if (rimrafError) {
                            console.log("Problem deleting chunks dir! " + rimrafError);
                        }
                    });
                    success();
                },
                failure);
        }
    });
}

function appendToStream(destStream, srcDir, srcFilesnames, index, success, failure) {
    if (index < srcFilesnames.length) {
        fs.createReadStream(srcDir + srcFilesnames[index])
            .on("end", function() {
                appendToStream(destStream, srcDir, srcFilesnames, index+1, success, failure);
            })
            .on("error", function(error) {
                console.error("Problem appending chunk! " + error);
                failure();
            })
            .pipe(destStream, {end: false});
    }
    else {
        success();
    }
}

function getChunkFilename(index, count) {
    var digits = new String(count).length,
        zeros = new Array(digits + 1).join("0");

    return (zeros + index).slice(-digits);
}
