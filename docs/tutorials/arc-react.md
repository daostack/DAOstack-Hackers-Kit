# Arc.react

Arc.react it's a react library that exposes arc.js functions and subgraph data in react components.

Making it easier to develop on top of DAOstack, because it allows the developer to:

- Build DAOs faster, easier, and better: Enables easy react application deployment and integration, and significantly simplifies building of custom DAO UIs, interfaces, pages, and website native UI.
- Create a better flow for projects/DAOs looking to onboard streams of new users
- Take the DAOs where the audience already is, instead of forcing them to come to another app (i.e: Alchemy)

Before going forward with how to use the library in your application, we recommend reading the [architecture](https://github.com/dOrgTech/arc.react/blob/master/documentation/architecture.md) and [examples](https://github.com/dOrgTech/arc.react/blob/master/documentation/examples.md) docs so you have a preview of how the library works.

Also, as this tutorial go, you can check the [api](https://github.com/dOrgTech/arc.react/blob/master/documentation/examples.md) documentation so you can see every component in depth.

To add this library into your react app you need to install it first:

> npm i --save @daostack/arc.react

As second step, you will need to connect Arc protocol to React with the `Arc` component. The `Arc` is similar to React's Context.Provider. It wraps your React app and places the client on the context, which enables you to access it from anywhere in your component tree.

We suggest putting `Arc` somewhere high in your app, above any component from `arc.react` library, because, since it's the one that allows the app to connect to the Arc protocol, all components are dependent of it (If you are familiar with `@apollo/client` library, you can see it as if this is the `ApolloProvider` object, that wraps the entire application in it).

You connect to the Arc protocol using and `ArcConfig` object like so (please check [Protocol connection](https://github.com/dOrgTech/arc.react/blob/master/documentation/api.md#protocol-connection) to get more information about it):

```tsx
import { Arc, ArcConfig } from "@daostack/arc.react";

<Arc config={new ArcConfig("rinkeby")}>All other components go here</Arc>;
```

And the last step to connecting your DAO into your app, you need to use the `DAO` component, passing the address of your DAO as a prop, like this:

```tsx
import { DAO } from "@daostack/arc.react";

<DAO address="0xMY_DAO">Your app</DAO>;
```

Now you are ready to code your react app that interacts with Arc protocol! At the end the application should look like this:

```tsx
import { Arc, ArcConfig, DAO } from "@daostack/arc.react";

const App = () => {
  const arcConfig = new ArcConfig("rinkeby");
  return (
    <Arc config={arcConfig}>
      <DAO address="0xMY_DAO">Here goes your app!</DAO>
    </Arc>
  );
};
```

Now you can see the members of your DAO:

```html
<Members>
  <Member.Data>{(data: MemberData) => <div>{data.address}</div>}</Member.Data>
</Members>
```

And the proposals:

```tsx
<Proposals>
  <Proposal.Data>
  <Proposal.Entity>
  {(data: ProposalData, entity: ProposalEntity) => (
    <div>
      <h1>{data.title}</h1>
      <button onClick={() => entity.vote({...})}>
        Up Vote
      </button>
      <button onClick={() => entity.vote({...})}>
        Down Vote
      </button>
    </div>
  )}
  </Proposal.Entity>
  </Proposal.Data>
</Proposals>
```

And any other entity within the [DAOstack protocol](https://github.com/dOrgTech/arc.react/tree/master/src/components)!

You can check the demo application built with `arc.react` on this repository: https://github.com/dOrgTech/arc.react-demo
