const $body = document.querySelector('body');
const _DATA = {
  "movimientos" : [
    {
      "concepto" : "Comida",
      "fecha_de_movimiento" : "2021-01-01",
      "fecha" : "2021-01-01",
      "forma_de_pago" : "Efectivo",
      "id" : 1,
      "monto" : 1100.50,
      "tienda": "Oxxo"
    }
  ],
  "tiendas"  : [
    {
      "id" : 1,
      "nombre" : "Oxxo",
      "imagen": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQk8Kna7ypx-hRHawKp6WagkJ8pYzOJhqFVTg&s"
    }
  ]
}

console.log(`
  getData() : Obtiene los movimientos
  addItem(concept, values) : Agrega un nuevo elemento a _DATA según el concepto
  renderTable(concept) : Renderiza una tabla con los elementos de _DATA según el concepto
`)

/**
 * OBETENER ELEMENTO.    
 * Obtiene los elementos de _DATA según el concepto
 * @param {string} concept - Concepto que se va a obtener de _DATA
 */
function getData(concept) {
  console.clear()
  !_DATA[concept]
    ? console.table(_DATA)
    : console.table(_DATA[concept])
}

/**
 * AGREGAR ELEMENTO.   
 * Agrega un nuevo elemento a _DATA según el concepto
 * @param {string} concept - Concepto que se va a agregar a _DATA
 * @param {*} values - Objeto a insertar en _DATA[concept]
 */
function addItem(concept, values) {
  if (!_DATA[concept]) {
    return console.error(`⚠ No existe el concepto: ${concept}.`);
  }

  if (!values) {
    return console.error(`⚠ No se recibieron valores para agregar en: ${concept}.`);
  }

  values.id ? updateItem(concept, values) : createItem(concept, values);
}

/**
 * CREAR ELEMENTO.   
 * Crea un nuevo elemento en _DATA según el concepto, genera el id en base a la longitud del    
 * arreglo del concepto y agrega el objeto a _DATA[concept]
 * @param {string} concept - Concepto que se va a agregar a _DATA
 * @param {*} values - Objeto a insertar en _DATA[concept]
 */
function createItem(concept, values) {
  values.id = _DATA[concept].length + 1;
  _DATA[concept].push(values);
  getData(concept);
}

/**
 * ACTUALIZAR ELEMENTO.    
 * Actualiza un elemento en _DATA según el concepto y el id del objeto a actualizar
 * @param {string} concept - Concepto que se va a actualizar en _DATA
 * @param {*} values - Objeto a actualizar en _DATA[concept]
 */
function updateItem(concept, values) {
  _DATA[concept] = _DATA[concept].map(item => item.id === values.id ? values : item)
  getData(concept)
}
