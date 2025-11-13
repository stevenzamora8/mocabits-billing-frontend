import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-receipts-create',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipts-create.component.html',
  styleUrls: ['./receipts-create.component.css']
})
export class ReceiptsCreateComponent {
  constructor() {}
}
