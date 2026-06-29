import { Component, signal, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { ThemeService } from '../../core/services/theme.service';
import { TranslationService, Language } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { filter } from 'rxjs/operators';

interface MenuItem {
  title: string;
  translateKey: string;
  path: string;
  icon: string;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'danger' | 'info';
  category: 'core' | 'operations' | 'management' | 'system';
}

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, FormsModule],
  template: `
    <div class="portal-container" [class.sidebar-collapsed]="isSidebarCollapsed()">
      <!-- SIDEBAR -->
      <aside class="portal-sidebar">
        <div class="sidebar-brand">
          <div class="brand-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#brand-grad)" />
              <path d="M10 22V10L16 16L22 10V22" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="brand-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#3B38FF" />
                  <stop offset="1" stop-color="#0F0CE8" />
                </linearGradient>
              </defs>
            </svg>
            <span class="brand-name" *ngIf="!isSidebarCollapsed()">Capital Finance</span>
          </div>
          <button class="btn-sidebar-toggle" (click)="toggleSidebar()">
            <svg *ngIf="!isSidebarCollapsed()" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            <svg *ngIf="isSidebarCollapsed()" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <!-- Sidebar Navigation Search -->
        <div class="sidebar-search" *ngIf="!isSidebarCollapsed()">
          <div class="search-input-wrapper">
            <svg class="search-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              type="text" 
              placeholder="Search menu..." 
              (input)="updateMenuSearch($event)" 
              [value]="menuSearchTerm()"
            />
          </div>
        </div>

        <!-- Sidebar Menu Items -->
        <nav class="sidebar-nav">
          <div *ngFor="let cat of categories">
            <div class="nav-category-header" *ngIf="!isSidebarCollapsed() && getFilteredItemsByCategory(cat.id).length > 0">
              {{ cat.label }}
            </div>
            
            <a 
              *ngFor="let item of getFilteredItemsByCategory(cat.id)" 
              [routerLink]="item.path" 
              routerLinkActive="active-link"
              class="nav-item"
              [title]="item.title"
            >
              <span class="nav-item-icon" [innerHTML]="item.icon"></span>
              <span class="nav-item-title" *ngIf="!isSidebarCollapsed()">{{ item.translateKey | translate }}</span>
              <span 
                *ngIf="!isSidebarCollapsed() && item.badge" 
                class="nav-item-badge" 
                [class]="'badge-' + item.badgeType"
              >
                {{ item.badge }}
              </span>
            </a>
          </div>
        </nav>

        <div class="sidebar-footer" *ngIf="!isSidebarCollapsed()">
          <div class="user-brief">
            <div class="user-avatar-placeholder">
              {{ (stateService.currentUser()?.name || 'U')[0] }}
            </div>
            <div class="user-info">
              <span class="name">{{ stateService.currentUser()?.name }}</span>
              <span class="role">{{ stateService.currentUser()?.role }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTAINER -->
      <div class="portal-main">
        <!-- TOP NAVIGATION -->
        <header class="portal-header">
          <!-- Global Search -->
          <div class="header-left">
            <div class="global-search-wrapper">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input 
                type="text" 
                placeholder="Search customers, loans, transactions..." 
                [(ngModel)]="globalSearchQuery"
                (keyup.enter)="triggerGlobalSearch()"
              />
            </div>
          </div>

          <!-- Quick Actions & Switches -->
          <div class="header-right">
            <!-- Language Switcher -->
            <div class="dropdown-wrapper">
              <button class="header-action-btn" (click)="toggleLanguageDropdown()">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                <span class="lang-code">{{ translationService.currentLanguage() | uppercase }}</span>
              </button>
              
              <div class="header-dropdown lang-dropdown" *ngIf="showLanguageDropdown()">
                <div class="dropdown-header">Select Language</div>
                <button class="dropdown-item" (click)="setLang('en')">English (EN)</button>
                <button class="dropdown-item" (click)="setLang('es')">Español (ES)</button>
                <button class="dropdown-item" (click)="setLang('fr')">Français (FR)</button>
                <button class="dropdown-item" (click)="setLang('de')">Deutsch (DE)</button>
              </div>
            </div>

            <!-- Theme Toggle -->
            <button class="header-action-btn" (click)="themeService.toggleTheme()" title="Toggle Theme">
              <!-- Sun Icon -->
              <svg *ngIf="themeService.isDarkMode()" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              <!-- Moon Icon -->
              <svg *ngIf="!themeService.isDarkMode()" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            </button>

            <!-- Tasks / Workflows Count -->
            <button class="header-action-btn" (click)="navigateTo('/portal/workflows')" title="Pending Tasks">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
              <span class="btn-badge badge-warning" *ngIf="pendingWorkflowsCount() > 0">{{ pendingWorkflowsCount() }}</span>
            </button>

            <!-- Notifications Center -->
            <div class="dropdown-wrapper">
              <button class="header-action-btn" (click)="toggleNotifications()" title="Notifications">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                <span class="btn-badge badge-danger" *ngIf="unreadNotificationsCount() > 0">{{ unreadNotificationsCount() }}</span>
              </button>

              <div class="header-dropdown notification-dropdown" *ngIf="showNotificationsDropdown()">
                <div class="dropdown-header">
                  <span>Notifications</span>
                  <button class="btn-text-action" (click)="markAllNotificationsRead()">Mark all as read</button>
                </div>
                <div class="dropdown-body">
                  <div class="notification-item" *ngFor="let note of stateService.notifications()" [class.unread]="!note.read">
                    <span class="indicator" [class]="note.type"></span>
                    <div class="content">
                      <p class="title">{{ note.title }}</p>
                      <p class="body">{{ note.body }}</p>
                      <span class="time">{{ note.date | date:'shortTime' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Profile Menu -->
            <div class="dropdown-wrapper">
              <button class="profile-trigger" (click)="toggleProfileDropdown()">
                <div class="user-avatar-placeholder">
                  {{ (stateService.currentUser()?.name || 'U')[0] }}
                </div>
                <span class="profile-name">{{ stateService.currentUser()?.name }}</span>
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
              </button>

              <div class="header-dropdown profile-dropdown" *ngIf="showProfileDropdown()">
                <div class="profile-user-info">
                  <p class="name">{{ stateService.currentUser()?.name }}</p>
                  <p class="email">{{ stateService.currentUser()?.email }}</p>
                </div>
                <div class="divider"></div>
                <button class="dropdown-item" (click)="navigateTo('/portal/settings')">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="mr-2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  Institution Settings
                </button>
                <div class="divider"></div>
                <button class="dropdown-item text-danger" (click)="logout()">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="mr-2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- MAIN BREADCRUMB & CONTENT -->
        <main class="content-wrapper">
          <div class="breadcrumb-container">
            <span class="parent">Capital Finance</span>
            <span class="sep">/</span>
            <span class="current">{{ activePageTitle() }}</span>
          </div>

          <div class="view-content">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .portal-container {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-base);
    }

    // Sidebar Styles
    .portal-sidebar {
      width: 260px;
      background-color: var(--bg-sidebar);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      color: rgba(255, 255, 255, 0.8);
      box-shadow: 4px 0 20px rgba(0,0,0,0.15);
      z-index: 100;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .portal-container.sidebar-collapsed .portal-sidebar {
      width: 70px;
    }

    .sidebar-brand {
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);

      .brand-logo {
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'Outfit', sans-serif;
        font-weight: 700;
        font-size: 18px;
        color: white;
      }

      .btn-sidebar-toggle {
        background: transparent;
        border: none;
        color: white;
        opacity: 0.6;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        
        &:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }

    .sidebar-search {
      padding: 12px 16px;

      .search-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;

        .search-icon {
          position: absolute;
          left: 10px;
          color: rgba(255, 255, 255, 0.4);
        }

        input {
          width: 100%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          padding: 8px 12px 8px 32px;
          color: white;
          outline: none;
          font-size: 13px;
          
          &:focus {
            border-color: rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.1);
          }
        }
      }
    }

    .sidebar-nav {
      flex-grow: 1;
      overflow-y: auto;
      padding: 12px 8px;

      .nav-category-header {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(255, 255, 255, 0.4);
        padding: 12px 12px 6px 12px;
        font-family: 'Outfit', sans-serif;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        border-radius: var(--radius-md);
        margin-bottom: 2px;
        font-size: 13.5px;
        transition: all 0.2s;
        cursor: pointer;

        .nav-item-icon {
          display: flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.6);
        }

        .nav-item-title {
          flex-grow: 1;
        }

        .nav-item-badge {
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 9999px;
          
          &.badge-success { background: var(--success); color: white; }
          &.badge-warning { background: var(--warning); color: var(--text-inverse); }
          &.badge-danger { background: var(--danger); color: white; }
          &.badge-info { background: var(--info); color: white; }
        }

        &:hover {
          color: white;
          background-color: var(--bg-sidebar-hover);
          .nav-item-icon { color: white; }
        }

        &.active-link {
          color: white;
          background-color: var(--bg-sidebar-active);
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(15, 12, 232, 0.25);
          .nav-item-icon { color: white; }
        }
      }
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);

      .user-brief {
        display: flex;
        align-items: center;
        gap: 12px;

        .user-avatar-placeholder {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          
          .name {
            font-size: 13px;
            font-weight: 600;
            color: white;
          }
          .role {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.5);
          }
        }
      }
    }

    // Portal Main Panel
    .portal-main {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    // Top Navigation Header
    .portal-header {
      height: 70px;
      background-color: var(--bg-surface);
      border-bottom: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      flex-shrink: 0;
      transition: background-color 0.3s, border-color 0.3s;

      .global-search-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        width: 320px;

        svg {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }

        input {
          width: 100%;
          background: var(--bg-base);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 8px 12px 8px 38px;
          color: var(--text-main);
          font-size: 13.5px;
          outline: none;
          transition: border-color 0.2s, background-color 0.2s;

          &:focus {
            border-color: var(--primary);
            background: var(--bg-surface);
          }
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .header-action-btn {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: background-color 0.2s, color 0.2s;

      &:hover {
        background-color: var(--border-light);
        color: var(--text-main);
      }

      .btn-badge {
        position: absolute;
        top: 6px;
        right: 6px;
        min-width: 16px;
        height: 16px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 700;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        
        &.badge-danger { background: var(--danger); }
        &.badge-warning { background: var(--warning); }
      }
    }

    .profile-trigger {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px;
      border-radius: var(--radius-md);
      background: transparent;
      border: none;
      color: var(--text-main);
      cursor: pointer;
      font-family: 'Outfit', sans-serif;
      font-weight: 500;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--border-light);
      }

      .user-avatar-placeholder {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--primary-light);
        color: var(--primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }
    }

    // Dropdowns
    .dropdown-wrapper {
      position: relative;
    }

    .header-dropdown {
      position: absolute;
      right: 0;
      top: 48px;
      width: 280px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      
      .dropdown-header {
        padding: 12px 16px;
        font-weight: 600;
        font-family: 'Outfit', sans-serif;
        border-bottom: 1px solid var(--border-light);
        display: flex;
        justify-content: space-between;
        align-items: center;

        .btn-text-action {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 11px;
          cursor: pointer;
          font-weight: 500;
          
          &:hover { text-decoration: underline; }
        }
      }

      .dropdown-item {
        width: 100%;
        text-align: left;
        padding: 10px 16px;
        background: transparent;
        border: none;
        color: var(--text-main);
        cursor: pointer;
        display: flex;
        align-items: center;
        font-size: 13.5px;
        transition: background-color 0.2s;

        &:hover {
          background-color: var(--border-light);
        }

        &.text-danger {
          color: var(--danger);
        }
      }

      .divider {
        height: 1px;
        background-color: var(--border-light);
      }
    }

    .lang-dropdown {
      width: 180px;
    }

    .notification-dropdown {
      width: 320px;

      .dropdown-body {
        max-height: 280px;
        overflow-y: auto;
      }

      .notification-item {
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-light);
        display: flex;
        gap: 12px;
        transition: background-color 0.2s;

        &.unread {
          background-color: var(--primary-light);
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
          
          &.loan { background: var(--info); }
          &.system { background: var(--danger); }
          &.risk { background: var(--warning); }
        }

        .content {
          .title { font-weight: 600; font-size: 13px; margin-bottom: 2px; }
          .body { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
          .time { font-size: 10px; color: var(--text-muted); }
        }
      }
    }

    .profile-dropdown {
      width: 220px;
      
      .profile-user-info {
        padding: 14px 16px;
        
        .name { font-weight: 600; color: var(--text-main); }
        .email { font-size: 12px; color: var(--text-muted); }
      }
    }

    // Main Content layout
    .content-wrapper {
      flex-grow: 1;
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .breadcrumb-container {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--text-muted);
      font-family: 'Outfit', sans-serif;
      font-weight: 500;

      .current {
        color: var(--primary);
        font-weight: 600;
      }
    }

    .view-content {
      flex-grow: 1;
    }

    .mr-2 {
      margin-right: 8px;
    }
  `]
})
export class PortalLayoutComponent {
  isSidebarCollapsed = signal<boolean>(false);
  menuSearchTerm = signal<string>('');

  stateService = inject(StateService);
  themeService = inject(ThemeService);
  translationService = inject(TranslationService);
  private router = inject(Router);

  // Global search input
  globalSearchQuery = '';

  // Dropdown states
  showLanguageDropdown = signal(false);
  showNotificationsDropdown = signal(false);
  showProfileDropdown = signal(false);

  categories = [
    { id: 'core', label: 'Core Banking' },
    { id: 'operations', label: 'Operations' },
    { id: 'management', label: 'Portfolio Management' },
    { id: 'system', label: 'System & Security' }
  ];

  menuItems: MenuItem[] = [
    { title: 'Dashboard', translateKey: 'nav.dashboard', path: '/portal/dashboard', category: 'core', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>' },
    { title: 'Customers', translateKey: 'nav.customers', path: '/portal/customers', category: 'core', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/></svg>' },
    { title: 'Loans', translateKey: 'nav.loans', path: '/portal/loans', category: 'core', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>' },
    { title: 'Savings', translateKey: 'nav.savings', path: '/portal/savings', category: 'core', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>' },
    
    { title: 'Wallet', translateKey: 'nav.wallet', path: '/portal/wallet', category: 'operations', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 10h.01M16 10h.01M20 10h.01"/></svg>' },
    { title: 'Collections', translateKey: 'nav.collections', path: '/portal/collections', category: 'operations', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>' },
    { title: 'Guarantors', translateKey: 'nav.guarantors', path: '/portal/guarantors', category: 'operations', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' },
    { title: 'Collateral', translateKey: 'nav.collateral', path: '/portal/collateral', category: 'operations', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
    
    { title: 'Accounting', translateKey: 'nav.accounting', path: '/portal/accounting', category: 'management', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>' },
    { title: 'Reports', translateKey: 'nav.reports', path: '/portal/reports', category: 'management', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>' },
    { title: 'Branches', translateKey: 'nav.branches', path: '/portal/branches', category: 'management', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 21h18M3 10h18M5 6h14a2 2 0 012 2v13H3V8a2 2 0 012-2z"/></svg>' },
    { title: 'Risk Management', translateKey: 'nav.risk', path: '/portal/risk', category: 'management', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>' },

    { title: 'Workflow Engine', translateKey: 'nav.workflows', path: '/portal/workflows', category: 'system', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' },
    { title: 'Notifications', translateKey: 'nav.notifications', path: '/portal/notifications', category: 'system', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>' },
    { title: 'Users & Roles', translateKey: 'nav.users', path: '/portal/users', category: 'system', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2a5 5 0 00-5 5v3a1 1 0 001 1h8a1 1 0 001-1V7a5 5 0 00-5-5zM4 22a8 8 0 0116 0H4z"/></svg>' },
    { title: 'Integrations', translateKey: 'nav.integrations', path: '/portal/integrations', category: 'system', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>' },
    { title: 'Institution Settings', translateKey: 'nav.settings', path: '/portal/settings', category: 'system', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>' }
  ];

  activePageTitle = signal<string>('Dashboard');

  pendingWorkflowsCount = computed(() => {
    return this.stateService.workflowApprovals().filter(w => w.status === 'Pending').length;
  });

  unreadNotificationsCount = computed(() => {
    return this.stateService.notifications().filter(n => !n.read).length;
  });

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        const matchingItem = this.menuItems.find(item => url.includes(item.path));
        if (matchingItem) {
          this.activePageTitle.set(matchingItem.title);
        } else {
          this.activePageTitle.set('Portal');
        }
        // Close dropdowns
        this.showLanguageDropdown.set(false);
        this.showNotificationsDropdown.set(false);
        this.showProfileDropdown.set(false);
      });
  }

  toggleSidebar() {
    this.isSidebarCollapsed.update(val => !val);
  }

  updateMenuSearch(event: any) {
    this.menuSearchTerm.set(event.target.value);
  }

  getFilteredItemsByCategory(categoryId: string): MenuItem[] {
    const term = this.menuSearchTerm().toLowerCase().trim();
    const items = this.menuItems.filter(item => item.category === categoryId);
    if (!term) return items;
    return items.filter(item => 
      item.title.toLowerCase().includes(term) || 
      this.translationService.translate(item.translateKey).toLowerCase().includes(term)
    );
  }

  // Dropdown controls
  toggleLanguageDropdown() {
    this.showLanguageDropdown.update(val => !val);
    this.showNotificationsDropdown.set(false);
    this.showProfileDropdown.set(false);
  }

  toggleNotifications() {
    this.showNotificationsDropdown.update(val => !val);
    this.showLanguageDropdown.set(false);
    this.showProfileDropdown.set(false);
  }

  toggleProfileDropdown() {
    this.showProfileDropdown.update(val => !val);
    this.showLanguageDropdown.set(false);
    this.showNotificationsDropdown.set(false);
  }

  setLang(lang: Language) {
    this.translationService.setLanguage(lang);
    this.showLanguageDropdown.set(false);
  }

  markAllNotificationsRead() {
    this.stateService.notifications.update(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  triggerGlobalSearch() {
    if (!this.globalSearchQuery.trim()) return;
    // Redirect to customer search results, or pass query to target modules
    this.router.navigate(['/portal/customers'], { queryParams: { q: this.globalSearchQuery } });
    this.globalSearchQuery = '';
  }

  logout() {
    this.stateService.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
