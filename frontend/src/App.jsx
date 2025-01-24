import { useState } from "react";
import Authors from "./components/Authors"
import Books from "./components/Books";
import NewBook from "./components/NewBook"
import { useQuery } from '@apollo/client'
import { ALL_AUTHORS, ALL_BOOKS } from './queries'
import Login from "./components/Login"
import { useApolloClient } from '@apollo/client'
import Recommend from "./components/Recommend"

const App = () => {
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const authorResult = useQuery(ALL_AUTHORS, {})
  const bookResult = useQuery(ALL_BOOKS, {})

  const [page, setPage] = useState("authors");

  if (authorResult.loading || bookResult.loading) { 
    return <div>loading...</div>
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>

        {!token ? (
          <button onClick={() => setPage("login")}>login</button>
        ) : (
          <>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => setPage("recommend")}>recommend</button>
            <button onClick={logout}>logout</button>
          </>
        )}
      </div>
      <Authors show={page === "authors"} authors={authorResult.data.allAuthors}/>
      <Books show={page === "books"} books={bookResult.data.allBooks} />
      {token && <NewBook show={page === "add"} />}      
      {token && <Recommend show={page === "recommend"}/>} 
      <Login show={page === "login"} setToken={setToken} />
    </div>
  );
};

export default App;