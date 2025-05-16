import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
} from '@angular/material/table';
import { Observable, BehaviorSubject, switchMap, startWith, filter } from 'rxjs';
import { indicate } from '../../utils';
import { Security } from '../../models/security';
import { SecurityService } from '../../services/security.service';
import { FilterableTableComponent, FilterField } from '../filterable-table/filterable-table.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'securities-list',
  standalone: true,
  imports: [
    FilterableTableComponent,
    AsyncPipe,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatNoDataRow,
    MatRowDef,
    MatRow,
  ],
  templateUrl: './securities-list.component.html',
  styleUrl: './securities-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecuritiesListComponent {
  protected displayedColumns: string[] = ['name', 'type', 'currency'];

  protected filterFields: FilterField[] = [
    { id: 'name', name: 'name', label: 'Name', type: 'text', placeholder: 'Search by name' },
    {
      id: 'type', name: 'type', label: 'Type', type: 'multiselect', options: [
        { label: 'Equity', value: 'Equity' },
        { label: 'BankAccount', value: 'BankAccount' },
        { label: 'Closed-endFund', value: 'Closed-endFund' },
        { label: 'DirectHolding', value: 'DirectHolding' },
        {label: 'Generic', value:'Generic'},
        {label: 'Collectibl', value:'Collectibl'},
        {label: 'RealEstate', value:'RealEstate'}
      ]
    },
    {
      id: 'currency', name: 'currency', label: 'currency', type: 'multiselect', options: [
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' }
      ]
    },
    { id: 'isPrivate', name: 'isPrivate', label: 'Private', type: 'boolean' }
  ];
  protected filterInitialValue = {};
  protected filterChange$ = new BehaviorSubject<any>(this.filterInitialValue);
  private _securityService = inject(SecurityService);
  protected loadingSecurities$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  private sanitizeFilter(filter: any): any {
    const sanitized: any = {};
    if (filter.name && filter.name.trim() !== '') {
      sanitized.name = filter.name.trim();
    }
    if (Array.isArray(filter.type) && filter.type.length > 0) {
      sanitized.type = filter.type;
    }
    if (Array.isArray(filter.currency) && filter.currency.length > 0) {
      sanitized.currency = filter.currency;
    }
    if (typeof filter.isPrivate === 'boolean') {
      sanitized.isPrivate = filter.isPrivate;
    }
    return sanitized;
  }

  protected securities$: Observable<Security[]> = this.filterChange$.pipe(
    startWith(this.filterInitialValue),
    switchMap(filter => this._securityService.getSecurities(this.sanitizeFilter(filter)).pipe(indicate(this.loadingSecurities$)))
  );


  public onFilterChange(filter: any) {
    this.filterChange$.next(filter);
  }
}
