import fs from 'fs/promises'
import { join } from 'path'

const currentDir = new URL('.', import.meta.url).pathname
const dataDir = join(currentDir, './data/')
const outputDir = join(currentDir, '../src/youtube/')

const readFile = async path => {
  try {
    const data = await fs.readFile(path, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    return []
  }
}

const writeFile = async (path, data) => {
  await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf-8')
}

const existingMovies = await readFile(join(dataDir, 'existing-movies.json'))
const newMovies = await readFile(join(dataDir, 'new-movies.json'))

const movies = [...newMovies, ...existingMovies]
  .map(movie => {
    movie.sortTitle =
      movie.sortTitle ||
      movie.title
        .toLowerCase()
        .replace(/^(a |an |the )/i, '')
        .replace(/^[^a-z0-9]/gi, '')
        .trim()
    movie.searchTitle = movie.searchTitle || movie.title.toLowerCase()
    movie.year = parseInt(movie.year)
    const tags = movie.tags || []
    const genres = [...(movie.genres || []), ...(movie.genre ? [movie.genre] : [])]
    movie.tags = Array.from(new Set([...tags, ...genres])).sort()
    return movie
  })
  .toSorted((a, b) => a.sortTitle.localeCompare(b.sortTitle))

await Promise.all([writeFile(join(dataDir, 'existing-movies.json'), movies), writeFile(join(outputDir, 'movies.json'), movies)])
console.log(`Wrote ${movies.length} movies to movies.json`)
