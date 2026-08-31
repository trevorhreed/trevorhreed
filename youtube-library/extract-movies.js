const movies = [...document.querySelectorAll('ytd-grid-movie-renderer')].map(el => {
  const url = el.querySelector('a#thumbnail')?.href || ''
  const title = el.querySelector('#video-title')?.textContent.trim() || ''
  const image = el.querySelector('img')?.src || ''
  const rating = el.querySelector('.badge-style-type-simple p')?.textContent.trim() || ''
  const genreYear = el.querySelector('.grid-movie-renderer-metadata')?.textContent.trim() || ''
  const [genre, year] = genreYear.split('•').map(s => s.trim())
  return { url, title, genre, year, rating, image }
})

console.log(movies)
