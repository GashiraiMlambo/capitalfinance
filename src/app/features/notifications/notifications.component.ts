import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',})
export class NotificationsComponent {
  stateService = inject(StateService);

  activeTab = signal<'log' | 'broadcast'>('log');

  // Broadcast campaign form variables
  bTitle = '';
  bType = 'system';
  bBody = '';

  dispatchBroadcast() {
    if (!this.bTitle || !this.bBody) return;

    this.stateService.notifications.update(prev => [
      {
        id: `N-${Date.now().toString().slice(-4)}`,
        title: this.bTitle,
        body: this.bBody,
        type: this.bType as any,
        date: new Date().toISOString(),
        read: false
      },
      ...prev
    ]);

    this.stateService.addAuditLog(`Broadcasted institutional message: ${this.bTitle}`);

    // Reset Form
    this.bTitle = '';
    this.bBody = '';
    this.activeTab.set('log');
  }
}
