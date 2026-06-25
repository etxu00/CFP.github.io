const $ = selector => document.querySelector(selector)
  ? document.querySelector(selector)
  : null
const _DATA = {}

function getData(key, subKey) {
  const localStorageData = localStorage.getItem('DATA')
  const tmpData = localStorageData ? JSON.parse(localStorageData) : {}
  const data = tmpData[key] ? tmpData[key][subKey] || [] : []
  _DATA[key] = tmpData[key]
  return data
}

function redirectEdit(event) {
  const $tr = event.target.closest('tr')
  const id = $tr.dataset.id
  location.href = _HTML + '.html?edit&id=' + id
}

function renderTable(data) {
  const $tbody = $('tbody')
  const $template = $('#template_tr')
  data.forEach((item, index) => {
    const $tr = $template.content.cloneNode(true)
    const tr = selector => $tr.querySelector(selector)
    for (i in item) {
      const value = item[i]
      if (i === 'id') {
        tr('[data-id]').dataset.id = value
      } else {
        const tmpTr = tr('._' + i)
        if (tmpTr) {
          if (tmpTr.tagName === 'IMG') {
            tr('._' + i).src = value
            tr('._' + i).alt = value
          } else if (tmpTr.tagName === 'A') {
            tr('._' + i).href = value
          } else {
            tr('._' + i).textContent = typeValue(value)
          }
        }
      }
    }
    $tbody.appendChild($tr)
  })
}

function start() {
  const items = getData(_CONCEPT, 'items')
  if (items.length) {
    renderTable(items)
  }
}

function typeValue(value) {
  if (value === 'true' || value === 'false') {
    return value === "true" ? "Si" : "No"
  } else if (value === 'on') {
    return value === "on" ? "Si" : "No"
  }
  return value
}

document.addEventListener('DOMContentLoaded', start, false)