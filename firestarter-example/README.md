# FireStarter Example

Firestarter is a community driven crowdsourcing platform, which utilizes DaoStack for governance of the projects.
This is a striped down version of the project, which only showcases the DaoStack integration.

**Notice: the code here was not profesionally audited, please use the code with caution and don't use with real money (unless you are willing to take the assosiated risks)**

## How it works?
Firestarter users can supply funds to a project, project owner can withdraw those funds.
Users reputation is based on how much Ether they supplied for a given project.
Users vote on project proposals, if the proposal has majority vote the proposal passes and the funds for the proposal are transfered.

## How to use?

Enter the project folder from the terminal and type the following:

After downloading the project:

If you don't have truffle, install truffle version 5.0.0 with `npm install -g truffle@5.0.0`

After that run `npm install`

Run `truffle develop` which will start a truffle console, in that console you can run:

`migrate --reset` - This will compile and run the code in a built in truffle test blockchain
