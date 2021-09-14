const express = require('express');
const server = express();
server.use(express.json());
const db = require("./db");

function isPhoneCorrect(phone) {
    const splittedPhone = phone.split('');
    const begging = `${splittedPhone[0]}${splittedPhone[1]}${splittedPhone[2]}${splittedPhone[3]}${splittedPhone[4]}${splittedPhone[5]}${splittedPhone[6]}${splittedPhone[7]}${splittedPhone[8]}`
    const firstCaracteres = `${splittedPhone[9]}${splittedPhone[10]}${splittedPhone[11]}${splittedPhone[12]}${splittedPhone[13]}`
    const middle = `${splittedPhone[14]}`
    const secondCaracteres = `${splittedPhone[15]}${splittedPhone[16]}${splittedPhone[17]}${splittedPhone[18]}`
    const isJustNumbers = /^\d+$/.test(firstCaracteres);
    const isJustNumbers2 = /^\d+$/.test(secondCaracteres);
    if(phone.length === 19 
        && begging === '+55 (41) ' 
        && isJustNumbers 
        && middle === '-' 
        && isJustNumbers2)
        return true

        return false
}

server.get('/contato/:id', (req, res) => {
    const {id} = req.params; 
    (async () => {
        try {
            const conn = await db.connect();
            const [rows] = await conn.query(`select nome, celular from contacts where id = ${id};`);
            
            if(rows.length < 1) res.json({message: "Nenhum contato encontrato"});
            
            const resultArray = Object.values(JSON.parse(JSON.stringify(rows)))
            return res.json(resultArray[0]);
        } catch (error) {
            return res.json({message: "Ocorreu um erro ao buscar contato"});
        }
    })();
})

server.get('/contatos', (req, res) => {
    (async () => {
        try {
            const conn = await db.connect();
            const [rows] = await conn.query(`select nome, celular from contacts`); 

            if(rows.length < 1) res.json({message: "Nenhum contato encontrato"});

            const resultArray = Object.values(JSON.parse(JSON.stringify(rows)))
            return res.json(resultArray);
        } catch (error) {
            return res.json({message: "Ocorreu um erro ao buscar contatos"});
        }
    })();
})

server.post('/contato', (req, res) => {
    const contatos = req.body;
    (async () => {
        try {
            contatos.map(async (contato) => {
                const isPhoneCorrectConst = isPhoneCorrect(contato.phone);
                if (isPhoneCorrectConst == false) res.json({message: `O telefone ${contato.phone} não esta no formato +55 (41) 93030-6905`})
                
                if (contato.name !== contato.name.toUpperCase()) 
                return res.json({message: `Somente letras maiusculas devem ser utilizadas no nome ${contato.name}`})
                
                const conn = await db.connect();
                await conn.query(`insert into contacts (nome, celular) values ('${contato.name}', '${contato.phone}');`); 
                return res.json({message: `Contatos cadastrados com sucesso`});
            })
        } catch (error) {
            return res.json({message: "Ocorreu um erro ao cadastrar contatos"});
        }
    })();
})

server.put('/contato/:id', (req, res) => {
    const {id} = req.params;
    const {name, phone} = req.body;

    (async () => {
        try {
            if (name !== name.toUpperCase()) 
            return res.json({message: 'Somente letras maiusculas devem ser utilizadas no nome'})
        
            const conn = await db.connect();
             await conn.query(`UPDATE contacts SET nome = '${name}', celular = '${phone}' WHERE id=${id};`); 
             return res.json({message: "Usuário atualizado com sucesso"});
            } catch (error) {
            return res.json({message: "Ocorreu um erro ao atualizar contatos"});
        }
    })();
})

server.delete('/contato/:id', (req, res) => {
    const {id} = req.params;
    (async () => {
        try {            
            const conn = await db.connect();
            await conn.query(`delete from contacts where id=${id};`); 
            return res.json({message: "Usuário deletado com sucesso"});
        } catch (error) {
            return res.json({message: "Ocorreu um erro ao deletar contatos"});
        }
    })();
})

server.listen(3000);