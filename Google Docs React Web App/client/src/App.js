import React from "react"
import { v4 as uuidV4 } from 'uuid'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import Editor from "./component/editor"

function App() {
  return (
    <Router>
      <Switch>
        <Route path = "/" exact>
          <Redirect to = { `/documents/${uuidV4()}` }></Redirect>
        </Route>
        <Route path = "/documents/:id">
          <Editor />      
        </Route>
      </Switch>
    </Router>
  )
}

export default App