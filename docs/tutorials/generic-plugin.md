# Registering a generic plugin

If you have a contract that is already deployed and would like it to interact with your DAO, creating a Generic Plugin is your solution!

You just need to add your plugin via the Plugin Manager, this will create a new proposal and once it passes, it will allow you to interact with the contract through alchemy dApp:

<p float="center">
  <img src="../../assets/examples/create-generic-plugin.gif"/>
</p>
 
 If the `contract to call` has not been added yet into alchemy (which means you selected custom and added an address), you will need to fork the [repository](https://github.com/daostack/alchemy) in order to interact with your new plugin in a user friendly way!

 The steps are the following:

1.- __Add an interface of your contract to alchemy__:

You will need to create a `YOUR_CONTRACT_NAME.json` file in `/src/genericPluginRegistry/plugins/`. This file will contain three main fields:

  - **name**: The name of your contract
  - **addresses**: This will be an object in which you will add the address of the target contract (or the address you want your DAO to interact with!). Please check the example linked below to get a reference on how it should be.
  - **actions**: This is the way you customize your proposal form. Here, you add an array of the actions (functions) you want your DAO to be able to execute on the contract to call, it needs to have the following keys:
      - _id_: The ID of the action in the dApp (Should be the name of the method in the contract)
      - _label_: The name of action that will appear in the dApp
      - _description_: Will tell your users what to expect from this action
      - _notes_: Url of the contract's code
      - _fields_: These are the arguments of the method the user will interact with when they create a proposal, it's an array, since you can add as many inputs as you desire. The fields will have three keys, which are:
          - _label_: Description of the argument in the UI
          - _name_: Name of the argument in the contract
          - _placeholder_: A placeholder for the input, can be an example of what the user should enter
      - _abi_: The ABI of the method of the contract

Check [this example](https://github.com/daostack/alchemy/src/genericPluginRegistry/plugins/CO2ken.json) for more information!

The last to do on this step is going to `/src/genericPluginRegistry/index.ts`, import your JSON and add it into the array of `KNOWNPLUGINS`

So far, you have created a good interface to allow your users to create new proposals in your generic scheme, now let's show this proposals in a good looking way

2.- __Create the view of proposal summary for your Generic plugin__:

