import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, AuditLog } from '../../../core/services/state.service';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss',})
export class AuditLogComponent implements OnInit, OnDestroy {
  stateService = inject(StateService);

  searchQuery = '';
  selectedSeverity = 'ALL';
  autoRefresh = true;

  private refreshInterval: any;

  filteredLogs = computed(() => {
    let list = this.stateService.auditLogs();
    
    // Severity Filter
    if (this.selectedSeverity !== 'ALL') {
      list = list.filter(l => l.severity === this.selectedSeverity);
    }

    // Text Search
    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(l => 
        l.user.toLowerCase().includes(q) || 
        l.action.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
      );
    }

    // Sort descending by timestamp (newest first)
    return [...list].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  ngOnInit() {
    this.toggleAutoRefresh();
  }

  ngOnDestroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  toggleAutoRefresh() {
    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        // Periodically write a simulated system ping log to demonstrate live streaming
        const randAct = Math.random();
        if (randAct > 0.8) {
          const checkPair = Math.random() > 0.5 ? 'USD/ZWG' : 'GBP/ZWG';
          this.stateService.addAuditLog(`System health check: Connection to ${checkPair} rate feeds is active.`, 'INFO');
        }
      }, 5000);
    } else {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }
    }
  }

  exportLogs() {
    const csvContent = this.filteredLogs().map(l => 
      `"${l.id}","${l.timestamp}","${l.user}","${l.severity}","${l.action.replace(/"/g, '""')}","${l.ipAddress}"`
    ).join('\n');

    const header = `"Audit ID","Timestamp","Actor","Severity","Log Payload","Host IP"\n`;
    
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_trail_export_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.stateService.addAuditLog('System Admin executed CSV export of system audit logs.', 'CRITICAL');
  }
}
