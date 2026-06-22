const $ = selector => document.querySelector(selector)
const $form = $('form')
let _DATA = null
let _FULL_DATA = null
let $previewImage = null

function addDefaultValues(info) {
  info.creador = 'etxu00'
  info.fecha_creacion = getDate()
  return info
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
  for (const [key, value] of formData.entries()) {
    const _value = parseValue(value)
    info[key] = _value
    info[key.toLowerCase()] = _value
  }
  addDefaultValues(info)
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

function inputsFunction() {
  const $inputPreview = $('#input_preview')
  const $inputImage = $('#input_image')
  const $inputImageLink = $('#input_image_link')

  if ($inputImage) {
    $previewImage = $inputImage
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
    console.log(item)
    if (item) {
      for (const [key, value] of Object.entries(item)) {
        updateInput(key, value)
      }
    }
  }
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
    $previewImage.src = event.target.result
    $inputImage.value = event.target.result
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
      .then(response => $previewImage.src = imgOk ? urlImage : imgError)
      .catch(error => $previewImage.src = imgError)
  }
  // Convierte la imagen en base64 y la pinta en el input hidden
  debugger
  if (!imgOk) {
    return false
  }
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()
  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    $inputImage.value = canvas.toDataURL('image/png')
  }
  img.src = urlImage
}

function redirect() {
  window.location.href = `/${_REDIRECT}.html`
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
}

function submitForm(event) {
  event.preventDefault()
  const formData = new FormData($form)
  if (!$form.checkValidity()) {
    focusFirstInputInvalid()
    return
  }
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