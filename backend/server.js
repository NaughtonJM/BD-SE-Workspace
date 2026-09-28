const express = require('express');
const cors = require('cors');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();

app.use(cors());
app.use(express.json());

const db = new Database('./database/workspace.db');

const schema =
    fs.readFileSync('./database/schema.sql')
      .toString();

db.exec(schema);

app.get('/api/health',(req,res)=>{
    res.json({
        status:'running',
        database:'connected'
    });
});

app.get('/api/opportunities',(req,res)=>{

    const rows =
        db.prepare(
            'select * from opportunities order by id desc'
        ).all();

    res.json(rows);
});

app.post('/api/opportunities',(req,res)=>{

    const stmt =
        db.prepare(
        INSERT INTO opportunities
        (
           account,
           opportunity_name,
           stage,
           partner,
           timing,
           context
        )
        VALUES
        (
           ?,?,?,?,?,?
        )
    );

    const result =
        stmt.run(
           req.body.account,
           req.body.opportunity_name,
           req.body.stage,
           req.body.partner,
           req.body.timing,
           req.body.context
        );

    res.json({
         success:true,
         id:result.lastInsertRowid
    });
});

const PORT = 3000;

app.listen(PORT,()=>{

   console.log('');
   console.log('===================================');
   console.log('BLACK DUCK SE WORKSPACE RUNNING');
   console.log('===================================');
   console.log('');
   console.log('http://localhost:3000');
   console.log('');

});
