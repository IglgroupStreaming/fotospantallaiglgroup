// storage.js - Sistema de almacenamiento local para fotos

class PhotoStorage {
    constructor() {
        this.STORAGE_KEY = 'photos_gallery';
        this.init();
    }

    // Inicializar almacenamiento
    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
        }
    }

    // Obtener todas las fotos
    getAllPhotos() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    }

    // Guardar fotos
    savePhotos(photos) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(photos));
        this.dispatchUpdateEvent();
    }

    // Agregar nueva foto
    addPhoto(file, description = '') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const photos = this.getAllPhotos();
                const newPhoto = {
                    id: Date.now(),
                    url: e.target.result,
                    description: description,
                    estado: 'pendiente',
                    fecha: Date.now(),
                    nombre: file.name,
                    tamaño: file.size
                };
                
                photos.push(newPhoto);
                this.savePhotos(photos);
                resolve(newPhoto);
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Actualizar estado de una foto
    updatePhotoStatus(photoId, status) {
        const photos = this.getAllPhotos();
        const index = photos.findIndex(p => p.id == photoId);
        
        if (index !== -1) {
            photos[index].estado = status;
            photos[index].fechaModeracion = Date.now();
            this.savePhotos(photos);
            return true;
        }
        return false;
    }

    // Eliminar foto
    deletePhoto(photoId) {
        let photos = this.getAllPhotos();
        photos = photos.filter(p => p.id != photoId);
        this.savePhotos(photos);
    }

    // Obtener fotos por estado
    getPhotosByStatus(status) {
        const photos = this.getAllPhotos();
        return photos.filter(p => p.estado === status);
    }

    // Obtener última foto aprobada
    getLastApprovedPhoto() {
        const photos = this.getAllPhotos();
        const approved = photos.filter(p => p.estado === 'aprobada');
        approved.sort((a, b) => b.fecha - a.fecha);
        return approved[0] || null;
    }

    // Obtener estadísticas
    getStats() {
        const photos = this.getAllPhotos();
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        return {
            total: photos.length,
            pendientes: photos.filter(p => p.estado === 'pendiente').length,
            aprobadas: photos.filter(p => p.estado === 'aprobada').length,
            rechazadas: photos.filter(p => p.estado === 'rechazada').length,
            aprobadasHoy: photos.filter(p => p.estado === 'aprobada' && p.fecha >= hoy.getTime()).length
        };
    }

    // Evento para notificar cambios en tiempo real
    dispatchUpdateEvent() {
        window.dispatchEvent(new CustomEvent('photosUpdated'));
    }

    // Suscribirse a cambios
    onUpdate(callback) {
        window.addEventListener('photosUpdated', callback);
        return () => window.removeEventListener('photosUpdated', callback);
    }
}

// Crear instancia global
const photoStorage = new PhotoStorage();