const Imap = require('imap');
const { simpleParser } = require('mailparser');
const HTMLParser = require('node-html-parser');
const fs = require('fs')
const imapConfig = {
  user: 'testwizgle@gmail.com',
  password: '1Jan@2017',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

let keysArr = ['Date', 'From_Terminal', 'Flight_Number', 'Check-in', 'To_Terminal', 'Arrives', 'Via']

const getEmails = () => {
  try {
    const imap = new Imap(imapConfig);
    imap.once('ready', () => {
      imap.openBox('INBOX', false, () => {
        imap.search([['FROM', 'shubham@wizgle.com']], (err, results) => {
          const f = imap.fetch(results, { bodies: '' });
          f.on('message', msg => {
            msg.on('body', stream => {
              simpleParser(stream, async (err, parsed) => {
                // const {from, subject, textAsHtml, text} = parsed;
                const root = HTMLParser.parse(parsed.html);
                let res = extractIndigoMail(root);
                console.log(JSON.stringify(res))
              });
            });
          });
          f.once('error', ex => {
            return Promise.reject(ex);
          });
          f.once('end', () => {
            console.log('Done fetching all messages!');
            imap.end();
          });
        });
      });
    });

    imap.once('error', err => {
      console.log(err);
    });

    imap.once('end', () => {
      console.log('Connection ended');
    });

    imap.connect();
  } catch (ex) {
    console.log('an error occurred');
  }
};

const extractIndigoMail = (root)=>{
  let dateObj = root.querySelectorAll("th")
  let finalObj = [];
  let nameArr = [];
  for (let i = 0; i < dateObj.length; i++) {
    let o = {};
    //Get the details
    if (dateObj[i].innerText.trim() == 'Date') {
      let tbody = dateObj[i].parentNode.parentNode;
      let arrTR2 = tbody.getElementsByTagName('tr')[1];
      let tds = arrTR2.querySelectorAll('td');
      for (let j = 0; j < tds.length; j++) {
        if(tds[j].innerText.trim().length)
          o[keysArr[j]] = tds[j].innerText.trim();
      }
      finalObj.push(o);
    }
    //get the passenger name
    if (dateObj[i].innerText.trim() == 'Passenger Name') {
      let tbody_ = dateObj[i].parentNode.parentNode;
      let arrTR2_ = tbody_.querySelectorAll('tr')[3];
      let tds_ = arrTR2_.querySelectorAll('td');
      nameArr.push({
        name: tds_[0].innerText.trim(),
        seat: tds_[2].innerText.trim()
      })
    }
  }
  for (let x = 0; x < finalObj.length; x++) {
    finalObj[x]['name'] = nameArr[x]['name'];
    finalObj[x]['seat'] = nameArr[x]['seat'];
  }
  return finalObj;
}
getEmails();