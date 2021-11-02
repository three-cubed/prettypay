# Prettypay
by three-cubed<br>
<br>
Prettypay is a web development tool. It is a moderately simple simulated payment processing system used with javascript and EJS pages. Prettypay is included on an EJS page, and then Prettypay functions are used on any javascript source for the EJS page.<br>
<br>

## Set-up

First, remember that Prettypay is designed for use with EJS. The page in which you wish to use Prettypay must be an EJS page.
(This would mean the root project directory has NPM initialised and has the EJS node package installed.)<br>

In `index.js` (or whatever you have named the server), you must include the lines:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`const prettypay = require('prettypay');`<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`app.use(prettypay);`<br>

This assumes you have called your instance of express.js "app". If not, amend accordingly!<br>

On the appropriate EJS page, on which you wish to fire the payment processor, you must include:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`<%- include('`*path-to-root*`node_modules/prettypay/views/view.ejs', { root: `*path-to-root*` }) %>`<br>
Place this at the bottom of the EJS on the page.<br>

You may then use all the Prettypay functions. Prettypay functions are used in the javascript for the EJS page.<br>

NOTE: The file path must be correct and the `root` property must correctly link the page on which you are placing Prettypay to the root directory in which Prettypay has been placed. This is discussed in the section below entitled 'The File Path and Root Property'.
<br><br>

## The File Path and Root Property
When you include Prettyapy in a file, using `<%- include('`*path-to-root*`node_modules/prettypay/views/view.ejs', { root: `*path-to-root*` }) %>`:<br>
(1) The correct path to the Prettypay view is needed by the EJS file it is placed in. This is dealt with in the first argument.<br>
(2) The location of that file in the root directory dictates the paths that must be followed in order to access Prettypay's javascript and CSS. This is dealt with using the *root* property.<br>
Note that *path-to-root* will be the same in both arguments.

For example, let us imagine you wish to use Prettypay in your project, which is called `my_project_root_dir`.<br>
You decide to place Prettypay on `pay_page.ejs`.<br>

If, for example, the (simpified) structure of your project is:<br>

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

...then the path from `pay_page.ejs` to the root directory `my_project_root_dir` is `'../'`, so on `pay_page.ejs` you would use:<br>

`<%- include('../prettypay/views/view.ejs', { root: '../' }) %>`
<br><br>

## Potential set-up problems

### Potential loading order problems
As is often the case with javascript functions for frontend pages, you will need to avoid invoking Prettypay functions prior to the loading of the page, or you will get an error such as `Uncaught ReferenceError: Prettypay is not defined`. 

Such errors are unlikely in practical usage, as Prettypay would be linked to some purchase button that will not exist prior to page loading. If, however, you were initially playing with Prettypay by placing a Prettypay function straight into your javascript page, this error might occur.<br>

### Potential directory structure problems
Prettypay will assume that both `index.js` (or whatever you have named the server) and `node_modules` are immediate children of the root directory. While this directory structure is to be expected, if for some reason this is not the case, Prettypay will malfunction.<br>
<br>

## Prettypay.open( *amount* )
The amount is a number passed to Prettypay to charge. This is the basic Prettypay function, and the only one you need to make the payment processor appear and function on your page.<br>

Prettypay.open() includes various options:

To make the payment form autofill itself for speed of use:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Prettypay.open(amount, { autofill: true })`<br>
<br>
By default, the payment form requests the customer's postal address and email. If you do not wish to request this information, you can use options:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Prettypay.open(amount, { askAddress: false })`<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Prettypay.open(amount, { askEmail: false })`<br>
<br>
Prettypay uses £ by default, but accepts all currencies except €. To use a different currency instead of £ (in this example, Japanese ¥):<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Prettypay.open(amount, { currency:  '¥' })`<br>
<br>
If you wish to do so, you can, of course, use more than one option at once, for example:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Prettypay.open(amount, {`<br>
&emsp;&emsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`currency:  '¥',`<br>
&emsp;&emsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`autofill: true,`<br>
&emsp;&emsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`askAddress: false`<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`})`<br>
<br>

## Prettypay.abort( 'Optional string' )
Prettypay will automatically perform checks (see the section entitles 'Processing') and may abort the transaction. The developer may, however, add their own criteria and invoke `Prettypay.abort()` where they wish, optionally adding a message for the user explaining why the transaction has been aborted. For example:<br>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`if (amountToCharge < 5) {`<br>
&emsp;&emsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Prettypay.abort('The transaction is too small. Please purchase more.');`<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`} else {`<br>
&emsp;&emsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Prettypay.open(amountToCharge);`<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`}`<br>
<br>

## Prettypay.setSuccessFunction( *function* ) & Prettypay.setNotSuccessFunction( *function* )
These are functions performed, respectively, for successful transactions and for unsuccessful transactions that did nonetheless reach the payment form stage.

Note that both `Prettypay.setSuccessFunction()` and `Prettypay.setNotSuccessFunction()` provide data from the relevant (un)successful transaction as an argument. For example:<br>

&nbsp;&nbsp;&nbsp;&nbsp;`Prettypay.setSuccessFunction((data) => {`<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`// Do something with the data provided!`<br>
&nbsp;&nbsp;&nbsp;&nbsp;`});`<br>

Neither `Prettypay.setSuccessFunction()` nor `Prettypay.setNotSuccessFunction()` need be set. If, at a certain stage in your code, you wish to nullify the functions set previously, use a `null` argument, as shown here:<br>

&nbsp;&nbsp;&nbsp;&nbsp;`Prettypay.setSuccessFunction(null);`<br>
<br>

## Prettypay.postTransaction( *Absolute URL* )
This function will post to your router, on the route of the specified URL, on the outcome of a transaction that did reach the payment form stage. The post will occur at the successful or unsuccessful conclusion of the transaction.<br>

You may wish to pay attention to timing this to get the information you want. `Prettypay.postTransaction()` might well follow a  `Prettypay.open()` function to inform the router of the outcome of that transaction, as shown here:

&nbsp;&nbsp;&nbsp;&nbsp;`Prettypay.open(myExampleAmount);`<br>
&nbsp;&nbsp;&nbsp;&nbsp;`Prettypay.postTransaction('http://www.mywebsite.com/data');`<br>

The user then chooses how to handle this post on their routes page, for example:<br>

&nbsp;&nbsp;&nbsp;&nbsp;`router.post('/data', function(req, res) {`<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`const data = req.body.transaction;`<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`// Do something with the data provided!`<br>
&nbsp;&nbsp;&nbsp;&nbsp;`}`<br>
<br>

## Processing
Prettypay applies checks to the fictional transaction. For example:
- Prettypay checks that the transaction amount is greater than zero.
- Prettypay checks that the card expiry date is appropriate.
- Prettypay checks for anomalies indicating that the transaction data has been tampered with on the payment form.

Where a check is failed, Prettypay will automatically abort the transaction. The developer may, however, add their own criteria and invoke `Prettypay.abort()` where they wish.<br>
<br>

## Data report
To view your Pretttypay data report, detailing your recorded transactions, go to the URL:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*your_root_directory_name* + `/prettypay/report`<br>
<br>
If you wish to reinitialise the transaction data with empty records, you can delete the data within the files in `node_modules/prettypay/records` (but do not delete the files themselves!).<br>
<br>
If, for some reason, there is a JSON error in a record file's data, Prettypay will re-initialise that file, deleting all previous records.<br>
<br>

## Licence & Trademark
Prettypay is not really a registered trademark - It's for effect! Nonetheless, check `LICENCE.md` in the Prettypay directory for details of the attribution, non-commercial, no derivative licence (CC BY-NC-ND 4.0).<br>
<br>

## Versioning
Prettypay 1.0.0 was not a node package for NPM.
The transformation into such a package represents a major change.
The node package versioning on NPM therefore starts at 2.0.0.
