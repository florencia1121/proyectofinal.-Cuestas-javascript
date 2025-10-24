
let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];


async function cargarProductos() {
    try {
        const res = await fetch('data/products.json');
        productos = await res.json();
    } catch (e) {
    
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los productos. Intenta recargar la página.',
        });
        productos = [];
    }
}


function mostrarProductos() {
    const cont = document.getElementById('productos');
    cont.innerHTML = '<h3>Productos disponibles</h3>';
    const row = document.createElement('div');
    row.className = 'row';
    productos.forEach(p => {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4 mb-3';
        col.innerHTML = `
            <div class="card h-100">
                <img src="${p.imagen || 'https://via.placeholder.com/300x200'}" class="card-img-top" alt="${p.nombre}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${p.nombre}</h5>
                    <p class="card-text small text-muted">${p.descripcion || ''}</p>
                    <div class="mt-auto d-flex justify-content-between align-items-center">
                        <div><strong>$${p.precio}</strong></div>
                        <div>
                            <input type="number" min="1" value="1" class="form-control d-inline w-50 me-2" data-qty="${p.id}">
                            <button class="btn btn-success" data-add="${p.id}">Agregar</button>
                        </div>
                    </div>
                </div>
            </div>`;
        row.appendChild(col);
    });
    cont.appendChild(row);
}

function agregarProducto(id) {
    const input = document.querySelector(`input[data-qty="${id}"]`);
    const qty = input ? Number(input.value) : 1;
    const producto = productos.find(p => p.id === id);
    if (!producto || qty <= 0) return;

    const existente = carrito.find(item => item.id === id);
    if (existente) {
        existente.cantidad += qty;
    } else {
        carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: qty });
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
    
    Swal.fire({
        icon: 'success',
        title: 'Producto agregado',
        text: `${producto.nombre} x${qty} agregado al carrito`,
        timer: 1200,
        showConfirmButton: false
    });
}

function mostrarCarrito() {
    const cont = document.getElementById('carrito');
    cont.innerHTML = '<h3>Tu carrito</h3>';
    if (carrito.length === 0) {
        cont.innerHTML += '<p>El carrito está vacío.</p>';
        document.getElementById('finalizar').disabled = true;
        return;
    }
    let html = '<ul class="list-group mb-2">';
    carrito.forEach((it, i) => {
        const subtotal = it.precio * it.cantidad;
        html += `<li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <strong>${it.nombre}</strong><br>
                $${it.precio} x ${it.cantidad} = $${subtotal}
            </div>
            <div>
                <button class="btn btn-sm btn-outline-secondary me-1" data-decrease="${i}">-</button>
                <button class="btn btn-sm btn-outline-secondary me-1" data-increase="${i}">+</button>
                <button class="btn btn-sm btn-danger" data-remove="${i}">Quitar</button>
            </div>
        </li>`;
    });
    html += '</ul>';
    const total = carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
    html += `<div id="total"><strong>Total:</strong> $${total}</div>`;
    cont.innerHTML = html;
    document.getElementById('finalizar').disabled = false;
}

function quitarProducto(index) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
}

function aumentarCantidad(index) {
    carrito[index].cantidad += 1;
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
}

function disminuirCantidad(index) {
    carrito[index].cantidad -= 1;
    if (carrito[index].cantidad <= 0) {
        quitarProducto(index);
        return;
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
}

async function finalizarCompra() {
    if (carrito.length === 0) {
        Swal.fire('Carrito vacío', 'Agrega productos antes de finalizar.', 'info');
        return;
    }

    
    document.getElementById('nombre').value = 'Florencia';
    document.getElementById('email').value = 'flor@gmail.com';
    document.getElementById('direccion').value = 'Taylor 5516';

    
    const total = carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
    
    let resumenHtml = '<ul class="resumen-list">';
    carrito.forEach(it => {
        resumenHtml += `<li>${it.nombre} x${it.cantidad} - $${it.precio * it.cantidad}</li>`;
    });
    resumenHtml += `</ul><p><strong>Total: $${total}</strong></p>`;

    const { value: confirm } = await Swal.fire({
        title: 'Confirmar compra',
        html: resumenHtml + '<br>Completa los datos en el formulario a la derecha.',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Volver'
    });

    if (confirm) {
        
        Swal.fire({
            title: 'Compra procesada',
            icon: 'success',
            text: 'Tu pedido fue procesado correctamente.',
            timer: 1400,
            showConfirmButton: false
        });
        
        carrito = [];
        localStorage.setItem('carrito', JSON.stringify(carrito));
        mostrarCarrito();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarProductos();
    mostrarProductos();
    mostrarCarrito();

    document.getElementById('productos').addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.add) {
            agregarProducto(Number(e.target.dataset.add));
        }
    });

    document.getElementById('carrito').addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON') {
            if (e.target.dataset.remove) quitarProducto(Number(e.target.dataset.remove));
            else if (e.target.dataset.increase) aumentarCantidad(Number(e.target.dataset.increase));
            else if (e.target.dataset.decrease) disminuirCantidad(Number(e.target.dataset.decrease));
        }
    });

    document.getElementById('finalizar').addEventListener('click', finalizarCompra);
});
