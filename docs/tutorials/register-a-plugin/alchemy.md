## Registering the plugin's name

In the `pluginUtils.ts` file, typically under `src/lib`, there's a `PLUGIN_NAMES` object: 

```ts
export const PLUGIN_NAMES = {
  ContributionReward: "Funding and Voting Power",
  GenericScheme: "Generic Plugin",
  ReputationFromToken: "Reputation from Token",
  SchemeRegistrar: "Plugin Registrar",
  SchemeFactory: "Plugin Manager",
  Competition: "Competition",
  TokenTrade: "Token Trade",
  ContributionRewardExt: "Contribution Reward Ext",
  Join: "Join",
  FundingRequest: "Funding Request",
};
```

Add the new plugin to that object.

## Creating the `CreateProposal` form component

Alchemy typically uses class based `React` components. And the naming convention is usually: 

Create + `Plugin Name` + Proposal. Example: `CreateContributionRewardProposal`.

### 1. Declaring Form Values

The first step is to declare an `IFormValues` interface that **describes all of the Create Proposal form fields**. This interface should always contain at least the following properties: 

```ts
interface IFormValues {
  description: string;
  title: string;
  url: string;
  tags: Array<string>
}
```

A full example of this interface can be found in the `CreateTokenTradeProposal` component:

```ts
interface IFormValues {
  description: string;
  title: string;
  url: string;
  tags: Array<string>;
  sendTokenAddress: string,
  sendTokenAmount: number,
  receiveTokenAddress: string,
  receiveTokenAmount: number,
}
```

The next step is to create a function that returns an `IFormValues` object with the proper initial values of each field. Following the `CreateTokenTradeProposal`'s `IFormValues` example, its initializing function would be:

```ts
const setInitialFormValues = (): IFormValues => {
  return Object.freeze({
    description: "",
    title: "",
    url: "",
    tags: [],
    sendTokenAddress: "",
    sendTokenAmount: 0,
    receiveTokenAddress: "",
    receiveTokenAmount: 0,
  });
};
```

Lastly, declare a `currentFormValues` class property of type `IFormValues` in the `CreateProposal` component:

```ts
class CreateExamplePluginProposal extends React.Component<IProps, IState> {

  currentFormValues: IFormValues;

  constructor(props: IProps) {
    super(props);

    ...
  }

  ...
}
```

### 2. Creating a `FormModalService` instance

Alchemy's `CreateProposal` form components make use of the `FormModalService`, which handles form state changes and notifications.

To use it, an instance of it is typically declared as a class property and created in the constructor:

```ts
class CreateExamplePluginProposal extends React.Component<IProps, IState> {

  formModalService: IFormModalService<IFormValues>;
  currentFormValues: IFormValues;

  constructor(props: IProps) {
    super(props);

    this.formModalService = CreateFormModalService(
      "CreateExamplePluginProposal",
      setInitialFormValues(),
      () => Object.assign(this.currentFormValues, this.state),
      (formValues: IFormValues, firstTime: boolean) => {
        this.currentFormValues = formValues;
        if (firstTime) { this.state = { tags: formValues.tags }; }
        else { this.setState({ tags: formValues.tags }); }
      },
      this.props.showNotification);
  }
```

From the example above, you will notice the `CreateFormModalService` function takes 5 arguments:

* **formName**
* **defaultValues**
* **valuesToPersist**
* **updateCurrentValues**
* **showNotification**

### 3. Initializing the state object

Sometimes it is necessary to persist form-relevant values across re-renders, that are not directly form values. Like an array with all possible dropdown options. This is always the case with proposal tags. Therefore, they should always be initialized in the constructor like this:

```ts

class CreateTokenTradeProposal extends React.Component<IProps, IState> {

  formModalService: IFormModalService<IFormValues>;
  currentFormValues: IFormValues;

  constructor(props: IProps) {
    super(props);

    this.state = { tags: [] };

    this.formModalService = CreateFormModalService(
      "CreateExamplePluginProposal",
      setInitialFormValues(),
      () => Object.assign(this.currentFormValues, this.state),
      (formValues: IFormValues, firstTime: boolean) => {
        this.currentFormValues = formValues;
        if (firstTime) { this.state = { tags: formValues.tags }; }
        else { this.setState({ tags: formValues.tags }); }
      },
      this.props.showNotification);
  }

```

### 4. Creating the form's markup

Inside the class Component's `render` function a `Formik` component should be declared. This component takes 4 arguments:

* **initialValues**: we will pass `this.currentFormValues` here.

* **validate**: we will pass a `Formik` validation function here, like this one:

```ts
(values: IFormValues) => {

  this.currentFormValues = values;

  const errors: any = {};

  const require = (name: string) => {
    if (!(values as any)[name]) {
      errors[name] = "Required";
    }
  };

  require("description");
  require("title");

  if (values.title.length > 120) {
    errors.title = "Title is too long (max 120 characters)";
  }

  if (!isValidUrl(values.url)) {
    errors.url = "Invalid URL";
  }

  return errors;
}
```

* **onSubmit**: we will pass the class's handleSubmit method (explained in detail in the following sections).

* **render**: here is where the actual `CreateProposal` form's markup will live. Here we pass a functional component that has all form relevant props injected by `Formik` and will return the form's markup:

```tsx
({
  errors,
  touched,
  isSubmitting,
  setFieldValue,
  values,
}: FormikProps<IFormValues>) => {
  return (
    <Form noValidate>
      <label className={css.description}>What to Expect</label>
      <div className={css.description}>Propose to trade tokens with the DAO.</div>
      <TrainingTooltip overlay={i18next.t("Title Tooltip")} placement="right">
        <label htmlFor="titleInput">
          <div className={css.requiredMarker}>*</div>
          Title
          <ErrorMessage name="title">{(msg) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
        </label>
      </TrainingTooltip>
      <Field
        autoFocus
        id="titleInput"
        maxLength={120}
        placeholder={i18next.t("Title Placeholder")}
        name="title"
        type="text"
        className={touched.title && errors.title ? css.error : null}
      />
    
    ...
    </Form>
  )}
}

```

It is worth noting the following conventions to write the form's markup:

* `i18next` should be used for all form labels, notifications and messages.
* There should be a `TrainingTooltip` component above each `Field` with a description relevant to said field.
* Styling is declared in a separate `Sass` file.

### 5. Creating the `handleSubmit` method

This method should be private and asynchronous. It, mainly, checks if the Wallet Provider is enabled, maps form values to an `Arc.js` proposalOptions object, awaits proposal creation through an `Arc.js` `createProposal` call, and tracks analytics on proposal submission.

A full example of this is the `TokenTrade`'s `handleSubmit` method:

```ts

private handleSubmit = async (values: IFormValues, { setSubmitting }: any ): Promise<void> => {
  if (!await enableWalletProvider({ showNotification: this.props.showNotification })) { return; }

  const proposalOptions = {
    dao: this.props.daoAvatarAddress,
    description: values.description,
    title: values.title,
    tags: this.state.tags,
    plugin: this.props.pluginState.address,
    url: values.url,
    sendTokenAddress: values.sendTokenAddress,
    sendTokenAmount: values.sendTokenAmount,
    receiveTokenAddress: values.receiveTokenAddress,
    receiveTokenAmount: values.receiveTokenAmount,
  };

  setSubmitting(false);

  await this.props.createProposal(proposalOptions);

  Analytics.track("Submit Proposal", {
    "DAO Address": this.props.daoAvatarAddress,
    "Proposal Title": values.title,
    "Plugin Address": this.props.pluginState.address,
    "Plugin Name": this.props.pluginState.name,
  });

  this.props.handleClose();
}

```

It is worth mentioning that `dao` address and `plugin` address options are taken from the component's props. More on this in the following sections.

## Registering the Form

For this component to be used it needs to be added to the `CreateProposalPage.tsx` file.

Go to this file, typically under `src/components/Proposal/Create`. You will notice the `CreateProposalPage` component:

```tsx
class CreateProposalPage extends React.Component<IProps, IStateProps> {

  constructor(props: IProps) {
    super(props);
    this.state = {
      createCrxProposalComponent: null,
    };
  }

  ...

  public render(): RenderOutput {
    const { daoAvatarAddress, currentAccountAddress } = this.props;
    const plugin = this.props.data;
    const pluginState = plugin.coreState;

    let createPluginComponent = <div />;
    const props = {
      currentAccountAddress,
      daoAvatarAddress,
      handleClose: this.doClose,
      plugin,
    };
    const pluginTitle = this.state.createCrxProposalComponent ? rewarderContractName(pluginState as IContributionRewardExtState) : pluginName(pluginState);

    if (this.state.createCrxProposalComponent) {
      createPluginComponent = <this.state.createCrxProposalComponent {...props} />;
    } else if (pluginState.name === "ContributionReward") {
      createPluginComponent = <CreateContributionRewardProposal {...props} pluginState={pluginState as IContributionRewardState} />;
    } else if (pluginState.name === "SchemeRegistrar") {
      createPluginComponent = <CreatePluginRegistrarProposal {...props} pluginState={pluginState as IPluginRegistrarState} />;
    } else if (pluginState.name === "SchemeFactory") {
      createPluginComponent = <CreatePluginManagerProposal {...props} pluginState={pluginState as IPluginManagerState} />;
    } else if (pluginState.name === "TokenTrade") {
      createPluginComponent = <CreateTokenTradeProposal {...props} pluginState={pluginState as ITokenTradeState} />;
    } else if (pluginState.name === "GenericScheme") {
      const contractToCall = (pluginState as IGenericPluginState).pluginParams.contractToCall;
      if (!contractToCall) {
        throw Error("No contractToCall for this genericPlugin was found!");
      }
      const genericPluginRegistry = new GenericPluginRegistry();
      const genericPluginInfo = genericPluginRegistry.getPluginInfo(contractToCall);
      if (genericPluginInfo) {
        createPluginComponent = <CreateKnownGenericPluginProposal {...props} genericPluginInfo={genericPluginInfo} pluginState={pluginState as IGenericPluginState} />;
      } else {
        createPluginComponent = <CreateUnknownGenericPluginProposal {...props} pluginState={pluginState as IGenericPluginState} />;
      }
    }

    ...
  }
}
```

Then on the `render` method of the `CreateProposalPage` declared there, add a condition to make the `createPluginComponent` variable be the `CreateProposalForm` you created in the previous section, if the pluginState's name matches the proposal's plugin. Your `CreateProposalForm` component in this method will take the `CreateProposalPage`'s deconstructed props: `{...props}` and a pluginState object which must be casted to an `Arc.js` Plugin State interface.

## Make created proposal redeemable

In order to make a proposal created through your `CreateProposalForm` redeemable, you must register it in the `arcActions` file. Typically under: `src/actions`, the file will contain a `tryRedeemProposal` function:

```ts
async function tryRedeemProposal(proposalId: string, accountAddress: string, observer: any) {
  const arc = getArc();
  const proposal = await Proposal.create(arc, proposalId);

  switch (proposal.coreState.name) {
    case "GenericScheme":
    case "ContributionReward":
    case "Competition":
    case "ContributionRewardExt":
    case "SchemeRegistrarRemove":
    case "SchemeRegistrarAdd":
    case "SchemeRegistrar":
    case "SchemeFactory":
      await (proposal as Proposal<IProposalState>).redeemRewards(
        accountAddress
      ).subscribe(...observer);
      break;
    case "FundingRequest":
      await (proposal as FundingRequestProposal).redeem().subscribe(...observer);
      break;
    case "Join":
      await (proposal as JoinProposal).redeem().subscribe(...observer);
      break;
    case "TokenTrade":
      await (proposal as TokenTradeProposal).redeem().subscribe(...observer);
      break;
    default:
      break;
  }

  return Promise.resolve();
}
```

There, add a case to the already existing `switch`, with the proposal's plugin name. Inside, cast the proposal object to the corresponding `Arc.js` Proposal Class, call redeem and subscribe on it and await it, just like in the example above.


## Registering the plugin in the Plugin Manager

In the `PluginManager`'s `CreateProposal` form, the following additions are needed so that the new plugin can be created from a plugin manager proposal:

* In the plugin manager's `IFormValues` interface: 

```ts
export interface IFormValues {
  description: string;

  currentTab: ITab;
  tags: Array<string>;
  title: string;
  url: string;
  pluginToRemove: string;
  pluginToAdd: PluginNames | "";
  GenericScheme: {
    permissions: IPermissions;
    votingParams: IGenesisProtocolFormValues;
    contractToCall: string;
  };
  ContributionReward: {
    permissions: IPermissions;
    votingParams: IGenesisProtocolFormValues;
  };
  Competition: {
    permissions: IPermissions;
    votingParams: IGenesisProtocolFormValues;
  };

  ...
}
```

add the new plugin's initialize parameters.

* In the plugin manager's `defaultValues` object, declare the initial default values for the initialize parameters declared in the previous step:

```ts
const defaultValues: IFormValues = {
  description: "",
  pluginToAdd: "",
  pluginToRemove: "",
  title: "",
  url: "",
  currentTab: "addPlugin",
  tags: [],
  GenericScheme: {
    votingParams: { ...votingParams },
    permissions: {
      registerPlugins: false,
      changeConstraints: false,
      upgradeController: false,
      genericCall: true,
    },
    contractToCall: "",
  },
  ContributionReward: {
    votingParams: { ...votingParams },
    permissions: {
      registerPlugins: false,
      changeConstraints: false,
      upgradeController: false,
      genericCall: false,
    },
  },

  ...
}
```

* In the plugin manager's `handleSubmit` method, add a case to the already existing switch for creation and replacement proposals. The case added must populate the plugin's initialize parameters:

```ts
if (currentTab === "addPlugin" || currentTab === "replacePlugin") {
      (proposalOptions.add as any) = {
        pluginName: values.pluginToAdd,
      };

      switch (proposalOptions.add.pluginName) {
        case "Competition":
          proposalOptions.add.pluginInitParams = {
            daoId: daoId,
            votingMachine: votingMachine,
            votingParams: gpFormValuesToVotingParams(values.Competition.votingParams),
            voteOnBehalf: values.Competition.votingParams.voteOnBehalf,
            voteParamsHash: values.Competition.votingParams.voteParamsHash,
            daoFactory: arc.getContractInfoByName("DAOFactoryInstance", LATEST_ARC_VERSION).address,
            packageVersion: packageVersion,
            rewarderName: "Competition",
          };
          break;
        case "ContributionReward":
          proposalOptions.add.pluginInitParams = {
            daoId: daoId,
            votingMachine: votingMachine,
            votingParams: gpFormValuesToVotingParams(values.ContributionReward.votingParams),
            voteOnBehalf: values.ContributionReward.votingParams.voteOnBehalf,
            voteParamsHash: values.ContributionReward.votingParams.voteParamsHash,
          };
          break;

          ...
      }

    ...
}
```

Additionally, so that the plugin manager's form can properly render the initialize parameters fields for the new plugin, go to the `PluginInitializeFields.ts` file, typically under `src/components/Proposal/Create`:

```tsx

...

const TokenTrade = () => (
  <div>
    {GenesisProtocolFields("TokenTrade.votingParams")}
  </div>
);

const ReputationFromTokenFields = () => (
  <div>
    {fieldView("ReputationFromToken", "Token Contract", "tokenContract")}
    {fieldView("ReputationFromToken", "Curve Interface", "curveInterface")}
  </div>
);

const fieldsMap = {
  GenericScheme: GenericSchemeFields,
  ContributionReward: ContributionRewardFields,
  Competition: CompetitionFields,
  ContributionRewardExt: ContributionRewardExtFields,
  FundingRequest: FundingRequest,
  Join: Join,
  TokenTrade: TokenTrade,
  SchemeRegistrar: SchemeRegistrarFields,
  SchemeFactory: PluginManagerFields,
  ReputationFromToken: ReputationFromTokenFields,
};

...

```

There, 2 additions are necessary:

* Create a function that returns each initialize parameter field for the new plugin. This is done, using the `fieldView` function that takes 3 arguments: pluginName, initializeParameterName, fieldName. See the code snippet above.

* Add the created funcion to the `fieldsMap` object.

## Create the Proposal Summary page

Each plugin should have its `ProposalSummary` page along with its `CreateProposal` form. This summary will contain the relevant proposal information that will be shown after the proposal has been created.

It follows a simple class based Component pattern. For example, `TokenTrade`'s proposal summary looks like this:

```tsx
export default class ProposalSummaryTokenTrade extends React.Component<IProps> {

  constructor(props: IProps) {
    super(props);
  }

  public render(): RenderOutput {

    const { beneficiaryProfile, proposalState, daoState, detailView, transactionModal } = this.props;

    let receiveToken;
    let sendToken;

    if (proposalState.sendTokenAddress && proposalState.sendTokenAmount) {
      const tokenData = tokenDetails(proposalState.sendTokenAddress);
      sendToken = formatTokens(toWei(Number(proposalState.sendTokenAmount)), tokenData ? tokenData["symbol"] : "?", tokenData ? tokenData["decimals"] : 18);
    }

    if (proposalState.receiveTokenAddress && proposalState.receiveTokenAmount) {
      const tokenData = tokenDetails(proposalState.receiveTokenAddress);
      receiveToken = formatTokens(toWei(Number(proposalState.receiveTokenAmount)), tokenData ? tokenData["symbol"] : "?", tokenData ? tokenData["decimals"] : 18);
    }

    const proposalSummaryClass = classNames({
      [css.detailView]: detailView,
      [css.transactionModal]: transactionModal,
      [css.proposalSummary]: true,
    });
    return (
      <div className={proposalSummaryClass}>
        <span className={css.transferType}>
          { sendToken &&
          <div>
            <div>
              <span className={css.bold}>{i18next.t("Send to DAO")}:</span>
            </div>
            <AccountPopup accountAddress={proposalState.beneficiary} daoState={daoState} width={12} />
            <span>
              <AccountProfileName accountAddress={proposalState.beneficiary} accountProfile={beneficiaryProfile} daoAvatarAddress={daoState.address}/>
            </span>
            <span className={css.transferAmount}></span>
            <img className={css.transferIcon} src="/assets/images/Icon/Transfer.svg" />
            {receiveToken}
          </div>
          }
          { receiveToken &&
          <div>
            <div>
              <span className={css.bold}>{i18next.t("Receive from DAO")}:</span>
            </div>
            {receiveToken}
            <span className={css.transferAmount}></span>
            <img className={css.transferIcon} src="/assets/images/Icon/Transfer.svg" />
            <AccountPopup accountAddress={proposalState.beneficiary} daoState={daoState} width={12} />
            <span>
              <AccountProfileName accountAddress={proposalState.beneficiary} accountProfile={beneficiaryProfile} daoAvatarAddress={daoState.address}/>
            </span>
          </div>
          }
        </span>
      </div>
    );

  }
}
```

It is worth noting:

* All labels and messages use `i18next`
* Css is declared separately
* There are already handy components like `AccountPopup` and `AccountProfileName` to display Account information consistently.

## Registering the Proposal Summary Page

In the `ProposalSummary.tsx` file, typically under `src/components/Proposal/ProposalSummary`:

```tsx
export default class ProposalSummary extends React.Component<IProps, IState> {

  ...

  public render(): RenderOutput {

    if (!this.state) {
      return null;
    }

    const { detailView, transactionModal } = this.props;
    const { proposal } = this.state;

    const proposalSummaryClass = classNames({
      [css.detailView]: detailView,
      [css.transactionModal]: transactionModal,
      [css.proposalSummary]: true,
    });

    if (proposal.coreState.name === "ContributionReward") {
      const state = proposal.coreState as IContributionRewardProposalState;
      return <ProposalSummaryContributionReward {...this.props} proposalState={state} />;
    } else if (proposal.coreState.name.includes("SchemeRegistrar")) {
      const state = proposal.coreState as IPluginRegistrarProposalState;
      return <ProposalSummaryPluginRegistrar {...this.props} proposalState={state} />;
    } else if (proposal.coreState.name.includes("TokenTrade")) {
      const state = proposal.coreState as ITokenTradeProposalState;
      return <ProposalSummaryTokenTrade {...this.props} proposalState={state} />;
    }
    ...
  }
```

Add a condition that will handle the case where the proposal's state name matches the new plugin's name. Inside this condition cast the `proposal.coreState` to the corresponding `Arc.js` ProposalState class. Then return the `ProposalSummary` component created on the previous section, and pass as props `{...this.props}` and a `proposalState` object which will be the casted `proposal.coreState`.