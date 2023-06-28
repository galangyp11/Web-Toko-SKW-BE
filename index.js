require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const session = require("express-session");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { error } = require("console");
const dir = path.join(__dirname, "public");
const port = 3311;

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(process.env.PORT || port, () => {
  console.log(`runnig on port ${port}`);
});

let con = mysql.createConnection({
  host: "Localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
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

const upload = multer({ dest: "public/" });

const mime = {
  html: "text/html",
  txt: "text/plain",
  css: "text/css",
  gif: "image/gif",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  js: "application/javascript",
};

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 10;

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res, next) {
  // console.log(req)
  res.send("test");
});

app.get("/item", (req, res) => {
  let sqlQuery = `
    SELECT
      *,
      i.id_item
    FROM
      item i
    JOIN kategori ON
      i.id_kategori = kategori.id_kategori
    JOIN penjual ON
      i.id_penjual = penjual.id_penjual
  `;

  if (req.query.search) {
    sqlQuery += ` WHERE i.nama_item LIKE '%${req.query.search}%' OR kategori.nama_kategori LIKE '%${req.query.search}%'`;
  }

  /** get offset by page */
  let offset = DEFAULT_OFFSET;
  if (req.query.page && Number(req.query.page) > 0) {
    offset =
      (Number(req.query.page) - 1) * Number(req.query.limit ?? DEFAULT_LIMIT);
  }

  sqlQuery += `
    LIMIT ${req.query.limit ?? DEFAULT_LIMIT}
    OFFSET ${offset} 
  `;

  con.query(sqlQuery, (err, rows) => {
    const idItems = [];

    rows?.forEach((r) => {
      idItems.push(r.id_item);
    });
    let imageQuery = `
        SELECT
            *
            FROM
        item_gambar ig 
        WHERE ig.id_item IN (${idItems.join(",")}) 
    `;

    try {
      con.query(imageQuery, (err, images) => {
        const data = rows?.map((r) => {
          return {
            ...r,
            gambar: images
              ? images
                  ?.filter((i) => i.id_item === r.id_item)
                  ?.map((i) => i.gambar)
              : [],
          };
        });
        try {
          res.json(data);
        } catch (error) {
          console.log(error);
          res.json({ message: error.message });
        }
      });
    } catch (error) {
      console.log(error);
      res.json({ message: error.message });
    }
  });
});

app.get("/total-item", (req, res) => {
  let sqlQuery = `SELECT * FROM item`;

  con.query(sqlQuery, (err, rows) => {
    res.json(rows);
  });
});

app.get("/item/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT *, item.id_item FROM item JOIN penjual ON item.id_penjual = penjual.id_penjual LEFT JOIN item_ukuran ON item.id_item = item_ukuran.id_item WHERE item.id_item = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      const idItems = [];

      rows.forEach((r) => {
        idItems.push(r.id_item);
      });
      let imageQuery = `
          SELECT
              *
              FROM
          item_gambar ig 
          WHERE ig.id_item IN (${idItems.join(",")}) 
      `;

      con.query(imageQuery, (err, images) => {
        try {
          const data = rows.map((r) => {
            return {
              ...r,
              gambar: images
                ? images
                    ?.filter((i) => i.id_item === r.id_item)
                    ?.map((i) => ({
                      id_gambar: i.id_gambar,
                      src: i.gambar,
                    }))
                : [],
            };
          });

          res.json(data[0]);
        } catch (error) {
          console.log(error);
          res.json({ message: error.message });
        }
      });
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/item-ukuran/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM item_ukuran WHERE id_item = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/riwayat-item-masuk", (req, res) => {
  // console.log('req', req)
  // let sqlQuery = `
  //     SELECT
  //       *,
  //       item.id_item AS id
  //     FROM
  //       item
  //     JOIN kategori ON
  //       item.id_kategori = kategori.id_kategori
  //     JOIN penjual ON
  //       item.id_penjual = penjual.id_penjual
  //     LEFT JOIN item_gambar ON
  //       item.id_item = item_gambar.id_item
  //   `;

  // let sqlQuery = `SELECT  *,
  // riwayat_item_masuk.id_item AS id FROM riwayat_item_masuk JOIN penjual ON riwayat_item_masuk.id_penjual = penjual.id_penjual JOIN item ON riwayat_item_masuk.id_item = item.id_item`;

  let sqlQuery = `SELECT * FROM riwayat_item_masuk JOIN penjual ON riwayat_item_masuk.id_penjual = penjual.id_penjual JOIN item ON riwayat_item_masuk.id_item = item.id_item`;

  // if (req.query.search) {
  //   console.log("here?");
  //   sqlQuery += ` WHERE riwayat_item_masuk.nama_item LIKE '%${req.query.search}%'`;
  // }
  if (req.query.search) {
    sqlQuery += ` WHERE nama_item LIKE '%${req.query.search}%' OR nama_toko LIKE '%${req.query.search}%'`;
  }

  let offset = DEFAULT_OFFSET;
  if (req.query.page && Number(req.query.page) > 0) {
    offset =
      (Number(req.query.page) - 1) * Number(req.query.limit ?? DEFAULT_LIMIT);
  }

  sqlQuery += `
    LIMIT ${req.query.limit ?? DEFAULT_LIMIT}
    OFFSET ${offset} 
  `;

  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json();
    }
  });
});

app.post("/riwayat-item-keluar", (req, res) => {
  const id_pembeli = req.body.id_pembeli;
  const id_item = req.body.id_item;
  const id_penjual = req.body.id_penjual;
  const id_transaksi = req.body.id_transaksi;
  const jumlah_beli = req.body.jumlah_beli;
  const tanggal = req.body.tanggal;

  console.log("item kelaur", req.body);

  const sqlQuery = `INSERT INTO riwayat_item_keluar (id_pembeli, id_penjual, id_item, id_transaksi, jumlah_beli, tanggal) VALUES ((SELECT id_pembeli FROM pembeli WHERE id_pembeli = ${id_pembeli}), (SELECT id_penjual FROM penjual WHERE id_penjual = ${id_penjual}), ${id_item}, (SELECT id_transaksi FROM transaksi WHERE id_transaksi = ${id_transaksi}),'${jumlah_beli}', '${tanggal}')`;
  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (error) {
      return res.json();
    }
  });
});

app.put("/riwayat-item-masuk", (req, res) => {
  const id_item = req.body.id_item;
  const stok_tambah = req.body.stok_tambah;

  const sqlQuery = `UPDATE riwayat_item_masuk SET stok_tambah = ${stok_tambah} WHERE id_item = ${id_item}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json(err);
    }
  });
});

app.get("/riwayat-item-keluar", (req, res) => {
  let sqlQuery = `SELECT * FROM riwayat_item_keluar JOIN pembeli ON riwayat_item_keluar.id_pembeli = pembeli.id_pembeli JOIN item ON riwayat_item_keluar.id_item = item.id_item JOIN penjual ON riwayat_item_keluar.id_penjual = penjual.id_penjual JOIN transaksi ON riwayat_item_keluar.id_transaksi = transaksi.id_transaksi`;

  if (req.query.search) {
    sqlQuery += ` WHERE nama_item LIKE '%${req.query.search}%' OR username LIKE '%${req.query.search}%' `;
  }

  let offset = DEFAULT_OFFSET;
  if (req.query.page && Number(req.query.page) > 0) {
    offset =
      (Number(req.query.page) - 1) * Number(req.query.limit ?? DEFAULT_LIMIT);
  }

  sqlQuery += `
    LIMIT ${req.query.limit ?? DEFAULT_LIMIT}
    OFFSET ${offset} 
  `;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json(err);
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

  let sqlQuery = `SELECT * FROM item JOIN kategori ON item.id_kategori = kategori.id_kategori JOIN penjual ON item.id_penjual = penjual.id_penjual where item.id_penjual = ${id}`;

  if (req.query.search) {
    sqlQuery += ` WHERE nama_item LIKE '%${req.query.search}%' OR nama_kategori LIKE '%${req.query.search}%' `;
  }

  let offset = DEFAULT_OFFSET;
  if (req.query.page && Number(req.query.page) > 0) {
    offset =
      (Number(req.query.page) - 1) * Number(req.query.limit ?? DEFAULT_LIMIT);
  }

  sqlQuery += `
    LIMIT ${req.query.limit ?? DEFAULT_LIMIT}
    OFFSET ${offset} 
  `;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/kategori", (req, res) => {
  let sqlQuery = `SELECT * FROM kategori`;

  if (req.query.search) {
    sqlQuery += ` WHERE nama_kategori LIKE '%${req.query.search}%' `;
  }

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
    console.log(rows)
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.post("/kategori", (req, res) => {
  const nama_kategori = req.body.nama_kategori;
  const foto_kategori = req.body.foto_kategori;
  const base64Data = foto_kategori?.[0].replace(
    /^data:([A-Za-z-+/]+);base64,/,
    ""
  );
  const buff = Buffer.from(base64Data, "base64");

  const values = { nama_kategori, foto_kategori: buff };
  const sqlQuery = `
    INSERT INTO kategori SET ?
  `;
  console.log("sqlQuery", sqlQuery);
  console.log("val", values);
  con.query(sqlQuery, values, (err, rows) => {
    try {
      console.log("err", err);
      console.log("rows", rows);
      res.json();
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.put("/kategori", (req, res) => {
  const id_kategori = req.body.id_kategori;
  const nama_kategori = req.body.nama_kategori;
  const foto_kategori = req.body.foto_kategori;
  const base64Data = foto_kategori?.[0].replace(
    /^data:([A-Za-z-+/]+);base64,/,
    ""
  );
  const buff = Buffer.from(base64Data, "base64");
  const values = { nama_kategori, foto_kategori: buff };

  const sqlQuery = `UPDATE kategori SET ? WHERE id_kategori = '${id_kategori}'`;
  con.query(sqlQuery, values, (err, rows) => {
    try {
      res.json();
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.delete("/kategori/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `DELETE FROM kategori WHERE id_kategori = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      res.json();
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
  let sqlQuery = `SELECT * FROM pembeli `;

  if (req.query.search) {
    sqlQuery += `WHERE username LIKE '%${req.query.search}%' OR email LIKE '%${req.query.search}$'`;
  }

  let offset = DEFAULT_OFFSET;
  if (req.query.page && Number(req.query.page) > 0) {
    offset =
      (Number(req.query.page) - 1) * Number(req.query.limit ?? DEFAULT_LIMIT);
  }

  sqlQuery += `
    LIMIT ${req.query.limit ?? DEFAULT_LIMIT}
    OFFSET ${offset} 
  `;

  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      // console.log(error);
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
  let sqlQuery = `SELECT * FROM penjual `;

  if (req.query.search) {
    sqlQuery += `WHERE nama_toko LIKE '%${req.query.search}%' OR email LIKE '%${req.query.search}$'`;
  }

  let offset = DEFAULT_OFFSET;
  if (req.query.page && Number(req.query.page) > 0) {
    offset =
      (Number(req.query.page) - 1) * Number(req.query.limit ?? DEFAULT_LIMIT);
  }

  sqlQuery += `
    LIMIT ${req.query.limit ?? DEFAULT_LIMIT}
    OFFSET ${offset} 
  `;

  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      // console.log(error);
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
  const deskripsi_item = req.body.deskripsi_item;
  const stok_item = req.body.stok_item;
  const warna_item = req.body.warna_item;
  const ukuran_item = req.body.ukuran_item;
  const biaya_operasional = req.body.biaya_operasional;
  const tanggal = req.body.tanggal;

  console.log(req.body);

  const sqlQuery = `INSERT INTO item (nama_item, harga_item, deskripsi_item, stok_item, biaya_operasional, id_penjual, id_kategori, tanggal ) VALUES ('${nama_item}', '${harga_item}', '${deskripsi_item}', '${stok_item}', '${biaya_operasional}' ,(SELECT id_penjual FROM penjual WHERE id_penjual = ${id_penjual}), (SELECT id_kategori FROM kategori WHERE id_kategori = ${id_kategori}), '${tanggal}')`;

  con.query(sqlQuery, (err, rows) => {
    const riwayatQuery = `INSERT INTO riwayat_item_masuk (id_penjual, id_item, stok_awal, tanggal) VALUES ((SELECT id_penjual FROM penjual WHERE id_penjual = ${id_penjual}), ${rows.insertId}, '${stok_item}', '${tanggal}')`;
    con.query(riwayatQuery, (err, rows) => {
      try {
        return res.json();
      } catch (error) {
        return res.json();
      }
    });

    if (req.body?.ukuran_item?.length > 0) {
      // req.body.ukuran_item.forEach(data => {
      if (req.body?.ukuran_item === "Semua Ukuran") {
        const ukuranItemQuery = `INSERT INTO item_ukuran (id_item, nama_ukuran) VALUES (${rows.insertId}, '${ukuran_item}')`;
        con.query(ukuranItemQuery, (err, rows) => {
          try {
            return res.json();
          } catch (error) {
            return res.json();
          }
        });
      } else {
        req.body.ukuran_item?.forEach((data) => {
          let iUkuran_item = data.split(" ");
          const ukuranItemQuery = `INSERT INTO item_ukuran (id_item, nama_ukuran) VALUES (${rows.insertId}, '${iUkuran_item}')`;

          con.query(ukuranItemQuery, (err, rows) => {
            try {
              return res.json();
            } catch (error) {
              return res.json();
            }
          });
        });
      }
    }

    if (warna_item?.length === 1) {
      const sqlQuery = `INSERT INTO item_warna (id_item, nama_warna) VALUES (${rows.insertId}, '${warna_item}')`;

      con.query(sqlQuery, (err, rows) => {
        try {
          res.json();
        } catch (error) {
          res.json(err);
        }
      });
    } else if (warna_item?.length > 1) {
      req.body.warna_item.forEach((data) => {
        let iWarna_item = data.split(" ");
        console.log("iWarna", iWarna_item);
        const warnaItemQuery = `INSERT INTO item_warna (id_item, nama_warna) VALUES (${rows.insertId}, '${iWarna_item}')`;

        con.query(warnaItemQuery, (err, rows) => {
          try {
            return res.json();
          } catch (error) {
            return res.json();
          }
        });
      });
    }

    try {
      if (req.files.length) {
        req.files.forEach((item) => {
          const fileType = item.mimetype.split("/")[1];
          let newFileName = item.filename + "." + fileType;

          fs.rename(
            `./public/${item.filename}`,
            `./public/${newFileName}`,
            function () {
              console.log("file renamed and uploaded");
            }
          );
          const imagePath = `${newFileName}`;
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
      console.log("err", err);
      return res.json();
    }
  });

  return res.json();
});

app.post("/riwayat-item-masuk", (req, res) => {
  const id_item = req.body.id_item;
  const id_penjual = req.body.id_penjual;
  const stok_awal = req.body.stok_awal;
  const stok_tambah = req.body.stok_tambah;
  const tanggal = req.body.tanggal;
  console.log(req.body);

  const sqlQuery = `INSERT INTO riwayat_item_masuk (id_penjual, id_item, stok_awal, stok_tambah, tanggal) VALUES ((SELECT id_penjual FROM penjual WHERE id_penjual = ${id_penjual}), ${id_item}, '${stok_awal}', '${stok_tambah}', '${tanggal}')`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json();
    } catch (error) {
      res.json();
    }
  });
});

app.get("/item-ukuran/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM item_ukuran WHERE id_item = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/item-warna/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM item_warna WHERE id_item = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/item-gambar/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM item_gambar WHERE id_item = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
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
  const ukuran_item = req.body.ukuran_item;
  const biaya_operasional = req.body.biaya_operasional;

  const sqlQuery = `UPDATE item SET nama_item = '${nama_item}', harga_item = ${harga_item}, deskripsi_item = '${deskripsi_item}', stok_item = ${stok_item},  biaya_operasional = ${biaya_operasional}, id_penjual = '${id_penjual}', id_kategori = ${id_kategori} WHERE item.id_item = ${id_item}`;

  con.query(sqlQuery, (err, rows) => {
    // try {
    //   res.json();
    // } catch (error) {
    //   res.json(err);
    // }
    if (req.body.ukuran_item.length > 0) {
      if (req.body.ukuran_item === "Semua Ukuran") {
        const ukuranItemQuery = `UPDATE item_ukuran SET nama_ukuran = '${ukuran_item}' WHERE item.id_item = ${id_item}`;
        con.query(ukuranItemQuery, (err, rows) => {
          try {
            return res.json();
          } catch (error) {
            return res.json();
          }
        });
      } else {
        req.body.ukuran_item.forEach((data) => {
          let iUkuran_item = data.split(" ");
          const ukuranItemQuery = `UPDATE item_ukuran SET nama_ukuran = '${iUkuran_item}' WHERE item.id_item = ${id_item}`;

          con.query(ukuranItemQuery, (err, rows) => {
            try {
              return res.json();
            } catch (error) {
              return res.json();
            }
          });
        });
      }
    }

    if (req.body.warna_item.length === 1) {
      const sqlQuery = `UPDATE item_warna SET nama_warna = '${warna_item}' WHERE item.id_item = ${id_item}`;
      con.query(sqlQuery, (err, rows) => {
        try {
          res.json()
        } catch (error) {
          res.json(err)
        }
      })
    } else if(req.body.warna_item.length > 1){
      req.body.warna_item.forEach((data) => {
        let iWarna_item = data.split(" ");
        const warnaItemQuery = `UPDATE item_warna SET nama_warna = '${iWarna_item}' WHERE item.id_item = ${id_item}`;

        con.query(warnaItemQuery, (err, rows) => {
          try {
            return res.json();
          } catch (error) {
            return res.json();
          }
        });

  /** handle img */
  if (req.body?.foto_item?.length > 0) {
    req.body?.foto_item?.forEach((i) => {
      const base64Data = i.replace(/^data:([A-Za-z-+/]+);base64,/, "");

      const imageTypeBase64 = i.substring(
        "data:image/".length,
        i.indexOf(";base64")
      );

      const filename = `${Math.floor(Date.now() / 1000)}.${imageTypeBase64}`;
      fs.writeFile(`./public/${filename}`, base64Data, "base64", (err) => {
        console.error(err);
        return res.json();
      });

      const addImageQuery = `INSERT INTO item_gambar (id_item, gambar) VALUES (${id_item}, '${filename}')`;

      con.query(addImageQuery, (err, rows) => {
        try {
          return res.json();
        } catch (err) {
          return res.json();
        }
      });
    });
  }

  if (req.body?.id_foto_item_delete?.length) {
    const getImageQuery = `SELECT gambar from item_gambar where id_gambar IN (${req.body?.id_foto_item_delete?.join(
      ","
    )})`;

    con.query(getImageQuery, (err, rows) => {
      try {
        console.log("rows", rows);
        rows?.forEach((r) => {
          const filePath = `./public/${r.gambar}`;
          fs.unlinkSync(filePath);
        });
      } catch (err) {
        return res.json();
      }
    });

    const deleteImageQuery = `DELETE from item_gambar where id_gambar IN (${req.body?.id_foto_item_delete?.join(
      ","
    )})`;

    con.query(deleteImageQuery, (err, rows) => {
      try {
        return res.json();
      } catch (err) {
        return res.json();
      }
    });
  return res.json();
    }
  })
  
    }
})
})

app.get("/keranjang/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM keranjang JOIN item ON keranjang.id_item = item.id_item JOIN pembeli ON keranjang.id_pembeli = pembeli.id_pembeli WHERE keranjang.id_pembeli = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    const idItems = [];

    rows?.forEach((r) => {
      idItems.push(r.id_item);
    });
    let imageQuery = `
        SELECT
            *
            FROM
        item_gambar ig 
        WHERE ig.id_item IN (${idItems.join(",")}) 
    `;

    try {
      con.query(imageQuery, (err, images) => {
        const data = rows?.map((r) => {
          return {
            ...r,
            gambar: images
              ? images
                  ?.filter((i) => i.id_item === r.id_item)
                  ?.map((i) => i.gambar)
              : [],
          };
        });
        try {
          res.json(data);
        } catch (error) {
          console.log(error);
          res.json({ message: error.message });
        }
      });
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.put("/item-stok", (req, res) => {
  const id_item = req.body.id_item;
  const stok_item = req.body.stok_item;

  const sqlQuery = `UPDATE item SET stok_item = ${stok_item} WHERE id_item = ${id_item}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json(err);
    }
  });
});

app.post("/keranjang", (req, res) => {
  const id_pembeli = req.body.id_pembeli;
  const id_item = req.body.id_item;
  const ukuran = req.body.ukuran;
  const warna = req.body.warna;
  const jumlah = req.body.jumlah;
  const total_harga = req.body.total_harga;

  console.log(req.body)

  const sqlQuery = `INSERT INTO keranjang (id_pembeli, id_item, jumlah, ukuran, warna, total_harga) VALUES ((SELECT id_pembeli FROM pembeli WHERE id_pembeli = ${id_pembeli}), (SELECT id_item FROM item WHERE id_item = ${id_item}), '${jumlah}' , '${ukuran}', '${warna}', '${total_harga}')`;

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
  // const id_pembeli = req.body.id_pembeli;
  const id = req.params.id;
console.log(id)
  const sqlQuery = `DELETE FROM keranjang WHERE id_keranjang = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (err) {
      res.json();
    }
  });
});

app.delete("/keranjang-pembeli/:id", (req, res) => {
  // const id_pembeli = req.body.id_pembeli;
  const id = req.params.id;
console.log(id)
  const sqlQuery = `DELETE FROM keranjang WHERE id_pembeli = ${id}`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (err) {
      res.json();
    }
  });
});

app.delete("/transaksi/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `DELETE FROM transaksi WHERE id_transaksi = ${id}`;
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
  const no_telp = req.body.no_telp;
  const foto_profil = req.body.foto_profil;
  const base64Data = foto_profil?.[0]?.replace(
    /^data:([A-Za-z-+/]+);base64,/,
    ""
  );
  const buff = Buffer.from(base64Data, "base64");

  const values = {foto_profil: buff};

  const sqlQuery = `UPDATE pembeli SET email = '${email}', foto_profil = '${values}', username = '${username}', no_telp = '${no_telp}', password = '${password}', alamat = '${alamat}' WHERE pembeli.id_pembeli = ${id}`;
  console.log(req.body)
  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      console.log(error)
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

app.get("/metode_pembayaran", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM metode_pembayaran`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
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
  const sqlQuery = `SELECT * FROM transaksi JOIN item ON transaksi.id_item = item.id_item JOIN pembeli ON transaksi.id_pembeli = pembeli.id_pembeli JOIN metode_pembayaran ON transaksi.id_mp = metode_pembayaran.id_mp WHERE transaksi.status_transaksi = 'Menunggu Konfirmasi'`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows ?? []);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/transaksi/pembeli", (req, res) => {
  const sqlQuery = `SELECT * FROM transaksi JOIN pembeli ON transaksi.id_pembeli = pembeli.id_pembeli JOIN metode_pembayaran ON transaksi.id_mp = metode_pembayaran.id_mp JOIN penjual ON transaksi.id_penjual = penjual.id_penjual`;
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

  const sqlQuery = `SELECT * FROM transaksi JOIN item ON transaksi.id_item = item.id_item JOIN pembeli ON transaksi.id_pembeli = pembeli.id_pembeli JOIN metode_pembayaran ON transaksi.id_mp = metode_pembayaran.id_mp JOIN penjual ON transaksi.id_penjual = penjual.id_penjual WHERE transaksi.id_pembeli = ${id} AND status_transaksi != 'Pembayaran ditolak' AND status_transaksi != 'Pesanan selesai'`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/transaksi/pembeli-selesai/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM transaksi JOIN item ON transaksi.id_item = item.id_item JOIN pembeli ON transaksi.id_pembeli = pembeli.id_pembeli JOIN metode_pembayaran ON transaksi.id_mp = metode_pembayaran.id_mp JOIN penjual ON transaksi.id_penjual = penjual.id_penjual WHERE transaksi.id_pembeli = ${id} AND status_transaksi = 'Pembayaran ditolak' OR status_transaksi = 'Pesanan selesai'`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/transaksi-notif/penjual/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM transaksi JOIN item ON transaksi.id_item = item.id_item JOIN pembeli ON transaksi.id_pembeli = pembeli.id_pembeli JOIN penjual ON transaksi.id_penjual = penjual.id_penjual WHERE transaksi.id_penjual = ${id} AND transaksi.status_transaksi = 'Pesanan diteruskan ke penjual'`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/transaksi-proses/penjual/:id", (req, res) => {
  const id = req.params.id;

  const sqlQuery = `SELECT * FROM transaksi JOIN item ON transaksi.id_item = item.id_item JOIN pembeli ON transaksi.id_pembeli = pembeli.id_pembeli JOIN penjual ON transaksi.id_penjual = penjual.id_penjual WHERE transaksi.id_penjual = ${id} AND transaksi.status_transaksi = 'Pesanan sedang dikemas'`;
  con.query(sqlQuery, (err, rows) => {
    try {
      res.json(rows);
    } catch (error) {
      res.json({ message: error.message });
    }
  });
});

app.get("/transaksi/riwayat", (req, res) => {
  let sqlQuery = `SELECT * FROM transaksi JOIN pembeli ON transaksi.id_pembeli = pembeli.id_pembeli JOIN metode_pembayaran ON transaksi.id_mp = metode_pembayaran.id_mp JOIN item ON transaksi.id_item = item.id_item`;

  if (req.query.search) {
    sqlQuery += ` WHERE nama_item LIKE '%${req.query.search}%' OR username LIKE '%${req.query.search}%' OR status_transaksi LIKE '%${req.query.search}%' OR nama_mp LIKE '%${req.query.search}%'`;
  }

  let offset = DEFAULT_OFFSET;
  if (req.query.page && Number(req.query.page) > 0) {
    offset =
      (Number(req.query.page) - 1) * Number(req.query.limit ?? DEFAULT_LIMIT);
  }

  sqlQuery += `
    LIMIT ${req.query.limit ?? DEFAULT_LIMIT}
    OFFSET ${offset} 
  `;

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
  const jumlah_beli = req.body.jumlah_beli;
  const waktu_pesan = req.body.waktu_pesan;
  const total_harga_transaksi = req.body.total_harga_transaksi;
  const status_transaksi = req.body.status_transaksi;
  console.log(req.body);

  const sqlQuery = `INSERT INTO transaksi ( id_mp, id_keranjang, id_pembeli, id_penjual,  id_item, jumlah_beli, waktu_pesan, total_harga_transaksi, status_transaksi ) VALUES ((SELECT id_mp FROM metode_pembayaran WHERE id_mp = ${id_mp}), (SELECT id_keranjang FROM keranjang WHERE id_keranjang = ${id_keranjang}), (SELECT id_pembeli FROM pembeli WHERE id_pembeli = ${id_pembeli}), (SELECT id_penjual FROM penjual WHERE id_penjual = ${id_penjual}), (SELECT id_item FROM item WHERE id_item = ${id_item}), '${jumlah_beli}', '${waktu_pesan}', '${total_harga_transaksi}', '${status_transaksi}')`;

  con.query(sqlQuery, (err, rows) => {
    try {
      return res.json();
    } catch (err) {
      res.json(err);
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