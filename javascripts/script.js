// Note that many variables use the suffix PP to minimise likelihood of a clash with the variables of the parent directory's javascript.

const closeModalButtonsPP = document.querySelectorAll('[data-close-button]'); // Square brackets seem to be necessary for query selection of data.
const overlayPP = document.getElementById('overlay-pp');
const paymentModalPP = document.getElementById('payment-modal');
const paymentFormPP = document.getElementById('payment-form');
const paymentCardExpiryPP = document.getElementById('payment-card-expiry');
const currencyOnModalPP = document.getElementById('currencyOnModal');
const totalOnModalPP = document.getElementById('totalOnModal');
const abortTransactiOnModalPP = document.getElementById('transaction-aborted-modal');
const abortTransactionOptionalMessageSpanPP = document.getElementById('transaction-aborted-optional-message-span');
const successfulTransactionModalPP = document.getElementById('transaction-successful-modal');
const successfulTransactionOptionalMessageSpanPP = document.getElementById('transaction-successful-optional-message-span');

const contactPostalAddressPP = document.getElementById('payment-contact-postal-address');
const contactEmailPP = document.getElementById('payment-contact-email');
let askAddressPP = true;
let askEmailPP = true;

let uniqueTransactionReferencePP;

if (document.readyState == 'loading') {
	document.addEventListener('DOMContentLoaded', addEventListenersAndResetForm)
} else {
	addEventListenersAndResetForm();
}

let prettypayPostPath = null;
let doIfSuccessfulPP = null;
let doIfNotSuccessfulPP = null;
let dataForFollowupFunctionPP;

// Prettypay.returnTransaction is untested.

const Prettypay = {
    open: function(amount, { autofill = false, currency = '£', askAddress = true, askEmail = true } = {}) {
        closeAnyModals();
        paymentFormPP.reset();
        if (amount <= 0) {
            Prettypay.abort('Error: The total charged is zero or less.');
        } else {
            if (askAddress === true) {
                contactPostalAddressPP.parentElement.classList.remove('invisiblePP');
                askAddressPP = true;
            } else {
                contactPostalAddressPP.parentElement.classList.add('invisiblePP');
                askAddressPP = false;
                document.getElementById('payment-contact-postal-address').value= 'not requested';
            }
            if (askEmail === true) {
                contactEmailPP.parentElement.classList.remove('invisiblePP');
                askEmailPP = true;
            } else {
                contactEmailPP.parentElement.classList.add('invisiblePP');
                askEmailPP = false;
                document.getElementById('payment-contact-email').value = 'not requested';
            }

            openpaymentFormPP(amount, currency);
            if (autofill === true) autofillpaymentFormPP();
            preprocessPayment(amount, currency);
        }
    },
    abort: function(message = '') {
        closeAnyModals();
        // console.log(`abort: message: ${message}`);
        if (message !== '') {
            abortTransactionOptionalMessageSpanPP.innerHTML = `<span id='transaction-aborted-optional-message-span'><br>${message}<br></span>`
        } else {
            abortTransactionOptionalMessageSpanPP.innerHTML = "<span id='transaction-aborted-optional-message-span'></span>"
        }
        abortTransactiOnModalPP.classList.add('active');
        overlayPP.classList.add('active');
    },
    approved: function(message = '') {
        closeAnyModals();
        if (message !== '') {
            successfulTransactionOptionalMessageSpanPP.innerHTML = `<span id='transaction-successful-optional-message-span'><br>${message}<br></span>`
        } else {
            successfulTransactionOptionalMessageSpanPP.innerHTML = "<span id='transaction-successful-optional-message-span'></span>"
        }
        successfulTransactionModalPP.classList.add('active');
        overlayPP.classList.add('active');
    },
    postTransaction: function(path) {
        prettypayPostPath = path;
    },
    setSuccessFunction: function(functionSet) {
        doIfSuccessfulPP = functionSet;
    },
    setNotSuccessFunction: function(functionSet) {
        doIfSuccessfulPP = functionSet;
    },
    returnTransaction: async function(reference) {
        let data = await fetch(`/prettypay/returnTransaction/${reference}`)
        let JSON = await data.json();
        return JSON;
    }
}

function autofillpaymentFormPP() {
    document.getElementsByClassName('text-in-modal')[0].innerHTML = 'This is the autofilled version, for your convenience.<br>Just click the button!';
    document.getElementById('payment-contact-name').value = 'Adam Smith';
    if (askAddressPP) document.getElementById('payment-contact-postal-address').value= '10 High Road, Brighton, BN1, 1AA';
    if (askEmailPP) document.getElementById('payment-contact-email').value = 'asmith@email.com';
    document.getElementById('payment-card-name').value = 'Mr A Smith';
    document.getElementById('payment-card-number').value = '4242 4242 4242 4242';
    document.getElementById('payment-card-expiry').value = '10/25';
    document.getElementById('payment-card-sec-code').value = '321';
}

function openpaymentFormPP(amount, currency) {
    currency = currency.trim();
    currencyOnModalPP.innerText = currency;
    totalOnModalPP.innerText = formatNumberToString(amount);
    paymentModalPP.classList.add('active');
    overlayPP.classList.add('active');
}

function preprocessPayment(amount, currency) {
    fetch('/prettypay/preprocess', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            amount: amount,
            currency: currency,
        })
    }).then(function(res) {
        return res.json();
    }).then(function(resJSON) {
        uniqueTransactionReferencePP = resJSON.uniqueTransactionReference;
    }).catch(function(error) {
        console.error(error);
    })
}

function addEventListenersAndResetForm() {

    paymentFormPP.reset();

    // If you choose to allow the overlay to be clicked to close the modals,
    // ensure you add code to fire the doIfSuccessfulPP() and doIfNotSuccessfulPP() functions as appropriate.

    // overlayPP.addEventListener('click', () => {
    //     closeAnyModals();
    // })

    closeModalButtonsPP.forEach(button => {
        const newId = `${button.parentElement.parentElement.id}-close-button`
        button.setAttribute('id', newId)
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        })
    })

    document.getElementById('transaction-successful-modal-close-button').addEventListener('click', () => {
        if (doIfSuccessfulPP !== null) {
            doIfSuccessfulPP(dataForFollowupFunctionPP);
        } else {
            return;
        }
    })

    document.getElementById('transaction-successful-modal-close-button').addEventListener('click', () => {
        if (doIfNotSuccessfulPP !== null) {
            doIfNotSuccessfulPP(dataForFollowupFunctionPP);
        } else {
            return;
        }
    })

}

function closeAnyModals() {
    const modals = document.querySelectorAll('.modal.active')
    modals.forEach(modal => {
        closeModal(modal);
    })
}

function closeModal(modal) {
    modal.classList.remove('active');
    if (modal === paymentModalPP) paymentFormPP.reset();
    overlayPP.classList.remove('active');
}

function processPayment() { // This is the function which works on submission of the form.
    const amountToProcessPP = parseFloat(totalOnModal.innerText.replace(/,/g, ''));
    const expiryStringPP = paymentCardExpiryPP.value;
    const currencyPP = currencyOnModalPP.innerText;
    const contactNamePP = document.getElementById('payment-contact-name').value;
    const contactPostalAddressPP = document.getElementById('payment-contact-postal-address').value;
    const contactEmailPP = document.getElementById('payment-contact-email').value;
    const cardNamePP = document.getElementById('payment-card-name').value;
    const cardNumPP = document.getElementById('payment-card-number').value;
    const cardExpiryPP = document.getElementById('payment-card-expiry').value;
    const cardSecCodePP = document.getElementById('payment-card-sec-code').value;
    fetch('/prettypay/process', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            expiryString: expiryStringPP,
            amountToProcess: amountToProcessPP,
            currency: currencyPP,
            uniqueTransactionReference: uniqueTransactionReferencePP,
            contactName: contactNamePP,
            contactPostalAddress: contactPostalAddressPP,
            contactEmail: contactEmailPP,
            cardName: cardNamePP,
            cardNum: cardNumPP,
            cardExpiry: cardExpiryPP,
            cardSecCode: cardSecCodePP,
            prettypayPostPath: prettypayPostPath
        })
    }).then(function(res) {
        return res.json();
    }).then(function(resJSON) {
        console.log(resJSON.devMessage); // ...this being the purpose of the devMessage.
        dataForFollowupFunctionPP = resJSON;
        if (resJSON.successful !== true) {
            Prettypay.abort(resJSON.customerMessage);
        } else {
            Prettypay.approved(resJSON.customerMessage);
        }
    }).catch(function(error) {
        console.error(error);
    })
}

function formatNumberToString(number) {
    // parseFloat(number) is because some numbers actually come into the function as strings! To check, use:
    // console.log(typeof number)
    number = parseFloat(number);
    if (!Number.isInteger(number)) {
        numberString = number.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
     } else {
        numberString = number.toLocaleString();
     }
     return numberString;
}
