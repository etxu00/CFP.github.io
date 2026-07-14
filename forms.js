const $ = selector => document.querySelector(selector)
const $form = $('form')
const MAX_WIDTH_IMAGE = 100 //px
let _DATA = null
let _FULL_DATA = null

function addDataAttributes(option, item, $select) {
  Array.from($select.attributes).forEach(attr => {
    if (attr.name.startsWith('data-data-')) {
      const dataAttrName = attr.name.replace('data-data-', 'data-')
      const sourceField = attr.value
      if (item[sourceField]) {
        option.setAttribute(dataAttrName, item[sourceField])
      }
    }
  })
}

function addDefaultValues(info) {
  info.creador = 'etxu00'
  info.fecha_creacion = getDate()
  return info
}

function clearImg() {
  $inputImage.value = ''
  $inputImageLink.value = ''
  $previewImage.src = 'https://img.icons8.com/forma-bold-filled/24/no-image.png'
}

function createData(info) {
  if (!info.id) {
    const maxId = _DATA.items.length > 0 
      ? Math.max(..._DATA.items.map(item => item.id)) 
      : 0
    info.id = maxId + 1
  }
  _DATA.items.push(info)
  saveData()
  redirect()
}

function createOption(value, text, item, $select) {
  const option = document.createElement('option')
  option.value = value
  option.textContent = text

  addDataAttributes(option, item, $select)
  return option
}

function deleteRegister() {
  const formData = new FormData($form)
  const id = formData.get('id')
  _DATA.items = _DATA.items.filter(item => item.id !== Number(id))
  saveData()
  redirect()
}

function focusFirstInputInvalid() {
  const $firstInvalid = $form.querySelectorAll('input:invalid, select:invalid, textarea:invalid')
  if ($firstInvalid.length) {
    if ($firstInvalid[0].tagName === 'INPUT' && $firstInvalid[0].value) {
      $firstInvalid[0].select()
      return
    }
    $firstInvalid[0].focus()
  }
}

function generateInfo(formData) {
  const info = {}
  const tmpFields = {}
  
  // Primero, recolectar todos los campos tmp_
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('tmp_')) {
      tmpFields[key] = parseValue(value)
    }
  }
  
  // Luego, procesar los campos normales y reemplazar si hay tmp_ correspondiente
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('tmp_')) continue
    
    const _value = parseValue(value)
    const tmpKey = `tmp_${key}`
    
    // Si existe un campo tmp_ correspondiente, usar su valor
    if (tmpFields[tmpKey] !== undefined) {
      info[key] = tmpFields[tmpKey]
      info[key.toLowerCase()] = tmpFields[tmpKey]
    } else {
      info[key] = _value
      info[key.toLowerCase()] = _value
    }
  }
  
  addDefaultValues(info)
  
  // Ejecutar función personalizada antes de guardar si existe
  if (typeof window.beforeSendSaveForm === 'function') {
    info = window.beforeSendSaveForm(info)
  }
  
  return info
}

function getDate() {
  const date = new Date()
  return date.toISOString()
}

function getDataReference() {
  const localData = localStorage.getItem('DATA')
  _FULL_DATA = localData ? JSON.parse(localData) : {}
  
  if (!_FULL_DATA[_CONCEPT]) {
    _FULL_DATA[_CONCEPT] = {
      items: []
    }
  }
  
  _DATA = _FULL_DATA[_CONCEPT]
}

function handleNewOptionChange($select, $input, newOption) {
  if ($select.value === newOption) {
    const TIME_DELAY = 250 // Ayuda a que el usuario vea que se hizo un cambio en el foco del input
    $input.hidden = false
    $input.required = true
    setTimeout(() => $input.focus(), TIME_DELAY)
  } else {
    $input.hidden = true
    $input.required = false
    $input.value = ''
  }
}

function inputsFunction() {
  $inputPreview = $('#input_preview')
  $inputImage = $('#input_image')
  $inputImageLink = $('#input_image_link')

  if ($inputImage) {
    $previewImage = $('#preview_image')
    if ($inputImageLink) {
      $inputImageLink.addEventListener('input', () => previewImageLink($inputImageLink.value), false)
    }  
    if ($inputPreview) {
      $inputPreview.addEventListener('change', previewImage, false)
    }
  }
}

function loadDataItem() {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('id')
  if (id) {
    const item = _DATA.items.find(item => item.id === Number(id))
    if (item) {
      for (const [key, value] of Object.entries(item)) {
        updateInput(key, value)
      }
    }
  }
}

function loadNewOption() {
  const $selects = document.querySelectorAll('select[data-new]')

  if (!$selects || !$selects.length) return
  
  $selects.forEach($select => {
    const newOption = $select.getAttribute('data-new')
    const dataInput = $select.getAttribute('data-input')
    
    if (!dataInput) return

    const inputId = dataInput.startsWith('#') ? dataInput.substring(1) : dataInput
    const $input = $(`#${inputId}`)

    if (!$input) return

    $select.addEventListener('change', () => handleNewOptionChange($select, $input, newOption))
  })
  /**
   * FUNCIONAMIENTO ESPERADO
   * 1. Cuando se selecciona "Nuevo..." en el select, se debe mostrar un input para
   *    ingresar el nuevo valor.
   * 2. EL select debe contar con con un atribituto [data-input] este sera el nombre del input
   *    que se usara para ingresar el nuevo valor, este input ya debe estar creado en el formulario
   *    y contar con atributo [hidden] ademas de contar con un id que sea igual al valor
   *    del atributo [data-input].
   *    Ejemplo: data-input="#input_name" -> <input id="input_name" name="input_name" />
   *    En el valor de [data-input] el signo de # es opcional, pero para buscar el <input> siempre
   *    se usara el id del input.
   *    Si el este atributo no se encuentra, se omitira la creación de la opcion.
   * 3. Al seleccionar la opción de "Nuevo...", se debe hacer auto focus al <input>, para facilitar
   *    la entrada de datos.
   * 4. El <input> donde se captura el nuevo valor debe estar oculto por defecto, solo se mostrara
   *    cuando se seleccione la opción de "Nuevo...".
   * 5. El <input> una vez que se muestre debe pasar a ser un campo requerido [required].
   * 6. El atributo name del <input> debe ser el mismo que el del <select> pero empezar con "tmp_".
   *     Porsteriormente al guardar en el formulario el valor de este del <select> se reemplazara
   *     por el valor del <input> y en el cuerpo de FormData se eliminaran todos los campos que
   *     tengan el prefijo "tmp_".
   */
}

function loadSelectOptions() {
  /**
     * FUNCIONAMIENTO ESPERADO
     * 1. Si el select tiene el atributo data-origin, se debe de cargar las opciones desde
     *    _FULL_DATA[origin] segun la información del valor del atributo.
     * 2. Para la creación de las opciones se deben tomar en cuenta los atributos, 
     *    [data-label] como principal. Si cuenta con [data-value] se usa como valor.
     * 3. Si el [data-label] tiene más de una opción (Ejemplo: alias|nombre), el primer valor
     *    se usara como la opción a mostrar, si no se encuentra, pasara al segundo valor
     *    y asi sucesivamente hasta encontrar una opcion valida. De no encontrar ninguna opcion valida
     *    la opción no se agregara al select.
     * 4. Si se cuenta con el atributo [data-data-xxxxx], las opciones generadas contaran con un atributo
     *    [data-xxxxx] con el valor de la opcion.
     * 5. Si el <select> cuenta con el atributo [data-order], las opciones se ordenaran de acuerdo al valor
     *    del atributo. Los valores posibles son "Asc" o "Desc".
  */
    
  const $selects = document.querySelectorAll('select[data-origin]')
  
  if (!$selects || !$selects.length) return
  
  $selects.forEach($select => {
    const origin = $select.getAttribute('data-origin')
    const dataLabel = $select.getAttribute('data-label')
    const dataValue = $select.getAttribute('data-value')
    const dataOrder = $select.getAttribute('data-order')
    
    if (!origin || !dataLabel) return

    const originData = getOriginData(origin)
    const sortedData = sortData(originData, dataOrder, dataLabel)
    const $optgroup = getOrCreateOptgroup($select, origin)
    
    $optgroup.innerHTML = ''
    generateOptions($optgroup, sortedData, dataLabel, dataValue, $select)
  })
}

function getOriginData(origin) {
  const originParts = origin.split('.')
  return originParts.length === 2 
    ? _FULL_DATA[originParts[0]]?.[originParts[1]] || []
    : _FULL_DATA[origin]?.items || []
}

function getLabelValue(item, label) {
  const labelParts = label.split('|')
  for (const part of labelParts) {
    if (item[part]) return item[part]
  }
  return null
}

function getOrCreateOptgroup($select, origin) {
  let $optgroup = $select.querySelector('optgroup')
  if (!$optgroup) {
    $optgroup = document.createElement('optgroup')
    const originParts = origin.split('.')
    $optgroup.label = originParts[0] || 'Opciones'
    $select.appendChild($optgroup)
  }
  return $optgroup
}

function generateOptions($optgroup, data, label, value, $select) {
  data.forEach(item => {
    const labelText = getLabelValue(item, label)
    if (!labelText) return
    
    const valueText = value ? item[value] : labelText
    const option = createOption(valueText, labelText, item, $select)
    $optgroup.appendChild(option)
  })
}

function parseValue(value) {
  const newValue = isNaN(value) ? value : Number(value)
  if (newValue === 'true') {
    return true
  }
  if (newValue === 'false') {
    return false
  }
  if (newValue === 'on') {
    return true
  }
  return newValue
}

function previewImage(event) {
  const file = event.target.files[0]
  const reader = new FileReader()
  reader.onload = event => {
    const img = new Image()
    img.onload = () => {
      const resizedImage = resizeImage(img, MAX_WIDTH_IMAGE)
      $previewImage.src = resizedImage
      $inputImage.value = resizedImage
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(file)
}

function previewImageLink(urlImage) {
  const imgError = 'https://img.icons8.com/forma-bold-filled/24/no-image.png'
  let imgOk = false
  if (!urlImage) {
    $previewImage.src = imgError
  } else {
    // Validamos con un fetch que el enlace sea una imagen .jpg, .png, .gif, .webp
    fetch(urlImage)
      .then(response => {
        imgOk = response.ok
        return response
      })
      .then(response => {
        if (imgOk) {
          const img = new Image()
          img.crossOrigin = 'anonymous' // Permitir acceso CORS
          img.onload = () => {
            try {
              const resizedImage = resizeImage(img, MAX_WIDTH_IMAGE)
              $previewImage.src = resizedImage
              $inputImage.value = resizedImage
            } catch (error) {
              console.error('Error al redimensionar la imagen:', error)
              $previewImage.src = urlImage
              $inputImage.value = urlImage
            }
          }
          img.onerror = () => {
            $previewImage.src = imgError
          }
          img.src = urlImage
        } else {
          $previewImage.src = imgError
        }
      })
      .catch(error => $previewImage.src = imgError)
  }
}

function redirect() {
  window.location.href = `/${_REDIRECT}.html`
}

function resizeImage(img, maxWidth) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  // Calcular el nuevo tamaño manteniendo la proporción
  let width = img.width
  let height = img.height
  
  if (width > maxWidth) {
    const ratio = maxWidth / width
    width = maxWidth
    height = height * ratio
  }
  
  canvas.width = width
  canvas.height = height
  
  // Dibujar la imagen redimensionada
  ctx.drawImage(img, 0, 0, width, height)
  
  return canvas.toDataURL('image/png')
}

function saveData() {
  console.log(_FULL_DATA)
  localStorage.setItem('DATA', JSON.stringify(_FULL_DATA))
}

function start() {
  if (!_CONCEPT) {
    return console.error('NO se ha especificado un concepto, declare _CONCEPT en el html')
  }
  if (!_REDIRECT) {
    return console.error('NO se ha especificado una redirección, declare _REDIRECT en el html')
  }
  getDataReference()
  loadDataItem()
  inputsFunction()
  loadSelectOptions()
  loadNewOption()
}

function sortData(data, order, label) {
  if (!order || data.length === 0) return data
  
  return [...data].sort((a, b) => {
    const aVal = getLabelValue(a, label)
    const bVal = getLabelValue(b, label)
    
    if (!aVal || !bVal) return 0
    
    const aNum = Number(aVal)
    const bNum = Number(bVal)
    const isNumeric = !isNaN(aNum) && !isNaN(bNum)
    
    if (order.toLowerCase() === 'asc') {
      return isNumeric ? aNum - bNum : String(aVal).localeCompare(String(bVal))
    } else if (order.toLowerCase() === 'desc') {
      return isNumeric ? bNum - aNum : String(bVal).localeCompare(String(aVal))
    }
    return 0
  })
}

function submitForm(event) {
  event.preventDefault()
  const formData = new FormData($form)
  if (!$form.checkValidity()) {
    focusFirstInputInvalid()
    $form.classList.add('invalid')
    return
  }
  $form.classList.remove('invalid')
  const info = generateInfo(formData)
  info?.id ? updateData(info) : createData(info)
}

function updateData(info) {
  const index = _DATA.items.findIndex(item => item.id === info.id)
  _DATA.items[index] = info
  saveData()
  redirect()
}

function updateInput(key, value) {
  const $input = $(`[name="${key}"]`)
  if ($input) {
    $input.value = value
  }
  if (key === 'imagen' && value !== '') {
    const $previewImage = $('#preview_image')
    $previewImage.src = value
  }
  // Sí el valor es true y el $input es un checkbox
  if (value === true && $input.type === 'checkbox') {
    $input.checked = true
  }
}

$form.addEventListener('submit', event => submitForm(event), false)
window.addEventListener('load', start, false)