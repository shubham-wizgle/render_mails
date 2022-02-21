const Imap = require('imap');
const {simpleParser} = require('mailparser');
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

const getEmails = () => {
  try {
    const imap = new Imap(imapConfig);
    imap.once('ready', () => {
      imap.openBox('INBOX', false, () => {
        imap.search([['FROM', 'shubham@wizgle.com']], (err, results) => {
          const f = imap.fetch(results, {bodies: ''});
          f.on('message', msg => {
            msg.on('body', stream => {
              simpleParser(stream, async (err, parsed) => {
                // const {from, subject, textAsHtml, text} = parsed;
                debugger
                const root = HTMLParser.parse(parsed.html);
                let dateObj = root.querySelectorAll("th")
                let count = 0;
               
                for(let i=0;i<dateObj.length;i++){
                  let details = '';
                  //Get the details
                  if(dateObj[i].innerText.trim() == 'Date'){
                    let tbody = dateObj[i].parentNode.parentNode;
                    let arrTR2 = tbody.getElementsByTagName('tr')[1];
                    let tds = arrTR2.querySelectorAll('td');
                    for(let j=0; j<tds.length; j++){
                      details += ' | ' +tds[j].innerText.trim();
                    }
                  }
                  // let names = '';
                  // //get the passenger name
                  // if(dateObj[i].innerText.trim() == 'Passenger Name'){
                  //   let tbody_ = dateObj[i].parentNode.parentNode;
                  //   let arrTR2_ = tbody_.getElementsByTagName('tr')[2];
                  //   let tds_ = arrTR2_.querySelectorAll('td');
                  //   for(let j=0; j<tds_.length; j++){
                  //     names += ' | ' +tds_[j].innerText.trim();
                  //   }
                  // }
                  // console.log(decodeURI(names));
                }
                   console.log("count: "+count);
                   console.log(dateObj.length)
              });
            });
            // msg.once('attributes', attrs => {
            //   const {uid} = attrs;
            //   imap.addFlags(uid, ['\\Seen'], () => {
            //     // Mark the email as read after reading it
            //     console.log('Marked as read!');
            //   });
            // });
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
  
  getEmails();