import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-form-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-section.component.html',
  styleUrls: ['./form-section.component.css']
})
export class UiFormSectionComponent {
  @Input() extraClass: string = '';
}
