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


    console.log('---');
    console.log(` doctor: ${med.doctor}`);
    console.log(` checkId: ${med.checkId}`);
    console.log(` patient name: ${med.person.name}`);
    console.log(` patient lastname: ${med.person.lastName}`);
    console.log(` patient date of birth: ${med.person.birthDate}`);
    console.log(` patient gender: ${med.person.gender}`);
    console.log(` patient date of birth: ${med.person.deathDate}`);
    console.log(` drug name: ${med.drugExposure.drugName}`);
    console.log(` drug start date: ${med.drugExposure.startDate}`);
    console.log(` drug end date: ${med.drugExposure.endDate}`);
    console.log(` drug dosis: ${med.drugExposure.dosis}`);
    console.log(` drug quantity: ${med.drugExposure.quantity} units`);
    console.log(` diagnosis: ${med.drugExposure.diagnosis}`);

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