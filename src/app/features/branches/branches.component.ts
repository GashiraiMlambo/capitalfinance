import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../core/services/state.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.scss',})
export class BranchesComponent {
  stateService = inject(StateService);
}
