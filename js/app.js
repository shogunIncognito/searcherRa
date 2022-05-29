const form = document.querySelector('#formulario');
const result = document.querySelector('#resultado');
const paginacionDiv = document.querySelector('#paginacion');
const registroPorPag = 40;
let totalPaginas;
let iterador;
let paginaActual = 1;


class DATA {

    //verifica si el valor ingresado esta vacio
    static validarDatos(e) {
        e.preventDefault();
        const valor = document.querySelector('#termino').value.trim();

        if (valor == '') {
            return UI.mostrarError('¡Hay campos vacios!');
        }

        //En caso de que no , se setea la pagina actual a 1 y se consulta la api
        paginaActual = 1;
        DATA.consultarApi();
    }

    static async consultarApi() {

        UI.mostrarSpinner();

        const valor = document.querySelector('#termino').value.trim();

        const apiKey = '27500608-828d1eb74aa8be21c5e124841';
        const url = `https://pixabay.com/api/?key=${apiKey}&q=${valor}&per_page=${registroPorPag}&page=${paginaActual}`

        try {
            const respuesta = await fetch(url);
            const resultado = await respuesta.json();

            if (resultado.hits.length < 1) {
                return UI.mostrarError('No se han encontrado fotos');
            }

            //se calcula las paginas para el paginador en base a la cantidad de resultados
            totalPaginas = DATA.calcularPaginas(resultado.totalHits);
            UI.mostrarImagen(resultado.hits);

        } catch (error) {
            UI.mostrarError('Error al consultar la api');
        }
    }

    static calcularPaginas(total) {
        return Math.ceil(total / registroPorPag)
    }

    //generador para el paginador
    static *crearPaginador(total) {
        for (let i = 1; i <= total; i++) {
            yield i;
        }
    }
}

class UI {

    static mostrarError(mensaje) {

        const existAlerta = document.querySelector('.bg-red-100');

        //Elimina los elementos que hayan en la caja de resultado
        UI.limpiarResultados();

        //Elimina el paginador
        UI.limpiarPaginador()

        //Comprueba si ya existe una alerta
        if (!existAlerta) {

            const alerta = document.createElement('p');
            alerta.classList.add('bg-red-100', 'border-red-400', 'text-red-700', 'px-4', 'py-3', 'rounded'
                , 'max-w-lg', 'mx-auto', 'mt-6', 'text-center')

            alerta.innerHTML = `
                <strong class="font-bold">Error!</strong>
                <span class="block sm:inline">${mensaje}</span>
            `;

            result.appendChild(alerta)

            setTimeout(() => {
                alerta.remove()
            }, 3000)

        }

    }

    static mostrarImagen(img) {

        //elimina los resultados previos
        UI.limpiarResultados();

        img.forEach(imag => {

            const { previewURL, likes, views, largeImageURL } = imag;
            const div = document.createElement('div')
            div.className = 'w-1/2 md:w-1/3 lg:w-1/4 p-3 mb-4'

            div.innerHTML = `
                <div class="bg-white">
                    <img class="w-full foto" src="${previewURL}">

                    <div class="p-4">
                        <p>${likes} <span>Me gusta</span></p>
                        <p>${views} <span>Vistas</span></p>
                        <a href="${largeImageURL}" class="block w-full bg-blue-800 hover:bg-blue-500 
                        text-white uppercase font-bold text-center rounded mt-5 p-1" target="_blank" rel="noopener noreferrer">
                            <span>Ver imagen</span>
                        </a>
                    </div>
                </div>
            `
            result.appendChild(div)
        })

        //limpia el html del paginador y muestra el nuevo
        UI.limpiarPaginador()
        UI.mostrarPaginacion()
    }

    static mostrarPaginacion() {

        iterador = DATA.crearPaginador(totalPaginas);

        while (true) {
            const { value, done } = iterador.next();
            //comprueba si el iterador ya termino de crear la paginacion
            if (done) return;

            //en caso contrario
            const boton = document.createElement('button');
            boton.dataset.pagina = value;
            boton.textContent = value;
            boton.className = 'siguiente mx-auto bg-yellow-400 px-4 py-1 mr-2 font-bold mb-4 rounded'

            if (boton.textContent == paginaActual) {

                boton.disabled = true;
                boton.classList.remove('bg-yellow-400');
                boton.classList.add('bg-yellow-600');

            }

            //cambia de pagina al igual que los resultados
            boton.onclick = () => {
                paginaActual = value;
                DATA.consultarApi()
            }

            paginacionDiv.appendChild(boton)
        }
    }

    static mostrarSpinner() {

        result.innerHTML = `
            <div class="spinner"></div>
        `;

        UI.limpiarPaginador()
    }

    static limpiarPaginador() {
        while (paginacionDiv.firstChild) {
            paginacionDiv.removeChild(paginacionDiv.firstChild)
        }
    }

    static limpiarResultados() {
        while (result.firstChild) {
            result.removeChild(result.firstChild)
        }
    }
}

//Unico evento, el boton
form.addEventListener('submit', DATA.validarDatos)
