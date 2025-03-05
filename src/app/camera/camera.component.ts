import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraService } from './services/camera.service';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.css'
})
export class CameraComponent implements OnInit {
  cameraService: CameraService = inject(CameraService);
  
  imgUrl: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  savedPhotos: string[] = [];
  showGallery: boolean = false;

  ngOnInit() {
    this.loadSavedPhotos();
  }

  async loadSavedPhotos() {
    try {
      this.savedPhotos = await this.cameraService.getSavedPhotos();
    } catch (error) {
      console.error('Error al cargar fotos guardadas:', error);
      this.errorMessage = 'No se pudieron cargar las fotos guardadas';
    }
  }

  async takePictureFromCamera() {
    this.errorMessage = ''; // Limpiar mensajes de error anteriores
    
    try {
      this.loading = true;
      
      this.imgUrl = await this.cameraService.takePictureFromCamera();
      
      if (!this.imgUrl) {
        throw new Error('No se obtuvo una imagen válida');
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      this.loading = false;
    } catch (error) {
      console.error('Error al capturar imagen con cámara:', error);
      this.errorMessage = String(error);
      this.imgUrl = '';
      this.loading = false;
    }
  }

  async takePictureFromGallery() {
    this.errorMessage = ''; // Limpiar mensajes de error anteriores
    
    try {
      this.loading = true;
      
      this.imgUrl = await this.cameraService.takePictureFromGallery();
      
      if (!this.imgUrl) {
        throw new Error('No se obtuvo una imagen válida');
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      this.loading = false;
    } catch (error) {
      console.error('Error al seleccionar imagen de la galería:', error);
      this.errorMessage = String(error);
      this.imgUrl = '';
      this.loading = false;
    }
  }

  async savePhoto() {
    if (!this.imgUrl) {
      this.errorMessage = 'No hay foto para guardar';
      return;
    }

    try {
      this.loading = true;
      await this.cameraService.savePhoto(this.imgUrl);
      await this.loadSavedPhotos();
      this.loading = false;
      // Opcional: mostrar mensaje de éxito
    } catch (error) {
      console.error('Error al guardar la foto:', error);
      this.errorMessage = 'No se pudo guardar la foto';
      this.loading = false;
    }
  }

  selectPhoto(photoUrl: string) {
    this.imgUrl = photoUrl;
    this.showGallery = false;
  }

  async deletePhoto(index: number, event: Event) {
    event.stopPropagation(); // Evitar que se seleccione la foto al eliminarla
    
    try {
      this.loading = true;
      await this.cameraService.deletePhoto(index);
      await this.loadSavedPhotos();
      this.loading = false;
      
      // Si la foto actual fue eliminada, limpiar imgUrl
      if (this.imgUrl === this.savedPhotos[index]) {
        this.imgUrl = '';
      }
    } catch (error) {
      console.error('Error al eliminar la foto:', error);
      this.errorMessage = 'No se pudo eliminar la foto';
      this.loading = false;
    }
  }
}