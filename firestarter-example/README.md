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

```
npm install
truffle build
truffle migrate
```