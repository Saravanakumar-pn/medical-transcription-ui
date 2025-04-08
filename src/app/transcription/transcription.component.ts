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

  startRecording() {
    this.transcript = null;
    this.audioChunks = [];

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.start();
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        this.isLoading = true;
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
   
    const formData = new FormData();
    formData.append('AudioFile', blob, 'recorded_audio.mp3');

    this.http.post<{transcript: string}>('https://localhost:44355/api/transcription/transcribe', formData)
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
