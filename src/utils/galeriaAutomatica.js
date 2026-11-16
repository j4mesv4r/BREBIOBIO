// Escanea automáticamente TODAS las imágenes que pongas en src/assets/terreno/ sin importar su nombre
const modulosImagenes = import.meta.glob(
  '../assets/terreno/*.{png,jpg,jpeg,webp,JPG,JPEG,PNG}',
  {
    eager: true,
    import: 'default',
  }
);

export const fotosTerreno = Object.values(modulosImagenes);

