import {Client} from "pg";
export const route = async (req, res, nex, db: Client, ...args) => {
    db.query("SELECT * FROM users", (err, _res) => {
        if (err) throw err;

        res.json(_res.rows)
        console.log(_res.rows)
        // res.render('main', { title: "API social-network"})
    })
}