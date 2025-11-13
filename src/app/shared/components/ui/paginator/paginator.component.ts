import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'ui-paginator',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.css']
})
export class UiPaginatorComponent {
  @Input() totalElements: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() currentPage: number = 0; // 0-based index
  @Input() maxVisiblePages: number = 5;

  @Output() pageChange = new EventEmitter<number>(); // emits 0-based page index

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalElements / this.itemsPerPage));
  }

  goTo(index: number) {
    if (index >= 0 && index < this.totalPages && index !== this.currentPage) {
      this.pageChange.emit(index);
    }
  }

  previous() {
    if (this.currentPage > 0) this.goTo(this.currentPage - 1);
  }

  next() {
    if (this.currentPage < this.totalPages - 1) this.goTo(this.currentPage + 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = this.maxVisiblePages || 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(0, this.currentPage - half);
    let end = Math.min(this.totalPages - 1, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(0, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  displayRangeStart(): number {
    return this.totalElements === 0 ? 0 : (this.currentPage * this.itemsPerPage) + 1;
  }

  displayRangeEnd(): number {
    return Math.min((this.currentPage + 1) * this.itemsPerPage, this.totalElements);
  }
}
