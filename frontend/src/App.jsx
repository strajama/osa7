import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import { gql, useQuery } from '@apollo/client'

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
      id
    }
  }
  `
const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author
      published
      genres
      id
    }
  }
  `

const App = () => {
  const authorResult = useQuery(ALL_AUTHORS, {
    pollInterval: 2000
  })
  const bookResult = useQuery(ALL_BOOKS, {
    pollInterval: 2000
  })
  const [page, setPage] = useState("authors");

  if (authorResult.loading || bookResult.loading) { 
    return <div>loading...</div>
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("add")}>add book</button>
      </div>

      <Authors show={page === "authors"} authors={authorResult.data.allAuthors}/>

      <Books show={page === "books"} books={bookResult.data.allBooks} />

      <NewBook show={page === "add"} />
    </div>
  );
};

export default App;