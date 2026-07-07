import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',})
export class ReportsComponent {
  stateService = inject(StateService);

  showToast = signal<boolean>(false);
  currentReportName = signal<string>('');
  exportFormat = signal<string>('');

  simulateExport(reportName: string, format: string) {
    this.currentReportName.set(reportName);
    this.exportFormat.set(format);
    this.showToast.set(true);

    this.stateService.addAuditLog(`Generated report compilation request: ${reportName} (${format})`);

    setTimeout(() => {
      this.showToast.set(false);
      alert(`Report download completed successfully. Check your browser downloads folder for the simulated "${reportName}.${format.toLowerCase() === 'pdf' ? 'pdf' : 'csv'}" file.`);
    }, 2500);
  }
}
