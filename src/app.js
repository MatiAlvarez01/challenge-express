var express = require("express");
var server = express();
var bodyParser = require("body-parser");

var model = {};

server.use(bodyParser.json());

server.listen(3000);
module.exports = { model, server };
var express = require("express");
var server = express();

var model = {};

server.use(express.json());

model.clients = {}; //1

model.reset = () => model.clients = {}; //2, 3

model.addAppointment = (client, appointment) => { //4 to 8
    appointment = Object.assign({}, appointment, {status: "pending"})
    if (!model.clients[client]) {
        model.clients[client] = [];
        model.clients[client].push(appointment);
        return appointment;
    } else {
        model.clients[client].push(appointment);
    }
}

model.attend = (name, date) => {  //9 to 13
    if (model.clients[name]) {
        const appointment = model.clients[name].find(obj => obj.date === date)
        if (appointment) {
            appointment.status = "attended"
        } else {
            return "Date not found."
        }
    } else {
        return "Client not found."
    }
}

model.expire = (name, date) => { //9 to 13
    if (model.clients[name]) {
        const appointment = model.clients[name].find(obj => obj.date === date)
        if (appointment) {
            appointment.status = "expired"
        } else {
            return "Date not found."
        }
    } else {
        return "Client not found."
    }
}

model.cancel = (name, date) => { //9 to 13
    if (model.clients[name]) {
        const appointment = model.clients[name].find(obj => obj.date === date)
        if (appointment) {
            appointment.status = "cancelled"
        } else {
            return "Date not found."
        }
    } else {
        return "Client not found."
    }
}

model.erase = (name, toErase) => { //14 to 16
    const length = toErase.split(" ").length;
    if (length > 1) { //Is a Date
        const appointment = model.clients[name].find(obj => obj.date === toErase);
        if (appointment) {
            const index = model.clients[name].indexOf(appointment)
            return model.clients[name].splice(index, 1)
        } else {
            return "Date not found."
        }
    } else { //Is a Status
        const instances = model.clients[name].filter(obj => obj.status === toErase);
        const appointmentsErased = [];
        if (instances.length > 0) {
            for (const matchs of instances) {
                appointmentsErased.push(model.clients[name][model.clients[name].indexOf(matchs)])
                model.clients[name].splice(model.clients[name].indexOf(matchs), 1)
            }
        }
        return appointmentsErased;
    }
}

model.getAppointments = (name, status) => { //16 to 18
    if (status) {
        const appointments = model.clients[name].filter(obj => obj.status === status);
        return appointments
    } else {
        return model.clients[name]
    }
}

model.getClients = () => { //18 to 20
    return Object.keys(model.clients)
}

server.get("/api", (req, res) => { //1
    res.json(model.clients)
})

server.post("/api/Appointments", (req, res) => { //2 to 4
    if (!req.body.client) {
        res.status(400).send("the body must have a client property")
    } else if (typeof req.body.client !== "string") {
        res.status(400).send("client must be a string")
    } else {
        const {client, appointment} = req.body
        res.json(model.addAppointment(client, appointment))
    }
})

server.get("/api/Appointments/:name", (req, res) => { //5 to 11
    const client = req.params.name;
    const date = req.query.date;
    const status = req.query.option;
    if (client === "clients") {
        res.json(model.getClients())
    } else if (!model.clients[client]) {
        res.status(400).send("the client does not exist");
    } else {
        const appointment = model.getAppointments(client)?.find(obj => obj.date === date)
        if (!appointment) {
            res.status(400).send("the client does not have a appointment for that date")
        } else if (status === "attend") {
            model.attend(client, date);
            res.json(appointment);
        } else if (status === "expire") {
            model.expire(client, date);
            res.json(appointment);
        } else if (status === "cancel") {
            model.cancel(client, date);
            res.json(appointment);
        } else {
            res.status(400).send("the option must be attend, expire or cancel")
        } 
    }
})

server.get("/api/Appointments/:name/erase", (req, res) => {//12 to 15
    const client = req.params.name;
    const toErase = req.query.date;
    if (!model.clients[client]) {
        res.status(400).send("the client does not exist");
    } else {
        res.json(model.erase(client, toErase))
    }
})

server.get("/api/Appointments/getAppointments/:name", (req, res) => { //16
    const client = req.params.name;
    const status = req.query.status;
    res.json(model.getAppointments(client, status))
})

server.listen(3000);
module.exports = { model, server };
