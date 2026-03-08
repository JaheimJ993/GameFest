const fs = require("fs");
const path = require("path");

const gallery2024Dir = path.join(__dirname, "..", "..", "..", "src", "client", "public", "images", "2024", "gallery");
const gallery2025Dir = path.join(__dirname, "..", "..", "..", "src", "client", "public", "images", "2025", "gallery");

console.log(gallery2025Dir)

//This Function will return an array of the images taken in 2024, For the inaugural edition of gamefest.
//The reason we are using this is to dynamically have all the images loaded onto the page, rather than hardcoding it. 
const gallery2024 = (req, res) => {
    fs.readdir(gallery2024Dir, (err, files) =>{
        if (err) return res.status(500).json({error: "Failed to load gallery"});
        res.json(files); //This sends back array of image filenmaes
    })
}
const gallery2025 = (req, res) => {
    fs.readdir(gallery2025Dir, (err, files) =>{
        if (err) return res.status(500).json({error: "Failed to load gallery"});
        res.json(files); //This sends back array of image filenmaes
    })
}

module.exports = {gallery2024, gallery2025}

