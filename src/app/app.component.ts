import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranscriptionComponent } from "./transcription/transcription.component";
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TranscriptionComponent],
  template: `<app-transcription></app-transcription>`,
})
export class AppComponent {}