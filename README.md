# Prettypay

by three-cubed

[🔗 github.com/three-cubed/prettypay](https://github.com/three-cubed/prettypay)&emsp;[🔗 npmjs.com/package/prettypay](https://www.npmjs.com/package/prettypay)

Prettypay is a moderately simple-to-use simulated payment processing system used with javascript and EJS pages. Prettypay is included on an EJS page, and then Prettypay functions are used on any javascript source for the EJS page.
<br><br>

## Table of contents
&emsp;[Set-up](#set-up)<br>&emsp;[The File Path and Root Property](#the-file-path-and-root-property)<br>
&emsp;[Potential Set-up Problems](#potential-set-up-problems)<br>
&emsp;[Prettypay.open()](#open)<br>
&emsp;[Prettypay.refuse()](#refuse)<br>
&emsp;[Prettypay.setSuccessFunction() & Prettypay.setNotSuccessFunction()](#set-function)<br>
&emsp;[Prettypay.postTransaction()](#post-transaction)<br>
&emsp;[Processing](#processing)<br>
&emsp;[Data Report](#data-report)<br>
&emsp;[Licence & Trademark](#licence)<br>
&emsp;[Versioning](#versioning)<br>
<br>

## Set-up <a name="set-up"></a>

First, remember that Prettypay is designed for use with EJS. The page in which you wish to use Prettypay must be an EJS page.
(This would mean the root project directory has NPM initialised and has the EJS node package installed.)

In `index.js` (or whatever you have named the server), you must include the lines:

    const prettypay = require('prettypay');
    app.use(prettypay);

This assumes you have called your instance of express.js "app". If not, amend accordingly!

On the appropriate EJS page, on which you wish to fire the payment processor, you must include:

    <%- include('$PATH_TO_ROOT/node_modules/prettypay/views/view.ejs', { root: '$PATH_TO_ROOT/' }) %>

Place this at the bottom of the EJS on the page.

You may then use all the Prettypay functions. Prettypay functions are used in the javascript for the EJS page.

NOTE: The file path and the `root` property must be correct. This is discussed in the section below entitled 'The File Path and Root Property'.
<br><br>

## The File Path and Root Property
When you include Prettypay in an EJS file, using the `include` function as instructed above...<br>

(1) The correct path to the Prettypay view is needed by the EJS file it is placed in. This is dealt with in the first argument.<br>
(2) The location of that file in the root directory dictates the paths that must be followed in order to access Prettypay's javascript and CSS. This is dealt with using the *root* property.<br>

Note that `$PATH_TO_ROOT/` will be the same in both arguments.

For example, let us imagine you wish to use Prettypay in your project, which is called `my_project_root_dir`.
You decide to place Prettypay on `pay_page.ejs`.

If, for example, the (simpified) structure of your project were:

&emsp;my_project_root_dir<br>
&emsp;&emsp;│<br>
&emsp;&emsp;├── javascripts<br>
&emsp;&emsp;│&emsp;&emsp;&emsp;├── scripts.js<br>
&emsp;&emsp;│<br>
&emsp;&emsp;├── node-modules<br>
&emsp;&emsp;│<br>
&emsp;&emsp;├── views<br>
&emsp;&emsp;│&emsp;&emsp;&emsp;├── pay_page.ejs<br>
&emsp;&emsp;│<br>
&emsp;&emsp;└── index.js<br>

...then the path from `pay_page.ejs` to the root directory `my_project_root_dir` would be `'../'`, so on `pay_page.ejs` you would use:<br>

    <%- include('../prettypay/views/view.ejs', { root: '../' }) %>

<br>

## Potential Set-up Problems

### Potential loading order problems
As is often the case with javascript functions for frontend pages, you will need to avoid invoking Prettypay functions prior to the loading of the page, or else you will get an error such as `Uncaught ReferenceError: Prettypay is not defined`. 

Such errors are unlikely in practical usage, as Prettypay would be linked to some purchase button that will not exist prior to page loading. If, however, you were initially playing with Prettypay by placing a Prettypay function straight into your javascript page, this error might occur.

### Potential directory structure problems
Prettypay will assume that both `index.js` (or whatever you have named the server) and `node_modules` are immediate children of the root directory. While this directory structure is to be expected, if for some reason this is not the case, Prettypay will malfunction.
<br><br>

## Prettypay.open( *amount* ) <a id='open'></a>
This is the basic Prettypay function, and the only one you need to make the payment processor appear and function on your page.
As an argument, pass a number to Prettypay to charge. 

Prettypay.open() includes various options:

To make the payment form autofill itself for speed of use:

    Prettypay.open(amount, { autofill: true })

By default, the payment form requests the customer's postal address and email. If you do not wish to request this information, you can use options:

    Prettypay.open(amount, { askAddress: false })
    Prettypay.open(amount, { askEmail: false })

Prettypay uses £ by default, but accepts all currencies except €. To use a different currency instead of £ (in this example, Japanese ¥):

    Prettypay.open(amount, { currency:  '¥' })

If you wish to do so, you can, of course, use more than one option at once, for example:

    Prettypay.open(amount, {
        currency:  '¥',
        autofill: true,
        askAddress: false
    })

<br>

## Prettypay.refuse() <a id='refuse'></a>
Prettypay will automatically perform checks (see the section entitled 'Processing') and may refuse the transaction. The developer may, however, add their own criteria and invoke `Prettypay.refuse()` where they wish, optionally adding a message for the user explaining why the transaction has been refused. For example:

    if (amountToCharge < 5) {
        Prettypay.refuse('The transaction is too small. Please purchase more.');
    } else {
        Prettypay.open(amountToCharge);
    }

NB: Using the previous name for this function, `Prettypay.abort()`, will have an identical effect.
<br><br>

## Prettypay.setSuccessFunction() & Prettypay.setNotSuccessFunction() <a id='set-function'></a>
*Warning: Versions prior to 2.0.3 are deprecated specifically due to a bug with these functions. If you have an earlier version, please update.*

These function are performed, respectively, for successful transactions and for unsuccessful transactions that did nonetheless reach the payment form stage.

Note that both `Prettypay.setSuccessFunction()` and `Prettypay.setNotSuccessFunction()` provide data from the relevant (un)successful transaction as an argument. For example:

    Prettypay.setSuccessFunction((data) => {
        // Do something with the data provided!
    });

Neither `Prettypay.setSuccessFunction()` nor `Prettypay.setNotSuccessFunction()` need be set. If, at a certain stage in your code, you wish to nullify the functions set previously, use a `null` argument, as shown here:

    Prettypay.setSuccessFunction(null);

<br>

## Prettypay.postTransaction( *Absolute URL* ) <a id='post-transaction'></a>
This function will post to your router, on the route of the specified URL, on the outcome of a transaction that did reach the payment form stage. The post will occur at the successful or unsuccessful conclusion of the transaction.

You may wish to pay attention to timing this to get the information you want. `Prettypay.postTransaction()` might well follow a  `Prettypay.open()` function to inform the router of the outcome of that transaction, as shown here:

    Prettypay.open(myExampleAmount);
    Prettypay.postTransaction('http://www.mywebsite.com/data');

The user then chooses how to handle this post on their routes page, for example:

    router.post('/data', function(req, res) {
        const data = req.body.transaction;
        // Do something with the data provided!
    }
<br>

## Processing
Prettypay applies checks to the fictional transaction. For example:
- Prettypay checks that the transaction amount is greater than zero.
- Prettypay checks that the card expiry date is appropriate.
- Prettypay checks for anomalies indicating that the transaction data has been tampered with on the Prettypay payment form.

Where a check is failed, Prettypay will automatically refuse the transaction. The developer may, however, add their own criteria and invoke `Prettypay.refuse()` where they wish.
<br><br>

## Data Report
To view your Pretttypay data report, detailing your recorded transactions, go to the URL:

    $ROOT_DIRECTORY_URL/prettypay/report

The page will display the relevant data.

If you wish to re-initialise the transaction data with empty records, you can delete the data within the files in `node_modules/prettypay/records` (but do not delete the files themselves!).

If, for some reason, there is a JSON error in a record file's data, Prettypay will itself re-initialise it, deleting all previous records in that file.
<br><br>

## Licence & Trademark <a id='licence'></a>
Prettypay is not really a registered trademark - The &trade; trademark sign is for effect! Nonetheless, check `LICENCE.md` in the Prettypay directory for details of the attribution, non-commercial, no derivative licence (CC BY-NC-ND 4.0).
<br><br>

## Versioning
Prettypay 1.0.0 was not a node package for NPM.
The transformation into such a package represents a major change.
The node package versioning on NPM therefore starts at 2.0.0.
<br><br>
