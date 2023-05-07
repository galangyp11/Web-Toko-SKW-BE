const express = require('express');
const cors = require('cors');
const app = express();
const session = require('express-session');
const mysql = require('mysql');

const port = 3311

app.use(cors({
    credentials: true,
    origin: "http://localhost:3000"
}));   
app.use(express.json()); 

app.listen(process.env.PORT || port, () => {
    console.log(`runnig on port ${port}`);
})

let con = mysql.createConnection({
    host:"Localhost",
    user:"root",
    password:"",
    database: 'skw'
});

app.use(session({
    secret: 'kadalmakanperkedel',
    name: 'test-session',
    resave: false,
    saveUninitialized: true
    // cookie: {secure: true}
}))

app.get('/', function(req, res, next){
    // console.log(req)
    res.send('test')
})

app.get("/item", (req,res) => {
    
    const sqlQuery = "SELECT * FROM item";
    con.query(sqlQuery, (err, rows) => {

        try {
            res.json(rows)
        } catch (error) {
            res.json({ message: error.message})
        }
              
    })
    
})

app.get("/item/:id", (req,res) => {
    const id = req.params.id;
    
    const sqlQuery = `SELECT * FROM item where id_item = ${id}`;
    con.query(sqlQuery, (err, rows) => {

        try {
            res.json(rows[0])
        } catch (error) {
            res.json({ message: error.message})            
        }
              
    })
    
})

app.get("/kategori", (req,res) => {
   
    const sqlQuery = `SELECT * FROM kategori`;
    con.query(sqlQuery, (err, rows) => {

        try {
            res.json(rows)
        } catch (error) {
            res.json({ message: error.message})            
        }
              
    })
    
})

app.get("/kategori/:id", (req,res) => {
    const id = req.params.id;
   
    const sqlQuery = `SELECT * FROM kategori JOIN item ON kategori.id_kategori = item.id_kategori WHERE kategori.id_kategori = ${id}`;
    con.query(sqlQuery, (err, rows) => {

        try {
            res.json(rows)
        } catch (error) {
            res.json({ message: error.message})            
        }
            
    })
    
})

app.get("/admin/:id", (req,res) => {
    const id = req.params.id;
    
    const sqlQuery = `SELECT * FROM admin where id_admin = ${id}`;
    con.query(sqlQuery, (err, rows) => {

        try {
            res.json(rows[0])
        } catch (error) {
            res.json({ message: error.message})            
        }
              
    })
    
})

app.get("/pembeli", (req,res) => {
    
    const sqlQuery = `SELECT * FROM pembeli`;
    con.query(sqlQuery, (err, rows) => {

        try {
            res.json(rows)
        } catch (error) {
            res.json({ message: error.message})            
        }
              
    })
    
})

app.get("/pembeli/:id", (req,res) => {
    const id = req.params.id;
    
    const sqlQuery = `SELECT * FROM pembeli where id_pembeli = ${id}`;
    con.query(sqlQuery, (err, rows) => {

        try {
            res.json(rows[0])
        } catch (error) {
            res.json({ message: error.message})            
        }
              
    })
    
})

app.post("/pembeli", (req,res) => {
    const values = [
    req.body.email,
    req.body.username, 
    req.body.password,
    req.body.alamat,
    req.body.foto_profil,
    req.body.level
    ] 

    const sqlQuery = "INSERT INTO pembeli (`email`, `username`, `password`, `alamat`, `foto_profil`, `level`) VALUES (?)";

    con.query(sqlQuery, [values], (err, rows) => {
        try {
            return res.json('udh keinput bang')
        } catch (err) {
            res.json()
        }
    })
})

app.get("/penjual", (req,res) => {
    
    const sqlQuery = `SELECT * FROM penjual`;
    con.query(sqlQuery, (err, rows) => {

        try {
            res.json(rows)
        } catch (error) {
            res.json({ message: error.message})            
        }
              
    })
    
})

app.get("/penjual/:id", (req,res) => {
    const id = req.params.id;
    
    const sqlQuery = `SELECT * FROM penjual where id_penjual = ${id}`;
    con.query(sqlQuery, (err, rows) => {

        try {
            res.json(rows[0])
        } catch (error) {
            res.json({ message: error.message})            
        }
              
    })
    
})

app.post("/penjual", (req,res) => {
    const values = [
    req.body.email,
    req.body.nama_toko,
    req.body.logo_toko,
    req.body.password,
    req.body.id_item,
    req.body.alamat,
    req.body.whatsapp,
    req.body.no_rek_penjual,
    req.body.level
    ] 

    const sqlQuery = "INSERT INTO 'penjual' (`email`, `id_item`, `nama_toko`, `logo_toko`, `password`, `alamat`, `whatsapp`, `no_rek_penjual`, `level`) VALUES (?)";

    con.query(sqlQuery, [values], (err, rows) => {
        try {
            return res.json('udh keinput bang')
        } catch (err) {
            res.json()
        }
    })
})

