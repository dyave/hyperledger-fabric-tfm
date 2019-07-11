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

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const CommercialPaper = require('../contract/lib/paper.js');

// A wallet stores a collection of identities for use
const wallet = new FileSystemWallet('../identity/user/balaji/wallet');

// Main program function
async function main() {

  // A gateway defines the peers used to access Fabric networks
  const gateway = new Gateway();

  // Main try/catch block
  try {

    // Specify userName for network access
    // const userName = 'isabella.issuer@magnetocorp.com';
    const userName = 'Admin@org1.example.com';

    // Load connection profile; will be used to locate a gateway
    let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/networkConnection.yaml', 'utf8'));

    // Set connection options; identity and wallet
    let connectionOptions = {
      identity: userName,
      wallet: wallet,
      discovery: { enabled:false, asLocalhost: true }

    };

    // Connect to gateway using application specified parameters
    //console.log('Connect to Fabric gateway.');

    await gateway.connect(connectionProfile, connectionOptions);

    // Access PaperNet network
    //console.log('Use network channel: mychannel.');

    const network = await gateway.getNetwork('mychannel');

    // Get addressability to commercial paper contract
    //console.log('Use org.papernet.commercialpaper smart contract.');

    const contract = await network.getContract('papercontract', 'org.papernet.commercialpaper');

    // buy commercial paper
    //console.log('Submit commercial paper buy transaction.');

    let transaction = 'update';
    let doctor = 'Garcia';
    let checkId = '001';

    let person = {
      name: 'Felipe',
      lastName: 'Perez',
      birthDate: '1992-06-08',
      ethnicity: 'white',
      gender: 'male',
      deathDate: '',
    };
    let drugExposure = {
      drugName: 'Amoxicillin',
      startDate: '2019-06-18',
      endDate: '2019-06-22',
      dosis: 'Dosis description.',
      quantity: 12,
      diagnosis: 'Patient was diagnosed with xxx desease.'
    };
    const patientCheck = {
      doctor,
      checkId,
      date: '2019-06-18',
      person,
      drugExposure
    };


    const response = await contract.submitTransaction(transaction, doctor, checkId, JSON.stringify(person), JSON.stringify(drugExposure));
    let med = CommercialPaper.fromBuffer(response);
    
    console.log(med.doctor);
    console.log(med.checkId);
    //console.log(med.date);
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
  //console.log('Buy program complete.');
}).catch((e) => {
  console.log('Buy program exception.');
  console.log(e);
  console.log(e.stack);
  process.exit(-1);

});