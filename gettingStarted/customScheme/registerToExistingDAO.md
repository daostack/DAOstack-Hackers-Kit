To register the new Scheme to an existing DAOstack DAO you can submit a new proposal to the Scheme Registrar via Alchemy UI after the Scheme is deployed.

## Deploy the Scheme contract

  You may use truffle or your own script to deploy the new scheme contract and intitialize it.

## Propose to SchemeRegistrar

  1. On Alchemy's landing page, choose the DAO to which you wish to register the scheme.
  2. Visit the DAO's `Home` page and choose `Scheme Registrar`.
  3. Click `New Proposal` – this will open a popup.
  4. Select `Add Scheme` on the popup sidebar (on the left).
  5. Give the proposal an appropriate title, description, and url linking to a description of the proposal.
  6. For `Scheme`,  put the address of the new scheme contract (universal or not).
  7. Enter the `paramHash` for your scheme.

     - *universal scheme* : `paramHash` returned by `setParameters` method
     - *non-universal scheme* : can be left null, since only one parameter set is registered to non-universal schemes at the time of deployment.

  8. In the permissions section, check the appropriate permissions required by the scheme.

    In case of `BuyInWithRageQuitOpt` example we only need mint and burn permissions.

  9. Submit the proposal and sign the transaction as normal.
  10. If the DAO passes your proposal, then your Scheme will be registered to the DAO.
