import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollToTopService } from '../services/scroll-to-top.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'mocabits-billing-frontend';

  constructor(private scrollToTopService: ScrollToTopService) {}

  ngOnInit(): void {
    // Initialize global scroll-to-top behavior on route changes
    this.scrollToTopService.initialize();
  }
}
