import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',})
export class SettingsComponent {
  stateService = inject(StateService);

  activeTab = signal<'general' | 'interest' | 'audit'>('general');

  // Profile
  instName = 'Central Capital Finance';
  instCurrency = 'USD';
  instLang = 'en';

  // Rules
  penaltyRate = 2.5;
  gracePeriod = 7;
  interestMethod = 'declining';

  saveSettings() {
    this.stateService.addAuditLog('Updated global institutional policy rules/profile settings');
    alert('Settings committed and applied globally to underwriting engine.');
  }
}
