// Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register('./sw.js')
    .then(res => console.log("SW ok", res))
    .catch(err => console.log("SW error", err));
}

new Vue({
  el: '#appPeliculas',
  vuetify: new Vuetify(),
  data() {
    return {
      dialogContentClass: 'dialog-content',
      dialogoDetallesVisible: false,
      peliculaSeleccionada: null,
      mostrarModal: false,
      drawer: false,
      pageTitulo: 'RaVar Películas',
      categorias: [
        { id: 0, name: 'Todo', icon: 'mdi-format-list-bulleted' },
        { id: 1, name: 'Acción', icon: 'mdi-fire' },
        { id: 2, name: 'Drama', icon: 'mdi-drama-masks' },
        { id: 3, name: 'Suspenso', icon: 'mdi-alert-circle-outline' },
        { id: 4, name: 'Comedia', icon: 'mdi-emoticon-outline' },
      ],
      peliculas: [],
      carrito: [],
      peliculasFiltradas: [],
      categoriaSeleccionada: null,
      filtroNombre: '',
    };
  },
  mounted() {
    this.fetchPeliculas();
  },
  methods: {
    fetchPeliculas() {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmMmRiZThmNGQ5YzM3YmQxMmM2YmJkYTZlNDQ4ODhiNyIsInN1YiI6IjY0OTVmNDNiOWEzNThkMDBjNTY4OWRmOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.cJhPW8m3I5m-jQHekpRvoYGggmLZvz7typL28fD-Q9g'
        }
      };

      fetch('https://api.themoviedb.org/3/movie/popular?language=en-US&page=1', options)
        .then(response => response.json())
        .then(data => {
          this.peliculas = data.results.map(pelicula => ({
            id: pelicula.id,
            titulo: pelicula.title,
            precio: pelicula.vote_average,
            año: pelicula.release_date.substring(0, 4),
            genero: this.getGenreName(pelicula.genre_ids),
            portada: 'https://image.tmdb.org/t/p/w500' + pelicula.poster_path,
            favorito: this.isFavorito(pelicula) 
          }));

          this.categoriaSeleccionada = this.categorias[0];
          this.filtrarPeliculas(this.categoriaSeleccionada);
        })
        .catch(error => {
          console.error('Error fetching peliculas:', error);
        });
    },
    getGenreName(genreIds) {
      const genreNames = {
        28: 'Acción',
        80: 'Crimen',
        18: 'Drama',
        53: 'Suspenso',
        35: 'Comedia'
      };

      const genreNameList = genreIds.map(id => genreNames[id]);
      return genreNameList.join(' ');
    },
    addCarrito(pelicula) {
      this.carrito.push({
        id: pelicula.id,
        titulo: pelicula.titulo,
        precio: pelicula.precio
      });
    },
    toggleFavorito(pelicula) {
      pelicula.favorito = !pelicula.favorito;
      pelicula.color = pelicula.favorito ? 'white' : 'red';
      const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
      const index = favoritos.findIndex(item => item.id === pelicula.id);
    
      if (index !== -1) {
        favoritos.splice(index, 1);
      } else {
        favoritos.push(pelicula);
      }
    
      localStorage.setItem('favoritos', JSON.stringify(favoritos));
    },
    isFavorito(pelicula) {
      
      const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
      return favoritos.some(item => item.id === pelicula.id);
    },
    precioTotal() {
      let total = 0;
      for (let item of this.carrito) {
        total += parseFloat(item.precio);
      }
      return total.toFixed(2);
    },
    filtrarPeliculas(categoria) {
      if (categoria.id === 0) {
        this.peliculasFiltradas = this.peliculas.filter(pelicula =>
          pelicula.titulo.toLowerCase().includes(this.filtroNombre.toLowerCase())
        );
      } else {
        this.peliculasFiltradas = this.peliculas.filter(pelicula =>
          pelicula.genero.includes(categoria.name) &&
          pelicula.titulo.toLowerCase().includes(this.filtroNombre.toLowerCase())
        );
      }
    },
    verDetalles(pelicula) {
      this.peliculaSeleccionada = pelicula;
      this.dialogoDetallesVisible = true;
    },
    cerrarModal() {
      this.dialogoDetallesVisible = false;
      this.dialogContentClass = 'dialog-content';
      this.peliculaSeleccionada = null;
    },
    toggleDialogBackdrop(visible) {
      this.dialogContentClass = visible ? 'dialog-content' : 'dialog-content no-backdrop';
    }
  },
  watch: {
    categoriaSeleccionada() {
      this.filtrarPeliculas(this.categoriaSeleccionada);
    },
    filtroNombre() {
      this.filtrarPeliculas(this.categoriaSeleccionada);
    },
  },
});
