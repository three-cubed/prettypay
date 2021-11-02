const fs = require('fs'); // Without this, "ReferenceError: fs is not defined"

function matchPreprocessingData(id, currency, amountToProcess) {
    const dataInFile = fs.readFileSync('./node_modules/prettypay/records/inProgress.json');
    // MUST be sync or dataInFile is undefined which messes things up.
    const dataArray = parseOrCreateJSON(dataInFile, './node_modules/prettypay/records/inProgress.json');
    for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i].uniqueTransactionReference === id) {
            if (dataArray[i].currency === currency && parseFloat(dataArray[i].amount) === parseFloat(amountToProcess)) {
                rewriteInprogressWithoutItem(dataArray, i);
                return 'match';
            }
            rewriteInprogressWithoutItem(dataArray, i);
            return 'discrepancy';
        }
    }
    return 'idError';
}

function parseOrCreateJSON(data, srcFile = null) {
    try {
        // console.log(`Parsed: data from ${srcFile}.`)
        return JSON.parse(data);
    } catch (e) {
        console.log(e);
        if (srcFile !== null) {
            console.log(`Could not parse with parseOrCreateJSON() from ${srcFile}; solving by rewriting file and returning parsed '[]'.`);
            fs.writeFileSync(srcFile, '[]', (err) => {
                if (err) throw err;
            });
        } else {
            console.log("Could not parse with parseOrCreateJSON(); solving issue by returning parsed '[]'.");
        }
        return JSON.parse('[]');
    }
}

function rewriteInprogressWithoutItem(dataArray, i) {
    dataArray = returnArrayWithoutItem(dataArray, i);
    while (dataArray.length > 200) dataArray.pop(); // To prevent file getting too long, limit to 200 in-progress transactions at once!
    const dataStringForSending = JSON.stringify(dataArray);
    fs.writeFileSync('./node_modules/prettypay/records/inProgress.json', dataStringForSending, (err) => {
        if (err) throw err;
    });
}

function returnArrayWithoutItem(array, i) {
    array.push(array.splice(i, 1)[0]);
    array.pop();
    // Using push then pop() intended to neutralise the effects of simultaneous deletions interfering with one another,
    // as even if at same time, number of pops should match number of items already moved to end for deletion.
    return array;
}

function searchForUnprocessedTransactions(dataArray) {
    const timeLimitPoint = new Date().getTime() - (1000 * 60 * 30); // Gives 30 minutes as minimum time.
    for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i].timePostedAsNumber < timeLimitPoint) {
            dataArray[i].successful = false;
            dataArray[i].message = `Transaction preprocessed at ${dataArray[i].timePosted}, but not subsequently processed, for reasons unknown. Transaction removed from in-progress data ${new Date()}.`;
            recordTransaction(dataArray[i]);
            rewriteInprogressWithoutItem(dataArray, i);
            i--;
        }
    }
}

function recordTransaction(responseObject) {
    let fileToRecordIn;
    if (responseObject.successful === true) {
        fileToRecordIn = './node_modules/prettypay/records/transactions.json';
    } else {
        fileToRecordIn = './node_modules/prettypay/records/nontransactions.json';
    }
    try {
        fs.readFile(fileToRecordIn, (error, dataInFile) => { // Should not be sync as will stall in case of faulty record files.
            if (error) {
                console.log('error at recordTransaction point 1');
                console.log(error);
            } else {
                try {
                    const dataArray = parseOrCreateJSON(dataInFile, fileToRecordIn);
                    dataArray.unshift(responseObject);
                    while (dataArray.length > 100) dataArray.pop(); // To prevent either file getting too long, 100 records each!
                    const dataStringForSending = JSON.stringify(dataArray);
                    fs.writeFile(fileToRecordIn, dataStringForSending, (err) => {
                        if (err) {
                            console.log('error at recordTransaction point 2');
                            throw err;
                        }
                    });
                } catch (err) {
                    console.log('error at recordTransaction point 3');
                    console.log(err);
                }
            }
        });
    } catch (error) {
        console.log(error);
    }
}

function preprocessData(currentTransaction, dataInFile) {
    const dataArray = parseOrCreateJSON(dataInFile);
    dataArray.unshift(currentTransaction);
    while (dataArray.length > 200) dataArray.pop(); // To prevent file getting too long, 200 in-progress transactions! Seems generous.
    const dataStringForSending = JSON.stringify(dataArray);
    try {
        fs.writeFileSync('./node_modules/prettypay/records/inProgress.json', dataStringForSending);
    } catch (err) {
        console.log(err);
    }
    searchForUnprocessedTransactions(dataArray);
}

function checkCardExpiry(input) {
    if (input === '' || input === null) return 'Prettypay failed to receive processable information for card expiry date.';

    const inputArray = input.match(/\d+/g);
    const monthInput = parseInt(inputArray[0]);
    const yearInput = parseInt(inputArray[1]);

    if (monthInput < 1 || monthInput > 12 || yearInput < 0 || yearInput > 99) return 'Faulty information for card expiry date.';

    const rightNow = new Date();
    const yearNow = rightNow.getYear() - 100;
    const monthNow = rightNow.getMonth() + 1;

    const monthifiedInput = monthInput + yearInput * 12;
    const monthifiedNow = monthNow + yearNow * 12;

    if (monthifiedInput < monthifiedNow) {
        return 'Card error: The expiry date provided indicates the card has expired.';
    }
    if (monthifiedInput > monthifiedNow + 48) {
        return 'Card error: Expiry date not valid as more than four years in the future.';
    }

    return 'good';
}

function generateUUID() { // generateUUID() is copied for processing simulation purposes; this function has a Public Domain/MIT license.
    let d = new Date().getTime(); // Timestamp
    let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0; // Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        let r = Math.random() * 16; // random number between 0 and 16
        if (d > 0) { // Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else { // Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function formatNumberToString(number) {
    let numberString;
    // parseFloat(number) is because some numbers actually come into the function as strings! To check, use:
    // console.log(typeof number)
    number = parseFloat(number);
    if (!Number.isInteger(number)) {
        numberString = number.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } else {
        numberString = number.toLocaleString();
    }
    return numberString;
}

function prepareDataToReport(filename) {
    let data;
    const filePath = `./node_modules/prettypay/records/${filename}`;
    try {
        data = fs.readFileSync(filePath);
        data = parseOrCreateJSON(data, filePath);
    } catch (error) {
        data = [{ 'Note': 'There are currently no historic data available here.' }];
        try {
            fs.writeFileSync(filePath, '[]');
        } catch (err) {
            console.log(err);
        }
    }
    if (data[0] === undefined) data = [{ 'Note': 'There are currently no relevant data to report.' }];
    return data;
}

module.exports = {
    matchPreprocessingData,
    recordTransaction,
    checkCardExpiry,
    generateUUID,
    formatNumberToString,
    preprocessData,
    prepareDataToReport,
    parseOrCreateJSON
};
