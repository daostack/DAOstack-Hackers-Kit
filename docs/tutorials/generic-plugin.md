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

Each plugin should have its `ProposalSummary` page along with its `CreateProposal` form. This summary will contain the relevant proposal information that will be shown after the proposal has been created.

It follows a simple class based Component pattern. For example, `NFTManager`'s proposal summary looks like this:

```tsx
export default class ProposalSummaryNFTManager extends React.Component<IProps, null> {

  public render(): RenderOutput {

    const { proposalState, detailView, genericPluginInfo, transactionModal } = this.props;
    let decodedCallData: any;
    let decodedParams: any;

    try {
      decodedCallData = genericPluginInfo.decodeCallData(proposalState.callData);
      // Fix for previous functions' failure to decode parameters
      const web3 = new Web3();
      decodedParams = web3.eth.abi.decodeParameters([...decodedCallData.action.abi.inputs.map((input: { type: any }) => input.type)], "0x" + proposalState.callData.slice(2 + 8));
      decodedCallData.values = decodedParams;
    } catch (err) {
      if (err.message.match(/no action matching/gi)) {
        return <div>Error: {err.message} </div>;
      } else {
        throw err;
      }
    }

    const action = decodedCallData.action;
    const proposalSummaryClass = classNames({
      [css.detailView]: detailView,
      [css.transactionModal]: transactionModal,
      [css.proposalSummary]: true,
      [css.withDetails]: true,
    });

    switch (action.id) {
      case "sendNFT":
        return (
          <div className={proposalSummaryClass}>
            {!detailView &&
              <span className={css.summaryTitle}>
                <strong>Send NFT </strong>
                <img className={css.iconPadding} src="/assets/images/Icon/Transfer.svg" />
                {decodedCallData.values[0]}
              </span>
            }
            {detailView &&
              <div className={css.summaryDetails}>
                <div>
                  <strong>Send NFT </strong>
                  <img className={css.iconPadding} src="/assets/images/Icon/Transfer.svg" />
                  <a href={linkToEtherScan(decodedCallData.values[0])} target="_blank" rel="noopener noreferrer">{decodedCallData.values[0]}</a>
                </div>
                <br />
                <div>
                  <strong>NFT Contract:</strong> <a href={linkToEtherScan(decodedCallData.values[1])} target="_blank" rel="noopener noreferrer">{decodedCallData.values[1]}</a>
                </div>
                <div>
                  <strong>TokenID:</strong> {decodedCallData.values[2]}
                </div>
                <div>
                  <strong>{i18next.t("Raw call data")}:</strong>
                  {truncateWithEllipses(proposalState.callData, 66)}<CopyToClipboard value={proposalState.callData} />
                </div>
              </div>
            }
          </div>
        );
      default:
        return "";
    }
  }
}
```

Note that in the render there's a switch with the actions ids, this is the way to implement the views per action, also it is worth noting:

* All labels and messages use `i18next`
* Css is declared separately
* There are already handy components like `AccountPopup` and `AccountProfileName` to display Account information consistently.

## Registering the Proposal Summary Page

In the `ProposalSummaryKnownGenericPlugin.tsx` file, typically under `src/components/Proposal/ProposalSummary`:

```tsx
export default class ProposalSummary extends React.Component<IProps, IState> {

  ...

  public render(): RenderOutput {

    ...

    const { proposalState, detailView, transactionModal, genericPluginInfo } = this.props;
    if (genericPluginInfo.specs.name === "DutchX") {
      return <ProposalSummaryDutchX {...this.props} />;
    } else if (genericPluginInfo.specs.name === "Standard Bounties") {
      return <ProposalSummaryStandardBounties {...this.props} />;
    } else if (genericPluginInfo.specs.name === "CO2ken") {
      return <ProposalSummaryCO2ken {...this.props} />;
    } else if (genericPluginInfo.specs.name === "NFTManager") {
      return <ProposalSummaryNFTManager {...this.props} />;
    }

    ...
  }
```

Add a condition that will handle the case where the proposal's state name matches the new plugin's name. Inside this condition cast the `genericPluginInfo.spec.name` to the name you gave to your Plugin in the JSON created in the first step. Then return the `ProposalSummary` component created on the previous section, and pass as props `{...this.props}` which will be the accessed in your new Proposal Summary component.
