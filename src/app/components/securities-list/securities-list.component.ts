import { ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
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
import { Observable, BehaviorSubject, switchMap, startWith, map } from 'rxjs';
import { indicate } from '../../utils';
import { Security } from '../../models/security';
import { SecuritiesResponse, SecurityService } from '../../services/security.service';
import { FilterableTableComponent, FilterField } from '../filterable-table/filterable-table.component';
import { AsyncPipe } from '@angular/common';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

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
    MatPaginatorModule,
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
        { label: 'Generic', value: 'Generic' },
        { label: 'Collectibl', value: 'Collectibl' },
        { label: 'RealEstate', value: 'RealEstate' }
      ]
    },
    {
      id: 'currency', name: 'currency', label: 'currency', type: 'select', options: [
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

  protected pageSize = 10;
  protected pageSizeOptions: number[] = [5, 10, 20];
  protected currentPage$ = new BehaviorSubject<number>(1);
  protected total$ = new BehaviorSubject<number>(0);
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;


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
      console.log(filter.isPrivate, "hh")
    }
    return sanitized;
  }

  protected securities$: Observable<Security[]> = this.filterChange$.pipe(
    startWith(this.filterInitialValue),
    switchMap(filter =>
      this.currentPage$.pipe(
        startWith(1),
        switchMap(currentPage => {
          const sanitized = this.sanitizeFilter(filter);
          sanitized.skip = (currentPage - 1) * this.pageSize;
          sanitized.limit = this.pageSize;
          return this._securityService.getSecurities(sanitized).pipe(
            indicate(this.loadingSecurities$),
            map((res: SecuritiesResponse) => {
              this.total$.next(res.total);
              return res.data;
            })
          );
        })
      )
    )
  );

  public onFilterChange(filter: any) {
    this.currentPage$.next(1);
    this.filterChange$.next(filter);
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }
  currentPage = 0;
  totalItems = 0;

  public onPageEvent(event: PageEvent) {
    if (event.pageSize !== this.pageSize) {
      this.pageSize = event.pageSize;
      this.currentPage$.next(1);
      if (this.paginator) {
        this.paginator.firstPage();
      }
    } else {
      this.currentPage$.next(event.pageIndex + 1);
    }
  }
}
