import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../core/services/state.service';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './integrations.component.html',
  styleUrl: './integrations.component.scss'
})
export class IntegrationsComponent {
  stateService = inject(StateService);

  toggleConnection(id: string, newStatus: 'Connected' | 'Disconnected') {
    this.stateService.integrations.update(items => {
      return items.map(item => {
        if (item.id === id) {
          this.stateService.addAuditLog(`Updated gateway integration ${item.name} connection status to ${newStatus}`);
          return {
            ...item,
            status: newStatus,
            latencyMs: newStatus === 'Connected' ? Math.floor(Math.random() * 80) + 20 : 0
          };
        }
        return item;
      });
    });
  }
}
