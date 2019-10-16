You might want to update client library while working on Alchemy integration if you added new contract or updated subgraph

In this client tutorial we will extend client library to interact with the previous non-universal example scheme `BuyInWithRageQuitOpt`

## Pre Work

Make sure you have cloned client submodule, if you have not already

        git submodule update --init
  
## Update Client

In order to extend client support for the new scheme you will have to add the following:

  - **New Scheme Class**
  - **New Entity Class**
  - **Integration Test** ( Merging code without testing is a risky business 😁)

### Add new scheme class

Create file `client/src/schemes/BuyInWithRageQuitOpt.ts` that exports the new scheme class to enable client to interact with the scheme contract

Please refer to [Example Scheme Class](#example-scheme-class)

NOTE:

  - You will need to **add abi** of the contract in `client/src`, if it does not exist in `@daostack/arc`
  - Client library use `toIOperationObservable` to create observables to get 3rd confirmation update

#### Example Scheme class

    import BN = require('bn.js')
    import { from } from 'rxjs'
    import { concatMap } from 'rxjs/operators'
    import buyInWithRageQuitOptScheme = require('./BuyInWithRageQuitOpt.json')
    import {
      Operation,
      toIOperationObservable
    } from '../operation'
    import { Scheme } from '../scheme'
    import { Deposit } from '../deposit'

    export class BuyInWithRageQuitOptScheme {

      constructor(public scheme: Scheme) {

      }

      err = (error: Error): Error => { return error }

      public deposit(amount: BN): Operation <Deposit|null> {
        const observable = from(this.getContract()).pipe(
          concatMap((buyInWithRageQuitOpt) => {
            const transaction = { value: amount, tx: buyInWithRageQuitOpt.methods.deposit() }
            const map = (receipt: any) => {
              const event = receipt.events.buyIn
              if (!event) {
                return null
              }

              return new Deposit({
                amount: event.returnValues._amount,
                member: event.returnValues._member.toLowerCase(),
                dao: event.returnValues._avatar.toLowerCase(),
                rep: event.returnValues._rep
              }, this.scheme.context)
            }

            return this.scheme.context.sendTransaction(transaction, map, this.err)
          })
        )
        return toIOperationObservable(observable)
      }

      public quit(): Operation <Quit|null> {
        const observable = from(this.getContract()).pipe(
          concatMap((buyInWithRageQuitOpt) => {
            const transaction = buyInWithRageQuitOpt.methods.quit()
            const map = (receipt: any) => {
              const event = receipt.events.buyIn
              if (!event) {
                return null
              }
              return new Quit({
                amount: event.returnValues._amount,
                memberAddress: event.returnValues._memberAddress,
                dao: event.returnValues._avatar,
                rep: event.returnValues._rep
              }, this.scheme.context)
            }
            return this.scheme.context.sendTransaction(transaction, map, this.err)
          })
        )
        return toIOperationObservable(observable)
      }

      private async getContract() {
        const state = await this.scheme.fetchStaticState()
        return  this.scheme.context.getContract(state.address, buyInWithRageQuitOptScheme.abi)
      }
    }

### Add new Entity class

Enable client library to interact with the Entities added to subgraph during previous step (Upgrade subgraph)

  - Add relevant IEntityStaticState, IEntityState and IEntityQueryOptions interface
  - Each `Entity` class must have following methods:
    - **state**: that takes IEntityQueryOptions and returns Entity Observable from graphQL query
    - **setStaticState**: that sets IEntityStaticState
    - **fetchStaticState**: that returns IEntityStaticState observable
    - **state**: that returns IEntityState observable

Please refer to example [Deposit Entity class](#example-entity-class)

#### Example Entity Class

    import gql from 'graphql-tag'
    import { Observable } from 'rxjs'
    import { first } from 'rxjs/operators'
    import { Arc, IApolloQueryOptions } from './arc'
    import { Address, ICommonQueryOptions, IStateful } from './types'
    import { BN, createGraphQlQuery, isAddress } from './utils'

    export interface IDepositStaticState {
      id?: string
      member: Address
      amount: typeof BN
      rep: typeof BN
      dao: Address

    }

    export interface IDepositState extends IDepositStaticState {
      id: string
    }

    export interface IDepositQueryOptions extends ICommonQueryOptions {
      where?: {
        id?: string
        member?: Address
        dao?: Address
        [key: string]: any
      }
    }

    export class Deposit implements IStateful<IDepositState> {
      /**
       * Deposit.search(context, options) searches for deposit entities
       * @param  context an Arc instance that provides connection information
       * @param  options the query options, cf. IDepositQueryOptions
       * @return         an observable of Deposit objects
       */
       public static search(
         context: Arc,
         options: IDepositQueryOptions = {},
         apolloQueryOptions: IApolloQueryOptions = {}
       ): Observable <Deposit[]> {
         if (!options.where) { options.where = {}}
         let where = ''
         let daoFilter: (r: any) => boolean
         daoFilter = () => true

         for (const key of Object.keys(options.where)) {
           if (options.where[key] === undefined) {
             continue
           }

           if (key === 'member' || key === 'dao') {
             const option = options.where[key] as string
             isAddress(option)
             options.where[key] = option.toLowerCase()
           } else {
             where += `${key}: "${options.where[key] as string}"\n`
           }
         }

         const query = gql`query DepositSearch
           {
             deposits ${createGraphQlQuery(options, where)} {
               id
               member
               amount
               avatar
               rep
             }
           }
         `

         return context.getObservableListWithFilter(
           query,
           (r: any) => {
             return new Deposit({
               id: r.id,
               member: r.member,
               amount: new BN(r.amount || 0),
               dao: r.avatar,
               rep: new BN(r.rep || 0)
             }, context)
           },
           daoFilter,
           apolloQueryOptions
         ) as Observable<Deposit[]>
       }

       public id: string|undefined
       public staticState: IDepositStaticState|undefined

       constructor(idOrOpts: string|IDepositStaticState, public context: Arc) {
         if (typeof idOrOpts === 'string') {
           this.id = idOrOpts
         } else {
           const opts = idOrOpts as IDepositStaticState
           this.id = opts.id
           this.setStaticState(opts)
         }
       }

       public setStaticState(opts: IDepositStaticState) {
         this.staticState = opts
       }

       public async fetchStaticState(): Promise<IDepositStaticState> {
         if (!!this.staticState) {
           return this.staticState
         } else {
           return await this.state().pipe(first()).toPromise()
         }
       }

       public state(apolloQueryOptions: IApolloQueryOptions = {}): Observable<IDepositState> {
         const query = gql`query DepositById {
           deposit (id: "${this.id}") {
             id
             memberAddress
             amount
             avatar
             rep
           }
         }`

         const itemMap = (item: any): IDepositState => {
           if (item === null) {
             throw Error(`Could not find a Vote with id ${this.id}`)
           }
           return {
             amount: item.amount,
             dao: item.dao,
             id: item.id,
             member: item.member,
             rep: item.rep
           }
         }
         return this.context.getObservableObject(query, itemMap, apolloQueryOptions)
       }
    }

## Integration Tests
  1. Add relevant integration test for the new scheme, `client/test/scheme-buyInWithRageQuitOpt.spec.ts`
  2. Start test watcher while you test and update the client

        npm run test:watch:client -- test/scheme-buyInWithRageQuitOpt.spec.ts

Refer to example [Test BuyInWithRageQuitOpt Scheme](#test-buyInWithRageQuitOpt-scheme)

### Test BuyInWithRageQuitOpt Scheme

Following is an example integration test file to test the sample non-universal scheme we developed in this tutorial

    import { Scheme } from '../src/scheme'
    import { Arc } from '../src/arc'
    import { DAO } from '../src/dao'
    import { first } from 'rxjs/operators'
    import { Reputation } from '../src/reputation'
    import { Deposit } from '../src/deposit'

    import {
      BN,
      getTestDAO,
      getTestAddresses,
      newArc,
      toWei,
      waitUntilTrue
     } from './utils'

    jest.setTimeout(60000)
    /**
     * Scheme test
     */
    describe('Deposit to buy reputaion', () => {

      let addresses: any
      let arc: Arc
      let dao: DAO
      let scheme: Scheme
      let daoBalanceBefore: undefined
      let reputationBefore: undefined
      let eventLengthBefore: number
      let reputation: any
      let amount = toWei('0.1')
      let response: any

      const getEventLength = async () => {
        let deposits = await Deposit.search(
          arc,
          {where: {member: arc.web3.eth.defaultAccount}}, { fetchPolicy: "no-cache"}
        ).pipe(first()).toPromise()
        return deposits.length
      }

      beforeAll(async () => {
        arc = await newArc()
        addresses = getTestAddresses(arc)
        dao = await getTestDAO()
        scheme = new Scheme({
            address: '0x6d065a54f0a14cb03b949a146dbb58c14a0afc48',
            dao: dao.id,
            id: '0x992c72e5e965d11a318839b554b0330dcb3ac81dc2ac0e4e57ba2c15660a3564',
            name: 'BuyInWithRageQuitOpt',
            paramsHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
        }, arc)
        reputation = new Reputation(addresses.dao.Reputation, arc)

        daoBalanceBefore = await dao.ethBalance().pipe(first()).toPromise()
        reputationBefore = await reputation.reputationOf(arc.web3.eth.defaultAccount).pipe(first()).toPromise()
        eventLengthBefore = await getEventLength()

        expect(scheme.BuyInWithRageQuitOpt).not.toBeFalsy()
        if (scheme.BuyInWithRageQuitOpt) {
          response = await scheme.BuyInWithRageQuitOpt.deposit(amount).send()
          expect(response)
        }
      })

      it('Should increase DAO balance by amount deposited', async () => {
        let daoBalanceAfter = await dao.ethBalance().pipe(first()).toPromise()
        expect(Number(daoBalanceAfter) - Number(daoBalanceBefore)).toEqual(Number(amount))
      })

      it('Should increase reputation of Member by amount deposited', async () => {
        let reputationAfter = new BN(await reputation.contract().methods.balanceOf(arc.web3.eth.defaultAccount).call())
        expect(Number(reputationAfter) - Number(reputationBefore)).toEqual(Number(amount))
      })

      it('Should index the deposit event', async () => {

          const state0 = await response.result.fetchStaticState()
          expect(state0).toMatchObject({
            amount: amount.toString(),
            member: arc.web3.eth.defaultAccount.toLowerCase(),
            dao: dao.id.toLowerCase(),
            rep: amount.toString()
          })

          let eventLengthAfter = eventLengthBefore

          const depositIsIndexed = async () => {
            eventLengthAfter = await getEventLength()
            return eventLengthAfter - eventLengthBefore > 0
          }
          
          await waitUntilTrue(depositIsIndexed)

          expect(eventLengthAfter-1).toEqual(eventLengthBefore)

      })

    })

    describe('Quit to refund funds', () => {

        // add more tests
    })

## Extra Interoperability updates (may differ per use case)

Apart from the above standard updates you might need to update some other files depending on the scheme you are adding.

For eg. In case of `BuyInWithRageQuitOpt Scheme`, we added to following files:

  - **src/scheme.ts**: To add BuyInWithRageQuitOpt to `ISchemeState`
  - **src/operation.ts**: To enable passing custom value to `this.scheme.context.sendTransaction`
  - **test/utils.ts**: To update `LATEST_ARC_VERSION` and to `getTestAddresses` of our newly created DAO instead of test DAO
  - **test/migration.json**: To use the migration file we got in the `migration` step (which has details of our DAO and new scheme`
