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
    await gateway.connect(connectionProfile, connectionOptions);
    const network = await gateway.getNetwork('mychannel');
    const contract = await network.getContract('papercontract', 'org.papernet.commercialpaper');
 
    let transaction = 'query';
    let doctor = 'Garcia';
    let checkId = '001';

    const response = await contract.evaluateTransaction(transaction, doctor, checkId);
    let med = CommercialPaper.fromBuffer(response);

    console.log(med.doctor);
    console.log(med.checkId);
    console.log(med.date);
    console.log(`${med.person.name} ${med.person.lastName}, ${med.person.gender}`);
    console.log(`${med.drugExposure.drugName}, ${med.drugExposure.quantity} units`);

  } catch (error) {
    console.log(`Error processing transaction. ${error}`);
    console.log(error.stack);
  } finally {
    gateway.disconnect();
  }
}

main().then(() => {
  //console.log('Issue program complete.');
}).catch((e) => {
  console.log('Issue program exception.');
  console.log(e);
  console.log(e.stack);
  process.exit(-1);

});