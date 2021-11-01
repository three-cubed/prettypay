const express = require('express');
const router = express.Router();
const fs = require('fs');
const fetch = require('node-fetch');

const { 
    matchPreprocessingData, 
    recordTransaction, 
    checkCardExpiry, 
    generateUUID, 
    formatNumberToString,
    preprocessData,
    prepareDataToReport,
    parseOrCreateJSON
} = require('../javascripts/utils.js');

router.post('/preprocess', function(req, res) {
    const currentTransaction = req.body;
    // const uniqueTransactionReference = generateUUID();
    currentTransaction.uniqueTransactionReference = generateUUID();
    currentTransaction.timePosted = new Date();
    currentTransaction.timePostedAsNumber = currentTransaction.timePosted.getTime();
    fs.readFile('./node_modules/prettypay/records/inProgress.json', function(error, dataInFile) {
        if (error) {
            console.log(error);
        } else {
            try {
                preprocessData(currentTransaction, dataInFile);
            } catch (error) {
                fs.writeFile('./node_modules/prettypay/records/inProgress.json', '[]', (err) => {
                    if (err) throw err;
                })
                try {
                    fs.readFile('./node_modules/prettypay/records/inProgress.json', function(error, dataInFile) {
                        if (error) {
                            console.log(error);
                        } else {
                            preprocessData(currentTransaction, dataInFile);
                        }
                    })
                } catch (error) {
                    console.log(error);
                }
            }
        }
    });
    res.status(200).json({ uniqueTransactionReference: currentTransaction.uniqueTransactionReference });
})

router.post('/process', async function(req, res) {
    const abortMessage = 'Fictional purchase aborted by Prettypay backend with status 403 (forbidden)';
    const currency = req.body.currency;
    const amountToProcess = parseFloat(req.body.amountToProcess);
    const uniqueTransactionReference = req.body.uniqueTransactionReference;
    const responseObject = {
        time: new Date(),
        successful: false,
        currency: currency,
        amountToProcess: amountToProcess,
        uniqueTransactionReference: uniqueTransactionReference,
        cardName: req.body.cardName,
        contactName: req.body.contactName,
        contactPostalAddress: req.body.contactPostalAddress,
        contactEmail: req.body.contactEmail,
        customerMessage: ''
    };

    if (amountToProcess <= 0) {
        responseObject.devMessage = `${abortMessage}: total charge of ${req.body.bodyamountToProcess} is not greater than zero.`;
        responseObject.customerMessage = `The total charge of ${req.body.bodyamountToProcess} is not greater than zero.`;
        handleRejectedTransaction(res, responseObject, req.body.prettypayPostPath);
        return;
    } else if (isNaN(amountToProcess)) {
        responseObject.devMessage = `${abortMessage}: ${req.body.bodyamountToProcess} cannot be processed as an amount.`;
        responseObject.customerMessage = `Error: Prettypay has not received a recognisable amount to process.`;
        handleRejectedTransaction(res, responseObject, req.body.prettypayPostPath);
        return;
    } else if (checkCardExpiry(req.body.expiryString) !== 'good') {
        responseObject.devMessage = `${abortMessage}: Expiry received: ${req.body.expiryString}; ${checkCardExpiry(req.body.expiryString)}`;
        responseObject.customerMessage = `${checkCardExpiry(req.body.expiryString)}`;
        handleRejectedTransaction(res, responseObject, req.body.prettypayPostPath);
        return;
    }

    const matchAttempt = await matchPreprocessingData(uniqueTransactionReference, currency, amountToProcess);
    // console.log(`matchAttempt: ${matchAttempt}`);

    if (matchAttempt === 'discrepancy') {
        const discrepancyMessage = 'There appears to be a discrepancy between amount & currency data received at preprocessing and corresponding data received at processing. You may wish to try again.'
        responseObject.devMessage = `${abortMessage}: ${discrepancyMessage}`;
        responseObject.customerMessage = `${discrepancyMessage}`;
        handleRejectedTransaction(res, responseObject, req.body.prettypayPostPath);
        return;
    } else if (matchAttempt === 'idError') {
        responseObject.devMessage = `${abortMessage}: There does not seem to be a transaction with this unique identity recorded at the backend as having been initiated.`;
        responseObject.customerMessage = `There appears to be a problem with the transaction. You may wish to try again.`;
        handleRejectedTransaction(res, responseObject, req.body.prettypayPostPath);
        return;
    } else if (req.body.currency === '€') {
        responseObject.devMessage = `${abortMessage}: Euro transactions forbidden.`;
        responseObject.customerMessage = '<p style="text-align: center">Prettypay does not accept euros.<br>🇬🇧&nbsp;God Save the Queen!&nbsp;🇬🇧</p>';
        handleRejectedTransaction(res, responseObject, req.body.prettypayPostPath);
        return;
    } else {
        responseObject.successful = true; // Very important line!
        responseObject.devMessage = `Successful fictional purchase processed by Prettypay backend; total charge of ${amountToProcess}.`;
        responseObject.customerMessage = `Amount debited: ${req.body.currency} ${formatNumberToString(req.body.amountToProcess)}<br><br><small>Transaction reference:<br>${uniqueTransactionReference}<small>`;
        recordTransaction(responseObject);
        postToParent(responseObject, req.body.prettypayPostPath);
        res.status(200).json(responseObject);
    }
})

function handleRejectedTransaction(res, responseObject, prettypayPostPath = null) {
    recordTransaction(responseObject);
    postToParent(responseObject, prettypayPostPath);
    res.status(401).json(responseObject);
}

function postToParent(responseObject, pathToPostToParent) {
    if (pathToPostToParent === null) return;
    fetch(pathToPostToParent, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            transaction: responseObject
        })
    }).catch(function(error) {
        console.error(error);
    })
}

router.get('/report', function(req, res) {
    let dataToReport = prepareDataToReport('transactions.json');
    let nontransDataToReport = prepareDataToReport('nontransactions.json');

    res.render(require('path').resolve(__dirname, '..') + '/views/report.ejs', { 
        dataToReport: dataToReport,
        nontransDataToReport: nontransDataToReport
    });
    // __dirname would go from this routes directory, 
    // while (require('path').resolve(__dirname, '..') gives me the directory above it.
})

//returnTransaction route untested, consider whether useful anyway.
router.get('/returnTransaction/:uniqueTransactionReference', function(req, res) {
    let responseObject = 'transaction not found';
    let uniqueTransactionReference = req.params.uniqueTransactionReference;
    const dataInFile = fs.readFileSync('./node_modules/prettypay/records/transactions.json');
    dataArray = parseOrCreateJSON(dataInFile, './node_modules/prettypay/records/transactions.json');
    for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i].uniqueTransactionReference === uniqueTransactionReference) {
            responseObject = dataArray[i];
        }
    }
    res.status(200).json(responseObject);
});

module.exports = router;
