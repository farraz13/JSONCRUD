const moment = require('moment')
const express = require('express')

const path = require('path')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()

const dbFile = './database/data.db'
const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE, (err) => {
  if (err) { console.log(`Failed to connect to database`, err) };
});

const app = express()
const port = 3000

app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


app.get('/', (req, res) => {
  const page = req.query.page || 1
  const url = req.url == '/' ? '/?page=1' : req.url
  const limit = 3;
  const offset = (page - 1) * limit

  const position = []
  const values = []

  db.all('SELECT * FROM bread', (err, total) => {
    if (err) {
      console.log('Failed to get data')
    }
    console.log(url)

    if (req.query.id && req.query.idCheck == 'on') {
      position.push(`id = ?`);
      values.push(req.query.id);
    }

    if (req.query.string && req.query.stringCheck == 'on') {
      position.push(`string like '%' || ? || '%'`);
      values.push(req.query.string);
    }

    if (req.query.integer && req.query.integerCheck == 'on') {
      position.push(`integer like '%' || ? || '%'`);
      values.push(req.query.integer);
    }

    if (req.query.float && req.query.floatCheck == 'on') {
      position.push(`float like '%' || ? || '%'`);
      values.push(req.query.float);
    }
    //
    if (req.query.dateCheck == 'on') {
      if (req.query.startDate != '' && req.query.endDate != '') {
        position.push('date BETWEEN ? AND ?')
        values.push(req.query.startDate);
        values.push(req.query.endDate);
      }
      else if (req.query.startDate) {
        position.push('date > ?')
        values.push(req.query.startDate);
      }
      else if (req.query.endDate) {
        position.push('date < ?')
        values.push(req.query.endDate);
      }
    }
    //
    if (req.query.boolean && req.query.booleanCheck == 'on') {
      position.push(`boolean = ?`);
      values.push(req.query.boolean);
    }

    let sql = 'SELECT COUNT(*) AS total FROM bread';
    if (position.length > 0) {
      sql += ` WHERE ${position.join(' AND ')}`
    }
    console.log(sql)

    db.all(sql, values, (err, data) => {
      if (err) {
        console.error(err);
      }
      const pages = Math.ceil(data[0].total / limit)

      sql = 'SELECT * FROM bread'
      if (position.length > 0) {
        sql += ` WHERE ${position.join(' AND ')}`
      }
      sql += ' LIMIT ? OFFSET ?';

      db.all(sql, [...values, limit, offset], (err, data) => {
        if (err) {
          console.error(err);
        }
        res.render('index', { data, moment, pages, page, query: req.query, url, total })
      })
    })
  })
})

app.get('/add', (req, res) => {
  res.render('add')
})

app.get('/edit', (req, res) => {
  res.render('edit')
})

app.get('/edit/:id', (req, res) => {
  db.all('SELECT * FROM bread WHERE id = ?', [req.params.id], (err, data) => {
    if (err) {
      console.log('Failed to get data to edit', err)
    }
    res.render('edit', { item: data[0] })
  })
})

app.get('/delete/:id', (req, res) => {
  db.run('DELETE FROM bread WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      console.log('Failed to delete data')
      throw err;
    }
    res.redirect('/')
  })
})


app.post('/add', (req, res) => {
  db.run('INSERT INTO bread (string, integer, float, date, boolean) VALUES (?, ?, ?, ?, ?)', [req.body.string, parseInt(req.body.integer), parseFloat(req.body.float), req.body.date, JSON.parse(req.body.boolean)], (err) => {
    if (err) {
      console.log('Failed to add data')
    }
    res.redirect('/')
  })
})

app.post('/edit/:id', (req, res) => {
  db.run('UPDATE bread SET string = ?, integer = ?, float = ?, date = ?, boolean = ? WHERE id = ?',
    [req.body.string, parseInt(req.body.integer), parseFloat(req.body.float), req.body.date, req.body.boolean, req.params.id], (err) => {
      if (err) {
        console.error('Failed to update data', err)
      }
      res.redirect('/');
    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})