import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-transcription',
  imports: [NgIf],
  templateUrl: './transcription.component.html',
  styleUrl: './transcription.component.css'
})
export class TranscriptionComponent {
private mediaRecorder!: MediaRecorder;
  private audioChunks: Blob[] = [];
  transcript: string | null = null;
  isRecording = false;
  audioURL: string | null = null;
  isLoading = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.audioURL = URL.createObjectURL(file);
      this.uploadAndTranscribe(file);
    }
  }

  uploadAndTranscribe(file: File) {
    this.isLoading = true;
    const formData = new FormData();
    formData.append('AudioFile', file);
    // formData.append('transcript', ''); // optional if you still need to send this
  
    this.http.post<any>('https://localhost:44355/api/SOAPNote/transcribe-and-generate', formData,)
      .subscribe({
        next: (res) => {
          debugger;
          this.transcript = res.transcript; // adjust based on your API's return shape
          this.isLoading = false;
         // this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Upload failed', err);
          this.isLoading = false;
        }
      });
  }
  startRecording() {
    this.transcript = null;
    this.audioChunks = [];
    this.isLoading = true;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.start();
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {       
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
        this.audioURL = URL.createObjectURL(audioBlob);
        this.sendToBackend(audioBlob);
     
      };
    }).catch(error => {
      console.error('Microphone access denied:', error);
    });
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  sendToBackend(blob: Blob) {

    this.isLoading = true;   
    const formData = new FormData();
    formData.append('AudioFile', blob, 'recorded_audio.mp3');
    // formData.append('transcript', ''); 
    this.http.post<any>('https://localhost:44355/api/SOAPNote/transcribe-and-generate', formData)
    .subscribe({
      next: res => {
        debugger;
        this.transcript = res.transcript;    
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Transcription failed:', err);
        this.isLoading = false;
      }
      });
  }
}
