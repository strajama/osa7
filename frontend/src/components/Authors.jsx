import { useState } from 'react'
import { gql, useMutation } from '@apollo/client'

const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(
      name: $name,
      setBornTo: $setBornTo
    ) {
      name
      born
      bookCount
      id
    }
  } 
`

const Authors = (props) => {

  const [born, setBorn] = useState('')
  const [name, setName] = useState('')
  const [ editAuthor ] = useMutation(EDIT_AUTHOR)
  
    if (!props.show) {
      return null
    }
    const authors = props.authors

    const submit = async (event) => {
      event.preventDefault()
      editAuthor({ variables: { name, setBornTo: parseInt(born) } })
      setBorn('')
      setName('')
    }
    
    return (
      <div>
        <h2>authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>born</th>
              <th>books</th>
            </tr>
            {authors.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2>Set birthyear</h2>
        <form onSubmit={submit}>
          <div>name 
          <select value={name} onChange={({ target }) => setName(target.value)}>
            {authors.map((a) => (
              <option key={a.id}>{a.name}</option>
            ))}
          </select>
          </div>
          <div>
            born
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
          </div>
          <div>
          <button type="submit">update author</button>
          </div>
        </form>
      </div>
    )
  }
  
  export default Authors