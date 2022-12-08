const $ = (selector, context = document) => {
  return Array.isArray(selector)
    ? Array.from(context.querySelectorAll(selector[0] || ''))
    : context.querySelector(selector)
}

$('#year').textContent = new Date().getFullYear()

document.addEventListener('DOMContentLoaded', e => {

  const $menu = $('#menu')
  const $nav = $('#small-nav')
  $menu.addEventListener('click', e => {
    $menu.classList.toggle('active')
    $nav.classList.toggle('active')
  })

  document.addEventListener('click', e => {
    if (
      e.target !== $menu
      && e.target !== $nav
      && !$menu.contains(e.target)
    ) {
      $menu.classList.remove('active')
      $nav.classList.remove('active')
    }
  })

  const $links = $(['[link]'])
  const $sections = $(['main > section'])
  const defaultSection = $('main').dataset.defaultSection


  const goToSection = url => {
    $menu.classList.remove('active')
    $nav.classList.remove('active')
    $sections.forEach($section => {
      const isDefault = $section.getAttribute('id') === defaultSection
      const id = $section.getAttribute('id')
      $section.classList.toggle('active', id === url || (url === '' && isDefault))
    })
  }

  $links.forEach($el => {
    $el.addEventListener('click', e => {
      e.preventDefault()
      const link = $el.getAttribute('link')
      const url = link ? `#${link}` : ''
      history.pushState(null, null, url)
      goToSection(url)
    })
  })

  if (window.location.hash) {
    const url = window.location.hash.slice(1)
    goToSection(url)
  }

})
