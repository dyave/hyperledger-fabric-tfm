/*
SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access PaperNet network
 * 4. Construct request to issue commercial paper
 * 5. Submit transaction
 * 6. Process response
 */

'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const CommercialPaper = require('../contract/lib/paper.js');

const wallet = new FileSystemWallet('../identity/user/isabella/wallet');

async function main() {
  const gateway = new Gateway();

  try {
    const userName = 'User1@org1.example.com';
    let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/networkConnection.yaml', 'utf8'));
    let connectionOptions = {
      identity: userName,
      wallet: wallet,
      discovery: { enabled:false, asLocalhost: true }
    };

    console.log('Connect to Fabric gateway.');
    await gateway.connect(connectionProfile, connectionOptions);

    console.log('Use network channel: mychannel.');
    const network = await gateway.getNetwork('mychannel');

    console.log('Use org.papernet.commercialpaper smart contract.');
    const contract = await network.getContract('papercontract', 'org.papernet.commercialpaper');
 
    //let transaction = 'issue';
    let transaction = 'query';
    //let transaction = 'create';
    let issuer = 'MagnetoCorp';
    let paperNumber = '00004';
    let issueDateTime = '2020-05-31';
    let maturityDateTime = '2020-11-30';
    let faceValue = '5000000';

    const patientToCreate = {
      issuer,
      paperNumber,
      issueDateTime,
      maturityDateTime,
      faceValue
    };
    const patientToQuery = {
      issuer,
      paperNumber
    };

    if (transaction == 'create') {
      console.log('Submit create');
      const issueResponse = await contract.submitTransaction(transaction, JSON.stringify(patientToCreate));
      let paper = CommercialPaper.fromBuffer(issueResponse);
      console.log(`${paper.issuer} commercial paper : ${paper.paperNumber} successfully issued for value ${paper.faceValue}`);
      console.log('Transaction complete.');
    }

    if (transaction == 'query') {
      const result = await contract.evaluateTransaction(transaction, issuer, paperNumber);
      let paper = CommercialPaper.fromBuffer(result);
      console.log(`issueer: ${paper.issuer}, commercial paper: ${paper.paperNumber} , owner: ${paper.owner}`);
    }

  } catch (error) {
    console.log(`Error processing transaction. ${error}`);
    console.log(error.stack);
  } finally {
    console.log('Disconnect from Fabric gateway.')
    gateway.disconnect();
  }
}

main().then(() => {
  console.log('Issue program complete.');
}).catch((e) => {
  console.log('Issue program exception.');
  console.log(e);
  console.log(e.stack);
  process.exit(-1);

});