import { Injectable, signal } from '@angular/core';

export type Language = 'en' | 'es' | 'fr' | 'de';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  currentLanguage = signal<Language>('en');

  private translations: Record<Language, Record<string, string>> = {
    en: {
      'nav.dashboard': 'Teller Dashboard',
      'nav.exchange': 'New Currency Exchange',
      'nav.remittance': 'New Remittance',
      'nav.onboarding': 'Customer Onboarding',
      'nav.manager_dash': 'Manager Dashboard',
      'nav.rates': 'Rate Management',
      'nav.compliance_dash': 'Compliance Dashboard',
      'nav.rbz': 'RBZ & EOD Status',
      'nav.users': 'User Management',
      'nav.audit': 'Audit Log',
      'nav.portal_home': 'Portal Home',
      'nav.portal_txns': 'My Transactions',
      
      'status.completed': 'Completed',
      'status.pending': 'Pending',
      'status.failed': 'Failed',
      'status.reversed': 'Reversed',
      'status.verified': 'Verified',
      'status.flagged': 'Flagged',
      'status.expired': 'Expired'
    },
    es: {
      'nav.dashboard': 'Tablero de Cajero',
      'nav.exchange': 'Nuevo Cambio',
      'nav.remittance': 'Nueva Remesa',
      'nav.onboarding': 'Registro de Cliente',
      'nav.manager_dash': 'Tablero de Gerente',
      'nav.rates': 'Gestión de Tasas',
      'nav.compliance_dash': 'Tablero de Cumplimiento',
      'nav.rbz': 'RBZ y Estado EOD',
      'nav.users': 'Gestión de Usuarios',
      'nav.audit': 'Registro de Auditoría',
      'nav.portal_home': 'Inicio del Portal',
      'nav.portal_txns': 'Mis Transacciones',
      
      'status.completed': 'Completado',
      'status.pending': 'Pendiente',
      'status.failed': 'Fallido',
      'status.reversed': 'Revertido',
      'status.verified': 'Verificado',
      'status.flagged': 'Marcado',
      'status.expired': 'Expirado'
    },
    fr: {
      'nav.dashboard': 'Tableau de bord Guichetier',
      'nav.exchange': 'Nouveau Change',
      'nav.remittance': 'Nouveau Transfert',
      'nav.onboarding': 'Enregistrement Client',
      'nav.manager_dash': 'Tableau de bord Manager',
      'nav.rates': 'Gestion des Taux',
      'nav.compliance_dash': 'Tableau de bord Conformité',
      'nav.rbz': 'RBZ & Statut EOD',
      'nav.users': 'Gestion des Utilisateurs',
      'nav.audit': 'Journal d\'Audit',
      'nav.portal_home': 'Accueil Portail',
      'nav.portal_txns': 'Mes Transactions',
      
      'status.completed': 'Terminé',
      'status.pending': 'En attente',
      'status.failed': 'Échoué',
      'status.reversed': 'Inversé',
      'status.verified': 'Vérifié',
      'status.flagged': 'Signalé',
      'status.expired': 'Expiré'
    },
    de: {
      'nav.dashboard': 'Kassierer-Dashboard',
      'nav.exchange': 'Neuer Geldwechsel',
      'nav.remittance': 'Neue Überweisung',
      'nav.onboarding': 'Kundenregistrierung',
      'nav.manager_dash': 'Manager-Dashboard',
      'nav.rates': 'Kursverwaltung',
      'nav.compliance_dash': 'Compliance-Dashboard',
      'nav.rbz': 'RBZ & EOD-Status',
      'nav.users': 'Benutzerverwaltung',
      'nav.audit': 'Audit-Protokoll',
      'nav.portal_home': 'Portal-Startseite',
      'nav.portal_txns': 'Meine Transaktionen',
      
      'status.completed': 'Abgeschlossen',
      'status.pending': 'Ausstehend',
      'status.failed': 'Fehlgeschlagen',
      'status.reversed': 'Storniert',
      'status.verified': 'Verifiziert',
      'status.flagged': 'Gekennzeichnet',
      'status.expired': 'Abgelaufen'
    }
  };

  setLanguage(lang: Language) {
    this.currentLanguage.set(lang);
  }

  translate(key: string): string {
    const lang = this.currentLanguage();
    return this.translations[lang]?.[key] || key;
  }
}
