const express = require('express');

const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

const server = express();
server.use(express.json());

const db = require('./db');
const isPhoneCorrect = require('./utils/phone-mask');
const requireJwtMiddleware = require('./utils/user-authentication');


server.get('/contato/:id', (req, res) => {
    const {id} = req.params;  
    
    (async () => {
        const response = await requireJwtMiddleware(req);
        if (response !== true) return res.status(400).json({response});
    
        try {
            const conn = await db.connect();
            const [rows] = await conn.query(`select nome, celular from contacts where id = ${id};`);
            if(rows.length < 1) res.status(404).json({message: 'Nenhum contato encontrato'});
            
            const resultArray = Object.values(JSON.parse(JSON.stringify(rows)))
            return res.status(200).json(resultArray[0]);
        } catch (error) {
            console.log(error);
            res.status(500).json({message:  'Ocorreu um erro ao buscar contato'});
        }
    })();
})

server.get('/contatos', (req, res) => {
    (async () => {
        const response = await requireJwtMiddleware(req); 
        if (response !== true) return res.status(400).json({response});
        try {
            const conn = await db.connect();
            const [rows] = await conn.query(`select nome, celular from contacts`); 

            if(rows.length < 1) res.status(404).json({message: 'Nenhum contato encontrato'});

            const resultArray = Object.values(JSON.parse(JSON.stringify(rows)))
            return res.status(200).json(resultArray);
        } catch (error) {
            console.log(error);
            res.status(500).json({message:  'Ocorreu um erro ao buscar contatos'});
        }
    })();
})

server.post('/contato', (req, res) => {
    const contatos = req.body;
    (async () => {
        const response = await requireJwtMiddleware(req); 
        if (response !== true) return res.status(400).json({response});
        try {
            contatos.map(async (contato) => {
                const isPhoneCorrectConst = isPhoneCorrect(contato.phone);
                if (!isPhoneCorrectConst) return res.status(400).json({message: `O telefone ${contato.phone} não esta no formato +55 (41) 93030-6905`})
                
                if (contato.name !== contato.name.toUpperCase()) 
                return res.status(400).json({message: `Somente letras maiusculas devem ser utilizadas no nome ${contato.name}`})
                
                const conn = await db.connect();
                await conn.query(`insert into contacts (nome, celular) values ('${contato.name}', '${contato.phone}');`); 
                return res.status(200).json({message: `Contatos cadastrados com sucesso`});
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({message: 'Ocorreu um erro ao cadastrar contatos'});
        }
    })();
})

server.put('/contato/:id', (req, res) => {
    const {id} = req.params;
    const {name, phone} = req.body;

    (async () => {
        const response = await requireJwtMiddleware(req); 
        if (response !== true) return res.status(400).json({response});
        try {
            if (name !== name.toUpperCase()) 
            return res.status(400).json({message: 'Somente letras maiusculas devem ser utilizadas no nome'})
        
            const conn = await db.connect();
            
            const [rows] = await conn.query(`select * from contacts where id=${id};`);
            if(rows.length < 1) return res.status(404).json({message: 'Usuário não encontrado'});

            await conn.query(`UPDATE contacts SET nome = '${name}', celular = '${phone}' WHERE id=${id};`); 
            return res.status(200).json({message: 'Usuário atualizado com sucesso'});
            } catch (error) {
                console.log(error);
                res.status(500).json({message:  'Ocorreu um erro ao atualizar contatos'});
        }
    })();
})

server.delete('/contato/:id', (req, res) => {
    const {id} = req.params;
    (async () => {
        const response = await requireJwtMiddleware(req); 
        if (response !== true) return res.status(400).json({response});
        try {            
            const conn = await db.connect();
            const [rows] = await conn.query(`select * from contacts where id=${id};`);
            if(rows.length < 1) return res.status(404).json({message: 'Usuário não encontrado'});
    
            await conn.query(`delete from contacts where id=${id};`);
            return res.status(200).json({message: 'Usuário deletado com sucesso'});
        } catch (error) {
            console.log(error);
            res.status(500).json({message: 'Ocorreu um erro ao deletar contatos'});
        }
    })();
})

server.post('/auth', (req, res) => {
    const {email, password} = req.body;
    (async () => {
        try {
            const conn = await db.connect();
            const [rows] = await conn.query(`select * from users where email='${email}';`);

            if(rows.length < 1) return res.status(400).json({message: 'Credenciais inválidas'});
            const users = Object.values(JSON.parse(JSON.stringify(rows)))

            const encryptedPassword = CryptoJS.MD5(password);
            if (users[0].senha !== encryptedPassword.toString()) return res.status(401).json({message: 'Ocorreu um erro na autenticação'});

            const authenticatedUser = users[0];
            const token = jwt.sign({ authenticatedUser }, 'SECRET', {
              expiresIn: '7d'
            });
            return res.status(200).json(token);
           } catch (error) {
            console.error(error)
            return res.status(500).json({message: 'Ocorreu um erro na autenticação'});
          }
    })();
})

server.listen(3000, ()=> { 
    console.log('Server is up on port', 3000)
});