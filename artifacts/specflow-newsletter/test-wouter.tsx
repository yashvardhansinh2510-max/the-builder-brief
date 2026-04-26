import React from 'react';
import { renderToString } from 'react-dom/server';
import { Route, Switch, Router } from 'wouter';

const App = () => (
  <Router hook={() => ['/dashboard', () => {}]}>
    <Switch>
      <Route path="/dashboard"><div id="dashboard-child">Dashboard!</div></Route>
      <Route path="/other" component={() => <div>Other</div>} />
      <Route><div>404 Not Found</div></Route>
    </Switch>
  </Router>
);

console.log(renderToString(<App />));
