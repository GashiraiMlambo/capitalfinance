import { Component, signal, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, User } from '../../core/services/state.service';
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
            <img *ngIf="!isSidebarCollapsed()" src="/5940427112177143524_120-removebg-preview.png" alt="Central Capital Finance" class="full-logo" />
            <img *ngIf="isSidebarCollapsed()" src="/5940427112177143524_120-removebg-preview.png" alt="Logo" class="collapsed-logo" />
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

        <!-- Sidebar Footer -->
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
          <!-- Left: Page Title / Search -->
          <div class="header-left">
            <div class="platform-indicator-badge">
              <span class="indicator-dot"></span>
              <span>Bureau de Change & Remittance</span>
            </div>
          </div>

          <!-- Right Actions -->
          <div class="header-right">
            <!-- ROLE QUICK SWITCHER (WOW Feature for Interactive Testing) -->
            <div class="dropdown-wrapper">
              <button class="role-switcher-btn" (click)="toggleRoleDropdown()">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8.684 10.742l4.8 2.4A1 1 0 0015 12.257V5.743a1 1 0 00-.516-.884l-4.8-2.4a1 1 0 00-.968 0l-4.8 2.4A1 1 0 003.5 5.743v6.514a1 1 0 00.516.884l4.8 2.4a1 1 0 00.968 0z"/></svg>
                <span>Role: {{ stateService.currentUser()?.role }}</span>
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
              </button>
              
              <div class="header-dropdown role-dropdown" *ngIf="showRoleDropdown()">
                <div class="dropdown-header">Interactive Testing Roles</div>
                <ng-container *ngFor="let u of stateService.users()">
                  <button class="dropdown-item" *ngIf="u.role !== 'Customer (Self-Service)'" (click)="selectRole(u)">
                    <div class="role-desc">
                      <p class="role-name">{{ u.name }}</p>
                      <p class="role-title">{{ u.role }}</p>
                    </div>
                  </button>
                </ng-container>
              </div>
            </div>

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
              <svg *ngIf="themeService.isDarkMode()" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              <svg *ngIf="!themeService.isDarkMode()" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            </button>

            <!-- Pending Review Count (Manager & Compliance Only) -->
            <button class="header-action-btn" *ngIf="isManagerOrCompliance()" (click)="navigateToReview()" title="Pending Overrides">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
              <span class="btn-badge badge-warning" *ngIf="pendingReviewsCount() > 0">{{ pendingReviewsCount() }}</span>
            </button>

            <!-- Notifications Center -->
            <div class="dropdown-wrapper">
              <button class="header-action-btn" (click)="toggleNotifications()" title="Notifications">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                <span class="btn-badge badge-danger" *ngIf="unreadNotificationsCount() > 0">{{ unreadNotificationsCount() }}</span>
              </button>

              <div class="header-dropdown notification-dropdown" *ngIf="showNotificationsDropdown()">
                <div class="dropdown-header">
                  <span>Notifications Center</span>
                  <button class="btn-text-action" (click)="markAllNotificationsRead()">Mark read</button>
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
            <span class="parent">Central Capital Finance</span>
            <span class="sep">/</span>
            <span class="current">{{ activePageTitle() }}</span>
          </div>

          <div class="view-content">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>

      <!-- Toast Notification Container -->
      <div class="global-toast-container">
        <div 
          *ngFor="let toast of stateService.toasts()" 
          class="global-toast" 
          [class]="toast.type"
        >
          <span class="toast-icon" [style.display]="'flex'" [style.align-items]="'center'">
            <svg *ngIf="toast.type === 'success'" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
            <svg *ngIf="toast.type === 'error'" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <svg *ngIf="toast.type === 'warning'" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <svg *ngIf="toast.type === 'info'" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .portal-container {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-base);
    }

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

    .portal-container.sidebar-collapsed .sidebar-brand {
      padding: 0 10px;
      justify-content: center;
      gap: 4px;
    }

    .sidebar-brand {
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);

      .brand-logo {
        display: flex;
        align-items: center;
        width: calc(100% - 28px);
        overflow: hidden;

        .full-logo {
          max-height: 56px;
          max-width: 100%;
          object-fit: contain;
          filter: brightness(0) invert(1);
        }

        .collapsed-logo {
          width: 32px;
          height: 32px;
          object-fit: cover;
          object-position: left center;
          filter: brightness(0) invert(1);
        }
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
          font-weight: 600;
          position: relative;
          padding-left: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 15%;
            height: 70%;
            width: 4px;
            background-color: white;
            border-radius: 0 4px 4px 0;
          }

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

    .portal-main {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

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
    }

    .platform-indicator-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--primary-light);
      color: var(--primary);
      padding: 6px 12px;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 13px;

      .indicator-dot {
        width: 8px;
        height: 8px;
        background-color: var(--success);
        border-radius: 50%;
        animation: pulse 1.5s infinite;
      }
    }

    @keyframes pulse {
      0% { transform: scale(0.9); opacity: 0.7; }
      50% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(0.9); opacity: 0.7; }
    }

    .role-switcher-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-base);
      border: 1px solid var(--border);
      color: var(--text-main);
      padding: 8px 12px;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      transition: background 0.2s;

      &:hover {
        background: var(--border-light);
      }
    }

    .role-dropdown {
      width: 250px;
      max-height: 350px;
      overflow-y: auto;
      
      .role-desc {
        text-align: left;
        .role-name { font-weight: 600; font-size: 13px; margin: 0; }
        .role-title { font-size: 11.5px; color: var(--text-muted); margin: 0; }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
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
          
          &.rate { background: var(--info); }
          &.override { background: var(--warning); }
          &.compliance { background: var(--danger); }
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

    .global-toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 9999;
      pointer-events: none;
    }

    .global-toast {
      pointer-events: auto;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      padding: 12px 18px;
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 280px;
      max-width: 400px;
      font-size: 13.5px;
      font-weight: 500;
      color: var(--text-main);
      animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      &.success {
        border-left: 4px solid var(--success);
        .toast-icon { color: var(--success); }
      }
      &.error {
        border-left: 4px solid var(--danger);
        .toast-icon { color: var(--danger); }
      }
      &.warning {
        border-left: 4px solid var(--warning);
        .toast-icon { color: var(--warning); }
      }
      &.info {
        border-left: 4px solid var(--info);
        .toast-icon { color: var(--info); }
      }
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
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

  // Dropdown states
  showLanguageDropdown = signal(false);
  showNotificationsDropdown = signal(false);
  showProfileDropdown = signal(false);
  showRoleDropdown = signal(false);

  categories = [
    { id: 'core', label: 'Core Bureau' },
    { id: 'operations', label: 'Operations & Management' },
    { id: 'system', label: 'System & Ledger' }
  ];

  menuItems: MenuItem[] = [
    // Teller
    { title: 'Dashboard', translateKey: 'nav.dashboard', path: '/teller/dashboard', category: 'core', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>' },
    { title: 'Currency Exchange', translateKey: 'nav.exchange', path: '/teller/exchange/new', category: 'core', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>' },
    { title: 'New Remittance', translateKey: 'nav.remittance', path: '/teller/remittance/new', category: 'core', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>' },
    { title: 'Customer Onboarding', translateKey: 'nav.onboarding', path: '/onboarding/new', category: 'core', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>' },
    { title: 'Customer Registry', translateKey: 'nav.customers', path: '/teller/customers', category: 'core', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' },

    // Branch & Rates
    { title: 'Admin & Branch Dashboard', translateKey: 'nav.manager_dash', path: '/admin/dashboard', category: 'operations', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>' },
    { title: 'Rate Management', translateKey: 'nav.rates', path: '/admin/rates', category: 'operations', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"/></svg>' },
    { title: 'Transactions Ledger', translateKey: 'nav.admin_txns', path: '/admin/transactions', category: 'operations', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },

    // Compliance
    { title: 'Compliance Dashboard', translateKey: 'nav.compliance_dash', path: '/compliance/dashboard', category: 'operations', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>' },
    { title: 'Compliance Audits', translateKey: 'nav.compliance_txns', path: '/compliance/transactions', category: 'operations', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12h6M9 16h6M9 8h6"/></svg>' },
    { title: 'KYC Queue', translateKey: 'nav.kyc_queue', path: '/compliance/kyc', category: 'operations', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>' },
    { title: 'RBZ Reporting & EOD', translateKey: 'nav.rbz', path: '/compliance/rbz-reporting', category: 'operations', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>' },

    // Admin & System
    { title: 'User Management', translateKey: 'nav.users', path: '/admin/users', category: 'system', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/></svg>' },
    { title: 'Audit Log', translateKey: 'nav.audit', path: '/admin/audit-log', category: 'system', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' },

    // Customer
    { title: 'Portal Home', translateKey: 'nav.portal_home', path: '/portal/home', category: 'core', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>' },
    { title: 'My Transactions', translateKey: 'nav.portal_txns', path: '/portal/transactions', category: 'core', icon: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' }
  ];

  activePageTitle = signal<string>('Teller Dashboard');

  pendingReviewsCount = computed(() => {
    return this.stateService.transactions().filter(t => t.status === 'Pending').length;
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
        } else if (url.includes('/receipt')) {
          this.activePageTitle.set('Transaction Voucher');
        } else if (url.includes('/customers/')) {
          this.activePageTitle.set('Customer Profile');
        } else if (url.includes('/review')) {
          this.activePageTitle.set('Transaction Override Review');
        } else {
          this.activePageTitle.set('Portal');
        }
        this.closeAllDropdowns();
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
    const userRole = this.stateService.currentUser()?.role || 'Branch Manager';

    // RBAC Filter: which items can this role view?
    const allowedPaths: string[] = [];
    if (userRole === 'Branch Manager') {
      allowedPaths.push(
        '/admin/dashboard', '/admin/rates', '/admin/transactions', '/admin/users', '/admin/audit-log',
        '/teller/dashboard', '/teller/exchange/new', '/teller/remittance/new', '/onboarding/new', '/teller/customers',
        '/compliance/dashboard', '/compliance/transactions', '/compliance/kyc', '/compliance/rbz-reporting'
      );
    } else if (userRole === 'Teller') {
      allowedPaths.push('/teller/dashboard', '/teller/exchange/new', '/teller/remittance/new', '/onboarding/new', '/teller/customers');
    } else if (userRole === 'Compliance Officer') {
      allowedPaths.push(
        '/compliance/dashboard', '/compliance/transactions', '/compliance/kyc', '/compliance/rbz-reporting',
        '/teller/customers', '/admin/dashboard'
      );
    }

    const items = this.menuItems.filter(item => 
      item.category === categoryId && allowedPaths.includes(item.path)
    );

    if (!term) return items;
    return items.filter(item => 
      item.title.toLowerCase().includes(term) || 
      this.translationService.translate(item.translateKey).toLowerCase().includes(term)
    );
  }

  isManagerOrCompliance(): boolean {
    const role = this.stateService.currentUser()?.role;
    return role === 'Compliance Officer' || role === 'Branch Manager';
  }

  navigateToReview() {
    const pendingTxn = this.stateService.transactions().find(t => t.status === 'Pending');
    if (pendingTxn) {
      const role = this.stateService.currentUser()?.role;
      if (role === 'Compliance Officer') {
        this.router.navigate([`/compliance/transactions/${pendingTxn.id}`]);
      } else {
        this.router.navigate([`/admin/transactions/${pendingTxn.id}/review`]);
      }
    } else {
      const role = this.stateService.currentUser()?.role;
      if (role === 'Compliance Officer') {
        this.router.navigate(['/compliance/dashboard']);
      } else {
        this.router.navigate(['/admin/dashboard']);
      }
    }
  }

  toggleLanguageDropdown() {
    this.showLanguageDropdown.update(v => !v);
    this.showNotificationsDropdown.set(false);
    this.showProfileDropdown.set(false);
    this.showRoleDropdown.set(false);
  }

  toggleNotifications() {
    this.showNotificationsDropdown.update(v => !v);
    this.showLanguageDropdown.set(false);
    this.showProfileDropdown.set(false);
    this.showRoleDropdown.set(false);
  }

  toggleProfileDropdown() {
    this.showProfileDropdown.update(v => !v);
    this.showLanguageDropdown.set(false);
    this.showNotificationsDropdown.set(false);
    this.showRoleDropdown.set(false);
  }

  toggleRoleDropdown() {
    this.showRoleDropdown.update(v => !v);
    this.showLanguageDropdown.set(false);
    this.showNotificationsDropdown.set(false);
    this.showProfileDropdown.set(false);
  }

  selectRole(user: User) {
    this.stateService.currentUser.set(user);
    this.stateService.addAuditLog(`Switched role to: ${user.role} (${user.name})`);
    this.closeAllDropdowns();

    // Redirect to default screen
    switch (user.role) {
      case 'Teller':
        this.router.navigate(['/teller/dashboard']);
        break;
      case 'Compliance Officer':
        this.router.navigate(['/compliance/dashboard']);
        break;
      case 'Branch Manager':
        this.router.navigate(['/admin/dashboard']);
        break;
    }
  }

  setLang(lang: Language) {
    this.translationService.setLanguage(lang);
    this.showLanguageDropdown.set(false);
  }

  markAllNotificationsRead() {
    this.stateService.notifications.update(prev => prev.map(n => ({ ...n, read: true })));
  }

  closeAllDropdowns() {
    this.showLanguageDropdown.set(false);
    this.showNotificationsDropdown.set(false);
    this.showProfileDropdown.set(false);
    this.showRoleDropdown.set(false);
  }

  logout() {
    this.stateService.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
}
