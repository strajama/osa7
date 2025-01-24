const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const { PubSub } = require('graphql-subscriptions')

const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allAuthors: async () => {
      return Author.find({})
    },
    allBooks: async (_root, args) => {
      if (!args.author && !args.genre) {
        return Book.find({}).populate('author')
      }
      if (args.author && args.genre) {
        const author = await Author.findOne({ name: args.author })
        return Book.find({ author: author, genres: args.genre }).populate('author')
      }
      if (args.genre) {
        return Book.find({ genres: args.genre }).populate('author')
      }
      const author = await Author.findOne({ name: args.author })
      return Book.find({ author: author }).populate('author')
    },
    me: (_root, _args, context) => {
      return context.currentUser
    }
  },

  Author: {
    bookCount: async (root) => {
      return Book.find({ author: root._id }).countDocuments()
    }
  },

  Mutation: {
    addBook: async (_root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
      let existingAuthor = await Author.findOne({ name: args.author })
      if (!existingAuthor) {
        const newAuthor = new Author({ name: args.author })
        try {
          existingAuthor = await newAuthor.save()
        } catch (error) {
          throw new GraphQLError('Saving author failed',
            { extensions: { code: 'BAD_USER_INPUT', invalidArgs: args, error } })
        }
      }
      const book = new Book( { ...args, author: existingAuthor._id })
      try {
        const savedBook = await book.save()
        const populatedBook = await savedBook.populate('author')
        pubsub.publish('BOOK_ADDED', { bookAdded : populatedBook })
        return populatedBook
      } catch (error) {
        throw new GraphQLError('Saving book failed',
          { extensions: { code: 'BAD_USER_INPUT', invalidArgs: args, error } })
      }
    },
    editAuthor: async (_root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      try {
        return await author.save()
      } catch (error) {
        throw new GraphQLError('Saving author failed',
          { extensions: { code: 'BAD_USER_INPUT', invalidArgs: args ,error } })
      }
    },
    createUser: async (_root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
      return user.save()
        .catch(error => {
          throw new GraphQLError('Creating the user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.username,
              error
            }
          })
        })
    },
    login: async (_root, args) => {
      const user = await User.findOne({ username: args.username })
      if ( !user || args.password !== 'secret' ) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      }
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => {
        return pubsub.asyncIterableIterator('BOOK_ADDED')
      }
    }
  }
}

module.exports = resolvers