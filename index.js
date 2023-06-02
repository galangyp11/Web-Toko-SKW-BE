const express = require("express");
const cors = require("cors");
const app = express();
const session = require("express-session");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");

const port = 3311;

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(process.env.PORT || port, () => {
  console.log(`runnig on port ${port}`);
});

let con = mysql.createConnection({
  host: "Localhost",
  user: "root",
  password: "",
  database: "skw",
});

app.use(
  session({
    secret: "kadalmakanperkedel",
    name: "test-session",
    resave: false,
    saveUninitialized: true,
    // cookie: {secure: true}
  })
);

// const storage = multer.diskStorage({
//     destination: (req, file, callBack) => {
//         callBack(null, './public/images/')     // './public/images/' directory name where save the file
//     },
//     filename: (req, file, callBack) => {
//         callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
//     }
// })

const upload = multer({ dest: "uploads/" });

app.get("/", function (req, res, next) {
  // console.log(req)
  res.send("test");
});

app.get("/item", (req, res) => {
  // console.log('req', req)
  let sqlQuery =
    "SELECT * FROM item JOIN kategori ON item.id_kategori = kategori.id_kategori JOIN penjual ON item.id_penjual = penjual.id_penjual LEFT JOIN item_gambar ON item.id_item = item_gambar.id_item ";

  if (req.query.search) {
    sqlQuery += ` WHERE item.nama_item LIKE '%${req.query.search}%'`;
  }

  con.query(sqlQuery, (err, rows) => {
    // console.log('rows', rows)
    try {
      const data = rows.reduce((results, i) => {
        // console.log('results', results)
        // console.log('i', i)
        const idx = results.findIndex((item) => item.id_item === i.id_item);

        if (idx < 0) {
          i.gambar = [i.gambar];
          results.push(i);
          return results;
        }
        results[idx].gambar.push(i.gambar);
        return results;
      }, []);
      res.json(data);
    } catch (error) {
      console.log(error);
      res.json({ message: error.message });
    }
  });
});

app.get("/item/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM item JOIN penjual ON item.id_penjual = penjual.id_penjual JOIN item_ukuran ON item.id_item = item_ukuran.id_item where item.id_item = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows[0]);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.delete("/item/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `DELETE FROM item WHERE id_item = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      res.json();
    }
  });
});

app.get("/item-penjual/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM item JOIN kategori ON item.id_kategori = kategori.id_kategori JOIN penjual ON item.id_penjual = penjual.id_penjual where item.id_penjual = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/kategori", (req, res) => {
  const sqlQuery = `SELECT * FROM kategori`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/kategori/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM kategori JOIN item ON kategori.id_kategori = item.id_kategori WHERE kategori.id_kategori = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/admin/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM admin where id_admin = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows[0]);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/pembeli", (req, res) => {
  const sqlQuery = `SELECT * FROM pembeli`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/pembeli/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM pembeli where id_pembeli = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows[0]);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.delete("/pembeli/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `DELETE FROM pembeli WHERE id_pembeli = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      res.json();
    }
  });
});

app.get("/penjual", (req, res) => {
  const sqlQuery = `SELECT * FROM penjual`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/penjual/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM penjual where id_penjual = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows[0]);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.delete("/penjual/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `DELETE FROM penjual WHERE id_penjual = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      res.json();
    }
  });
});

app.post("/pembeli", (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const alamat = req.body.alamat;
  const foto_profil = req.body.foto_profil;
  const no_rek_pembeli = req.body.no_rek_pembeli;
  const level = req.body.level;

  const sqlQuery = `INSERT INTO pembeli (level, email, username, password, alamat, foto_profil, no_rek_pembeli) VALUES ('${level}', '${email}', '${username}', '${password}', '${alamat}', '${foto_profil}', '${no_rek_pembeli}')`;

  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      res.json();
    }
  });
});

app.post("/penjual", (req, res) => {
  const level = req.body.level;
  const email = req.body.email;
  const nama_toko = req.body.nama_toko;
  const logo_toko = req.body.logo_toko;
  const password = req.body.password;
  const alamat_toko = req.body.alamat;
  const whatsapp = req.body.whatsapp;
  const no_rek_penjual = req.body.no_rek_penjual;

  const sqlQuery = `INSERT INTO penjual ( level, email, nama_toko, logo_toko, password, alamat_toko, whatsapp, no_rek_penjual) VALUES ('${level}', '${email}', '${nama_toko}', '${logo_toko}', '${password}', '${alamat_toko}', '${whatsapp}', '${no_rek_penjual}')`;

  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      res.json();
    }
  });
});

app.put("/penjual", (req, res) => {
  const id = req.body.id_penjual;
  const email = req.body.email;
  const nama_toko = req.body.nama_toko;
  const logo_toko = req.body.logo_toko;
  const password = req.body.password;
  const alamat_toko = req.body.alamat;
  const whatsapp = req.body.whatsapp;
  const no_rek_penjual = req.body.no_rek_penjual;

  const sqlQuery = `UPDATE penjual SET email = '${email}', nama_toko = '${nama_toko}', logo_toko = '${logo_toko}', password = '${password}', alamat_toko = '${alamat_toko}', whatsapp = '${whatsapp}', no_rek_penjual = '${no_rek_penjual}' WHERE penjual.id_penjual = ${id}`;

  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      res.json();
    }
  });
});

app.post("/item", upload.array("foto_item", 10), (req, res) => {
  // console.log('reqbody', req)
  const id_penjual = req.body.id_penjual;
  const id_kategori = req.body.id_kategori;
  const nama_item = req.body.nama_item;
  const harga_item = req.body.harga_item;
  const deksripsi_item = req.body.deksripsi_item;
  const stok_item = req.body.stok_item;
  const warna_item = req.body.warna_item;
  const ukuran_item = req.body.ukuran_item;
  const biaya_operasional = req.body.biaya_operasional;
  const tgl_input = req.body.tgl_input;

  const sqlQuery = `INSERT INTO item (nama_item, harga_item, deskripsi_item, stok_item, warna_item, biaya_operasional, id_penjual, id_kategori, tgl_input ) VALUES ('${nama_item}', '${harga_item}', '${deksripsi_item}', '${stok_item}', '${warna_item}', '${biaya_operasional}'  ,(SELECT id_penjual FROM penjual WHERE id_penjual = ${id_penjual}), (SELECT id_kategori FROM kategori WHERE id_kategori = ${id_kategori}), '${tgl_input}')`;

  con.query(sqlQuery, (err, rows) => {
    if (req.body.ukuran_item.length) {
      // req.body.ukuran_item.forEach(data => {
      const ukuranItemQuery = `INSERT INTO item_ukuran (id_item, nama_ukuran) VALUES (${rows.insertId}, '${ukuran_item}')`;

      con.query(ukuranItemQuery, (err, rows) => {
        try {
          return res.json();
        } catch (error) {
          return res.json();
        }

        // });
      });
    }
    try {
      if (req.files.length) {
        req.files.forEach((item) => {
          const fileType = item.mimetype.split("/")[1];
          let newFileName = item.filename + "." + fileType;

          fs.rename(
            `./uploads/${item.filename}`,
            `./uploads/${newFileName}`,
            function () {
              console.log("file renamed and uploaded");
            }
          );
          const imagePath = `${__dirname}/uploads/${newFileName}`;
          const addImageQuery = `INSERT INTO item_gambar (id_item, gambar) VALUES (${rows.insertId}, '${imagePath}')`;

          con.query(addImageQuery, (err, rows) => {
            try {
              return res.json();
            } catch (err) {
              return res.json();
            }
          });
        });
      }
      return res.json();
    } catch (err) {
      return res.json();
    }
  });

  return res.json();
});

app.put("/item", upload.array("foto_item", 10), (req, res) => {
  console.log("reqbody", req);
  const id_item = req.body.id_item;
  const id_penjual = req.body.id_penjual;
  const id_kategori = req.body.id_kategori;
  const nama_item = req.body.nama_item;
  const harga_item = req.body.harga_item;
  const deskripsi_item = req.body.deskripsi_item;
  const stok_item = req.body.stok_item;
  const warna_item = req.body.warna_item;
  // const ukuran_item = req.body.ukuran_item
  const biaya_operasional = req.body.biaya_operasional;
  const tgl_input = req.body.tgl_input;

  const sqlQuery = `UPDATE item SET nama_item = '${nama_item}', harga_item = '${harga_item}', deskripsi_item = '${deskripsi_item}', stok_item = '${stok_item}', warna_item = '${warna_item}', ukuran_item = '${ukuran_item}', biaya_operasional = '${biaya_operasional}' id_penjual = '${id_penjual}', id_kategori = '${id_kategori}', tgl_input = '${tgl_input}' WHERE item.id_item = ${id_item}`;

  // UPDATE penjual SET email = '${email}', nama_toko = '${nama_toko}', logo_toko = '${logo_toko}', password = '${password}', alamat = '${alamat}', whatsapp = '${whatsapp}', no_rek_penjual = '${no_rek_penjual}' WHERE penjual.id_penjual = ${id}

  con.query(sqlQuery, (err, rows) => {
    try {
      if (req.files.length) {
        req.files.forEach((item) => {
          const fileType = item.mimetype.split("/")[1];
          let newFileName = item.filename + "." + fileType;

          fs.rename(
            `./uploads/${item.filename}`,
            `./uploads/${newFileName}`,
            function () {
              console.log("file renamed and uploaded");
            }
          );
          const imagePath = `${__dirname}/uploads/${newFileName}`;

          const addImageQuery = `INSERT INTO item_gambar (id_item, gambar) VALUES (${rows.insertId}, '${imagePath}')`;

          con.query(addImageQuery, (err, rows) => {
            try {
              return res.json();
            } catch (err) {
              return res.json();
            }
          });
        });
      }
      return res.json();
    } catch (err) {
      return res.json();
    }
  });

  return res.json();
});

app.get("/keranjang/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM keranjang JOIN item ON keranjang.id_item = item.id_item JOIN pembeli ON keranjang.id_pembeli = pembeli.id_pembeli WHERE keranjang.id_pembeli = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.post("/keranjang", (req, res) => {
  const id_pembeli = req.body.id_pembeli;
  const id_item = req.body.id_item;
  const jumlah = req.body.jumlah;
  const total_harga = req.body.total_harga;

  const sqlQuery = `INSERT INTO keranjang (id_pembeli, id_item, jumlah, total_harga) VALUES ((SELECT id_pembeli FROM pembeli WHERE id_pembeli = ${id_pembeli}), (SELECT id_item FROM item WHERE id_item = ${id_item}), '${jumlah}', '${total_harga}')`;

  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      res.json();
    }
  });
});

app.get("/keranjang/:id_pembeli/:id", (req, res) => {
  const id_pembeli = req.params.id_pembeli;
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM keranjang JOIN item ON keranjang.id_item = item.id_item WHERE id_pembeli = ${id_pembeli} AND id_keranjang = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(row.length ? rows[0] : {});
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.delete("/keranjang/:id", (req, res) => {
  const id_pembeli = req.body.id_pembeli;
  const id = req.params.id;

  const sqlQuery = `DELETE FROM keranjang WHERE id_keranjang = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      res.json();
    }
  });
});

app.put("/pembeli", (req, res) => {
  const id = req.body.id_pembeli;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const alamat = req.body.alamat;

  const sqlQuery = `UPDATE pembeli SET email = '${email}', username = '${username}', password = '${password}', alamat = '${alamat}' WHERE pembeli.id_pembeli = ${id}`;

  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      res.json();
    }
  });
});

app.put("/alamat-pembeli", (req, res) => {
  const id = req.body.id_pembeli;
  const alamat = req.body.alamat;

  const sqlQuery = `UPDATE pembeli SET alamat = '${alamat}' WHERE pembeli.id_pembeli = ${id}`;

  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      res.json();
    }
  });
});

app.put("/keranjang", (req, res) => {
  const id = req.body.id_keranjang;
  const jumlah = req.body.jumlah;
  const total_harga = req.body.total_harga;

  const sqlQuery = `UPDATE keranjang SET jumlah = '${jumlah}', total_harga = '${total_harga}' WHERE keranjang.id_keranjang = ${id}`;

  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      res.json();
    }
  });
});

app.get("/admin", (req, res) => {
  const sqlQuery = `SELECT * FROM admin`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows ?? []);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/checkout", (req, res) => {
  const id_pembeli = req.body.id_pembeli;

  const sqlQuery = `SELECT * FROM checkout `;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows ?? []);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.post("/checkout", (req, res) => {
  const values = [req.body.id_pembeli, req.body.id_item, req.body.id_keranjang];

  // const values = req.body.map((value) => [
  //     value.id_pembeli,
  //     value.id_item,
  //     value.id_keranjang
  // ])

  // const id_item = req.body.id_item
  // const id_keranjang = req.body.id_keranjang
  // const id_pembeli = req.body.id_pembeli

  const sqlQuery = `INSERT INTO checkout (id_pembeli, id_item, id_keranjang) VALUES (?)`;

  // const sqlQuery = `INSERT INTO checkout (id_item, id_keranjang, id_pembeli) VALUES ((SELECT id_item FROM item WHERE id_item = ${id_item}), (SELECT id_keranjang FROM keranjang WHERE id_keranjang = ${id_keranjang}), (SELECT id_pembeli FROM pembeli WHERE id_pembeli = ${id_pembeli}),)`;

  con.query(sqlQuery, [values], (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      res.json();
    }
  });
});

app.delete("/checkout", (req, res) => {
  const sqlQuery = `DELETE FROM checkout `;
  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      res.json();
    }
  });
});

app.get("/metode_pembayaran/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM metode_pembayaran WHERE id_mp = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows[0]);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/transaksi", (req, res) => {
  const sqlQuery = `SELECT * FROM transaksi JOIN pembeli ON transaksi.id_pembeli = pembeli.id_pembeli JOIN metode_pembayaran ON transaksi.id_mp = metode_pembayaran.id_mp WHERE transaksi.status_transaksi = 'Menunggu Konfirmasi'`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows ?? []);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/transaksi/pembeli", (req, res) => {
  const sqlQuery = `SELECT * FROM transaksi JOIN pembeli ON transaksi.id_pembeli = pembeli.id_pembeli JOIN metode_pembayaran ON transaksi.id_mp = metode_pembayaran.id_mp`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/transaksi/pembeli/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM transaksi JOIN item ON transaksi.id_item = item.id_item JOIN pembeli ON transaksi.id_pembeli = pembeli.id_pembeli JOIN metode_pembayaran ON transaksi.id_mp = metode_pembayaran.id_mp WHERE transaksi.id_pembeli = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/transaksi/penjual/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM transaksi JOIN item ON transaksi.id_item = item.id_item JOIN pembeli ON transaksi.id_pembeli = pembeli.id_pembeli JOIN penjual ON transaksi.id_penjual = penjual.id_penjual WHERE transaksi.id_penjual = ${id} AND transaksi.status_transaksi = 'Pesanan sedang di proses'`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/transaksi/riwayat", (req, res) => {
  const sqlQuery = `SELECT * FROM transaksi JOIN pembeli ON transaksi.id_pembeli = pembeli.id_pembeli JOIN metode_pembayaran ON transaksi.id_mp = metode_pembayaran.id_mp JOIN item ON transaksi.id_item = item.id_item`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.post("/transaksi", (req, res) => {
  const id_mp = req.body.id_mp;
  const id_item = req.body.id_item;
  const id_keranjang = req.body.id_keranjang;
  const id_penjual = req.body.id_penjual;
  const id_pembeli = req.body.id_pembeli;
  const waktu_pesan = req.body.waktu_pesan;
  const total_harga_transaksi = req.body.total_harga_transaksi;
  const status_transaksi = req.body.status_transaksi;

  const sqlQuery = `INSERT INTO transaksi ( id_mp, id_keranjang, id_pembeli, id_penjual,  id_item, waktu_pesan, total_harga_transaksi, status_transaksi ) VALUES ((SELECT id_mp FROM metode_pembayaran WHERE id_mp = ${id_mp}), (SELECT id_keranjang FROM keranjang WHERE id_keranjang = ${id_keranjang}), (SELECT id_pembeli FROM pembeli WHERE id_pembeli = ${id_pembeli}), (SELECT id_penjual FROM penjual WHERE id_penjual = ${id_penjual}), (SELECT id_item FROM item WHERE id_item = ${id_item}), '${waktu_pesan}', '${total_harga_transaksi}', '${status_transaksi}')`;

  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      res.json();
    }
  });
});

app.put("/transaksi/:id", (req, res) => {
  const id = req.params.id;
  const status_transaksi = req.body.status_transaksi;

  const sqlQuery = `UPDATE transaksi SET status_transaksi = '${status_transaksi}' WHERE transaksi.id_transaksi = ${id}`;

  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      res.json();
    }
  });
});

// app.get("/konfirmasi", (req, res) => {
//   const sqlQuery = `SELECT * FROM konfirmasi JOIN pembeli ON konfirmasi.id_pembeli = pembeli.id_pembeli JOIN metode_pembayaran ON konfirmasi.id_mp = metode_pembayaran.id_mp`;
//   con.query(sqlQuery, (err, rows) => {
//     try {
//       res.json(rows);
//     } catch (error) {
//       res.json({ message: error.message });
//     }
//   });
// });

// app.post("/konfirmasi", (req, res) => {
//   const id_mp = req.body.id_mp;
//   const id_item = req.body.id_item;
//   const id_pembeli = req.body.id_pembeli;
//   const waktu_pesan = req.body.waktu_pesan;

//   const sqlQuery = `INSERT INTO konfirmasi ( id_mp, id_item, id_pembeli, waktu_pesan ) VALUES ((SELECT id_mp FROM metode_pembayaran WHERE id_mp = ${id_mp}), (SELECT id_item FROM item WHERE id_item = ${id_item}), (SELECT id_pembeli FROM pembeli WHERE id_pembeli = ${id_pembeli}), '${waktu_pesan}')`;

//   con.query(sqlQuery, (err, rows) => {
//     try {
//       return res.json();
//     } catch (err) {
//       res.json();
//     }
//   });
// });
