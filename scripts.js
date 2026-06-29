const $ = selector => document.querySelector(selector)
  ? document.querySelector(selector)
  : null
const _DATA = {}
const itemSelected = []

function activeOrDeactivateItem(event) {
  if (event) {
    const $tr = event.target.closest('tr')
    const id = $tr.dataset.id
    const info = _DATA[_CONCEPT].items.find(item => item.id === Number(id))
    info.activo = !info.activo
    console.log(info)
    localStorage.setItem('DATA', JSON.stringify(_DATA))
    renderTable(_DATA[_CONCEPT].items)
  }
}

function addItemSelected(event) {
  const $tr = event.target.closest('tr')
  const id = $tr.dataset.id
  if (event.target.checked) {
    itemSelected.push(Number(id))
  } else {
    itemSelected.splice(itemSelected.indexOf(Number(id)), 1)
  }
}

function deleteItems(event) {
  if (event) {
    const $tr = event.target.closest('tr')
    const id = $tr.dataset.id
    itemSelected.push(Number(id))
  }
  if (itemSelected.length) {
    const items = _DATA[_CONCEPT].items
    _DATA[_CONCEPT].items = items.filter(item => !itemSelected.includes(item.id))
    localStorage.setItem('DATA', JSON.stringify(_DATA))
    itemSelected.length = 0
    renderTable(_DATA[_CONCEPT].items)
  }
}

function exportData(event) {
  // Exporta _DATA en un archivo txt que guarda todo el contenido de la variable en un JSON
  const blob = new Blob([JSON.stringify(_DATA)], { type: 'text/plain;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  const nameFile = `Finanzas ${new Date().toLocaleDateString('es-ES')}.json`
  
  link.setAttribute('href', url)
  link.setAttribute('download', nameFile)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function generateTemplate(nameFile) {
  if (!_MODEL) {
    return alert('No se encontró el modelo')
  }
  
  // Obtener los labels del modelo para la primera fila del CSV
  const labels = Object.values(_MODEL).map(field => field.label)
  
  // Crear la primera fila del CSV
  const csvHeader = labels.join(',')
  
  // Crear el contenido del CSV (solo el header por ahora)
  const csvContent = csvHeader
  
  // Crear el blob y descargar el archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', nameFile ? nameFile : `${_CONCEPT.toLowerCase()}_template.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function getData(key, subKey) {
  const localStorageData = localStorage.getItem('DATA')
  const tmpData = localStorageData ? JSON.parse(localStorageData) : {}
  const data = tmpData[key] ? tmpData[key][subKey] || [] : []
  _DATA[key] = tmpData[key]
  return data
}

function importData(event) {
  const $btn = event.target
  const $fileImport = $('#file_import')
  $btn.disabled = true
  if (!$fileImport) {
    return alert('No se encontró el input de archivo') // TODO Mejorar manejo de errores
  }
  const file = $fileImport.files[0]
  if (!file) {
    return alert('No se seleccionó ningún archivo') // TODO Mejorar manejo de errores
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    // TODO: Procesar el archivo CSV
  }
  reader.readAsText(file)
  $btn.disabled = false
}

function pipeDate(date) {
  return date.split('T')[0].split('-').reverse().join('/')
}

function redirectEdit(event) {
  const $tr = event.target.closest('tr')
  const id = $tr.dataset.id
  location.href = _HTML + '.html?edit&id=' + id
}

function renderTable(data) {
  const $tbody = $('tbody')
  const $template = $('#template_tr')
  $tbody.innerHTML = ''
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
  // Si es booleano
  if (value === 'true' || value === 'false' || value === true || value === false) {
    return value === "true" || value === true ? "Si" : "No"
  // Si es booleano con valor on/off
  } else if (value === 'on') {
    return value === "on" ? "Si" : "No"
  // Si es fecha
  } else if (typeof value === 'string' && value.includes('T')) {
    return pipeDate(value)
  // Si es numero
  } else if (typeof value === 'number') {
    return Number(value)
  }
  return value
}

document.addEventListener('DOMContentLoaded', start, false)

/**
 * Agrega un evento a todos los <details>, para cuando se presione algun <button> o <a> dentro de ellos,
 * se cierre el details, o cuando se presione fuera del details.
*/
document.querySelectorAll('details').forEach(details => {
  details.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A') {
      details.open = false
    }
  })
  document.addEventListener('click', (event) => {
    if (!details.contains(event.target)) {
      details.open = false
    }
  })
})

