var mssql = require('mssql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const cheerio = require("cheerio");
var fs = require('fs');


// dapat nasa .env file
const config = {
    user: "webdevdendenski_SQLLogin_1",
    password: "lfg1eakl9c",
    server: "dbsample.mssql.somee.com",
    database: "dbsample",
    options: {
      trustServerCertificate: true
    }
  };

mssql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new mssql.Request();
    request.query('select * from dbsample.dbo.dblogin', function (err, recordset) {
        if (err) console.log(err)
    });
});

var app = express();

app.use(session({
	secret: 'secret1234', // dapat nasa .env file
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
        var req = new mssql.Request();
        req.input('password', password);
        req.input('name', username);
		req.query('SELECT * FROM dbsample.dbo.dblogin WHERE name = @name AND password = @password', async (error, results) => {
            if (results.recordset.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/main-index');
				response.end();
			} else {
				console.log("test");
				add_text(response)
			}			
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/add', function(request, response) {
	if (request.session.loggedin) { 
		let { lastname, firstname, middlename, address, birthDate, age, gender, disability, id_number, civil_status, guardian_lastname, guardian_firstname,
			guardian_middlename, guardian_contactno, lgu_pension, voter_status, occupation } = request.body
			
		var req = new mssql.Request();
		req.input('lastname',lastname);
		req.input('firstname',firstname);
		req.input('middlename',middlename);
		req.input('address',address);
		req.input('birthDate',birthDate);
		req.input('age',age);
		req.input('gender',gender);
		req.input('disability',disability);
		req.input('id_number',id_number);
		req.input('civil_status',civil_status);
		req.input('guardian_lastname',guardian_lastname);
		req.input('guardian_firstname',guardian_firstname);
		req.input('guardian_middlename',guardian_middlename);
		req.input('guardian_contactno',guardian_contactno);
		req.input('lgu_pension',lgu_pension);
		req.input('voter_status',voter_status);
		req.input('occupation',occupation);
		req.query('INSERT INTO dbsample.dbo.pwdinfo (last_name, first_name, middle_name, address, birth_date, age, gender, disability, id_no, civil_status, g_last_name, g_first_name, g_midde_name, g_contactno, lgu_pension, voter_status, occupation) \
					VALUES (@lastname, @firstname, @middlename, @address, @birthDate, @age, @gender, @disability, @id_number, @civil_status, @guardian_lastname, @guardian_firstname, @guardian_middlename, @guardian_contactno, @lgu_pension, @voter_status, @occupation);', (error, result) => {
			if(error) {
				console.log(error)
			} else {
				response.redirect('/view-data');
			}
		})
	} else {
		response.redirect('/');
	}
});

app.get('/main-index', function(request, response) {
	if (request.session.loggedin) { 
        response.sendFile(path.join(__dirname + '/main-index.html'));
	} else {
		response.redirect('/');
	}
});

app.get('/logout', function(request, response) {
	if (request.session.loggedin) { 
        response.redirect('/');
		request.session.destroy();
	} 
});

app.get('/view-data', function(request, response) {
	if (request.session.loggedin) { 
		var request = new mssql.Request();
   		request.query('select * from dbsample.dbo.pwdinfo', function (err, recordset) {
        if (err) console.log(err)
		add_row(response, recordset)
    });
	} else {
		response.redirect('/');
	}
});

app.get('/new-entry', function(request, response) {
	if (request.session.loggedin) { 
		response.sendFile(path.join(__dirname + '/new-entry-index.html'));
	} else {
		response.redirect('/');
	}
});

app.get('/update-entry', function(request, response) {
	if (request.session.loggedin) { 
		response.sendFile(path.join(__dirname + '/update-entry-accessible-index.html'));
	} else {
		response.redirect('/');
	}
});

function add_row(response, recordset){
	const filename = path.join(__dirname + '/view-data-index.html')
	const filenameout = path.join(__dirname + '/dummy.html')
	const markup = fs.readFileSync(filename);
	const $ = cheerio.load(markup);

	for (let i = 0; i < recordset.recordset.length; i++) {	
	rowtext=`
	<tr>
		<td data-label="ID No.">${recordset.recordset[i].id_no}</td>
		<td data-label="First Name" >${recordset.recordset[i].first_name}</td>
		<td data-label="Middle Name" >${recordset.recordset[i].middle_name}</td>
		<td data-label="Last Name" >${recordset.recordset[i].last_name}</td>
		<td data-label="Age">${recordset.recordset[i].age}</td>
		<td data-label="Gender">${recordset.recordset[i].gender}</td>
		<td data-label="Birthdate">${recordset.recordset[i].birth_date}</td>
		<td data-label="Disability Type">${recordset.recordset[i].disability}</td>
		<td data-label="Civil Status">${recordset.recordset[i].civil_status}</td>
		<td data-label="Occupation">${recordset.recordset[i].occupation}</td>
		<td data-label="Voter">${recordset.recordset[i].voter_status}</td>
		<td data-label="LGU Pension">${recordset.recordset[i].lgu_pension}</td>
		<td data-label="Address" >${recordset.recordset[i].address}</td>
		<td data-label="Guardian F.N.">${recordset.recordset[i].g_first_name}</td>
		<td data-label="Guardian M.N.">${recordset.recordset[i].g_midde_name}</td>
		<td data-label="Guardian L.N.">${recordset.recordset[i].g_last_name}</td>
		<td data-label="Contact">${recordset.recordset[i].g_contactno}</td>
	</tr>`;
    $('.tableBody').append(rowtext).html();
	}
	fs.writeFileSync(filenameout, $.html(), 'utf8');
	response.sendFile(filenameout);
	console.log($('title').text());
}

function add_text(response){
	const filename = path.join(__dirname + '/index.html')
	const filenameout = path.join(__dirname + '/dummy.html')
	const markup = fs.readFileSync(filename);
	const $ = cheerio.load(markup);
	navText='Wrong username/password';

    $('.warning').append(navText).html();
	fs.writeFileSync(filenameout, $.html(), 'utf8');
	response.sendFile(filenameout);
	console.log($('title').text());
}

app.use(express.static('public'));
app.listen(3000);