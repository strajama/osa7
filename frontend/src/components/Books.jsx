import { useState, useEffect } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'

const Books = (props) => {
  const [genre, setGenre] = useState('')

  const [changeGenre, { data }] = useLazyQuery(ALL_BOOKS, {
    fetchPolicy: 'network-only',
    variables: { genre }
  })

  useEffect(() => {
    if (genre) {
      changeGenre()
    }
  }, [genre, changeGenre])

  if (!props.show) {
    return null
  }

  const books = data ? data.allBooks : props.books || []

  const genres = (props.books || []).reduce((acc, book) => {
    book.genres.forEach(genre => {
      if (!acc.includes(genre)) {
        acc.push(genre)
      }
    })
    return acc
  }, [])

  const updateGenre = (event) => {
    setGenre(event.target.innerText)
  }

  return (
    <div>
      <h2>books</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      genres: {genres.map(genre => <button key={genre} onClick={updateGenre}>{genre}</button>)}
    </div>
  )
}

export default Books
