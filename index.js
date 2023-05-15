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
    
});

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

app.post("/pembeli", (req,res) => {
    // const values = [
    // req.body.email,
    // req.body.username, 
    // req.body.password,
    // req.body.alamat,
    // req.body.foto_profil,
    // req.body.no_rek_pembeli,
    // req.body.level
    // ] 

    const email = req.body.email
    const username = req.body.username 
    const password = req.body.password
    const alamat = req.body.alamat
    const foto_profil = req.body.foto_profil
    const no_rek_pembeli = req.body.no_rek_pembeli
    const level = req.body.level

    const sqlQuery = `INSERT INTO pembeli (level, email, username, password, alamat, foto_profil, no_rek_pembeli) VALUES ('${level}', '${email}', '${username}', '${password}', '${alamat}', '${foto_profil}', '${no_rek_pembeli}')`;

    con.query(sqlQuery, (err, rows) => {
        try {
            return res.json()
        } catch (err) {
            res.json()
        }
    })
})

app.post("/penjual", (req,res) => {
    const level = req.body.level
    const email = req.body.email
    const nama_toko = req.body.nama_toko
    const logo_toko = req.body.logo_toko
    const password = req.body.password
    const alamat = req.body.alamat
    const whatsapp = req.body.whatsapp
    const no_rek_penjual = req.body.no_rek_penjual

    const sqlQuery = `INSERT INTO penjual ( level, email, nama_toko, logo_toko, password, alamat, whatsapp, no_rek_penjual) VALUES ('${level}', '${email}', '${nama_toko}', '${logo_toko}', '${password}', '${alamat}', '${whatsapp}', '${no_rek_penjual}')`;

    con.query(sqlQuery, (err, rows) => {
        try {
            return res.json()
        } catch (err) {
            res.json()
        }
    })
});

app.post("/item", (req,res) => {
    const id_penjual = req.body.id_penjual
    const id_kategori = req.body.id_kategori
    const nama_item = req.body.nama_item
    const harga_item = req.body.harga_item
    const foto_item = req.body.foto_item
    const deksripsi_item = req.body.deksripsi_item
    const stok_item = req.body.stok_item
    const warna_item = req.body.warna_item
    const ukuran_item = req.body.ukuran_item
    const biaya_operasional =req.body.biaya_operasional
    
    const sqlQuery = `INSERT INTO item (nama_item, harga_item, foto_item, deskripsi_item, stok_item, warna_item, ukuran_item, biaya_operasional, id_penjual, id_kategori ) VALUES ('${nama_item}', '${harga_item}', '${foto_item}', '${deksripsi_item}', '${stok_item}', '${warna_item}', '${ukuran_item}', '${biaya_operasional}'  ,(SELECT id_penjual FROM penjual WHERE id_penjual = ${id_penjual}), (SELECT id_kategori FROM kategori WHERE id_kategori = ${id_kategori}))`;

    con.query(sqlQuery, (err, rows) => {
        try {
            return res.json()
        } catch (err) {
            res.json()
        }     
    })
});

app.get("/keranjang", (req,res) => {
    const id_pembeli = req.body.id_pembeli
    
    const sqlQuery = `SELECT * FROM keranjang `;
    con.query(sqlQuery, (err, rows) => {

        try {
            res.json(rows)
        } catch (error) {
            res.json({ message: error.message})            
        }
              
    })
    
});

app.get("/keranjang/:id", (req,res) => {
    const id = req.params.id;
    
    const sqlQuery = `SELECT * FROM keranjang JOIN item ON keranjang.id_item = item.id_item where id_pembeli = ${id}`;
    con.query(sqlQuery, (err, rows) => {

        try {
            res.json(rows)
        } catch (error) {
            res.json({ message: error.message})            
        }
              
    })
    
});

app.post("/keranjang", (req,res)=>{
    const id_pembeli = req.body.id_pembeli
    const id_item = req.body.id_item
    const jumlah = req.body.jumlah

    const sqlQuery = `INSERT INTO keranjang (id_pembeli, id_item, jumlah) VALUES ((SELECT id_pembeli FROM pembeli WHERE id_pembeli = ${id_pembeli}), (SELECT id_item FROM item WHERE id_item = ${id_item}), '${jumlah}')`;

    con.query(sqlQuery, (err, rows) => {
        try {
            return res.json()
        } catch (err) {
            res.json()
        }     
    })
});

app.get("/keranjang/:id", (req,res) => {
    const id = req.params.id;
    
    const sqlQuery = `SELECT * FROM keranjang WHERE id_pembeli = ${id}`;
    con.query(sqlQuery, (err, rows) => {

        try {
            res.json(rows[0])
        } catch (error) {
            res.json({ message: error.message})            
        }
              
    })
    
})

app.get("/keranjang/delete/:id", (req,res) => {
    const id = req.params.id;
    
    const sqlQuery = `SELECT * FROM keranjang WHERE id_keranjang = ${id}`;
    con.query(sqlQuery, (err, rows) => {

        try {
            res.json(rows[0])
        } catch (error) {
            res.json({ message: error.message})            
        }
              
    })
    
})

app.delete("/keranjang/:id", (req,res)=>{
    const id = req.params.id;

    const sqlQuery = `DELETE FROM keranjang WHERE id_keranjang = ${id}`;
    con.query(sqlQuery, (err, rows) => {
        try {
            return res.json()
        } catch (err) {
            res.json()
        }     
    })
})

app.put("/pembeli", (req,res) => {
    const id = req.body.id_pembeli
    const value = req.body.value
    const dataRecord = req.body.dataRecord

    const sqlQuery = `UPDATE pembeli SET ${value} = '${dataRecord}' WHERE pembeli.id_pembeli = ${id}`;

    con.query(sqlQuery, (err, rows) => {
        try {
            return res.json()
        } catch (err) {
            res.json()
        }
    })
});

app.get("/admin", (req,res) => {
    
    const sqlQuery = `SELECT * FROM admin`;
    con.query(sqlQuery, (err, rows) => {

        try {
            res.json(rows[0])
        } catch (error) {
            res.json({ message: error.message})            
        }
              
    })
    
})


app.get("/checkout", (req,res) => {
    
    const sqlQuery = `SELECT * FROM checkout JOIN item ON checkout.id_item = item.id_item`;
    con.query(sqlQuery, (err, rows) => {

        try {
            res.json(rows)
        } catch (error) {
            res.json({ message: error.message})            
        }
              
    })
    
})

app.post("/checkout", (req,res)=>{
    // const id_item = req.body.id_item
    // const id_keranjang  = req.body.id_keranjang

    const values = [
        req.body.id_item,
        req.body.id_keranjang
    ]


    const sqlQuery = `INSERT INTO checkout (id_item, id_keranjang) VALUES (?)`;

    con.query(sqlQuery, [values],(err, rows) => {
        try {
            return res.json()
        } catch (err) {
            res.json()
        }     
    })
});